import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { listConfigurationDrafts } from '../application/configurationUseCases';
import { useAuth } from '../context/AuthContext';
import { ClientManager } from '../logic/ClientManager';

export default function ClientSpacePage() {
  const { t } = useTranslation(['clientSpace', 'univers', 'configurator', 'common']);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [drafts, setDrafts] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!user) return;
    listConfigurationDrafts(user.uid).then((items) => setDrafts(items)).catch(() => setDrafts([]));
    ClientManager.getOrders(user.uid).then((items) => setOrders(items)).catch(() => setOrders([]));
  }, [user]);

  return (
    <div style={{ minHeight: '100vh', background: '#0b0b0b', color: '#eaeaea', padding: '60px 24px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontFamily: 'Playfair Display, serif', color: '#c5a059', marginBottom: '6px' }}>{t('title')}</h1>
          <p style={{ color: '#999', lineHeight: 1.8, margin: 0 }}>
            {t('intro')}
          </p>
        </div>

        <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#c5a059', fontSize: '1.3rem', marginTop: '32px', marginBottom: '12px' }}>
          {t('draftsTitle')}
        </h2>
        <div style={{ display: 'grid', gap: '12px' }}>
          {drafts.length === 0 ? (
            <div style={{ padding: '18px', border: '1px solid rgba(212, 175, 55, 0.2)', borderRadius: '12px', background: 'rgba(255,255,255,0.04)' }}>
              {t('empty')}
            </div>
          ) : (
            drafts.map((draft) => (
              <button
                key={draft.id}
                onClick={() => navigate(`/config/${draft.universId || 'vins-spiritueux'}`, { state: { draft } })}
                style={{ textAlign: 'left', padding: '18px', border: '1px solid rgba(212, 175, 55, 0.2)', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', cursor: 'pointer', color: 'inherit' }}
              >
                <div style={{ fontWeight: 600, color: '#f4e6c0' }}>
                  {t(`univers:titles.${draft.universId}`, draft.universTitle || t('common:configurationFallback', { ns: 'common' }))}
                </div>
                <div style={{ color: '#999', fontSize: '0.95rem', marginTop: '6px' }}>
                  {t('draftLine', {
                    version: draft.version || 1,
                    essence: t(`configurator:essences.${draft.values?.essence}`, draft.values?.essence || '—'),
                    finition: t(`configurator:finitions.${draft.values?.finition}`, draft.values?.finition || '—'),
                    quantite: draft.values?.quantite || 1,
                  })}
                </div>
              </button>
            ))
          )}
        </div>

        <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#c5a059', fontSize: '1.3rem', marginTop: '32px', marginBottom: '12px' }}>
          {t('ordersTitle')}
        </h2>
        <div style={{ display: 'grid', gap: '12px' }}>
          {orders.length === 0 ? (
            <div style={{ padding: '18px', border: '1px solid rgba(212, 175, 55, 0.2)', borderRadius: '12px', background: 'rgba(255,255,255,0.04)' }}>
              {t('ordersEmpty')}
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                style={{ padding: '18px', border: '1px solid rgba(212, 175, 55, 0.2)', borderRadius: '12px', background: 'rgba(255,255,255,0.04)' }}
              >
                <div style={{ fontWeight: 600, color: '#f4e6c0' }}>
                  {t(`univers:titles.${order.configuration?.universId}`, order.configuration?.universTitle || t('common:configurationFallback', { ns: 'common' }))}
                </div>
                <div style={{ color: '#999', fontSize: '0.95rem', marginTop: '6px' }}>
                  {t('orderLine', {
                    id: order.id.slice(0, 8).toUpperCase(),
                    date: order.date,
                    quantite: order.configuration?.values?.quantite || 1,
                    total: Number(order.total || 0).toFixed(2),
                  })}
                </div>
                <div style={{ color: '#c5a059', fontSize: '0.9rem', marginTop: '4px' }}>
                  {t(`common:status.${order.statut}`, order.statut)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
