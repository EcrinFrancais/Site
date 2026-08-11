import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ClientManager } from '../logic/ClientManager';
import { FREE_SHIPPING_THRESHOLD_TTC } from '../logic/shippingService';
import CartItemVisualSummary from '../components/CartItemVisualSummary';

const styles = {
  page: { minHeight: '100vh', background: '#0b0b0b', color: '#eaeaea', padding: '60px 24px' },
  inner: { maxWidth: '900px', margin: '0 auto' },
  title: { fontFamily: 'Playfair Display, serif', color: '#c5a059', marginBottom: '6px' },
  intro: { color: '#999', lineHeight: 1.8, margin: '0 0 32px' },
  empty: {
    padding: '18px',
    border: '1px solid rgba(212, 175, 55, 0.2)',
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.04)',
  },
  emptyCta: {
    display: 'inline-block',
    marginTop: '16px',
    fontSize: '0.72rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#000',
    background: '#d4af37',
    border: 'none',
    borderRadius: '999px',
    padding: '12px 22px',
    textDecoration: 'none',
  },
  list: { display: 'grid', gap: '12px', marginBottom: '32px' },
  card: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '18px',
    border: '1px solid rgba(212, 175, 55, 0.2)',
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.04)',
  },
  cardName: { fontWeight: 600, color: '#f4e6c0' },
  cardUnivers: { color: '#c5a059', fontSize: '0.85rem', marginTop: '2px' },
  cardLine: { color: '#999', fontSize: '0.95rem', marginTop: '6px' },
  cardPrice: { color: '#c5a059', fontWeight: 600, whiteSpace: 'nowrap' },
  removeButton: {
    flexShrink: 0,
    width: '32px',
    height: '32px',
    border: '1px solid rgba(212, 175, 55, 0.2)',
    borderRadius: '8px',
    background: 'rgba(255,255,255,0.04)',
    color: '#c98080',
    cursor: 'pointer',
    fontSize: '1rem',
    lineHeight: 1,
  },
  totals: {
    border: '1px solid rgba(212, 175, 55, 0.2)',
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.04)',
    padding: '24px',
    maxWidth: '420px',
    marginLeft: 'auto',
  },
  totalsRow: { display: 'flex', justifyContent: 'space-between', color: '#dccfab', marginBottom: '10px' },
  grandTotalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    color: '#c5a059',
    fontSize: '1.2rem',
    fontWeight: 700,
    marginTop: '14px',
    paddingTop: '14px',
    borderTop: '1px solid rgba(212, 175, 55, 0.2)',
  },
  hint: { color: '#948a76', fontSize: '0.78rem', marginTop: '12px' },
  confirmButton: {
    width: '100%',
    marginTop: '20px',
    fontSize: '0.75rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#000',
    background: '#d4af37',
    border: 'none',
    borderRadius: '999px',
    padding: '14px 22px',
    cursor: 'pointer',
    fontWeight: 600,
  },
  error: { color: '#d88b7c', marginTop: '12px', fontSize: '0.85rem' },
};

export default function CartPage() {
  const { t } = useTranslation(['cart', 'univers', 'common']);
  const { user, profile } = useAuth();
  const { items, removeItem, clear, subtotalTTC, shippingCostTTC, grandTotalTTC } = useCart();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState(false);

  const handleRemove = (itemId) => {
    if (!window.confirm(t('removeConfirm'))) return;
    removeItem(itemId);
  };

  const handleConfirmOrder = async () => {
    if (!user) {
      navigate('/auth', { state: { from: '/panier' } });
      return;
    }
    setError(false);
    setConfirming(true);
    const result = await ClientManager.sauvegarderPanier(items, profile || {});
    setConfirming(false);
    if (result.success) {
      const basketSummary = { items, subtotalTTC, shippingCostTTC, grandTotalTTC, orderIds: result.orderIds };
      clear();
      navigate('/commande', { state: { basketSummary } });
    } else {
      setError(true);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.inner}>
        <h1 style={styles.title}>{t('title')}</h1>
        <p style={styles.intro}>{t('intro')}</p>

        {items.length === 0 ? (
          <div style={styles.empty}>
            {t('empty')}
            <div>
              <button type="button" style={{ ...styles.emptyCta, border: 'none' }} onClick={() => navigate('/univers')}>
                {t('emptyCta')}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div style={styles.list}>
              {items.map((item) => (
                <div key={item.id} style={styles.card}>
                  <div style={{ flex: 1 }}>
                    <div style={styles.cardName}>
                      {item.name || t(`univers:titles.${item.universId}`, item.universTitle || t('common:configurationFallback', { ns: 'common' }))}
                    </div>
                    {item.name && (
                      <div style={styles.cardUnivers}>
                        {t(`univers:titles.${item.universId}`, item.universTitle || t('common:configurationFallback', { ns: 'common' }))}
                      </div>
                    )}
                    <CartItemVisualSummary universId={item.universId} values={item.configuration?.values} />
                    <div style={styles.cardLine}>{t('quantityLine', { quantite: item.quantite })}</div>
                  </div>
                  <div style={styles.cardPrice}>{Number(item.quote.totalTTC).toFixed(2)} €</div>
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    aria-label={t('remove')}
                    title={t('remove')}
                    style={styles.removeButton}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div style={styles.totals}>
              <div style={styles.totalsRow}>
                <span>{t('subtotal')}</span>
                <span>{subtotalTTC.toFixed(2)} €</span>
              </div>
              <div style={styles.totalsRow}>
                <span>{t('shipping')}</span>
                <span>{shippingCostTTC === 0 ? t('shippingFree') : `${shippingCostTTC.toFixed(2)} €`}</span>
              </div>
              <div style={styles.grandTotalRow}>
                <span>{t('grandTotal')}</span>
                <span>{grandTotalTTC.toFixed(2)} €</span>
              </div>

              {subtotalTTC < FREE_SHIPPING_THRESHOLD_TTC && (
                <div style={styles.hint}>{t('freeShippingHint', { threshold: FREE_SHIPPING_THRESHOLD_TTC })}</div>
              )}
              {!user && <div style={styles.hint}>{t('signInRequired')}</div>}

              <button type="button" style={styles.confirmButton} onClick={handleConfirmOrder} disabled={confirming}>
                {confirming ? t('confirming') : t('confirmOrder')}
              </button>
              {error && <div style={styles.error}>{t('confirmError')}</div>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
