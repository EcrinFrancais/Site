import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AdminManager } from '../../logic/AdminManager';

const styles = {
  page: {
    minHeight: '100vh',
    background: '#0b0b0b',
    color: '#eaeaea',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    fontFamily: 'Montserrat, sans-serif',
  },
  card: {
    width: '100%',
    maxWidth: '360px',
    background: '#101010',
    border: '1px solid rgba(197, 160, 89, 0.22)',
    borderRadius: '12px',
    padding: '36px',
  },
  brand: {
    fontSize: '0.7rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#948a76',
    marginBottom: '8px',
  },
  title: { fontFamily: 'Playfair Display, serif', color: '#c5a059', margin: '0 0 4px' },
  subtitle: { color: '#999', margin: '0 0 24px', fontSize: '0.9rem' },
  field: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#948a76', marginBottom: '6px' },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    background: '#0b0b0b',
    border: '1px solid rgba(197, 160, 89, 0.3)',
    borderRadius: '6px',
    padding: '10px 12px',
    color: '#eaeaea',
    fontSize: '0.95rem',
  },
  submit: {
    width: '100%',
    marginTop: '10px',
    fontSize: '0.75rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#000',
    background: '#d4af37',
    border: 'none',
    borderRadius: '999px',
    padding: '12px 22px',
    cursor: 'pointer',
    fontWeight: 600,
  },
  error: { color: '#d88b7c', fontSize: '0.85rem', marginTop: '14px' },
};

export default function AdminLoginPage() {
  const { t } = useTranslation('admin');
  const navigate = useNavigate();
  const [identifiant, setIdentifiant] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await AdminManager.loginAdmin(identifiant, password);
    setSubmitting(false);
    if (!result.success) {
      setError(result.error === 'not_admin' ? t('login.notAdmin') : t('login.invalidCredentials'));
      return;
    }
    navigate('/admin', { state: { newOrdersCount: result.newOrdersCount, isFirstLogin: !result.previousLastLoginAt } });
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.brand}>{t('login.brand')}</div>
        <h1 style={styles.title}>{t('login.title')}</h1>
        <p style={styles.subtitle}>{t('login.subtitle')}</p>

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label} htmlFor="admin-identifiant">{t('login.identifiantLabel')}</label>
            <input
              id="admin-identifiant"
              type="text"
              style={styles.input}
              value={identifiant}
              onChange={(e) => setIdentifiant(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label} htmlFor="admin-password">{t('login.passwordLabel')}</label>
            <input
              id="admin-password"
              type="password"
              style={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          <button type="submit" style={styles.submit} disabled={submitting}>
            {t('login.submit')}
          </button>
          {error && <p style={styles.error}>{error}</p>}
        </form>
      </div>
    </div>
  );
}
