import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CartItemVisualSummary from '../components/CartItemVisualSummary';

export default function OrderSummaryPage() {
  const { t } = useTranslation(['orderSummary', 'univers', 'common', 'cart']);
  const location = useLocation();
  const basketSummary = location.state?.basketSummary;
  const items = basketSummary?.items || [];

  return (
    <div style={{ minHeight: '100vh', background: '#0b0b0b', color: '#eaeaea', padding: '60px 24px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', background: '#101010', padding: '32px', border: '1px solid #222' }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', color: '#c5a059' }}>{t('title')}</h1>

        {items.length > 0 && (
          <>
            <p style={{ color: '#7fae7f' }}>{t('confirmationSent')}</p>
            <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#c5a059', fontSize: '1.1rem', marginTop: '24px' }}>
              {t('itemsTitle')}
            </h2>
            <div style={{ display: 'grid', gap: '10px', marginTop: '12px' }}>
              {items.map((item) => {
                const univers = t(`univers:titles.${item.universId}`, item.universTitle || t('common:configurationFallback', { ns: 'common' }));
                return (
                  <div
                    key={item.id}
                    style={{ padding: '14px', border: '1px solid #222', borderRadius: '8px', color: '#dccfab' }}
                  >
                    {t('itemLine', {
                      univers,
                      quantite: item.quantite,
                      totalTTC: Number(item.quote.totalTTC).toFixed(2),
                    })}
                    <CartItemVisualSummary universId={item.universId} values={item.configuration?.values} />
                  </div>
                );
              })}
            </div>

            <p style={{ color: '#999', lineHeight: 1.8, marginTop: '20px' }}>
              {basketSummary.shippingCostTTC === 0
                ? t('shippingFreeLine')
                : t('shippingLine', { amount: Number(basketSummary.shippingCostTTC).toFixed(2) })}
            </p>
            <p style={{ color: '#c5a059', fontSize: '1.2rem' }}>
              {t('grandTotalLine', { amount: Number(basketSummary.grandTotalTTC).toFixed(2) })}
            </p>
            {basketSummary.orderIds?.length > 0 && (
              <p style={{ color: '#c5a059' }}>
                {t('orderIdsLine', {
                  ids: basketSummary.orderIds.map((id) => id.slice(0, 8).toUpperCase()).join(', '),
                })}
              </p>
            )}
            <p style={{ color: '#999', lineHeight: 1.8, marginTop: '20px' }}>{t('followUpNote')}</p>
          </>
        )}

        {items.length === 0 && (
          <p style={{ color: '#999', lineHeight: 1.8 }}>
            <Link to="/univers" style={{ color: '#c5a059' }}>{t('cart:emptyCta')}</Link>
          </p>
        )}
      </div>
    </div>
  );
}
