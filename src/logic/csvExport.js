function escapeCsvField(value) {
  const text = String(value ?? '');
  if (/[;"\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function toCsv(headers, rows) {
  const lines = [headers, ...rows].map((row) => row.map(escapeCsvField).join(';'));
  // BOM UTF-8 pour qu'Excel (FR) affiche correctement les accents.
  const BOM = String.fromCharCode(0xfeff);
  return BOM + lines.join('\r\n');
}

function downloadCsv(csvContent, filename) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportBasketsToCsv(baskets, { clientLabel, universLabel, statusLabel, itemCount }) {
  const headers = ['Commande', 'Date', 'Client', 'E-mail', 'Univers', 'Écrins', 'Total (€)', 'Statut'];
  const rows = baskets.map((basket) => [
    basket.basketId.slice(-8).toUpperCase(),
    basket.createdAt ? new Date(basket.createdAt).toLocaleDateString() : '',
    clientLabel(basket),
    basket.clientProfile?.email || '',
    universLabel(basket),
    itemCount(basket),
    basket.total.toFixed(2),
    statusLabel(basket),
  ]);

  const csvContent = toCsv(headers, rows);
  const dateSuffix = new Date().toISOString().slice(0, 10);
  downloadCsv(csvContent, `commandes-${dateSuffix}.csv`);
}
