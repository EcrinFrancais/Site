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

  // Une entrée par sous-type disponible pour chaque famille, avec les
  // dimensions standard (en cm) proposées par défaut — modifiables ensuite
  // via les curseurs de taille du panneau de configuration.
  sousTypes: {
    bague: [
      { id: 'bague-coussinet', label: 'Écrin classique à coussinet', dims: { L: 9, l: 9, h: 6 } },
    ],
    boucles: [
      { id: 'boucles-fentes', label: 'Écrin à fentes', dims: { L: 9, l: 9, h: 4 } },
      { id: 'boucles-coussinet-crochets', label: 'Écrin à coussinet avec crochets', dims: { L: 9, l: 9, h: 6 } },
      { id: 'boucles-plat-velours', label: 'Écrin plat velours', dims: { L: 9, l: 9, h: 2.5 } },
    ],
    collier: [
      { id: 'collier-allonge', label: 'Écrin allongé rectangulaire', dims: { L: 22, l: 8, h: 4 } },
      { id: 'collier-pendentif-seul', label: 'Écrin à pendentif seul', dims: { L: 8, l: 8, h: 5 } },
    ],
    bracelet: [
      { id: 'bracelet-allonge', label: 'Écrin allongé horizontal', dims: { L: 20, l: 8, h: 5 } },
      { id: 'bracelet-manchette', label: 'Écrin à bracelet rigide/manchette', dims: { L: 20, l: 11, h: 9 } },
    ],
    parure: [
      { id: 'parure-multi', label: 'Écrin multi-niveaux', dims: { L: 24, l: 17, h: 8 } },
    ],
    montre: [
      { id: 'montre-coussin', label: 'Écrin à coussin fixe', dims: { L: 11, l: 11, h: 9 } },
      { id: 'montre-socle-rigide', label: 'Écrin à socle rigide', dims: { L: 11, l: 11, h: 10 } },
      { id: 'montre-tiroir', label: 'Écrin coulissant / tiroir', dims: { L: 13, l: 12, h: 8 } },
      { id: 'montre-fenetre', label: 'Écrin à fenêtre', dims: { L: 12, l: 12, h: 9 } },
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

// Plage de réglage (en cm) autour des dimensions standard d'un sous-type,
// utilisée par les curseurs de taille du panneau de configuration : de 65 %
// à 155 % de la taille standard, par pas de 0,5 cm, avec un plancher de 3 cm
// pour éviter les coffrets impossibles à doubler.
export function getDimsRange(dims) {
  const range = (value) => ({
    min: Math.max(3, Math.round(value * 0.65 * 2) / 2),
    max: Math.round(value * 1.55 * 2) / 2,
  });
  return { L: range(dims.L), l: range(dims.l), h: range(dims.h) };
}
