import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cercueilConfig } from '../data/cercueilConfig';
import CercueilConfigurationPanel from '../components/CercueilConfigurationPanel';
import CercueilPreview3DPanel from '../components/CercueilPreview3DPanel';
import { coffretCadeauConfiguratorStyles as styles } from '../styles/coffretCadeauConfiguratorStyles';

// Univers "blague" temporaire, entièrement isolé du reste du site : aucune
// autre page/logique (panier, commandes, pricing) n'en dépend. Pour le
// retirer : supprimer ce fichier + les composants Cercueil*/data/cercueilConfig,
// puis l'entrée "cercueil" dans src/config/univers.js et ConfiguratorRouter.jsx.
export default function CercueilConfiguratorPage() {
  const navigate = useNavigate();

  const [essence, setEssence] = useState(cercueilConfig.essences[0]);
  const [finition, setFinition] = useState(cercueilConfig.finitions[0]);
  const [couleurLaque, setCouleurLaque] = useState(cercueilConfig.laqueColors[0]);
  const [doublure, setDoublure] = useState('Satin');
  const [couleurSatin, setCouleurSatin] = useState(cercueilConfig.satinColors[0]);
  const [fermeture, setFermeture] = useState(cercueilConfig.fermetures[0]);
  const [isOpen, setIsOpen] = useState(true);
  const [viewSize, setViewSize] = useState('moyen');

  return (
    <div style={styles.pageContainer}>
      <CercueilConfigurationPanel
        styles={styles}
        essence={essence}
        setEssence={setEssence}
        finition={finition}
        setFinition={setFinition}
        couleurLaque={couleurLaque}
        setCouleurLaque={setCouleurLaque}
        doublure={doublure}
        setDoublure={setDoublure}
        couleurSatin={couleurSatin}
        setCouleurSatin={setCouleurSatin}
        fermeture={fermeture}
        setFermeture={setFermeture}
        onBack={() => navigate('/univers')}
      />

      <CercueilPreview3DPanel
        styles={styles}
        essence={essence}
        finition={finition}
        couleurLaque={couleurLaque}
        doublure={doublure}
        couleurSatin={couleurSatin}
        fermeture={fermeture}
        isOpen={isOpen}
        viewSize={viewSize}
        setViewSize={setViewSize}
        setIsOpen={setIsOpen}
      />
    </div>
  );
}
