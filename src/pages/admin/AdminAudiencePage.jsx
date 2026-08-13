import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AdminManager } from '../../logic/AdminManager';
import { groupVisitesByWeek, groupByReferrerDomain, groupPageVuesByPath, getTopPagePerWeek } from '../../logic/audienceInsights';
import { adminStyles as styles } from '../../styles/adminStyles';

const WEEKS_WINDOW = 12;

function describePath(path, t) {
  if (!path) return path;
  if (path === '/') return t('audience.pages.home');
  if (path === '/univers') return t('audience.pages.univers');
  if (path.startsWith('/config/')) {
    const universId = path.split('/')[2];
    return t(`univers:titles.${universId}`, `${t('audience.pages.configurator')} — ${universId}`);
  }
  if (path === '/panier') return t('audience.pages.cart');
  if (path === '/commande') return t('audience.pages.orderSummary');
  if (path === '/client') return t('audience.pages.clientSpace');
  if (path === '/profil') return t('audience.pages.profile');
  if (path === '/auth') return t('audience.pages.auth');
  if (path === '/a-propos') return t('audience.pages.about');
  if (path === '/contact') return t('audience.pages.contact');
  if (path === '/mentions-legales') return t('audience.pages.legal');
  return path;
}

function formatWeekLabel(weekKey) {
  const [year, month, day] = weekKey.split('-');
  return `${day}/${month}/${year}`;
}

export default function AdminAudiencePage() {
  const { t } = useTranslation(['admin', 'univers']);
  const [visites, setVisites] = useState(null);
  const [pageVues, setPageVues] = useState(null);

  useEffect(() => {
    const sinceIso = new Date(Date.now() - WEEKS_WINDOW * 7 * 24 * 60 * 60 * 1000).toISOString();
    Promise.all([AdminManager.getVisites(sinceIso), AdminManager.getPageVues(sinceIso)]).then(
      ([visiteDocs, pageVueDocs]) => {
        setVisites(visiteDocs);
        setPageVues(pageVueDocs);
      }
    );
  }, []);

  const weeklyVisits = useMemo(() => (visites ? groupVisitesByWeek(visites) : []), [visites]);
  const origins = useMemo(() => (visites ? groupByReferrerDomain(visites) : []), [visites]);
  const topPages = useMemo(() => (pageVues ? groupPageVuesByPath(pageVues).slice(0, 10) : []), [pageVues]);
  const topPagePerWeek = useMemo(() => (pageVues ? getTopPagePerWeek(pageVues) : new Map()), [pageVues]);

  const maxWeeklyCount = useMemo(
    () => weeklyVisits.reduce((max, entry) => Math.max(max, entry.count), 0),
    [weeklyVisits]
  );

  const loading = visites === null || pageVues === null;
  const isEmpty = !loading && visites.length === 0;

  return (
    <div style={styles.page}>
      <div style={styles.inner}>
        <Link to="/admin" style={styles.backLink}>{t('audience.back')}</Link>
        <div style={styles.headerRow}>
          <h1 style={styles.title}>{t('audience.title')}</h1>
        </div>
        <p style={{ color: '#948a76', fontSize: '0.82rem', marginTop: '-8px', marginBottom: '20px' }}>
          {t('audience.consentHint')}
        </p>

        {loading ? (
          <div style={styles.empty}>{t('audience.loading')}</div>
        ) : isEmpty ? (
          <div style={styles.empty}>{t('audience.empty')}</div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
              <div style={styles.revenueTile}>
                <div style={styles.revenueLabel}>{t('audience.totalVisitsLabel', { weeks: WEEKS_WINDOW })}</div>
                <div style={styles.revenueValue}>{visites.length}</div>
              </div>
              <div style={styles.revenueTile}>
                <div style={styles.revenueLabel}>{t('audience.totalPageViewsLabel', { weeks: WEEKS_WINDOW })}</div>
                <div style={styles.revenueValue}>{pageVues.length}</div>
              </div>
            </div>

            <div style={styles.card}>
              <h2 style={styles.sectionTitle}>{t('audience.weeklyTitle')}</h2>
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>{t('audience.weekColumn')}</th>
                      <th style={styles.th}>{t('audience.connectionsColumn')}</th>
                      <th style={styles.th}>{t('audience.topPageColumn')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weeklyVisits.map(({ weekKey, count }) => {
                      const top = topPagePerWeek.get(weekKey);
                      const barWidth = maxWeeklyCount > 0 ? Math.round((count / maxWeeklyCount) * 100) : 0;
                      return (
                        <tr key={weekKey}>
                          <td style={styles.td}>{formatWeekLabel(weekKey)}</td>
                          <td style={styles.td}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ background: 'rgba(197, 160, 89, 0.35)', height: '8px', borderRadius: '4px', width: `${Math.max(barWidth, 4)}px`, minWidth: '4px' }} />
                              <span>{count}</span>
                            </div>
                          </td>
                          <td style={styles.td}>
                            {top?.path ? `${describePath(top.path, t)} (${top.count})` : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={styles.card}>
              <h2 style={styles.sectionTitle}>{t('audience.originTitle')}</h2>
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>{t('audience.originColumn')}</th>
                      <th style={styles.th}>{t('audience.connectionsColumn')}</th>
                      <th style={styles.th}>{t('audience.originShareColumn')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {origins.map(({ domain, count, percent }) => (
                      <tr key={domain}>
                        <td style={styles.td}>{domain === 'direct' ? t('audience.originDirect') : domain}</td>
                        <td style={styles.td}>{count}</td>
                        <td style={styles.td}>{percent.toFixed(0)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={styles.card}>
              <h2 style={styles.sectionTitle}>{t('audience.topPagesTitle')}</h2>
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>{t('audience.pageColumn')}</th>
                      <th style={styles.th}>{t('audience.viewsColumn')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topPages.map(({ path, count }) => (
                      <tr key={path}>
                        <td style={styles.td}>{describePath(path, t)}</td>
                        <td style={styles.td}>{count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
