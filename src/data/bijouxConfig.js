// src/data/bijouxConfig.js
import { vinsConfig } from './vinsConfig';

export const bijouxConfig = {
  familles: [
    { id: 'bague', label: 'Bague' },
    { id: 'boucles', label: "Boucles d'oreilles" },
    { id: 'collier', label: 'Collier / Pendentif' },
    { id: 'bracelet', label: 'Bracelet' },
    { id: 'parure', label: 'Parure (set complet)' },
    { id: 'montre', label: 'Montre' },
  ],

  // Une entrée par sous-type disponible pour chaque famille. Un seul
  // sous-type par famille pour l'instant ; d'autres variantes (ballerine,
  // double, coussinet à crochets, plat velours, pendentif seul, manchette,
  // socle rigide, tiroir, fenêtre...) pourront être ajoutées ici plus tard
  // sans changer la structure. Dimensions en cm.
  sousTypes: {
    bague: [
      { id: 'bague-coussinet', label: 'Écrin classique à coussinet', dims: { L: 9, l: 9, h: 6 } },
    ],
    boucles: [
      { id: 'boucles-fentes', label: 'Écrin à fentes', dims: { L: 9, l: 9, h: 4 } },
    ],
    collier: [
      { id: 'collier-allonge', label: 'Écrin allongé rectangulaire', dims: { L: 22, l: 8, h: 4 } },
    ],
    bracelet: [
      { id: 'bracelet-allonge', label: 'Écrin allongé horizontal', dims: { L: 20, l: 8, h: 5 } },
    ],
    parure: [
      { id: 'parure-multi', label: 'Écrin multi-niveaux', dims: { L: 24, l: 17, h: 8 } },
    ],
    montre: [
      { id: 'montre-coussin', label: 'Écrin à coussin fixe', dims: { L: 11, l: 11, h: 9 } },
    ],
  },

  formesGenerales: [
    { id: 'rectangulaire', label: 'Carré / rectangulaire classique' },
    { id: 'rond', label: 'Rond' },
    { id: 'coeur', label: 'Cœur' },
  ],

  // Taxonomies partagées avec le configurateur vin : mêmes essences, finitions,
  // couleurs de velours et types de gravure, pour rester cohérent et réutiliser
  // les traductions déjà en place.
  essences: vinsConfig.essences,
  finitions: vinsConfig.finitions,
  veloursColors: vinsConfig.veloursColors,
  gravureTypes: vinsConfig.gravureTypes,
};

export function getSousTypesForFamille(familleId) {
  return bijouxConfig.sousTypes[familleId] || [];
}

export function getSousType(familleId, sousTypeId) {
  return getSousTypesForFamille(familleId).find((s) => s.id === sousTypeId) || getSousTypesForFamille(familleId)[0];
}
