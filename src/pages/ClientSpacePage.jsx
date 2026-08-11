import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { listConfigurationDrafts, deleteConfigurationDraft } from '../application/configurationUseCases';
import { useAuth } from '../context/AuthContext';
import { ClientManager } from '../logic/ClientManager';
import { groupOrdersIntoBaskets } from '../domain/basket';
import { OrderStatus } from '../domain/orderStatus';
import OrderProgress from '../components/OrderProgress';
import ReviewForm from '../components/ReviewForm';

export default function ClientSpacePage() {
  const { t } = useTranslation(['clientSpace', 'univers', 'configurator', 'common', 'reviews']);
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  // Prénom + initiale du nom uniquement : c'est ce nom qui sera affiché
  // publiquement à côté de l'avis (jamais le nom complet).
  const reviewerName = [profile?.prenom, profile?.nom ? `${profile.nom.charAt(0)}.` : ''].filter(Boolean).join(' ');
  const [drafts, setDrafts] = useState([]);
  const [orderBaskets, setOrderBaskets] = useState([]);
  const [reviewedBasketIds, setReviewedBasketIds] = useState([]);
  const [openReviewBasketId, setOpenReviewBasketId] = useState(null);

  useEffect(() => {
    if (!user) return;
    listConfigurationDrafts(user.uid).then((items) => setDrafts(items)).catch(() => setDrafts([]));
    ClientManager.getOrders(user.uid)
      .then((items) => setOrderBaskets(groupOrdersIntoBaskets(items)))
      .catch(() => setOrderBaskets([]));
    ClientManager.getMyReviewedBasketIds(user.uid)
      .then((ids) => setReviewedBasketIds(ids))
      .catch(() => setReviewedBasketIds([]));
  }, [user]);

  const handleDeleteDraft = (draftId) => {
    if (!window.confirm(t('deleteConfirm'))) return;
    setDrafts((current) => current.filter((draft) => draft.id !== draftId));
    deleteConfigurationDraft(draftId).catch(() => {
      listConfigurationDrafts(user.uid).then((items) => setDrafts(items)).catch(() => {});
    });
  };

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
              <div
                key={draft.id}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '18px', border: '1px solid rgba(212, 175, 55, 0.2)', borderRadius: '12px', background: 'rgba(255,255,255,0.04)' }}
              >
                <button
                  onClick={() => navigate(`/config/${draft.universId || 'vins-spiritueux'}`, { state: { draft } })}
                  style={{ flex: 1, textAlign: 'left', padding: 0, border: 'none', background: 'none', cursor: 'pointer', color: 'inherit' }}
                >
                  <div style={{ fontWeight: 600, color: '#f4e6c0' }}>
                    {draft.name || t(`univers:titles.${draft.universId}`, draft.universTitle || t('common:configurationFallback', { ns: 'common' }))}
                  </div>
                  {draft.name && (
                    <div style={{ color: '#c5a059', fontSize: '0.85rem', marginTop: '2px' }}>
                      {t(`univers:titles.${draft.universId}`, draft.universTitle || t('common:configurationFallback', { ns: 'common' }))}
                    </div>
                  )}
                  <div style={{ color: '#999', fontSize: '0.95rem', marginTop: '6px' }}>
                    {t('draftLine', {
                      version: draft.version || 1,
                      essence: t(`configurator:essences.${draft.values?.essence}`, draft.values?.essence || '—'),
                      finition: t(`configurator:finitions.${draft.values?.finition}`, draft.values?.finition || '—'),
                      quantite: draft.values?.quantite || 1,
                    })}
                  </div>
                </button>
                <button
                  onClick={() => handleDeleteDraft(draft.id)}
                  aria-label={t('delete')}
                  title={t('delete')}
                  style={{ flexShrink: 0, width: '32px', height: '32px', border: '1px solid rgba(212, 175, 55, 0.2)', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', color: '#c98080', cursor: 'pointer', fontSize: '1rem', lineHeight: 1 }}
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#c5a059', fontSize: '1.3rem', marginTop: '32px', marginBottom: '12px' }}>
          {t('ordersTitle')}
        </h2>
        <div style={{ display: 'grid', gap: '12px' }}>
          {orderBaskets.length === 0 ? (
            <div style={{ padding: '18px', border: '1px solid rgba(212, 175, 55, 0.2)', borderRadius: '12px', background: 'rgba(255,255,255,0.04)' }}>
              {t('ordersEmpty')}
            </div>
          ) : (
            orderBaskets.map((basket) => {
              const firstNamed = basket.items.find((item) => item.configuration?.name);
              const displayName = firstNamed?.configuration?.name
                || t(`univers:titles.${basket.items[0]?.configuration?.universId}`, basket.items[0]?.configuration?.universTitle || t('common:configurationFallback', { ns: 'common' }));
              const universLabels = Array.from(
                new Set(basket.items.map((item) => t(`univers:titles.${item.configuration?.universId}`, item.configuration?.universTitle)))
              ).join(', ');
              const quantiteTotale = basket.items.reduce((sum, item) => sum + Number(item.configuration?.values?.quantite || 1), 0);
              const dateLabel = basket.items[0]?.date;

              return (
                <div
                  key={basket.basketId}
                  style={{ padding: '18px', border: '1px solid rgba(212, 175, 55, 0.2)', borderRadius: '12px', background: 'rgba(255,255,255,0.04)' }}
                >
                  <div style={{ fontWeight: 600, color: '#f4e6c0' }}>{displayName}</div>
                  {firstNamed && (
                    <div style={{ color: '#c5a059', fontSize: '0.85rem', marginTop: '2px' }}>{universLabels}</div>
                  )}
                  <div style={{ color: '#999', fontSize: '0.95rem', marginTop: '6px' }}>
                    {t('orderLine', {
                      id: basket.basketId.slice(-8).toUpperCase(),
                      date: dateLabel,
                      quantite: quantiteTotale,
                      total: basket.total.toFixed(2),
                    })}
                  </div>
                  <OrderProgress status={basket.status} />

                  {basket.status === OrderStatus.DELIVERED && (
                    reviewedBasketIds.includes(basket.basketId) ? (
                      <div style={{ marginTop: '12px', color: '#7fae7f', fontSize: '0.85rem' }}>
                        {t('reviews:alreadySubmitted')}
                      </div>
                    ) : openReviewBasketId === basket.basketId ? (
                      <ReviewForm
                        userId={user.uid}
                        clientName={reviewerName}
                        universId={basket.items[0]?.configuration?.universId}
                        basketId={basket.basketId}
                        onCancel={() => setOpenReviewBasketId(null)}
                        onSubmitted={() => {
                          setReviewedBasketIds((current) => [...current, basket.basketId]);
                          setOpenReviewBasketId(null);
                        }}
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => setOpenReviewBasketId(basket.basketId)}
                        style={{
                          marginTop: '12px',
                          fontSize: '0.72rem',
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          color: '#c5a059',
                          background: 'transparent',
                          border: '1px solid rgba(197, 160, 89, 0.4)',
                          borderRadius: '999px',
                          padding: '10px 18px',
                          cursor: 'pointer',
                        }}
                      >
                        {t('reviews:cta')}
                      </button>
                    )
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
