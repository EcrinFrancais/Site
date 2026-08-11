// Teintes partagées par tous les configurateurs (vin, joaillerie, coffret
// cadeau) pour l'aperçu 3D — centralisées ici pour être réutilisées telles
// quelles dans le résumé visuel du panier, sans dépendre des composants 3D.
export const woodTintHex = {
  Pin: '#b9864f',
  Peuplier: '#caa06f',
  Noyer: '#6e3f29',
  Érable: '#a56b3f',
  Chêne: '#8b5c3a',
  Ébène: '#2a201b',
  Palissandre: '#4b2722',
  Merisier: '#9b4f36',
};

export const velvetColorHex = {
  Grenat: '#6e0f1f',
  Émeraude: '#0b6e4f',
  'Bleu royal': '#1e3a8a',
  Anthracite: '#2b2b2e',
  Ivoire: '#f1e9d2',
};

const FALLBACK_SWATCH = '#8a7960';

// Couleur principale à afficher (laque choisie si finition laquée, sinon
// teinte de l'essence de bois).
export function resolveSwatchColor(values) {
  if (!values) return FALLBACK_SWATCH;
  if (values.finition === 'Laque' && values.couleurLaque) return values.couleurLaque;
  if (values.essence && woodTintHex[values.essence]) return woodTintHex[values.essence];
  return FALLBACK_SWATCH;
}

// Couleur de doublure (velours/satin), affichée en second plan si présente.
export function resolveLiningColor(values) {
  const name = values?.couleurVelours;
  return (name && velvetColorHex[name]) || null;
}
