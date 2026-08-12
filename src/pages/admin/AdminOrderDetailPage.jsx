import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AdminManager } from '../../logic/AdminManager';
import { groupOrdersIntoBaskets } from '../../domain/basket';
import { OrderStatus } from '../../domain/orderStatus';
import { isStale, getStatusSince, daysSince } from '../../logic/orderInsights';
import { adminStyles as styles } from '../../styles/adminStyles';

export default function AdminOrderDetailPage() {
  const { t } = useTranslation(['admin', 'univers', 'configurator', 'common']);
  const { basketId } = useParams();
  const navigate = useNavigate();
  const [basket, setBasket] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [statusState, setStatusState] = useState('idle');
  const [selectedItem, setSelectedItem] = useState(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [noteState, setNoteState] = useState('idle');

  useEffect(() => {
    AdminManager.getAllOrders().then((orderDocs) => {
      const found = groupOrdersIntoBaskets(orderDocs).find((b) => b.basketId === basketId);
      if (!found) {
        setNotFound(true);
        return;
      }
      setBasket(found);
      setNoteDraft(found.note || '');
    });
  }, [basketId]);

  const totals = useMemo(() => {
    if (!basket) return { subtotal: 0, shipping: 0 };
    const shipping = basket.items.reduce((sum, item) => sum + Number(item.shippingShareTTC || 0), 0);
    return { subtotal: basket.total - shipping, shipping };
  }, [basket]);

  const handleStatusChange = async (event) => {
    const newStatus = event.target.value;
    setStatusState('saving');
    const result = await AdminManager.updateBasketStatus(basket.orderIds, newStatus, {
      clientEmail: basket.clientProfile?.email,
      basketNumero: basket.basketId.slice(-8).toUpperCase(),
      statusLabel: t(`common:status.${newStatus}`, newStatus),
    });
    if (result.success) {
      setBasket((prev) => ({
        ...prev,
        status: newStatus,
        statusHistory: [...(prev.statusHistory || []), result.historyEntry],
      }));
      setStatusState('saved');
      window.setTimeout(() => setStatusState('idle'), 2000);
    } else {
      setStatusState('error');
    }
  };

  const handleSaveNote = async () => {
    setNoteState('saving');
    const result = await AdminManager.updateBasketNote(basket.orderIds, noteDraft);
    if (result.success) {
      setBasket((prev) => ({ ...prev, note: noteDraft }));
      setNoteState('saved');
      window.setTimeout(() => setNoteState('idle'), 2000);
    } else {
      setNoteState('error');
    }
  };

  if (notFound) {
    return (
      <div style={styles.page}>
        <div style={styles.inner}>
          <Link to="/admin" style={styles.backLink}>{t('detail.back')}</Link>
          <p>{t('dashboard.empty')}</p>
        </div>
      </div>
    );
  }

  if (!basket) {
    return <div style={styles.page} />;
  }

  const p = basket.clientProfile || {};
  const adresse = p.adresse
    ? [
        [p.adresse.numero, p.adresse.voie, p.adresse.complement].filter(Boolean).join(' '),
        [p.adresse.codePostal, p.adresse.ville, p.adresse.pays].filter(Boolean).join(' '),
      ].filter(Boolean).join(', ')
    : null;

  return (
    <div style={styles.page}>
      <div style={styles.inner}>
        <button type="button" onClick={() => navigate('/admin')} style={{ ...styles.backLink, background: 'none', border: 'none', cursor: 'pointer', font: 'inherit' }}>
          {t('detail.back')}
        </button>

        <div style={styles.headerRow}>
          <h1 style={styles.title}>{t('detail.orderTitle', { numero: basket.basketId.slice(-8).toUpperCase() })}</h1>
          <div>
            <label style={{ display: 'block', fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#948a76', marginBottom: '6px' }}>
              {t('detail.statusLabel')}
            </label>
            <select style={styles.select} value={basket.status} onChange={handleStatusChange}>
              {Object.values(OrderStatus).map((status) => (
                <option key={status} value={status}>{t(`common:status.${status}`, status)}</option>
              ))}
            </select>
            {isStale(basket) && (
              <div style={{ ...styles.staleBadge, marginLeft: 0, marginTop: '6px' }}>
                {t('detail.staleBadge', { days: daysSince(getStatusSince(basket)) })}
              </div>
            )}
            {statusState === 'saving' && <div style={{ fontSize: '0.75rem', color: '#948a76', marginTop: '6px' }}>{t('detail.statusSaving')}</div>}
            {statusState === 'saved' && <div style={{ fontSize: '0.75rem', color: '#7fae7f', marginTop: '6px' }}>{t('detail.statusSaved')}</div>}
            {statusState === 'error' && <div style={{ fontSize: '0.75rem', color: '#d88b7c', marginTop: '6px' }}>{t('detail.statusError')}</div>}
          </div>
        </div>

        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>{t('detail.clientInfoTitle')}</h2>
          <p style={{ margin: '4px 0' }}>{[p.prenom, p.nom].filter(Boolean).join(' ') || '—'}</p>
          <p style={{ margin: '4px 0', color: '#948a76' }}>{p.email || '—'}</p>
          <p style={{ margin: '4px 0', color: '#948a76' }}>{p.telephone || '—'}</p>
          <p style={{ margin: '4px 0', color: '#948a76' }}>{adresse || '—'}</p>
          {p.entreprise && <p style={{ margin: '4px 0', color: '#948a76' }}>{p.entreprise}{p.siret ? ` (SIRET ${p.siret})` : ''}</p>}
        </div>

        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>{t('detail.historyTitle')}</h2>
          {(basket.statusHistory || []).length === 0 ? (
            <p style={{ color: '#948a76', margin: 0 }}>{t('detail.historyEmpty')}</p>
          ) : (
            <div style={{ display: 'grid', gap: '8px' }}>
              {basket.statusHistory.map((entry, index) => (
                <div key={`${entry.status}-${entry.changedAt}-${index}`} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: '#dccfab' }}>{t(`common:status.${entry.status}`, entry.status)}</span>
                  <span style={{ color: '#948a76' }}>{entry.changedAt ? new Date(entry.changedAt).toLocaleString() : '—'}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>{t('detail.notesTitle')}</h2>
          <p style={{ color: '#948a76', fontSize: '0.8rem', marginTop: 0 }}>{t('detail.notesHint')}</p>
          <textarea
            style={{ ...styles.textarea, minHeight: '80px' }}
            placeholder={t('detail.notesPlaceholder')}
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
          />
          <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button type="button" style={styles.primaryButton} onClick={handleSaveNote} disabled={noteState === 'saving'}>
              {t('detail.notesSave')}
            </button>
            {noteState === 'saved' && <span style={{ fontSize: '0.75rem', color: '#7fae7f' }}>{t('detail.notesSaved')}</span>}
            {noteState === 'error' && <span style={{ fontSize: '0.75rem', color: '#d88b7c' }}>{t('detail.notesError')}</span>}
          </div>
        </div>

        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>{t('detail.projectsTitle')}</h2>
          {basket.items.map((item) => {
            const config = item.configuration || {};
            const universLabel = config.universId
              ? t(`univers:titles.${config.universId}`, config.universTitle || config.universId)
              : t('common:configurationFallback', { ns: 'common' });
            return (
              <div key={item.id} style={styles.itemRow} onClick={() => setSelectedItem(item)}>
                <div>
                  <div style={{ color: '#f4e6c0', fontWeight: 600 }}>{config.name || universLabel}</div>
                  {config.name && <div style={{ color: '#c5a059', fontSize: '0.82rem' }}>{universLabel}</div>}
                </div>
                <div style={{ color: '#dccfab' }}>
                  {t('detail.quantity')}: {config.values?.quantite || 1} — {(Number(item.total || 0) - Number(item.shippingShareTTC || 0)).toFixed(2)} €
                </div>
              </div>
            );
          })}

          <div style={{ marginTop: '18px', paddingTop: '14px', borderTop: '1px solid rgba(197, 160, 89, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dccfab', marginBottom: '6px' }}>
              <span>{t('detail.subtotal')}</span><span>{totals.subtotal.toFixed(2)} €</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dccfab', marginBottom: '6px' }}>
              <span>{t('detail.shipping')}</span><span>{totals.shipping.toFixed(2)} €</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#c5a059', fontWeight: 700, fontSize: '1.1rem' }}>
              <span>{t('detail.total')}</span><span>{basket.total.toFixed(2)} €</span>
            </div>
          </div>
        </div>
      </div>

      {selectedItem && (
        <div style={styles.overlay} role="dialog" aria-modal="true" onClick={() => setSelectedItem(null)}>
          <div style={styles.panel} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.sectionTitle}>{t('detail.projectCharacteristics')}</h2>
            <ProjectCharacteristics item={selectedItem} t={t} />
            <button type="button" style={{ ...styles.linkButton, marginTop: '18px' }} onClick={() => setSelectedItem(null)}>
              {t('detail.close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ProjectCharacteristics({ item, t }) {
  const v = item.configuration?.values || {};
  const quantite = v.quantite || 1;
  const totalTTC = Number(item.total || 0) - Number(item.shippingShareTTC || 0);
  const unitPrice = quantite > 0 ? totalTTC / quantite : totalTTC;
  const dims = v.dims || v.mesures;
  const dimsLabel = dims && (dims.L || dims.l || dims.h)
    ? `${dims.L || '—'} × ${dims.l || '—'} × ${dims.h || '—'} cm`
    : null;

  const rows = [
    [t('detail.quantity'), quantite],
    [t('detail.unitPrice'), `${unitPrice.toFixed(2)} €`],
    v.taille && [t('detail.taille'), t(`configurator:tailles.${v.taille}`, v.taille)],
    dimsLabel && [t('detail.dimensions'), dimsLabel],
    v.essence && [t('detail.essence'), t(`configurator:essences.${v.essence}`, v.essence)],
    v.finition && [t('detail.finition'), t(`configurator:finitions.${v.finition}`, v.finition)],
    v.cales && [t('detail.cales'), v.cales],
    v.couleurVelours && [t('detail.couleurVelours'), v.couleurVelours],
    v.fermeture && [t('detail.fermeture'), v.fermeture],
    [t('detail.gravure'), v.gravureType && v.gravureType !== 'Aucune' ? `${v.gravureType}${v.texteGravure ? ` — "${v.texteGravure}"` : ''}` : t('detail.noGravure')],
  ].filter(Boolean);

  return (
    <div style={{ display: 'grid', gap: '10px' }}>
      {rows.map(([label, value]) => (
        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
          <span style={{ color: '#948a76' }}>{label}</span>
          <span style={{ color: '#eaeaea', textAlign: 'right' }}>{value}</span>
        </div>
      ))}
    </div>
  );
}
