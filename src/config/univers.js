export const universData = [
  {
    id: 'vins-spiritueux',
    titre: 'Vins & Spiritueux',
    image:
      'https://images.unsplash.com/photo-1568213816046-0ee1c42bd559?q=80&w=1000&auto=format&fit=crop',
    defaultConfig: {
      taille: 'bouteille',
      essence: 'Pin',
      finition: 'Brut',
      cales: 'Bois',
      fermeture: 'Charnière',
      gravureType: 'Aucune',
      quantite: 1,
    },
  },
  {
    id: 'joaillerie-horlogerie',
    titre: 'Joaillerie & Horlogerie',
    image:
      'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=1000&auto=format&fit=crop',
    defaultConfig: {
      taille: 'bouteille',
      essence: 'Pin',
      finition: 'Brut',
      cales: 'Bois',
      fermeture: 'Charnière',
      gravureType: 'Aucune',
      quantite: 1,
    },
  },
  {
    id: 'coffret-cadeau',
    titre: 'Coffret Cadeau',
    image:
      'https://images.unsplash.com/photo-1608755728617-aefab37d2edd?q=80&w=1000&auto=format&fit=crop',
    defaultConfig: {
      taille: 'bouteille',
      essence: 'Pin',
      finition: 'Brut',
      cales: 'Bois',
      fermeture: 'Charnière',
      gravureType: 'Aucune',
      quantite: 1,
    },
  },
];

export const getUniverseById = (id) =>
  universData.find((univers) => univers.id === id) ?? universData[0];

export const getUniverseTitle = (id) => getUniverseById(id)?.titre ?? 'Configuration';
