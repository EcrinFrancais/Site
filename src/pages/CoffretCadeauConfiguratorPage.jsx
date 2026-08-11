import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { coffretCadeauConfig } from '../data/coffretCadeauConfig';
import { coffretCadeauPricingService } from '../logic/coffretCadeauPricingService';
import { configurationService } from '../logic/configurationService';
import {
  createDraftConfiguration,
  buildConfigurationSnapshot,
  saveConfigurationDraft,
} from '../application/configurationUseCases';
import { createCartItem } from '../domain/cartItem';
import { estimateItemWeightKg } from '../logic/shippingService';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useUnsavedChanges } from '../context/UnsavedChangesContext';
import CoffretCadeauConfigurationPanel from '../components/CoffretCadeauConfigurationPanel';
import CoffretCadeauPreview3DPanel from '../components/CoffretCadeauPreview3DPanel';
import AddToCartModal from '../components/AddToCartModal';
import { coffretCadeauConfiguratorStyles as styles } from '../styles/coffretCadeauConfiguratorStyles';

const GIFT_BOX_UNIVERS_ID = 'coffret-cadeau';

export default function CoffretCadeauConfiguratorPage() {
  const { t } = useTranslation(['univers', 'configurator']);
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { setIsDirty: setGlobalDirty, registerSaveHandler } = useUnsavedChanges();
  const resolvedUnivers = params.universId || GIFT_BOX_UNIVERS_ID;
  const incomingDraft = location.state?.draft;

  const initialConfiguration = React.useMemo(() => {
    if (incomingDraft) return incomingDraft;
    return createDraftConfiguration(resolvedUnivers, configurationService.getTitle(resolvedUnivers));
  }, [incomingDraft, resolvedUnivers]);

  const [name, setName] = useState(initialConfiguration.name || '');
  // Le squelette de config par défaut (partagé avec le vin) retombe sur des
  // valeurs bouteille ('bouteille', 'Bois', 'Charnière', hex de velours) qui
  // ne correspondent à aucune option du coffret cadeau — on ne les reprend
  // que si elles sont bien valides ici (cas d'un brouillon déjà enregistré
  // depuis ce configurateur).
  const [taille, setTaille] = useState(
    coffretCadeauConfig.tailles.some((tItem) => tItem.id === initialConfiguration.values.taille)
      ? initialConfiguration.values.taille
      : 'moyen'
  );
  const [mesures, setMesures] = useState(initialConfiguration.values.mesures || { L: '', l: '', h: '' });
  const [essence, setEssence] = useState(initialConfiguration.values.essence || coffretCadeauConfig.essences[0]);
  const [finition, setFinition] = useState(initialConfiguration.values.finition || coffretCadeauConfig.finitions[0]);
  const [couleurLaque, setCouleurLaque] = useState(initialConfiguration.values.couleurLaque || '#800020');
  const [doublure, setDoublure] = useState(
    coffretCadeauConfig.doublures.includes(initialConfiguration.values.doublure)
      ? initialConfiguration.values.doublure
      : 'Aucune'
  );
  const [couleurVelours, setCouleurVelours] = useState(
    coffretCadeauConfig.veloursColors.includes(initialConfiguration.values.couleurVelours)
      ? initialConfiguration.values.couleurVelours
      : coffretCadeauConfig.veloursColors[0]
  );
  const [fermeture, setFermeture] = useState(
    coffretCadeauConfig.fermetures.includes(initialConfiguration.values.fermeture)
      ? initialConfiguration.values.fermeture
      : coffretCadeauConfig.fermetures[0]
  );
  const [gravureType, setGravureType] = useState(initialConfiguration.values.gravureType || 'Aucune');
  const [fontStyle, setFontStyle] = useState(initialConfiguration.values.fontStyle || 'Serif');
  const [tailleTexte, setTailleTexte] = useState(initialConfiguration.values.tailleTexte || 100);
  const [tailleImage, setTailleImage] = useState(initialConfiguration.values.tailleImage || 100);
  const [posX, setPosX] = useState(initialConfiguration.values.posX ?? 50);
  const [posY, setPosY] = useState(initialConfiguration.values.posY ?? 50);
  const [quantite, setQuantite] = useState(initialConfiguration.values.quantite || 1);
  const [isOpen, setIsOpen] = useState(initialConfiguration.values.isOpen || false);
  const [viewSize, setViewSize] = useState('moyen');
  const [texteGravure, setTexteGravure] = useState(initialConfiguration.values.texteGravure || '');
  const [modeGravure, setModeGravure] = useState(initialConfiguration.values.modeGravure || 'texte');
  const [imageGravure, setImageGravure] = useState(initialConfiguration.values.imageGravure || null);

  const configuration = React.useMemo(
    () =>
      buildConfigurationSnapshot(
        initialConfiguration,
        {
          taille,
          mesures,
          essence,
          finition,
          couleurLaque,
          doublure,
          couleurVelours,
          fermeture,
          gravureType,
          fontStyle,
          tailleTexte,
          tailleImage,
          posX,
          posY,
          quantite,
          isOpen,
          texteGravure,
          modeGravure,
          imageGravure,
        },
        { name }
      ),
    [
      initialConfiguration,
      taille,
      mesures,
      essence,
      finition,
      couleurLaque,
      doublure,
      couleurVelours,
      fermeture,
      gravureType,
      fontStyle,
      tailleTexte,
      tailleImage,
      posX,
      posY,
      quantite,
      isOpen,
      texteGravure,
      modeGravure,
      imageGravure,
      name,
    ]
  );

  const quote = React.useMemo(
    () => coffretCadeauPricingService.calculateQuote(configuration.values),
    [configuration]
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      saveConfigurationDraft(configuration, user?.uid || 'anonymous').catch(() => {});
    }, 800);

    return () => window.clearTimeout(timer);
  }, [configuration, user]);

  // Suivi des modifications non enregistrées, pour le bouton "Enregistrer
  // comme brouillon" et l'avertissement de navigation dans l'en-tête.
  const [isDirty, setIsDirty] = useState(false);
  const [draftSaveState, setDraftSaveState] = useState('idle');
  const isFirstEditRef = useRef(true);
  useEffect(() => {
    if (isFirstEditRef.current) {
      isFirstEditRef.current = false;
      return;
    }
    setIsDirty(true);
  }, [configuration]);

  useEffect(() => {
    setGlobalDirty(isDirty);
  }, [isDirty, setGlobalDirty]);

  useEffect(() => {
    if (!isDirty) return undefined;
    const handler = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  const persistDraft = async (nameToUse) => {
    setDraftSaveState('saving');
    try {
      const snapshot = buildConfigurationSnapshot(configuration, {}, { name: nameToUse });
      await saveConfigurationDraft(snapshot, user?.uid || 'anonymous');
      setIsDirty(false);
      setDraftSaveState('saved');
      window.setTimeout(() => setDraftSaveState('idle'), 2500);
      return true;
    } catch {
      setDraftSaveState('idle');
      return false;
    }
  };

  const handleSaveDraft = async () => {
    const trimmed = name.trim();
    if (trimmed) {
      return persistDraft(trimmed);
    }
    const entered = window.prompt(t('configurator:saveDraftNamePrompt'));
    if (!entered || !entered.trim()) return false;
    const finalName = entered.trim();
    setName(finalName);
    return persistDraft(finalName);
  };

  useEffect(() => {
    registerSaveHandler(handleSaveDraft);
  });

  useEffect(
    () => () => {
      setGlobalDirty(false);
      registerSaveHandler(null);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleUploadImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageGravure(URL.createObjectURL(file));
    }
  };

  const [isOrdering, setIsOrdering] = useState(false);
  const [showAddedModal, setShowAddedModal] = useState(false);

  const handleOrder = async () => {
    if (isOrdering) return;
    setIsOrdering(true);
    const weight = estimateItemWeightKg(quote.selectedDimensions, configuration.values.quantite);
    addItem(createCartItem(configuration, quote, weight));
    setIsOrdering(false);
    setIsDirty(false);
    setShowAddedModal(true);
  };

  const handleContinueConfiguring = () => {
    setShowAddedModal(false);
    navigate('/univers');
  };

  const handleGoToCart = () => {
    setShowAddedModal(false);
    navigate('/panier');
  };

  return (
    <div style={styles.pageContainer}>
      <CoffretCadeauConfigurationPanel
        styles={styles}
        name={name}
        setName={setName}
        taille={taille}
        setTaille={setTaille}
        mesures={mesures}
        setMesures={setMesures}
        essence={essence}
        setEssence={setEssence}
        finition={finition}
        setFinition={setFinition}
        couleurLaque={couleurLaque}
        setCouleurLaque={setCouleurLaque}
        doublure={doublure}
        setDoublure={setDoublure}
        couleurVelours={couleurVelours}
        setCouleurVelours={setCouleurVelours}
        fermeture={fermeture}
        setFermeture={setFermeture}
        gravureType={gravureType}
        setGravureType={setGravureType}
        fontStyle={fontStyle}
        setFontStyle={setFontStyle}
        tailleTexte={tailleTexte}
        setTailleTexte={setTailleTexte}
        tailleImage={tailleImage}
        setTailleImage={setTailleImage}
        posX={posX}
        setPosX={setPosX}
        posY={posY}
        setPosY={setPosY}
        quantite={quantite}
        setQuantite={setQuantite}
        texteGravure={texteGravure}
        setTexteGravure={setTexteGravure}
        modeGravure={modeGravure}
        setModeGravure={setModeGravure}
        handleUploadImage={handleUploadImage}
        quote={quote}
        onOrder={handleOrder}
        orderPending={isOrdering}
        onSaveDraft={handleSaveDraft}
        draftSaveState={draftSaveState}
        title={t(`titles.${resolvedUnivers}`, configurationService.getTitle(resolvedUnivers))}
      />

      <CoffretCadeauPreview3DPanel
        styles={styles}
        taille={taille}
        mesures={mesures}
        essence={essence}
        finition={finition}
        couleurLaque={couleurLaque}
        doublure={doublure}
        couleurVelours={couleurVelours}
        isOpen={isOpen}
        gravureType={gravureType}
        texteGravure={texteGravure}
        modeGravure={modeGravure}
        imageGravure={imageGravure}
        fermeture={fermeture}
        fontStyle={fontStyle}
        tailleTexte={tailleTexte}
        tailleImage={tailleImage}
        posX={posX}
        posY={posY}
        viewSize={viewSize}
        setViewSize={setViewSize}
        setIsOpen={setIsOpen}
      />

      {showAddedModal && (
        <AddToCartModal onContinue={handleContinueConfiguring} onGoToCart={handleGoToCart} />
      )}
    </div>
  );
}
