import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AdminManager } from '../../logic/AdminManager';
import { adminStyles as styles } from '../../styles/adminStyles';

export default function AdminReviewsPage() {
  const { t } = useTranslation(['admin', 'univers']);
  const [reviews, setReviews] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [pendingId, setPendingId] = useState(null);

  const loadReviews = () => {
    AdminManager.getAllReviews().then((items) => {
      setReviews(items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')));
    });
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const filtered = useMemo(() => {
    if (!reviews) return [];
    if (!statusFilter) return reviews;
    return reviews.filter((review) => review.statut === statusFilter);
  }, [reviews, statusFilter]);

  const handleModerate = async (reviewId, statut) => {
    setPendingId(reviewId);
    await AdminManager.updateReviewStatus(reviewId, statut);
    setPendingId(null);
    loadReviews();
  };

  return (
    <div style={styles.page}>
      <div style={styles.inner}>
        <Link to="/admin" style={styles.backLink}>{t('reviews.back')}</Link>
        <div style={styles.headerRow}>
          <h1 style={styles.title}>{t('reviews.title')}</h1>
        </div>

        <div style={styles.filterBar}>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={styles.select}>
            <option value="">{t('reviews.statusFilterAll')}</option>
            <option value="en_attente">{t('reviews.statusEnAttente')}</option>
            <option value="approuve">{t('reviews.statusApprouve')}</option>
            <option value="rejete">{t('reviews.statusRejete')}</option>
          </select>
        </div>

        {reviews === null ? (
          <div style={styles.empty}>{t('reviews.loading')}</div>
        ) : filtered.length === 0 ? (
          <div style={styles.empty}>{t('reviews.empty')}</div>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>{t('reviews.table.date')}</th>
                  <th style={styles.th}>{t('reviews.table.client')}</th>
                  <th style={styles.th}>{t('reviews.table.univers')}</th>
                  <th style={styles.th}>{t('reviews.table.note')}</th>
                  <th style={styles.th}>{t('reviews.table.comment')}</th>
                  <th style={styles.th}>{t('reviews.table.status')}</th>
                  <th style={styles.th}>{t('reviews.table.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((review) => (
                  <tr key={review.id}>
                    <td style={styles.td}>{(review.createdAt || '').slice(0, 10)}</td>
                    <td style={styles.td}>{review.clientName || '—'}</td>
                    <td style={styles.td}>
                      {t(`univers:titles.${review.universId}`, review.universId || '—')}
                    </td>
                    <td style={styles.td}>{'★'.repeat(review.note || 0)}</td>
                    <td style={{ ...styles.td, maxWidth: '320px' }}>{review.commentaire}</td>
                    <td style={styles.td}>
                      <span style={styles.statusBadge}>
                        {t(`reviews.status${review.statut === 'en_attente' ? 'EnAttente' : review.statut === 'approuve' ? 'Approuve' : 'Rejete'}`)}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {review.statut !== 'approuve' && (
                        <button
                          type="button"
                          style={{ ...styles.linkButton, marginRight: '8px' }}
                          disabled={pendingId === review.id}
                          onClick={() => handleModerate(review.id, 'approuve')}
                        >
                          {t('reviews.approve')}
                        </button>
                      )}
                      {review.statut !== 'rejete' && (
                        <button
                          type="button"
                          style={styles.linkButton}
                          disabled={pendingId === review.id}
                          onClick={() => handleModerate(review.id, 'rejete')}
                        >
                          {t('reviews.reject')}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
