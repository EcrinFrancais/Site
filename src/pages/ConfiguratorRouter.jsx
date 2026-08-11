import React, { lazy } from 'react';
import { useParams } from 'react-router-dom';

// Le configurateur vin (ConfiguratorPage) reste strictement inchangé : ce
// routeur se contente d'aiguiller vers la page dédiée pour les univers
// joaillerie/horlogerie et coffret cadeau, sans jamais toucher au code du vin.
const ConfiguratorPage = lazy(() => import('./ConfiguratorPage'));
const JewelryConfiguratorPage = lazy(() => import('./JewelryConfiguratorPage'));
const CoffretCadeauConfiguratorPage = lazy(() => import('./CoffretCadeauConfiguratorPage'));
// Univers "blague" temporaire, isolé : voir CercueilConfiguratorPage.jsx.
const CercueilConfiguratorPage = lazy(() => import('./CercueilConfiguratorPage'));

const JEWELRY_UNIVERS_ID = 'joaillerie-horlogerie';
const GIFT_BOX_UNIVERS_ID = 'coffret-cadeau';
const CERCUEIL_UNIVERS_ID = 'cercueil';

export default function ConfiguratorRouter() {
  const { universId } = useParams();

  if (universId === JEWELRY_UNIVERS_ID) {
    return <JewelryConfiguratorPage />;
  }

  if (universId === GIFT_BOX_UNIVERS_ID) {
    return <CoffretCadeauConfiguratorPage />;
  }

  if (universId === CERCUEIL_UNIVERS_ID) {
    return <CercueilConfiguratorPage />;
  }

  return <ConfiguratorPage univers={null} />;
}
