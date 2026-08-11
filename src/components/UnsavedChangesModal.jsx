import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 300,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  card: {
    background: '#17140f',
    border: '1px solid rgba(197, 160, 89, 0.3)',
    borderRadius: '12px',
    padding: '32px',
    maxWidth: '420px',
    width: '100%',
    textAlign: 'center',
    fontFamily: 'Montserrat, sans-serif',
    boxShadow: '0 20px 40px -12px rgba(0,0,0,0.7)',
  },
  title: {
    fontFamily: 'Playfair Display, serif',
    color: '#c5a059',
    fontSize: '1.3rem',
    margin: '0 0 12px',
  },
  body: {
    color: '#dccfab',
    lineHeight: 1.6,
    margin: '0 0 24px',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  outlineButton: {
    fontSize: '0.72rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#c5a059',
    background: 'transparent',
    border: '1px solid rgba(197, 160, 89, 0.5)',
    borderRadius: '999px',
    padding: '12px 20px',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  solidButton: {
    fontSize: '0.72rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#000',
    background: '#d4af37',
    border: 'none',
    borderRadius: '999px',
    padding: '12px 20px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontWeight: 600,
  },
};

export default function UnsavedChangesModal({ onSave, onDiscard, onCancel }) {
  const { t } = useTranslation('header');

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  return (
    <div
      style={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="unsaved-changes-modal-title"
      onClick={onCancel}
    >
      <div style={styles.card} onClick={(event) => event.stopPropagation()}>
        <h2 id="unsaved-changes-modal-title" style={styles.title}>
          {t('unsavedChangesModal.title')}
        </h2>
        <p style={styles.body}>{t('unsavedChangesModal.body')}</p>
        <div style={styles.actions}>
          <button type="button" style={styles.outlineButton} onClick={onDiscard}>
            {t('unsavedChangesModal.discard')}
          </button>
          <button type="button" style={styles.solidButton} onClick={onSave}>
            {t('unsavedChangesModal.save')}
          </button>
        </div>
      </div>
    </div>
  );
}
