export const OrderStatus = {
  RECEIVED: 'received',
  CONFIRMED: 'confirmed',
  AWAITING_CLIENT_VALIDATION: 'awaiting_client_validation',
  VALIDATED: 'validated',
  IN_PRODUCTION: 'in_production',
  QUALITY_CONTROL: 'quality_control',
  READY_TO_SHIP: 'ready_to_ship',
  SHIPPED: 'shipped',
  IN_DELIVERY: 'in_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  DISPUTE_RETURN: 'dispute_return',
  ON_HOLD: 'on_hold',
};

// Linear fulfilment flow, in order. Used to render the progress visual.
export const ORDER_PROGRESS_STEPS = [
  OrderStatus.RECEIVED,
  OrderStatus.CONFIRMED,
  OrderStatus.AWAITING_CLIENT_VALIDATION,
  OrderStatus.VALIDATED,
  OrderStatus.IN_PRODUCTION,
  OrderStatus.QUALITY_CONTROL,
  OrderStatus.READY_TO_SHIP,
  OrderStatus.SHIPPED,
  OrderStatus.IN_DELIVERY,
  OrderStatus.DELIVERED,
];

// Statuses that fall outside the linear flow and get their own badge instead of a progress bar.
export const ORDER_EXCEPTION_STATUSES = [
  OrderStatus.CANCELLED,
  OrderStatus.DISPUTE_RETURN,
  OrderStatus.ON_HOLD,
];

export function isExceptionStatus(status) {
  return ORDER_EXCEPTION_STATUSES.includes(status);
}

export function getOrderProgressIndex(status) {
  return ORDER_PROGRESS_STEPS.indexOf(status);
}
