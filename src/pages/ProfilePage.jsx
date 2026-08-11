import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { ClientManager } from '../logic/ClientManager';

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #050505 0%, #101010 100%)',
    color: '#f5ebd7',
    padding: '40px 24px 80px',
    fontFamily: 'Montserrat, sans-serif',
  },
  shell: { maxWidth: '1200px', margin: '0 auto', display: 'grid', gap: '24px' },
  card: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(197,160,89,0.24)',
    borderRadius: '22px',
    padding: '24px',
    boxShadow: '0 18px 45px rgba(0,0,0,0.25)',
  },
  title: { fontFamily: 'Playfair Display, serif', color: '#c5a059', marginBottom: '8px' },
  muted: { color: '#9b937f', lineHeight: 1.7 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' },
  input: {
    width: '100%',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '12px',
    padding: '12px 14px',
    background: 'rgba(255,255,255,0.05)',
    color: '#f5ebd7',
    boxSizing: 'border-box',
  },
  button: {
    padding: '12px 16px',
    borderRadius: '999px',
    border: '1px solid #c5a059',
    background: 'transparent',
    color: '#c5a059',
    cursor: 'pointer',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  row: { display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '12px' },
  pill: { display: 'inline-flex', padding: '6px 10px', borderRadius: '999px', background: 'rgba(197,160,89,0.16)', color: '#e8d6a7', fontSize: '0.8rem' },
  list: { display: 'grid', gap: '10px', marginTop: '12px' },
  item: { padding: '14px', borderRadius: '14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' },
};

const EMPTY_ADDRESS_FIELDS = { numero: '', voie: '', complement: '', codePostal: '', ville: '', pays: 'France' };

// Ancien profil : une seule adresse à plat (profileData.adresse). On la
// convertit en carnet d'une entrée par défaut, pour ne rien perdre au
// premier chargement d'un profil créé avant le carnet d'adresses.
function migrateAddresses(profileData) {
  if (Array.isArray(profileData?.adresses) && profileData.adresses.length > 0) {
    return profileData.adresses;
  }
  const legacy = profileData?.adresse;
  const hasContent = legacy && (legacy.voie || legacy.ville || legacy.codePostal);
  if (!hasContent) return [];
  return [
    {
      id: 'legacy',
      label: '',
      ...EMPTY_ADDRESS_FIELDS,
      ...legacy,
      isDefaultLivraison: true,
      isDefaultFacturation: true,
    },
  ];
}

function generateAddressId() {
  return `addr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function ProfilePage() {
  const { t, i18n } = useTranslation(['profile', 'configurator', 'common']);
  const { user, refreshProfile } = useAuth();
  const [profile, setProfile] = useState({
    type: 'particulier',
    genre: 'Monsieur',
    prenom: '',
    nom: '',
    entreprise: '',
    siret: '',
    telephone: '',
    passion: '',
    attente: '',
    email: '',
    langue: i18n.language,
  });
  const [addresses, setAddresses] = useState([]);
  const [addressForm, setAddressForm] = useState(null); // null = fermé, sinon l'adresse en cours d'édition/création
  const [addressSaving, setAddressSaving] = useState(false);
  const [orders, setOrders] = useState([]);
  const [projects, setProjects] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      const [profileData, ordersData, projectsData] = await Promise.all([
        ClientManager.getProfile(user.uid),
        ClientManager.getOrders(user.uid),
        ClientManager.getProjects(user.uid),
      ]);

      setProfile({
        ...profileData,
        email: user.email || profileData?.email || '',
        langue: profileData?.langue || i18n.language,
      });
      setAddresses(migrateAddresses(profileData));
      setOrders(ordersData);
      setProjects(projectsData);
      setLoading(false);
    };

    loadProfile();
    // i18n.language volontairement exclu : ne sert qu'à initialiser la valeur par
    // défaut du champ langue, un changement manuel ne doit pas recharger le profil.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    if (field === 'langue') {
      i18n.changeLanguage(value);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user) return;

    await ClientManager.updateProfile(user.uid, profile);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  // L'adresse de livraison par défaut est toujours mirroir dans profile.adresse
  // (à plat) pour rester compatible avec tout le code existant qui lit encore
  // ce champ (panier au moment de la commande, back-office, export CSV).
  const persistAddresses = async (nextAddresses) => {
    if (!user) return;
    const defaultLivraison = nextAddresses.find((a) => a.isDefaultLivraison) || nextAddresses[0] || null;
    await ClientManager.updateProfile(user.uid, {
      adresses: nextAddresses,
      adresse: defaultLivraison
        ? {
            numero: defaultLivraison.numero,
            voie: defaultLivraison.voie,
            complement: defaultLivraison.complement,
            codePostal: defaultLivraison.codePostal,
            ville: defaultLivraison.ville,
            pays: defaultLivraison.pays,
          }
        : EMPTY_ADDRESS_FIELDS,
    });
    setAddresses(nextAddresses);
    await refreshProfile();
  };

  const openNewAddressForm = () => {
    setAddressForm({
      id: generateAddressId(),
      label: '',
      ...EMPTY_ADDRESS_FIELDS,
      isDefaultLivraison: addresses.length === 0,
      isDefaultFacturation: addresses.length === 0,
    });
  };

  const openEditAddressForm = (address) => setAddressForm({ ...address });

  const handleAddressFormChange = (field, value) => {
    setAddressForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveAddress = async () => {
    if (!addressForm) return;
    setAddressSaving(true);
    const exists = addresses.some((a) => a.id === addressForm.id);
    let next = exists
      ? addresses.map((a) => (a.id === addressForm.id ? addressForm : a))
      : [...addresses, addressForm];

    if (addressForm.isDefaultLivraison) {
      next = next.map((a) => ({ ...a, isDefaultLivraison: a.id === addressForm.id }));
    }
    if (addressForm.isDefaultFacturation) {
      next = next.map((a) => ({ ...a, isDefaultFacturation: a.id === addressForm.id }));
    }

    await persistAddresses(next);
    setAddressSaving(false);
    setAddressForm(null);
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm(t('addresses.deleteConfirm'))) return;
    let next = addresses.filter((a) => a.id !== addressId);
    if (next.length > 0 && !next.some((a) => a.isDefaultLivraison)) {
      next = next.map((a, index) => (index === 0 ? { ...a, isDefaultLivraison: true } : a));
    }
    if (next.length > 0 && !next.some((a) => a.isDefaultFacturation)) {
      next = next.map((a, index) => (index === 0 ? { ...a, isDefaultFacturation: true } : a));
    }
    await persistAddresses(next);
  };

  const handleMessage = async () => {
    if (!user || !message.trim()) return;

    await ClientManager.saveMessage(user.uid, {
      message,
      email: user.email || profile.email,
      createdAt: new Date().toISOString(),
    });
    setMessage('');
    setSaved(true);
  };

  if (loading) {
    return <div style={styles.page}><div style={styles.card}>{t('common:loading.space', { ns: 'common' })}</div></div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <div style={styles.card}>
          <h1 style={styles.title}>{t('title')}</h1>
          <p style={styles.muted}>{t('intro')}</p>
        </div>

        <div style={styles.card}>
          <h2 style={styles.title}>{t('personalInfo')}</h2>
          <form onSubmit={handleSubmit}>
            <div style={styles.grid}>
              <label>
                <div style={{ marginBottom: '6px', color: '#d8c89b' }}>{t('fields.type')}</div>
                <select value={profile.type || 'particulier'} onChange={(e) => handleChange('type', e.target.value)} style={styles.input}>
                  <option value="particulier">{t('fields.typeParticulier')}</option>
                  <option value="entreprise">{t('fields.typeEntreprise')}</option>
                </select>
              </label>
              <label>
                <div style={{ marginBottom: '6px', color: '#d8c89b' }}>{t('fields.civility')}</div>
                <select value={profile.genre || 'Monsieur'} onChange={(e) => handleChange('genre', e.target.value)} style={styles.input}>
                  <option value="Monsieur">{t('fields.civilityMonsieur')}</option>
                  <option value="Madame">{t('fields.civilityMadame')}</option>
                  <option value="Autre">{t('fields.civilityAutre')}</option>
                </select>
              </label>
              <label>
                <div style={{ marginBottom: '6px', color: '#d8c89b' }}>{t('fields.firstName')}</div>
                <input value={profile.prenom || ''} onChange={(e) => handleChange('prenom', e.target.value)} style={styles.input} />
              </label>
              <label>
                <div style={{ marginBottom: '6px', color: '#d8c89b' }}>{t('fields.lastName')}</div>
                <input value={profile.nom || ''} onChange={(e) => handleChange('nom', e.target.value)} style={styles.input} />
              </label>
              <label>
                <div style={{ marginBottom: '6px', color: '#d8c89b' }}>{t('fields.email')}</div>
                <input value={profile.email || ''} readOnly style={styles.input} />
              </label>
              <label>
                <div style={{ marginBottom: '6px', color: '#d8c89b' }}>{t('fields.phone')}</div>
                <input value={profile.telephone || ''} onChange={(e) => handleChange('telephone', e.target.value)} style={styles.input} />
              </label>
              <label>
                <div style={{ marginBottom: '6px', color: '#d8c89b' }}>{t('fields.company')}</div>
                <input value={profile.entreprise || ''} onChange={(e) => handleChange('entreprise', e.target.value)} style={styles.input} />
              </label>
              <label>
                <div style={{ marginBottom: '6px', color: '#d8c89b' }}>{t('fields.siret')}</div>
                <input value={profile.siret || ''} onChange={(e) => handleChange('siret', e.target.value)} style={styles.input} />
              </label>
              <label>
                <div style={{ marginBottom: '6px', color: '#d8c89b' }}>{t('fields.language')}</div>
                <select value={profile.langue || i18n.language} onChange={(e) => handleChange('langue', e.target.value)} style={styles.input}>
                  <option value="fr">{t('fields.languageFr')}</option>
                  <option value="en">{t('fields.languageEn')}</option>
                </select>
              </label>
            </div>
            <div style={{ marginTop: '16px' }}>
              <label>
                <div style={{ marginBottom: '6px', color: '#d8c89b' }}>{t('fields.passion')}</div>
                <textarea value={profile.passion || ''} onChange={(e) => handleChange('passion', e.target.value)} style={{ ...styles.input, minHeight: '90px' }} />
              </label>
            </div>
            <div style={{ marginTop: '16px' }}>
              <label>
                <div style={{ marginBottom: '6px', color: '#d8c89b' }}>{t('fields.expectation')}</div>
                <textarea value={profile.attente || ''} onChange={(e) => handleChange('attente', e.target.value)} style={{ ...styles.input, minHeight: '90px' }} />
              </label>
            </div>
            <div style={styles.row}>
              <button type="submit" style={styles.button}>{t('save')}</button>
              {saved && <span style={styles.pill}>{t('savedProfile')}</span>}
            </div>
          </form>
        </div>

        <div style={styles.card}>
          <h2 style={styles.title}>{t('addresses.title')}</h2>

          {addresses.length === 0 && !addressForm && <p style={styles.muted}>{t('addresses.empty')}</p>}

          {addresses.length > 0 && (
            <div style={styles.list}>
              {addresses.map((address) => (
                <div key={address.id} style={styles.item}>
                  <div style={{ fontWeight: 700, color: '#f7e0a7' }}>
                    {address.label || t('addresses.labelPlaceholder')}
                  </div>
                  <div style={{ color: '#9b937f', marginTop: '6px' }}>
                    {[address.numero, address.voie, address.complement].filter(Boolean).join(' ')}
                    {' — '}
                    {[address.codePostal, address.ville, address.pays].filter(Boolean).join(' ')}
                  </div>
                  <div style={styles.row}>
                    {address.isDefaultLivraison && <span style={styles.pill}>{t('addresses.defaultShippingBadge')}</span>}
                    {address.isDefaultFacturation && <span style={styles.pill}>{t('addresses.defaultBillingBadge')}</span>}
                  </div>
                  <div style={{ ...styles.row, marginTop: '10px' }}>
                    <button type="button" style={styles.button} onClick={() => openEditAddressForm(address)}>
                      {t('addresses.editButton')}
                    </button>
                    <button type="button" style={styles.button} onClick={() => handleDeleteAddress(address.id)}>
                      {t('addresses.deleteButton')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {addressForm ? (
            <div style={{ ...styles.item, marginTop: '16px' }}>
              <div style={styles.grid}>
                <label>
                  <div style={{ marginBottom: '6px', color: '#d8c89b' }}>{t('addresses.labelField')}</div>
                  <input
                    value={addressForm.label}
                    onChange={(e) => handleAddressFormChange('label', e.target.value)}
                    placeholder={t('addresses.labelPlaceholder')}
                    style={styles.input}
                  />
                </label>
                <label>
                  <div style={{ marginBottom: '6px', color: '#d8c89b' }}>{t('fields.addressNumber')}</div>
                  <input value={addressForm.numero} onChange={(e) => handleAddressFormChange('numero', e.target.value)} style={styles.input} />
                </label>
                <label>
                  <div style={{ marginBottom: '6px', color: '#d8c89b' }}>{t('fields.addressStreet')}</div>
                  <input value={addressForm.voie} onChange={(e) => handleAddressFormChange('voie', e.target.value)} style={styles.input} />
                </label>
                <label>
                  <div style={{ marginBottom: '6px', color: '#d8c89b' }}>{t('fields.addressComplement')}</div>
                  <input value={addressForm.complement} onChange={(e) => handleAddressFormChange('complement', e.target.value)} style={styles.input} />
                </label>
                <label>
                  <div style={{ marginBottom: '6px', color: '#d8c89b' }}>{t('fields.postalCode')}</div>
                  <input value={addressForm.codePostal} onChange={(e) => handleAddressFormChange('codePostal', e.target.value)} style={styles.input} />
                </label>
                <label>
                  <div style={{ marginBottom: '6px', color: '#d8c89b' }}>{t('fields.city')}</div>
                  <input value={addressForm.ville} onChange={(e) => handleAddressFormChange('ville', e.target.value)} style={styles.input} />
                </label>
                <label>
                  <div style={{ marginBottom: '6px', color: '#d8c89b' }}>{t('fields.country')}</div>
                  <input value={addressForm.pays} onChange={(e) => handleAddressFormChange('pays', e.target.value)} style={styles.input} />
                </label>
              </div>
              <div style={{ ...styles.row, marginTop: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#d8c89b' }}>
                  <input
                    type="checkbox"
                    checked={addressForm.isDefaultLivraison}
                    onChange={(e) => handleAddressFormChange('isDefaultLivraison', e.target.checked)}
                  />
                  {t('addresses.setDefaultShipping')}
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#d8c89b' }}>
                  <input
                    type="checkbox"
                    checked={addressForm.isDefaultFacturation}
                    onChange={(e) => handleAddressFormChange('isDefaultFacturation', e.target.checked)}
                  />
                  {t('addresses.setDefaultBilling')}
                </label>
              </div>
              <div style={{ ...styles.row, marginTop: '12px' }}>
                <button type="button" style={styles.button} onClick={handleSaveAddress} disabled={addressSaving}>
                  {t('addresses.save')}
                </button>
                <button type="button" style={styles.button} onClick={() => setAddressForm(null)} disabled={addressSaving}>
                  {t('addresses.cancel')}
                </button>
              </div>
            </div>
          ) : (
            <div style={styles.row}>
              <button type="button" style={styles.button} onClick={openNewAddressForm}>
                {t('addresses.addButton')}
              </button>
            </div>
          )}
        </div>

        <div style={styles.card}>
          <h2 style={styles.title}>{t('projects.title')}</h2>
          {projects.length === 0 ? <p style={styles.muted}>{t('projects.empty')}</p> : (
            <div style={styles.list}>
              {projects.map((project) => (
                <div key={project.id} style={styles.item}>
                  <div style={{ fontWeight: 700, color: '#f7e0a7' }}>
                    {t(`univers:titles.${project.universId}`, project.universTitle || t('common:configurationFallback', { ns: 'common' }))}
                  </div>
                  <div style={{ color: '#9b937f', marginTop: '6px' }}>
                    {t('projects.line', {
                      version: project.version || 1,
                      essence: t(`configurator:essences.${project.values?.essence}`, project.values?.essence || '—'),
                      finition: t(`configurator:finitions.${project.values?.finition}`, project.values?.finition || '—'),
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={styles.card}>
          <h2 style={styles.title}>{t('orders.title')}</h2>
          {orders.length === 0 ? <p style={styles.muted}>{t('orders.empty')}</p> : (
            <div style={styles.list}>
              {orders.map((order) => (
                <div key={order.id} style={styles.item}>
                  <div style={{ fontWeight: 700, color: '#f7e0a7' }}>{order.reference || t('orders.fallbackReference')}</div>
                  <div style={{ color: '#9b937f', marginTop: '6px' }}>
                    {t('orders.line', {
                      status: t(`common:status.${order.statut}`, order.statut || t('common:status.En cours', { ns: 'common' })),
                      date: order.date || '—',
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={styles.card}>
          <h2 style={styles.title}>{t('question.title')}</h2>
          <p style={styles.muted}>{t('question.intro')}</p>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t('question.placeholder')} style={{ ...styles.input, minHeight: '110px', marginTop: '12px' }} />
          <div style={styles.row}>
            <button type="button" onClick={handleMessage} style={styles.button}>{t('question.send')}</button>
            {saved && <span style={styles.pill}>{t('question.sent')}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
