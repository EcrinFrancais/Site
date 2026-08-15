import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { bijouxConfig, getSousTypesForFamille, getSousType, getDimsRange } from '../data/bijouxConfig';
import { bijouxPricingService } from '../logic/bijouxPricingService';
import { configurationService } from '../logic/configurationService';
import {
  createDraftConfiguration,
  buildConfigurationSnapshot,
  saveConfigurationDraft,
} from '../application/configurationUseCases';
import { createCartItem } from '../domain/cartItem';
import { estimateItemWeightKg } from '../logic/shippingService';
import { useEngravingUpload } from '../hooks/useEngravingUpload';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useUnsavedChanges } from '../context/UnsavedChangesContext';
import JewelryConfigurationPanel from '../components/JewelryConfigurationPanel';
import JewelryPreview3DPanel from '../components/JewelryPreview3DPanel';
import AddToCartModal from '../components/AddToCartModal';
import { jewelryConfiguratorStyles as styles } from '../styles/jewelryConfiguratorStyles';

const JEWELRY_UNIVERS_ID = 'joaillerie-horlogerie';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export default function JewelryConfiguratorPage() {
  const { t } = useTranslation(['univers', 'configurator']);
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { setIsDirty: setGlobalDirty, registerSaveHandler } = useUnsavedChanges();
  const resolvedUnivers = params.universId || JEWELRY_UNIVERS_ID;
  const incomingDraft = location.state?.draft;

  const initialConfiguration = React.useMemo(() => {
    if (incomingDraft) return incomingDraft;
    return createDraftConfiguration(resolvedUnivers, configurationService.getTitle(resolvedUnivers));
  }, [incomingDraft, resolvedUnivers]);

  const [name, setName] = useState(initialConfiguration.name || '');
  const [famille, setFamille] = useState(initialConfiguration.values.famille || 'bague');
  const [sousType, setSousType] = useState(
    initialConfiguration.values.sousType || getSousTypesForFamille(initialConfiguration.values.famille || 'bague')[0]?.id
  );
  const [formeGenerale, setFormeGenerale] = useState(initialConfiguration.values.formeGenerale || 'rectangulaire');
  const [essence, setEssence] = useState(initialConfiguration.values.essence || bijouxConfig.essences[0]);
  const [finition, setFinition] = useState(initialConfiguration.values.finition || bijouxConfig.finitions[0]);
  const [couleurVelours, setCouleurVelours] = useState(
    // Le squelette de config par défaut (partagé avec le vin) retombe sur un
    // hex brut ('#3d2c1c') qui ne correspond à aucun nom de la liste bijouterie
    // — on ne le reprend que s'il s'agit bien d'un nom connu (brouillon existant).
    bijouxConfig.veloursColors.includes(initialConfiguration.values.couleurVelours)
      ? initialConfiguration.values.couleurVelours
      : bijouxConfig.veloursColors[0]
  );
  const [gravureType, setGravureType] = useState(initialConfiguration.values.gravureType || 'Aucune');
  const [fontStyle, setFontStyle] = useState(initialConfiguration.values.fontStyle || 'Serif');
  const [tailleTexte, setTailleTexte] = useState(initialConfiguration.values.tailleTexte || 100);
  const [tailleImage, setTailleImage] = useState(initialConfiguration.values.tailleImage || 100);
  const [posX, setPosX] = useState(initialConfiguration.values.posX ?? 50);
  const [posY, setPosY] = useState(initialConfiguration.values.posY ?? 50);
  const [customDims, setCustomDims] = useState(() => {
    const base = getSousType(
      initialConfiguration.values.famille || 'bague',
      initialConfiguration.values.sousType
    )?.dims;
    return initialConfiguration.values.dims || base || { L: 9, l: 9, h: 6 };
  });
  const [lockProportions, setLockProportions] = useState(initialConfiguration.values.lockProportions ?? true);
  const [quantite, setQuantite] = useState(initialConfiguration.values.quantite || 1);
  const [isOpen, setIsOpen] = useState(initialConfiguration.values.isOpen || false);
  const [viewSize, setViewSize] = useState('moyen');
  const [texteGravure, setTexteGravure] = useState(initialConfiguration.values.texteGravure || '');
  const [modeGravure, setModeGravure] = useState(initialConfiguration.values.modeGravure || 'texte');
  const [imageGravure, setImageGravure] = useState(initialConfiguration.values.imageGravure || null);
  const { gravureFichierUrl, gravureFichierNom, gravureUploadState, handleUploadImage } = useEngravingUpload({
    configId: initialConfiguration.id,
    initialUrl: initialConfiguration.values.gravureFichierUrl,
    initialNom: initialConfiguration.values.gravureFichierNom,
    onLocalPreview: setImageGravure,
  });

  const configuration = React.useMemo(
    () =>
      buildConfigurationSnapshot(
        initialConfiguration,
        {
          famille,
          sousType,
          formeGenerale,
          essence,
          finition,
          couleurVelours,
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
          gravureFichierUrl,
          gravureFichierNom,
          dims: customDims,
          lockProportions,
        },
        { name }
      ),
    [
      initialConfiguration,
      famille,
      sousType,
      formeGenerale,
      essence,
      finition,
      couleurVelours,
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
      gravureFichierUrl,
      gravureFichierNom,
      customDims,
      lockProportions,
      name,
    ]
  );

  const quote = React.useMemo(
    () => bijouxPricingService.calculateQuote(configuration.values),
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

  const handleFamilleChange = (nextFamille) => {
    setFamille(nextFamille);
    const first = getSousTypesForFamille(nextFamille)[0];
    if (first) {
      setSousType(first.id);
      setCustomDims(first.dims);
    }
  };

  const handleSousTypeChange = (nextSousType) => {
    setSousType(nextSousType);
    const info = getSousType(famille, nextSousType);
    if (info) setCustomDims(info.dims);
  };

  const dimsRange = React.useMemo(
    () => getDimsRange(getSousType(famille, sousType)?.dims || customDims),
    [famille, sousType, customDims]
  );

  const handleDimChange = (axis, rawValue) => {
    const value = Number(rawValue);
    if (Number.isNaN(value)) return;
    const baseDims = getSousType(famille, sousType)?.dims || customDims;

    if (lockProportions) {
      const ratio = value / baseDims[axis];
      setCustomDims({
        L: clamp(baseDims.L * ratio, dimsRange.L.min, dimsRange.L.max),
        l: clamp(baseDims.l * ratio, dimsRange.l.min, dimsRange.l.max),
        h: clamp(baseDims.h * ratio, dimsRange.h.min, dimsRange.h.max),
      });
    } else {
      setCustomDims((prev) => ({
        ...prev,
        [axis]: clamp(value, dimsRange[axis].min, dimsRange[axis].max),
      }));
    }
  };

  const [isOrdering, setIsOrdering] = useState(false);
  const [showAddedModal, setShowAddedModal] = useState(false);

  const handleOrder = async () => {
    if (isOrdering) return;
    if (modeGravure === 'image' && (gravureUploadState === 'uploading' || gravureUploadState === 'error')) {
      alert(t('configurator:engravingNotReadyAlert'));
      return;
    }
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
      <JewelryConfigurationPanel
        styles={styles}
        name={name}
        setName={setName}
        famille={famille}
        setFamille={handleFamilleChange}
        sousType={sousType}
        setSousType={handleSousTypeChange}
        formeGenerale={formeGenerale}
        setFormeGenerale={setFormeGenerale}
        essence={essence}
        setEssence={setEssence}
        finition={finition}
        setFinition={setFinition}
        couleurVelours={couleurVelours}
        setCouleurVelours={setCouleurVelours}
        dims={customDims}
        dimsRange={dimsRange}
        onDimChange={handleDimChange}
        lockProportions={lockProportions}
        setLockProportions={setLockProportions}
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
        gravureUploadState={gravureUploadState}
        gravureFichierNom={gravureFichierNom}
        quote={quote}
        onOrder={handleOrder}
        orderPending={isOrdering}
        onSaveDraft={handleSaveDraft}
        draftSaveState={draftSaveState}
        title={t(`titles.${resolvedUnivers}`, configurationService.getTitle(resolvedUnivers))}
      />

      <JewelryPreview3DPanel
        styles={styles}
        famille={famille}
        sousType={sousType}
        formeGenerale={formeGenerale}
        essence={essence}
        finition={finition}
        couleurVelours={couleurVelours}
        isOpen={isOpen}
        gravureType={gravureType}
        texteGravure={texteGravure}
        modeGravure={modeGravure}
        imageGravure={imageGravure}
        fontStyle={fontStyle}
        tailleTexte={tailleTexte}
        tailleImage={tailleImage}
        posX={posX}
        posY={posY}
        viewSize={viewSize}
        setViewSize={setViewSize}
        dims={customDims}
        setIsOpen={setIsOpen}
      />

      {showAddedModal && (
        <AddToCartModal onContinue={handleContinueConfiguring} onGoToCart={handleGoToCart} />
      )}
    </div>
  );
}
