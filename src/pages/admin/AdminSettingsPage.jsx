import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AdminManager } from '../../logic/AdminManager';
import { adminStyles as styles } from '../../styles/adminStyles';

export default function AdminSettingsPage() {
  const { t } = useTranslation('admin');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);
    if (newPassword !== confirmPassword) {
      setFeedback({ type: 'error', text: t('settings.mismatch') });
      return;
    }
    setSubmitting(true);
    const result = await AdminManager.changeAdminPassword(currentPassword, newPassword);
    setSubmitting(false);
    if (result.success) {
      setFeedback({ type: 'success', text: t('settings.success') });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setFeedback({ type: 'error', text: t('settings.error') });
    }
  };

  return (
    <div style={styles.page}>
      <div style={{ ...styles.inner, maxWidth: '480px' }}>
        <Link to="/admin" style={styles.backLink}>{t('settings.back')}</Link>
        <h1 style={styles.title}>{t('settings.title')}</h1>

        <form onSubmit={handleSubmit} style={{ marginTop: '24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#948a76', marginBottom: '6px' }}>
              {t('settings.currentPasswordLabel')}
            </label>
            <input type="password" style={{ ...styles.input, width: '100%', boxSizing: 'border-box' }} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#948a76', marginBottom: '6px' }}>
              {t('settings.newPasswordLabel')}
            </label>
            <input type="password" style={{ ...styles.input, width: '100%', boxSizing: 'border-box' }} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#948a76', marginBottom: '6px' }}>
              {t('settings.confirmPasswordLabel')}
            </label>
            <input type="password" style={{ ...styles.input, width: '100%', boxSizing: 'border-box' }} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} />
          </div>
          <button type="submit" style={styles.primaryButton} disabled={submitting}>{t('settings.submit')}</button>
          {feedback && (
            <p style={{ marginTop: '14px', color: feedback.type === 'success' ? '#7fae7f' : '#d88b7c' }}>{feedback.text}</p>
          )}
        </form>
      </div>
    </div>
  );
}
