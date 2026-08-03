import { vinsConfig } from '../data/vinsConfig';
import { getUniverseById } from '../config/univers';

const createInitialConfiguration = (universId) => {
  const univers = getUniverseById(universId);
  return {
    universId,
    universTitle: univers.titre,
    taille: univers.defaultConfig.taille,
    mesures: { L: '', l: '', h: '' },
    essence: univers.defaultConfig.essence,
    finition: univers.defaultConfig.finition,
    couleurLaque: '#800020',
    cales: univers.defaultConfig.cales,
    couleurVelours: vinsConfig.veloursColors[0],
    fermeture: univers.defaultConfig.fermeture,
    gravureType: univers.defaultConfig.gravureType,
    fontStyle: 'Serif',
    tailleTexte: 100,
    tailleImage: 100,
    posX: 50,
    posY: 50,
    quantite: univers.defaultConfig.quantite,
    isOpen: false,
    texteGravure: '',
    modeGravure: 'texte',
    imageGravure: null,
  };
};

export const configurationService = {
  createInitialConfiguration,

  buildConfigurationState(universId) {
    return createInitialConfiguration(universId);
  },

  getTitle(universId) {
    return getUniverseById(universId)?.titre ?? 'Configuration';
  },
};
