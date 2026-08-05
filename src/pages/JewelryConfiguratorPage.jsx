import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { bijouxConfig, getSousTypesForFamille } from '../data/bijouxConfig';
import { bijouxPricingService } from '../logic/bijouxPricingService';
import { configurationService } from '../logic/configurationService';
import {
  createDraftConfiguration,
  buildConfigurationSnapshot,
  saveConfigurationDraft,
} from '../application/configurationUseCases';
import { createOrderDraft } from '../logic/orderModel';
import { ClientManager } from '../logic/ClientManager';
import { useAuth } from '../context/AuthContext';
import JewelryConfigurationPanel from '../components/JewelryConfigurationPanel';
import JewelryPreview3DPanel from '../components/JewelryPreview3DPanel';
import { jewelryConfiguratorStyles as styles } from '../styles/jewelryConfiguratorStyles';

const JEWELRY_UNIVERS_ID = 'joaillerie-horlogerie';

export default function JewelryConfiguratorPage() {
  const { t } = useTranslation('univers');
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
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

  const handleFamilleChange = (nextFamille) => {
    setFamille(nextFamille);
    const first = getSousTypesForFamille(nextFamille)[0];
    if (first) setSousType(first.id);
  };

  const handleUploadImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageGravure(URL.createObjectURL(file));
    }
  };

  const [isOrdering, setIsOrdering] = useState(false);

  const handleOrder = async () => {
    if (isOrdering) return;
    setIsOrdering(true);
    const orderDraft = createOrderDraft(configuration, quote, profile || {});
    const result = await ClientManager.sauvegarderCommande(orderDraft);
    setIsOrdering(false);
    navigate('/commande', {
      state: { orderDraft: { ...orderDraft, id: result.id, persisted: result.success } },
    });
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
        setSousType={setSousType}
        formeGenerale={formeGenerale}
        setFormeGenerale={setFormeGenerale}
        essence={essence}
        setEssence={setEssence}
        finition={finition}
        setFinition={setFinition}
        couleurVelours={couleurVelours}
        setCouleurVelours={setCouleurVelours}
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
        viewSize={viewSize}
        setViewSize={setViewSize}
        texteGravure={texteGravure}
        setTexteGravure={setTexteGravure}
        modeGravure={modeGravure}
        setModeGravure={setModeGravure}
        handleUploadImage={handleUploadImage}
        quote={quote}
        onOrder={handleOrder}
        orderPending={isOrdering}
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
        setIsOpen={setIsOpen}
      />
    </div>
  );
}
