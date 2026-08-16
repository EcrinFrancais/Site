import { PricingEngine } from './PricingEngine';

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

export const pricingService = {
  calculateQuote(configuration) {
    const dimensions = configuration.mesures || {};
    const longueur = Number(dimensions.L || 0);
    const largeur = Number(dimensions.l || 0);
    const hauteur = Number(dimensions.h || 0);

    const baseDimensions = {
      bouteille: { longueur: 33, largeur: 9, hauteur: 9 },
      magnum: { longueur: 38, largeur: 12, hauteur: 12 },
      jeroboam: { longueur: 48, largeur: 16, hauteur: 16 },
      rehoboam: { longueur: 53, largeur: 18, hauteur: 18 },
      sur_mesure: { longueur, largeur, hauteur },
    };

    const selected = baseDimensions[configuration.taille] || baseDimensions.bouteille;
    const effectiveLength = selected.longueur || 33;
    const effectiveWidth = selected.largeur || 9;
    const effectiveHeight = selected.hauteur || 9;

    const quote = PricingEngine.calculerPrix({
      longueur: effectiveLength,
      largeur: effectiveWidth,
      hauteur: effectiveHeight,
      essence: normalizeEssence(configuration.essence),
      finition: normalizeFinition(configuration.finition),
      fermeture: configuration.fermeture,
      qte: Number(configuration.quantite || 1),
      isB2B: false,
      cales: configuration.cales,
      gravureType: configuration.gravureType,
      modeGravure: configuration.modeGravure,
      tailleTexte: configuration.tailleTexte,
      tailleImage: configuration.tailleImage,
    });

    return {
      ...quote,
      selectedDimensions: selected,
      isB2B: false,
    };
  },
};
