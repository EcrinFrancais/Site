// src/data/coffretCadeauConfig.js
import { vinsConfig } from './vinsConfig';

// Coffret neutre (sans forme intérieure imposée) : tailles génériques plutôt
// que des formats de bouteille, le reste des taxonomies (essences, finitions,
// fermetures, gravures) est partagé avec le configurateur vin pour rester
// cohérent et réutiliser les traductions déjà en place.
export const coffretCadeauConfig = {
  tailles: [
    { id: 'petit', label: 'Petit (20 x 15 x 8 cm)', dims: { L: 20, l: 15, h: 8 } },
    { id: 'moyen', label: 'Moyen (30 x 22 x 12 cm)', dims: { L: 30, l: 22, h: 12 } },
    { id: 'grand', label: 'Grand (40 x 30 x 15 cm)', dims: { L: 40, l: 30, h: 15 } },
    { id: 'sur_mesure', label: 'Sur mesure...' },
  ],

  essences: vinsConfig.essences,
  finitions: vinsConfig.finitions,
  // Doublure intérieure optionnelle : simple bois brut si "Aucune", sinon
  // velours dans la couleur choisie (voir couleurVelours + veloursColors).
  doublures: ['Aucune', 'Velours'],
  veloursColors: vinsConfig.veloursColors,
  fermetures: vinsConfig.fermetures,
  gravureTypes: vinsConfig.gravureTypes,
};

// Retombe toujours sur un preset avec des dimensions (jamais l'entrée
// "sur_mesure", qui n'en a pas) : les dimensions réelles du sur-mesure
// viennent des mesures saisies par l'utilisateur, pas de ce preset.
export function getTailleById(id) {
  const match = coffretCadeauConfig.tailles.find((t) => t.id === id);
  if (match && match.dims) return match;
  return coffretCadeauConfig.tailles.find((t) => t.id === 'moyen');
}
