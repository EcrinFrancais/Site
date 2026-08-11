import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ClientManager } from '../logic/ClientManager';

const styles = {
  card: {
    marginTop: '12px',
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid rgba(212, 175, 55, 0.25)',
    background: 'rgba(255,255,255,0.03)',
  },
  title: { color: '#c5a059', fontWeight: 600, marginBottom: '10px' },
  starRow: { display: 'flex', gap: '6px', marginBottom: '12px' },
  star: { fontSize: '1.4rem', cursor: 'pointer', background: 'none', border: 'none', padding: 0, lineHeight: 1 },
  textarea: {
    width: '100%',
    boxSizing: 'border-box',
    minHeight: '80px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.05)',
    color: '#f5ebd7',
    padding: '10px 12px',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  actions: { display: 'flex', gap: '10px', marginTop: '12px', alignItems: 'center' },
  primaryButton: {
    fontSize: '0.72rem',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#000',
    background: '#d4af37',
    border: 'none',
    borderRadius: '999px',
    padding: '10px 18px',
    cursor: 'pointer',
    fontWeight: 600,
  },
  secondaryButton: {
    fontSize: '0.72rem',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#c5a059',
    background: 'transparent',
    border: '1px solid rgba(197, 160, 89, 0.4)',
    borderRadius: '999px',
    padding: '10px 18px',
    cursor: 'pointer',
  },
  error: { color: '#d88b7c', fontSize: '0.82rem', marginTop: '8px' },
};

export default function ReviewForm({ userId, clientName, universId, basketId, onSubmitted, onCancel }) {
  const { t } = useTranslation('reviews');
  const [note, setNote] = useState(5);
  const [hoverNote, setHoverNote] = useState(0);
  const [commentaire, setCommentaire] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = async () => {
    setSending(true);
    setError(false);
    const result = await ClientManager.submitReview(userId, {
      clientName: clientName || '',
      universId,
      basketId,
      note,
      commentaire: commentaire.trim(),
    });
    setSending(false);
    if (result.success) {
      onSubmitted();
    } else {
      setError(true);
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.title}>{t('form.title')}</div>
      <div style={styles.starRow}>
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            aria-label={t('form.ratingLabel')}
            style={{ ...styles.star, color: (hoverNote || note) >= value ? '#d4af37' : '#4a4436' }}
            onMouseEnter={() => setHoverNote(value)}
            onMouseLeave={() => setHoverNote(0)}
            onClick={() => setNote(value)}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        value={commentaire}
        onChange={(event) => setCommentaire(event.target.value)}
        placeholder={t('form.commentPlaceholder')}
        style={styles.textarea}
      />
      <div style={styles.actions}>
        <button type="button" style={styles.primaryButton} onClick={handleSubmit} disabled={sending}>
          {sending ? t('form.sending') : t('form.submit')}
        </button>
        <button type="button" style={styles.secondaryButton} onClick={onCancel} disabled={sending}>
          {t('form.cancel')}
        </button>
      </div>
      {error && <div style={styles.error}>{t('form.error')}</div>}
    </div>
  );
}
