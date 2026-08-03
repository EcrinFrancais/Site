export const ConfigurationStatus = {
  DRAFT: 'draft',
  VALIDATED: 'validated',
  ORDERED: 'ordered',
};

export function createConfigurationModel({ universId, universTitle, data = {} }) {
  return {
    id: data.id || `config-${Date.now()}`,
    universId,
    universTitle,
    status: data.status || ConfigurationStatus.DRAFT,
    version: data.version || 1,
    versions: data.versions || [],
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
    values: {
      taille: data.values?.taille || 'bouteille',
      mesures: data.values?.mesures || { L: '', l: '', h: '' },
      essence: data.values?.essence || 'Pin',
      finition: data.values?.finition || 'Brut',
      couleurLaque: data.values?.couleurLaque || '#800020',
      cales: data.values?.cales || 'Bois',
      couleurVelours: data.values?.couleurVelours || '#3d2c1c',
      fermeture: data.values?.fermeture || 'Charnière',
      gravureType: data.values?.gravureType || 'Aucune',
      fontStyle: data.values?.fontStyle || 'Serif',
      tailleTexte: data.values?.tailleTexte || 100,
      tailleImage: data.values?.tailleImage || 100,
      posX: data.values?.posX || 50,
      posY: data.values?.posY || 50,
      quantite: data.values?.quantite || 1,
      isOpen: data.values?.isOpen || false,
      texteGravure: data.values?.texteGravure || '',
      modeGravure: data.values?.modeGravure || 'texte',
      imageGravure: data.values?.imageGravure || null,
    },
  };
}
