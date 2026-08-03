export const createOrderDraft = (configuration, quote = {}, clientProfile = {}) => ({
  configuration,
  clientProfile,
  status: 'Reçu',
  total: Number(quote.totalTTC || 0),
  currency: 'EUR',
  createdAt: new Date().toISOString(),
});

export const buildOrderSummary = (orderDraft) => ({
  title: 'Résumé de commande',
  univers: orderDraft.configuration?.universTitle || 'Configuration',
  quantity: orderDraft.configuration?.values?.quantite || 1,
  total: orderDraft.total || 0,
  status: orderDraft.status,
});
