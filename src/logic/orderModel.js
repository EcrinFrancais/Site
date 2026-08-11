import { OrderStatus } from '../domain/orderStatus';

export const createOrderDraft = (configuration, quote = {}, clientProfile = {}, extra = {}) => {
  const createdAt = new Date().toISOString();
  return {
    configuration,
    clientProfile,
    status: OrderStatus.RECEIVED,
    total: Number(quote.totalTTC || 0) + Number(extra.shippingShareTTC || 0),
    shippingShareTTC: Number(extra.shippingShareTTC || 0),
    basketId: extra.basketId || null,
    currency: 'EUR',
    createdAt,
    statusHistory: [{ status: OrderStatus.RECEIVED, changedAt: createdAt }],
    note: '',
  };
};
