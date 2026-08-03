// src/data/vinsConfig.js

export const vinsConfig = {
  tailles: [
    { id: 'bouteille', label: 'Bouteille standard (33x9x9 cm)' },
    { id: 'magnum', label: 'Magnum (38x12x12 cm)' },
    { id: 'jeroboam', label: 'Jéroboam (48x16x16 cm)' },
    { id: 'rehoboam', label: 'Réhoboam (53x18x18 cm)' },
    { id: 'sur_mesure', label: 'Sur mesure...' }
  ],
  essences: [
    'Pin', 'Peuplier', 'Noyer', 'Érable', 
    'Chêne', 'Ébène', 'Palissandre', 'Merisier'
  ],
  finitions: ['Brut', 'Vernis mat', 'Vernis brillant', 'Laque'],
  cales: ['Bois', 'Velours'],
  veloursColors: ['Grenat', 'Émeraude', 'Bleu royal', 'Anthracite', 'Ivoire'],
  fermetures: [
    'Charnières + fermeture magnétique invisible',
    'Charnières + loquet en laiton',
    'Couvercle coulissant',
    'Tiroir coulissant',
    'Couvercle amovible par emboîtement'
  ],
  gravureTypes: ['Aucune', 'Gravure laser', 'Gravure mécanique', 'Sérigraphie'],
  gravureLocalisations: ['Intérieure', 'Extérieure', 'Les deux']
};