import { PricingEngine } from './PricingEngine';
import { getTailleById } from '../data/coffretCadeauConfig';

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

export const coffretCadeauPricingService = {
  calculateQuote(configuration) {
    const preset = getTailleById(configuration.taille);
    const dims =
      configuration.taille === 'sur_mesure'
        ? {
            L: Number(configuration.mesures?.L) || preset.dims.L,
            l: Number(configuration.mesures?.l) || preset.dims.l,
            h: Number(configuration.mesures?.h) || preset.dims.h,
          }
        : preset.dims;

    const quote = PricingEngine.calculerPrix({
      longueur: dims.L,
      largeur: dims.l,
      hauteur: dims.h,
      essence: normalizeEssence(configuration.essence),
      finition: normalizeFinition(configuration.finition),
      fermeture: configuration.fermeture,
      qte: Number(configuration.quantite || 1),
      isB2B: false,
      // "doublure" (Aucune/Velours) est l'équivalent des cales de l'univers
      // Vins — même paramètre `cales` côté moteur, même table PRIX_CALES :
      // "Aucune" ne matche aucune clé donc retombe sur 0€, "Velours" à 25€.
      cales: configuration.doublure,
      gravureType: configuration.gravureType,
      modeGravure: configuration.modeGravure,
      tailleTexte: configuration.tailleTexte,
      tailleImage: configuration.tailleImage,
    });

    return {
      ...quote,
      selectedDimensions: { longueur: dims.L, largeur: dims.l, hauteur: dims.h },
      isB2B: false,
    };
  },
};
