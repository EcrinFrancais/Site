import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { buildOrderSummary } from '../logic/orderModel';

export default function OrderSummaryPage() {
  const { t } = useTranslation(['orderSummary', 'univers', 'common']);
  const location = useLocation();
  const orderDraft = location.state?.orderDraft || { configuration: {} };
  const summary = buildOrderSummary(orderDraft);
  const universId = orderDraft.configuration?.universId;
  const translatedUnivers = t(`univers:titles.${universId}`, summary.univers);
  const translatedStatus = t(`common:status.${summary.status}`, summary.status);

  return (
    <div style={{ minHeight: '100vh', background: '#0b0b0b', color: '#eaeaea', padding: '60px 24px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', background: '#101010', padding: '32px', border: '1px solid #222' }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', color: '#c5a059' }}>{t('title')}</h1>
        <p style={{ color: '#999', lineHeight: 1.8 }}>
          {t('univers', { univers: translatedUnivers })}
        </p>
        <p style={{ color: '#999', lineHeight: 1.8 }}>
          {t('quantity', { quantity: summary.quantity })}
        </p>
        <p style={{ color: '#999', lineHeight: 1.8 }}>
          {t('status', { status: translatedStatus })}
        </p>
        <p style={{ color: '#c5a059', fontSize: '1.2rem' }}>
          {t('total', { total: Number(summary.total).toFixed(2) })}
        </p>
        {orderDraft.id && (
          <p style={{ color: '#c5a059' }}>
            {t('orderId', { id: orderDraft.id.slice(0, 8).toUpperCase() })}
          </p>
        )}
        {orderDraft.persisted && (
          <p style={{ color: '#7fae7f' }}>{t('confirmationSent')}</p>
        )}
      </div>
    </div>
  );
}
