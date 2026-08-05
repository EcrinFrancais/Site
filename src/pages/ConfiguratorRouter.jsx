import React, { lazy } from 'react';
import { useParams } from 'react-router-dom';

// Le configurateur vin (ConfiguratorPage) reste strictement inchangé : ce
// routeur se contente d'aiguiller vers la page bijouterie dédiée pour
// l'univers joaillerie/horlogerie, sans jamais toucher au code du vin.
const ConfiguratorPage = lazy(() => import('./ConfiguratorPage'));
const JewelryConfiguratorPage = lazy(() => import('./JewelryConfiguratorPage'));

const JEWELRY_UNIVERS_ID = 'joaillerie-horlogerie';

export default function ConfiguratorRouter() {
  const { universId } = useParams();

  if (universId === JEWELRY_UNIVERS_ID) {
    return <JewelryConfiguratorPage />;
  }

  return <ConfiguratorPage univers={null} />;
}
