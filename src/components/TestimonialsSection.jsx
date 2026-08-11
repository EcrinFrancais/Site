import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ClientManager } from '../logic/ClientManager';

const styles = {
  section: {
    padding: '120px 40px',
    background: 'linear-gradient(180deg, #0a0a0a 0%, #101010 100%)',
  },
  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '3rem',
    color: '#C5A059',
    marginBottom: '16px',
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    color: '#b8af96',
    maxWidth: '720px',
    margin: '0 auto 48px',
    lineHeight: 1.8,
    fontSize: '1rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
    maxWidth: '1280px',
    margin: '0 auto',
  },
  card: {
    padding: '28px 26px',
    border: '1px solid rgba(197,160,89,0.18)',
    borderRadius: '18px',
    background: 'rgba(255,255,255,0.04)',
  },
  stars: { color: '#d4af37', fontSize: '1.1rem', marginBottom: '12px', letterSpacing: '2px' },
  comment: { color: '#D9D1C2', lineHeight: 1.7, fontSize: '0.98rem', margin: '0 0 16px' },
  footer: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' },
  name: { color: '#F3E7C4', fontWeight: 600, fontSize: '0.9rem' },
  badge: {
    fontSize: '0.68rem',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: '#8fbf8f',
    border: '1px solid rgba(143, 191, 143, 0.35)',
    borderRadius: '999px',
    padding: '4px 10px',
  },
};

export default function TestimonialsSection() {
  const { t } = useTranslation(['reviews', 'univers']);
  const [reviews, setReviews] = useState(null);

  useEffect(() => {
    ClientManager.getApprovedReviews(6).then(setReviews).catch(() => setReviews([]));
  }, []);

  if (!reviews || reviews.length === 0) return null;

  return (
    <section style={styles.section}>
      <h2 style={styles.title}>{t('reviews:testimonials.title')}</h2>
      <p style={styles.subtitle}>{t('reviews:testimonials.subtitle')}</p>
      <div style={styles.grid}>
        {reviews.map((review) => (
          <div key={review.id} style={styles.card}>
            <div style={styles.stars}>{'★'.repeat(review.note || 0)}{'☆'.repeat(5 - (review.note || 0))}</div>
            <p style={styles.comment}>{review.commentaire}</p>
            <div style={styles.footer}>
              <span style={styles.name}>
                {review.clientName || t('reviews:testimonials.verifiedBadge')}
                {review.universId && (
                  <span style={{ color: '#948a76', fontWeight: 400 }}>
                    {' '}— {t(`univers:titles.${review.universId}`, '')}
                  </span>
                )}
              </span>
              <span style={styles.badge}>{t('reviews:testimonials.verifiedBadge')}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
