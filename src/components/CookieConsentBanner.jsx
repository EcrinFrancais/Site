import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCookieConsent } from '../context/CookieConsentContext';

const styles = {
  // Carte flottante en coin (plutôt qu'une barre pleine largeur) : certaines
  // pages (configurateurs) ont leurs propres boutons d'action près du bas de
  // l'écran ; une barre pleine largeur les recouvrirait et bloquerait les clics.
  bar: {
    position: 'fixed',
    left: '20px',
    bottom: '20px',
    zIndex: 400,
    maxWidth: '380px',
    width: 'calc(100% - 40px)',
    background: '#131110',
    border: '1px solid rgba(197, 160, 89, 0.35)',
    borderRadius: '16px',
    boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
    padding: '20px',
    fontFamily: 'Montserrat, sans-serif',
  },
  inner: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  text: { color: '#dccfab', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 },
  link: { color: '#c5a059', textDecoration: 'underline' },
  actions: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  outlineButton: {
    fontSize: '0.72rem',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#c5a059',
    background: 'transparent',
    border: '1px solid rgba(197, 160, 89, 0.5)',
    borderRadius: '999px',
    padding: '11px 20px',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  solidButton: {
    fontSize: '0.72rem',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#000',
    background: '#d4af37',
    border: 'none',
    borderRadius: '999px',
    padding: '11px 20px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontWeight: 600,
  },
};

export default function CookieConsentBanner() {
  const { t } = useTranslation('cookies');
  const { isBannerVisible, acceptAll, rejectAll } = useCookieConsent();

  if (!isBannerVisible) return null;

  return (
    <div style={styles.bar} role="dialog" aria-modal="false" aria-labelledby="cookie-consent-text">
      <div style={styles.inner}>
        <p id="cookie-consent-text" style={styles.text}>
          {t('banner.text')}{' '}
          <Link to="/mentions-legales" style={styles.link}>{t('banner.learnMore')}</Link>
        </p>
        <div style={styles.actions}>
          <button type="button" style={styles.outlineButton} onClick={rejectAll}>
            {t('banner.reject')}
          </button>
          <button type="button" style={styles.solidButton} onClick={acceptAll}>
            {t('banner.accept')}
          </button>
        </div>
      </div>
    </div>
  );
}
