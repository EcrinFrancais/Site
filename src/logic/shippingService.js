// src/logic/shippingService.js
//
// Estimation du poids d'un écrin par catégorie de volume (pas de densité réelle
// par essence — approximation suffisante pour calculer des frais de port).

const VOLUME_THRESHOLDS_CM3 = { medium: 3000, large: 8000 };

const BASE_WEIGHT_KG = { small: 0.6, medium: 1.1, large: 2.2 };

const PACKAGING_WEIGHT_KG = 0.4;

export function categorizeVolume(volumeCm3) {
  if (volumeCm3 >= VOLUME_THRESHOLDS_CM3.large) return 'large';
  if (volumeCm3 >= VOLUME_THRESHOLDS_CM3.medium) return 'medium';
  return 'small';
}

export function estimateItemWeightKg(selectedDimensions, quantite = 1) {
  const { longueur = 0, largeur = 0, hauteur = 0 } = selectedDimensions || {};
  const volumeCm3 = Number(longueur) * Number(largeur) * Number(hauteur);
  const category = categorizeVolume(volumeCm3);
  const unitWeightKg = BASE_WEIGHT_KG[category] + PACKAGING_WEIGHT_KG;
  return Number((unitWeightKg * Number(quantite || 1)).toFixed(2));
}

// Franco de port au-delà de ce sous-total TTC (€).
export const FREE_SHIPPING_THRESHOLD_TTC = 600;

// Paliers de port par poids total du panier (kg), appliqués sous le seuil de franco.
const SHIPPING_TIERS_TTC = [
  { maxWeightKg: 5, priceTTC: 19 },
  { maxWeightKg: 15, priceTTC: 35 },
  { maxWeightKg: 30, priceTTC: 59 },
  { maxWeightKg: Infinity, priceTTC: 89 },
];

export function estimateShippingCost(cartItems) {
  if (!cartItems || cartItems.length === 0) return 0;

  const subtotalTTC = cartItems.reduce((sum, item) => sum + Number(item.quote?.totalTTC || 0), 0);
  if (subtotalTTC >= FREE_SHIPPING_THRESHOLD_TTC) return 0;

  const totalWeightKg = cartItems.reduce((sum, item) => sum + Number(item.estimatedWeightKg || 0), 0);
  const tier = SHIPPING_TIERS_TTC.find((t) => totalWeightKg <= t.maxWeightKg);
  return tier.priceTTC;
}
