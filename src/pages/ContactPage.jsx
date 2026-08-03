import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ContactManager } from '../logic/ContactManager';

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #050505 0%, #101010 100%)',
    color: '#f5ebd7',
    padding: '60px 24px 90px',
    fontFamily: 'Montserrat, sans-serif',
  },
  shell: { maxWidth: '760px', margin: '0 auto' },
  eyebrow: {
    fontFamily: 'Montserrat, sans-serif',
    fontSize: '0.72rem',
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    color: '#c5a059',
    marginBottom: '14px',
  },
  title: {
    fontFamily: 'Playfair Display, serif',
    color: '#f2e2b4',
    fontSize: '2.1rem',
    fontWeight: 400,
    marginBottom: '14px',
  },
  muted: { color: '#a79c86', lineHeight: 1.8, fontSize: '0.98rem', marginBottom: '40px' },
  card: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(197,160,89,0.24)',
    borderRadius: '22px',
    padding: '32px',
    boxShadow: '0 18px 45px rgba(0,0,0,0.25)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '18px',
  },
  field: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: {
    fontSize: '0.68rem',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: '#d8c89b',
  },
  input: {
    width: '100%',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '12px',
    padding: '12px 14px',
    background: 'rgba(255,255,255,0.05)',
    color: '#f5ebd7',
    fontFamily: 'inherit',
    fontSize: '0.95rem',
    boxSizing: 'border-box',
  },
  submitButton: {
    marginTop: '26px',
    padding: '14px 30px',
    borderRadius: '999px',
    border: '1px solid #c5a059',
    background: 'transparent',
    color: '#c5a059',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
  },
  errorText: {
    marginTop: '16px',
    color: '#e3a08c',
    fontSize: '0.85rem',
    lineHeight: 1.6,
  },
  confirmCard: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(197,160,89,0.3)',
    borderRadius: '22px',
    padding: '52px 40px',
    textAlign: 'center',
    boxShadow: '0 18px 45px rgba(0,0,0,0.25)',
  },
  confirmMark: {
    width: '56px',
    height: '56px',
    margin: '0 auto 22px',
    borderRadius: '50%',
    border: '1px solid #c5a059',
    color: '#c5a059',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.4rem',
  },
};

export default function ContactPage() {
  const { t } = useTranslation('contact');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('sending');
    const res = await ContactManager.envoyerMessage({ nom, email, telephone, message });
    setStatus(res.success ? 'sent' : 'error');
  };

  if (status === 'sent') {
    return (
      <div style={styles.page}>
        <div style={styles.shell}>
          <div style={styles.confirmCard}>
            <div style={styles.confirmMark}>✓</div>
            <h1 style={styles.title}>{t('confirm.title')}</h1>
            <p style={{ ...styles.muted, marginBottom: 0 }}>
              {t('confirm.text')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <div style={styles.eyebrow}>{t('eyebrow')}</div>
        <h1 style={styles.title}>{t('title')}</h1>
        <p style={styles.muted}>
          {t('lead')}
        </p>

        <form onSubmit={handleSubmit} style={styles.card}>
          <div style={styles.grid}>
            <label style={styles.field}>
              <span style={styles.label}>{t('fields.name')}</span>
              <input
                required
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                style={styles.input}
              />
            </label>
            <label style={styles.field}>
              <span style={styles.label}>{t('fields.email')}</span>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
              />
            </label>
            <label style={styles.field}>
              <span style={styles.label}>{t('fields.phone')}</span>
              <input
                type="tel"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                style={styles.input}
              />
            </label>
          </div>

          <label style={{ ...styles.field, marginTop: '18px' }}>
            <span style={styles.label}>{t('fields.message')}</span>
            <textarea
              required
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{ ...styles.input, resize: 'vertical' }}
            />
          </label>

          {status === 'error' && (
            <p style={styles.errorText}>
              {t('error')}
            </p>
          )}

          <button type="submit" style={styles.submitButton} disabled={status === 'sending'}>
            {status === 'sending' ? t('sending') : t('submit')}
          </button>
        </form>
      </div>
    </div>
  );
}
