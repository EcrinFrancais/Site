import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AdminManager } from '../../logic/AdminManager';
import { groupOrdersIntoBaskets } from '../../domain/basket';
import { OrderStatus } from '../../domain/orderStatus';
import { isStale, getStatusSince, daysSince } from '../../logic/orderInsights';
import { exportBasketsToCsv } from '../../logic/csvExport';
import { adminStyles as styles } from '../../styles/adminStyles';

function clientLabel(basket) {
  const p = basket.clientProfile || {};
  const name = [p.prenom, p.nom].filter(Boolean).join(' ');
  return name || p.email || basket.clientId || '—';
}

function universLabel(item, t) {
  const universId = item.configuration?.universId;
  if (!universId) return t('common:configurationFallback', { ns: 'common' });
  return t(`univers:titles.${universId}`, item.configuration?.universTitle || universId);
}

export default function AdminDashboardPage() {
  const { t } = useTranslation(['admin', 'univers', 'common']);
  const location = useLocation();
  const navigate = useNavigate();
  const [baskets, setBaskets] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [universFilter, setUniversFilter] = useState('');
  const [sortKey, setSortKey] = useState('date');
  const [sortDir, setSortDir] = useState('desc');

  const newOrdersCount = location.state?.newOrdersCount;
  const isFirstLogin = location.state?.isFirstLogin;

  useEffect(() => {
    AdminManager.getAllOrders().then((orderDocs) => {
      setBaskets(groupOrdersIntoBaskets(orderDocs));
    });
  }, []);

  const universOptions = useMemo(() => {
    if (!baskets) return [];
    const ids = new Set();
    baskets.forEach((basket) => basket.items.forEach((item) => ids.add(item.configuration?.universId)));
    return Array.from(ids).filter(Boolean);
  }, [baskets]);

  const statusCounts = useMemo(() => {
    if (!baskets) return {};
    return baskets.reduce((acc, basket) => {
      acc[basket.status] = (acc[basket.status] || 0) + 1;
      return acc;
    }, {});
  }, [baskets]);

  const revenueTotal = useMemo(() => {
    if (!baskets) return 0;
    return baskets
      .filter((basket) => basket.status === OrderStatus.DELIVERED)
      .reduce((sum, basket) => sum + basket.total, 0);
  }, [baskets]);

  const filteredSorted = useMemo(() => {
    if (!baskets) return [];
    const searchLower = search.trim().toLowerCase();

    let result = baskets.filter((basket) => {
      if (statusFilter && basket.status !== statusFilter) return false;
      if (universFilter && !basket.items.some((item) => item.configuration?.universId === universFilter)) return false;
      if (searchLower) {
        const label = clientLabel(basket).toLowerCase();
        const email = (basket.clientProfile?.email || '').toLowerCase();
        const orderNumber = basket.basketId.slice(-8).toLowerCase();
        if (!label.includes(searchLower) && !email.includes(searchLower) && !orderNumber.includes(searchLower)) return false;
      }
      return true;
    });

    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'date') cmp = (a.createdAt || '').localeCompare(b.createdAt || '');
      else if (sortKey === 'client') cmp = clientLabel(a).localeCompare(clientLabel(b));
      else if (sortKey === 'total') cmp = a.total - b.total;
      else if (sortKey === 'status') cmp = (a.status || '').localeCompare(b.status || '');
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [baskets, search, statusFilter, universFilter, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const handleLogout = async () => {
    await AdminManager.logoutAdmin();
    navigate('/admin/login');
  };

  const handleExportCsv = () => {
    exportBasketsToCsv(filteredSorted, {
      clientLabel,
      universLabel: (basket) => Array.from(new Set(basket.items.map((item) => universLabel(item, t)))).join(', '),
      statusLabel: (basket) => t(`common:status.${basket.status}`, basket.status),
      itemCount: (basket) => basket.items.reduce((sum, item) => sum + Number(item.configuration?.values?.quantite || 1), 0),
    });
  };

  return (
    <div style={styles.page}>
      <div style={styles.topbar}>
        <span style={styles.topbarBrand}>{t('login.brand')}</span>
        <div style={styles.topbarActions}>
          <Link to="/admin/avis" style={styles.linkButton}>{t('dashboard.reviews')}</Link>
          <Link to="/admin/audience" style={styles.linkButton}>{t('dashboard.audience')}</Link>
          <Link to="/admin/parametres" style={styles.linkButton}>{t('dashboard.settings')}</Link>
          <button type="button" style={styles.linkButton} onClick={handleLogout}>{t('dashboard.logout')}</button>
        </div>
      </div>

      <div style={styles.inner}>
        <div style={styles.headerRow}>
          <h1 style={styles.title}>{t('dashboard.title')}</h1>
          <div style={styles.revenueTile}>
            <div style={styles.revenueLabel}>{t('dashboard.revenueLabel')}</div>
            <div style={styles.revenueValue}>{revenueTotal.toFixed(2)} €</div>
          </div>
        </div>

        {typeof newOrdersCount === 'number' && (
          <div style={styles.banner}>
            {isFirstLogin
              ? t('dashboard.firstLogin')
              : newOrdersCount > 0
                ? t('dashboard.newOrdersBanner', { count: newOrdersCount })
                : t('dashboard.noNewOrders')}
          </div>
        )}

        {baskets && (
          <div style={styles.statusCounts}>
            {Object.entries(statusCounts).map(([status, count]) => (
              <span key={status} style={styles.statusPill}>
                {t(`common:status.${status}`, status)} · {count}
              </span>
            ))}
          </div>
        )}

        <div style={styles.filterBar}>
          <input
            type="text"
            placeholder={t('dashboard.searchPlaceholder')}
            style={{ ...styles.input, minWidth: '240px' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select style={styles.select} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">{t('dashboard.statusFilterAll')}</option>
            {Object.values(OrderStatus).map((status) => (
              <option key={status} value={status}>{t(`common:status.${status}`, status)}</option>
            ))}
          </select>
          <select style={styles.select} value={universFilter} onChange={(e) => setUniversFilter(e.target.value)}>
            <option value="">{t('dashboard.universFilterAll')}</option>
            {universOptions.map((id) => (
              <option key={id} value={id}>{t(`univers:titles.${id}`, id)}</option>
            ))}
          </select>
          <button type="button" style={styles.linkButton} onClick={handleExportCsv} disabled={filteredSorted.length === 0}>
            {t('dashboard.exportCsv')}
          </button>
        </div>

        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>{t('dashboard.table.order')}</th>
                <th style={styles.th} onClick={() => toggleSort('date')}>{t('dashboard.table.date')}</th>
                <th style={styles.th} onClick={() => toggleSort('client')}>{t('dashboard.table.client')}</th>
                <th style={styles.th}>{t('dashboard.table.univers')}</th>
                <th style={styles.th}>{t('dashboard.table.items')}</th>
                <th style={styles.th} onClick={() => toggleSort('total')}>{t('dashboard.table.total')}</th>
                <th style={styles.th} onClick={() => toggleSort('status')}>{t('dashboard.table.status')}</th>
              </tr>
            </thead>
            <tbody>
              {baskets === null ? (
                <tr><td style={styles.td} colSpan={7}>{t('dashboard.loading')}</td></tr>
              ) : filteredSorted.length === 0 ? (
                <tr><td style={styles.empty} colSpan={7}>{t('dashboard.empty')}</td></tr>
              ) : (
                filteredSorted.map((basket) => {
                  const universLabels = Array.from(
                    new Set(basket.items.map((item) => universLabel(item, t)))
                  ).join(', ');
                  const itemCount = basket.items.reduce((sum, item) => sum + Number(item.configuration?.values?.quantite || 1), 0);
                  return (
                    <tr key={basket.basketId} style={styles.row} onClick={() => navigate(`/admin/commandes/${basket.basketId}`)}>
                      <td style={styles.td}>{basket.basketId.slice(-8).toUpperCase()}</td>
                      <td style={styles.td}>{basket.createdAt ? new Date(basket.createdAt).toLocaleDateString() : '—'}</td>
                      <td style={styles.td}>{clientLabel(basket)}</td>
                      <td style={styles.td}>{universLabels}</td>
                      <td style={styles.td}>{itemCount}</td>
                      <td style={styles.td}>{basket.total.toFixed(2)} €</td>
                      <td style={styles.td}>
                        <span style={styles.statusBadge}>{t(`common:status.${basket.status}`, basket.status)}</span>
                        {isStale(basket) && (
                          <span style={styles.staleBadge} title={t('dashboard.staleTitle', { days: daysSince(getStatusSince(basket)) })}>
                            ⚠
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
