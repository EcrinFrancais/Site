// src/logic/audienceInsights.js
//
// Agrégation des documents Firestore "visites"/"pageVues" (voir
// SiteAnalyticsService.js) pour l'onglet admin "Audience" : connexions et
// pages vues regroupées par semaine (lundi comme premier jour), origine des
// visites, pages les plus consultées.

export function getWeekStart(dateInput) {
  const d = new Date(dateInput);
  const day = d.getDay() || 7; // dimanche (0) -> 7
  if (day !== 1) d.setDate(d.getDate() - (day - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getWeekKey(dateInput) {
  return getWeekStart(dateInput).toISOString().slice(0, 10);
}

export function groupVisitesByWeek(visites) {
  const counts = new Map();
  visites.forEach((v) => {
    if (!v.createdAt) return;
    const key = getWeekKey(v.createdAt);
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  return Array.from(counts.entries())
    .map(([weekKey, count]) => ({ weekKey, count }))
    .sort((a, b) => b.weekKey.localeCompare(a.weekKey));
}

export function groupByReferrerDomain(visites) {
  const counts = new Map();
  visites.forEach((v) => {
    const domain = v.referrerDomain || 'direct';
    counts.set(domain, (counts.get(domain) || 0) + 1);
  });
  const total = visites.length || 1;
  return Array.from(counts.entries())
    .map(([domain, count]) => ({ domain, count, percent: (count / total) * 100 }))
    .sort((a, b) => b.count - a.count);
}

export function groupPageVuesByPath(pageVues) {
  const counts = new Map();
  pageVues.forEach((p) => {
    const path = p.path || '/';
    counts.set(path, (counts.get(path) || 0) + 1);
  });
  return Array.from(counts.entries())
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count);
}

// Pour chaque semaine, la page la plus consultée — répond à "qu'est-ce qui a
// été fait principalement" quand on croise avec groupVisitesByWeek.
export function getTopPagePerWeek(pageVues) {
  const perWeek = new Map();
  pageVues.forEach((p) => {
    if (!p.createdAt) return;
    const weekKey = getWeekKey(p.createdAt);
    const path = p.path || '/';
    if (!perWeek.has(weekKey)) perWeek.set(weekKey, new Map());
    const pathCounts = perWeek.get(weekKey);
    pathCounts.set(path, (pathCounts.get(path) || 0) + 1);
  });

  const result = new Map();
  perWeek.forEach((pathCounts, weekKey) => {
    let topPath = null;
    let topCount = 0;
    pathCounts.forEach((count, path) => {
      if (count > topCount) {
        topCount = count;
        topPath = path;
      }
    });
    result.set(weekKey, { path: topPath, count: topCount });
  });
  return result;
}
