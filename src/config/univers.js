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
      taille: 'moyen',
      essence: 'Pin',
      finition: 'Brut',
      doublure: 'Aucune',
      fermeture: 'Charnières + fermeture magnétique invisible',
      gravureType: 'Aucune',
      quantite: 1,
    },
  },
  // --- Univers "blague" temporaire (voir CercueilConfiguratorPage) ---
  // Facile à retirer : supprimer ce bloc, l'entrée dans ConfiguratorRouter.jsx,
  // et les fichiers src/pages/CercueilConfiguratorPage.jsx,
  // src/components/Cercueil*.jsx et src/data/cercueilConfig.js.
  {
    id: 'cercueil',
    titre: 'Cercueil (Édition Spéciale)',
    image:
      'https://images.unsplash.com/photo-1509909756405-be0199881695?q=80&w=1000&auto=format&fit=crop',
    defaultConfig: {
      taille: 'bouteille',
      essence: 'Chêne',
      finition: 'Brut',
      doublure: 'Satin',
      fermeture: 'Poignées dorées',
      gravureType: 'Aucune',
      quantite: 1,
    },
  },
];

export const getUniverseById = (id) =>
  universData.find((univers) => univers.id === id) ?? universData[0];

export const getUniverseTitle = (id) => getUniverseById(id)?.titre ?? 'Configuration';
