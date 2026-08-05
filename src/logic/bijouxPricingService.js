import { PricingEngine } from './PricingEngine';
import { getSousType } from '../data/bijouxConfig';

const normalizeFinition = (finition) => {
  const normalized = (finition || '').toLowerCase();
  if (normalized.includes('vernis brillant')) return 'vernis brillant';
  if (normalized.includes('vernis mat')) return 'vernis mat';
  if (normalized.includes('laque')) return 'laque';
  return 'brut';
};

const normalizeEssence = (essence) => {
  if (!essence) return 'pin';
  return essence.toLowerCase().normalize('NFD').replace(/[^a-z]/g, '');
};

export const bijouxPricingService = {
  calculateQuote(configuration) {
    const sousType = getSousType(configuration.famille, configuration.sousType);
    const dims = sousType?.dims || { L: 9, l: 9, h: 6 };

    const quote = PricingEngine.calculerPrix(
      dims.L,
      dims.l,
      dims.h,
      normalizeEssence(configuration.essence),
      normalizeFinition(configuration.finition),
      Number(configuration.quantite || 1),
      false
    );

    return {
      ...quote,
      selectedDimensions: { longueur: dims.L, largeur: dims.l, hauteur: dims.h },
      isB2B: false,
    };
  },
};
