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

export default function ProfilePage() {
  const { t, i18n } = useTranslation(['profile', 'configurator', 'common']);
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    type: 'particulier',
    genre: 'Monsieur',
    prenom: '',
    nom: '',
    entreprise: '',
    siret: '',
    telephone: '',
    adresse: { numero: '', voie: '', complement: '', codePostal: '', ville: '', pays: 'France' },
    passion: '',
    attente: '',
    email: '',
    langue: i18n.language,
  });
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
        adresse: profileData?.adresse || { numero: '', voie: '', complement: '', codePostal: '', ville: '', pays: 'France' },
        langue: profileData?.langue || i18n.language,
      });
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

  const handleAddressChange = (field, value) => {
    setProfile((prev) => ({ ...prev, adresse: { ...prev.adresse, [field]: value } }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user) return;

    await ClientManager.updateProfile(user.uid, profile);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
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
                <div style={{ marginBottom: '6px', color: '#d8c89b' }}>{t('fields.addressNumber')}</div>
                <input value={profile.adresse?.numero || ''} onChange={(e) => handleAddressChange('numero', e.target.value)} style={styles.input} />
              </label>
              <label>
                <div style={{ marginBottom: '6px', color: '#d8c89b' }}>{t('fields.addressStreet')}</div>
                <input value={profile.adresse?.voie || ''} onChange={(e) => handleAddressChange('voie', e.target.value)} style={styles.input} />
              </label>
              <label>
                <div style={{ marginBottom: '6px', color: '#d8c89b' }}>{t('fields.addressComplement')}</div>
                <input value={profile.adresse?.complement || ''} onChange={(e) => handleAddressChange('complement', e.target.value)} style={styles.input} />
              </label>
              <label>
                <div style={{ marginBottom: '6px', color: '#d8c89b' }}>{t('fields.postalCode')}</div>
                <input value={profile.adresse?.codePostal || ''} onChange={(e) => handleAddressChange('codePostal', e.target.value)} style={styles.input} />
              </label>
              <label>
                <div style={{ marginBottom: '6px', color: '#d8c89b' }}>{t('fields.city')}</div>
                <input value={profile.adresse?.ville || ''} onChange={(e) => handleAddressChange('ville', e.target.value)} style={styles.input} />
              </label>
              <label>
                <div style={{ marginBottom: '6px', color: '#d8c89b' }}>{t('fields.country')}</div>
                <input value={profile.adresse?.pays || 'France'} onChange={(e) => handleAddressChange('pays', e.target.value)} style={styles.input} />
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
