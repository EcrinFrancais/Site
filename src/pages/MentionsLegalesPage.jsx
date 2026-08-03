import React from 'react';
import { useTranslation } from 'react-i18next';

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #050505 0%, #111111 100%)',
    color: '#f3ead7',
    padding: '40px 24px 80px',
    fontFamily: 'Montserrat, sans-serif',
  },
  shell: { maxWidth: '900px', margin: '0 auto', display: 'grid', gap: '20px' },
  card: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(197,160,89,0.24)',
    borderRadius: '22px',
    padding: '24px',
    boxShadow: '0 18px 45px rgba(0,0,0,0.25)',
  },
  title: { fontFamily: 'Playfair Display, serif', color: '#c5a059', marginBottom: '8px', fontSize: '1.5rem' },
  subtitle: { fontFamily: 'Playfair Display, serif', color: '#c5a059', marginBottom: '8px', fontSize: '1.15rem' },
  muted: { color: '#9b937f', lineHeight: 1.7, fontSize: '0.9rem' },
};

export default function MentionsLegalesPage() {
  const { t } = useTranslation('legal');
  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <div style={styles.card}>
          <h1 style={styles.title}>{t('title')}</h1>
          <p style={styles.muted}>{t('lastUpdated')}</p>
        </div>

        <div style={styles.card}>
          <h2 style={styles.subtitle}>{t('sections.editor.title')}</h2>
          <p style={styles.muted}>{t('sections.editor.text')}</p>
        </div>

        <div style={styles.card}>
          <h2 style={styles.subtitle}>{t('sections.ip.title')}</h2>
          <p style={styles.muted}>{t('sections.ip.text')}</p>
        </div>

        <div style={styles.card}>
          <h2 style={styles.subtitle}>{t('sections.data.title')}</h2>
          <p style={styles.muted}>{t('sections.data.text')}</p>
        </div>

        <div style={styles.card}>
          <h2 style={styles.subtitle}>{t('sections.terms.title')}</h2>
          <p style={styles.muted}>{t('sections.terms.text')}</p>
        </div>

        <div style={styles.card}>
          <h2 style={styles.subtitle}>{t('sections.returns.title')}</h2>
          <p style={styles.muted}>{t('sections.returns.text')}</p>
        </div>
      </div>
    </div>
  );
}
