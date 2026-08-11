// src/data/cercueilConfig.js
//
// Univers "blague" totalement isolé (voir CercueilConfiguratorPage). Aucune
// donnée ici n'est partagée avec les univers sérieux : le supprimer ne
// touche à rien d'autre.
export const cercueilConfig = {
  essences: ['Chêne', 'Ébène', 'Noyer', 'Merisier', 'Pin', 'Palissandre'],
  finitions: ['Brut', 'Vernis mat', 'Vernis brillant', 'Laque'],
  laqueColors: ['Noir', 'Bordeaux', 'Violet sombre', 'Blanc nacré'],
  laqueColorHex: {
    Noir: '#0a0a0a',
    Bordeaux: '#5c0a1e',
    'Violet sombre': '#2e1a3d',
    'Blanc nacré': '#eee6da',
  },
  doublures: ['Aucune', 'Satin'],
  satinColors: ['Rouge', 'Blanc', 'Noir', 'Violet'],
  satinColorHex: {
    Rouge: '#7a0d1c',
    Blanc: '#f4ede0',
    Noir: '#161616',
    Violet: '#3d1f4d',
  },
  fermetures: ['Poignées dorées', 'Poignées argentées', 'Croix gravée', 'Sans ornement'],
};
