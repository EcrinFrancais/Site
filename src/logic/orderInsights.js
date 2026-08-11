import { OrderStatus } from '../domain/orderStatus';

export const STALE_THRESHOLD_DAYS = 7;

// Statuts terminaux : peu importe depuis combien de temps la commande y est,
// ce n'est pas une stagnation à signaler.
const TERMINAL_STATUSES = [OrderStatus.DELIVERED, OrderStatus.CANCELLED];

export function getStatusSince(basket) {
  const history = basket.statusHistory || [];
  if (history.length > 0) return history[history.length - 1].changedAt;
  return basket.createdAt;
}

export function daysSince(isoDate) {
  if (!isoDate) return null;
  const diffMs = Date.now() - new Date(isoDate).getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export function isStale(basket, thresholdDays = STALE_THRESHOLD_DAYS) {
  if (TERMINAL_STATUSES.includes(basket.status)) return false;
  const days = daysSince(getStatusSince(basket));
  return days !== null && days >= thresholdDays;
}
