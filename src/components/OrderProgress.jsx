import React from 'react';
import { useTranslation } from 'react-i18next';
import { ORDER_PROGRESS_STEPS, isExceptionStatus, getOrderProgressIndex } from '../domain/orderStatus';

const EXCEPTION_COLORS = {
  cancelled: '#c98080',
  dispute_return: '#d99a52',
  on_hold: '#8fa3c9',
};

export default function OrderProgress({ status }) {
  const { t } = useTranslation('common');
  const label = t(`status.${status}`, status || '—');

  if (isExceptionStatus(status)) {
    const color = EXCEPTION_COLORS[status] || '#c5a059';
    return (
      <span
        style={{
          display: 'inline-block',
          marginTop: '8px',
          padding: '4px 10px',
          borderRadius: '999px',
          border: `1px solid ${color}`,
          color,
          fontSize: '0.85rem',
        }}
      >
        {label}
      </span>
    );
  }

  const stepIndex = getOrderProgressIndex(status);
  const isDelivered = stepIndex === ORDER_PROGRESS_STEPS.length - 1;

  return (
    <div style={{ marginTop: '10px' }}>
      <div style={{ display: 'flex', gap: '4px' }}>
        {ORDER_PROGRESS_STEPS.map((step, i) => (
          <div
            key={step}
            style={{
              flex: 1,
              height: '5px',
              borderRadius: '3px',
              background: stepIndex >= 0 && i <= stepIndex ? '#c5a059' : 'rgba(255,255,255,0.12)',
            }}
          />
        ))}
      </div>
      <div style={{ color: isDelivered ? '#7fae7f' : '#c5a059', fontSize: '0.85rem', marginTop: '6px' }}>
        {label}
      </div>
    </div>
  );
}
