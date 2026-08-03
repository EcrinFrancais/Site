import React, { useState, Suspense, useRef, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { vinsConfig } from '../data/vinsConfig';
import { useFrame } from '@react-three/fiber';
import { configurationService } from '../logic/configurationService';
import { createDraftConfiguration, calculateConfigurationQuote, buildConfigurationSnapshot, saveConfigurationDraft } from '../application/configurationUseCases';
import { createOrderDraft } from '../logic/orderModel';
import { ClientManager } from '../logic/ClientManager';
import { useAuth } from '../context/AuthContext';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import ConfigurationPanel from '../components/ConfigurationPanel';
import Preview3DPanel from '../components/Preview3DPanel';
import { HEADER_HEIGHT } from '../components/Header';

import bottleImage from '../textures/auxey-duresse.png';
import textureChene from '../textures/chene.jpg';
import textureEbene from '../textures/ebene.jpg';
import textureNoyer from '../textures/noyer.jpg';
import texturePin from '../textures/pin.jpg';
import texturePeuplier from '../textures/peuplier.jpg';
import textureErable from '../textures/erable.jpg';
import texturePalissandre from '../textures/palissandre.jpg';
import textureMerisier from '../textures/merisier.jpg';

const texturesBois = {
  Chêne: textureChene,
  Ébène: textureEbene,
  Noyer: textureNoyer,
  Pin: texturePin,
  Peuplier: texturePeuplier,
  Érable: textureErable,
  Palissandre: texturePalissandre,
  Merisier: textureMerisier,
};

// Note : "Serif" n'a pas d'entrée dédiée — le Text de troika retombe sur sa police
// par défaut (déjà de style serif) tant qu'aucune webfont "classique" compatible
// (.ttf/.otf/.woff, pas l'ancien format JSON three.js) n'a été choisie.
const fonts = {
  SansSerif:
    'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5WZLCzYlKw.woff',
  Script:
    'https://fonts.gstatic.com/s/greatvibes/v14/RWmMoKWR9v4ksMfaWd_JN9XliaO6.woff',
};

// --- LE MOTEUR 3D : CRÉATION DU COFFRET ---
export function Coffret3D({
  taille,
  mesures,
  essence,
  finition,
  couleurLaque,
  couleurVelours,
  isOpen,
  gravureType,
  texteGravure,
  modeGravure,
  imageGravure,
  fermeture,
  fontStyle,
  tailleTexte,
  tailleImage,
  posX,
  posY,
  viewSize,
}) {
  const [woodTexture, setWoodTexture] = useState(null);
  const [bottleRatio, setBottleRatio] = useState(1); // 1 par défaut

  // Réinitialisation pendant le rendu (plutôt que dans l'effet) pour éviter
  // d'afficher un instant l'ancienne texture pendant le chargement de la nouvelle.
  const [previousEssence, setPreviousEssence] = useState(essence);
  if (previousEssence !== essence) {
    setPreviousEssence(essence);
    setWoodTexture(null);
  }

  useEffect(() => {
    const imagePath = texturesBois[essence] || texturesBois['Chêne'];
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    loader.load(
      imagePath,
      (texture) => {
        texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.needsUpdate = true;
        setWoodTexture(texture);
      },
      undefined,
      (error) => {
        console.error('Erreur bois :', error);
        setWoodTexture(null);
      }
    );
  }, [essence]);

  const [logoTexture, setLogoTexture] = useState(null);
  useEffect(() => {
    if (modeGravure === 'image' && imageGravure) {
      const loader = new THREE.TextureLoader();
      loader.load(imageGravure, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        setLogoTexture(texture);
      });
    }
  }, [imageGravure, modeGravure]);

  const [bottleTexture, setBottleTexture] = useState(null);
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(
      bottleImage,
      (texture) => {
        texture.minFilter = THREE.LinearFilter;
        texture.colorSpace = THREE.SRGBColorSpace;
        setBottleRatio(texture.image.width / texture.image.height);
        setBottleTexture(texture);
      },
      undefined,
      (error) => {
        console.error('Erreur bouteille :', error);
      }
    );
  }, []);

  let dims = [0.9, 3.3, 0.9];
  if (taille === 'magnum') dims = [1.2, 3.8, 1.2];
  if (taille === 'jeroboam') dims = [1.6, 4.8, 1.6];
  if (taille === 'rehoboam') dims = [1.8, 5.3, 1.8];
  if (taille === 'sur_mesure') {
    const L = mesures.L ? mesures.L / 10 : 1;
    const l = mesures.l ? mesures.l / 10 : 1;
    const h = mesures.h ? mesures.h / 10 : 3.3;
    dims = [L, h, l];
  }

  const [W, H, D] = dims;
  const T = 0.05;
  const LD = D * 0.1;
  const BD = D * 0.9;

  const estLaque = finition === 'Laque';
  const estBrillant = finition === 'Vernis brillant' || estLaque;
  const textureAAppliquer = estLaque ? null : woodTexture;
  const woodTints = {
    Pin: '#b9864f',
    Peuplier: '#caa06f',
    Noyer: '#6e3f29',
    Érable: '#a56b3f',
    Chêne: '#8b5c3a',
    Ébène: '#2a201b',
    Palissandre: '#4b2722',
    Merisier: '#9b4f36',
  };
  const baseColor = estLaque
    ? couleurLaque
    : woodTexture
    ? woodTints[essence] || '#a67b5b'
    : '#a67b5b';

  const woodMaterialProps = {
    key: `${essence}-${textureAAppliquer ? textureAAppliquer.uuid : 'sans-texture'}`,
    map: textureAAppliquer,
    color: baseColor,
    roughness: estBrillant ? 0.12 : 0.78,
    metalness: estBrillant ? 0.12 : 0.02,
  };

  const lidRef = useRef();
  const isMagnetic = fermeture === 'Charnières + fermeture magnétique invisible';
  const isSlidingTop = fermeture === 'Couvercle coulissant';
  const isSlidingDrawer = fermeture === 'Tiroir coulissant';
  const isEmboitement = fermeture === 'Couvercle amovible par emboîtement';
  const isLatch = fermeture === 'Charnières + loquet en laiton';

  useFrame(() => {
    if (lidRef.current) {
      if (isSlidingTop) {
        lidRef.current.position.y = THREE.MathUtils.lerp(
          lidRef.current.position.y,
          isOpen ? 0.55 : 0,
          0.08
        );
        lidRef.current.position.x = THREE.MathUtils.lerp(
          lidRef.current.position.x,
          0,
          0.08
        );
        lidRef.current.position.z = THREE.MathUtils.lerp(
          lidRef.current.position.z,
          0,
          0.08
        );
        lidRef.current.rotation.y = 0;
      } else if (isSlidingDrawer) {
        lidRef.current.position.z = THREE.MathUtils.lerp(
          lidRef.current.position.z,
          isOpen ? 0.35 : 0,
          0.08
        );
        lidRef.current.position.x = THREE.MathUtils.lerp(
          lidRef.current.position.x,
          0,
          0.08
        );
        lidRef.current.position.y = THREE.MathUtils.lerp(
          lidRef.current.position.y,
          0,
          0.08
        );
        lidRef.current.rotation.y = 0;
      } else if (isEmboitement) {
        lidRef.current.position.x = THREE.MathUtils.lerp(
          lidRef.current.position.x,
          isOpen ? 0.4 : 0,
          0.08
        );
        lidRef.current.position.y = THREE.MathUtils.lerp(
          lidRef.current.position.y,
          0,
          0.08
        );
        lidRef.current.position.z = THREE.MathUtils.lerp(
          lidRef.current.position.z,
          0,
          0.08
        );
        lidRef.current.rotation.y = 0;
      } else {
        const targetRotation = isOpen ? -Math.PI / 1.45 : 0;
        lidRef.current.rotation.y = THREE.MathUtils.lerp(
          lidRef.current.rotation.y,
          targetRotation,
          0.08
        );
        lidRef.current.position.x = THREE.MathUtils.lerp(
          lidRef.current.position.x,
          0,
          0.08
        );
        lidRef.current.position.y = THREE.MathUtils.lerp(
          lidRef.current.position.y,
          0,
          0.08
        );
        lidRef.current.position.z = THREE.MathUtils.lerp(
          lidRef.current.position.z,
          0,
          0.08
        );
      }
    }
  });

  const innerHeight = H - 2 * T;
  const bottomInnerY = -H / 2 + T;

  const bottleHeight = innerHeight * 0.9;
  const bottlePosY = bottomInnerY + bottleHeight / 2 - 0.01;

  //  const bottleHeight = H * 0.82;
  //  const bottlePosY = -H / 2 + T + bottleHeight / 2;
  const bottlePosZ = D * 0.3;

  let colorGravure = '#3e2723';
  if (
    gravureType.toLowerCase().includes('dorure') ||
    gravureType.toLowerCase().includes('or')
  )
    colorGravure = '#d4af37';
  if (gravureType.toLowerCase().includes('argent')) colorGravure = '#c0c0c0';

  const textPosX = (posX / 100) * W - W / 2;
  const textPosY = H / 2 - (posY / 100) * H;
  const actualFontSize = 0.06 * (tailleTexte / 100);
  const actualImageScale = 0.3 * (tailleImage / 100);
  const modelScale = { petit: 0.58, moyen: 0.72, grand: 0.86 }[viewSize] || 0.72;

  return (
    <group scale={[modelScale, modelScale, modelScale]} position={[0, H / 2 - 1.5, 0]}>
      <group position={[0, 0, -LD / 2]}>
        <mesh position={[0, 0, -BD / 2 + T / 2]} castShadow receiveShadow>
          <boxGeometry args={[W, H, T]} />
          <meshStandardMaterial {...woodMaterialProps} />
        </mesh>
        <mesh position={[-W / 2 + T / 2, 0, T / 2]} castShadow receiveShadow>
          <boxGeometry args={[T, H, BD - T]} />
          <meshStandardMaterial {...woodMaterialProps} />
        </mesh>
        <mesh position={[W / 2 - T / 2, 0, T / 2]} castShadow receiveShadow>
          <boxGeometry args={[T, H, BD - T]} />
          <meshStandardMaterial {...woodMaterialProps} />
        </mesh>
        <mesh position={[0, -H / 2 + T / 2, T / 2]} castShadow receiveShadow>
          <boxGeometry args={[W - 2 * T, T, BD - T]} />
          <meshStandardMaterial {...woodMaterialProps} />
        </mesh>
        <mesh position={[0, H / 2 - T / 2, T / 2]} castShadow receiveShadow>
          <boxGeometry args={[W - 2 * T, T, BD - T]} />
          <meshStandardMaterial {...woodMaterialProps} />
        </mesh>

        <mesh position={[0, 0, -BD / 2 + T + 0.005]}>
          <boxGeometry args={[W - 2 * T - 0.02, H - 2 * T - 0.02, 0.01]} />
          <meshStandardMaterial
            color={couleurVelours}
            roughness={0.9}
            metalness={0.1}
          />
        </mesh>

        {/* ✅ BOUTEILLE DANS LE COFFRET */}
        {bottleTexture && (
          <mesh position={[0, bottlePosY, bottlePosZ]}>
            <planeGeometry args={[bottleHeight * bottleRatio, bottleHeight]} />
            <meshStandardMaterial map={bottleTexture} transparent />
          </mesh>
        )}

        {/* COUVERCLE ANIMÉ */}
        <group position={[-W / 2, 0, D / 2 - LD]} ref={lidRef}>
          <mesh position={[W / 2, 0, LD / 2]} castShadow>
            <boxGeometry args={[W, H, LD]} />
            <meshStandardMaterial {...woodMaterialProps} />
            {isMagnetic && (
              <mesh position={[0.12 * W, -0.12 * H, LD / 2 + 0.012]}>
                <boxGeometry args={[0.02, 0.02, 0.015]} />
                <meshStandardMaterial color="#d7d7d7" metalness={0.9} roughness={0.2} />
              </mesh>
            )}
            {isLatch && (
              <>
                <mesh position={[0.08 * W, 0.08 * H, LD / 2 + 0.012]}>
                  <boxGeometry args={[0.06, 0.12, 0.025]} />
                  <meshStandardMaterial color="#b08b2d" metalness={0.8} roughness={0.2} />
                </mesh>
                <mesh position={[0.18 * W, 0.02 * H, LD / 2 + 0.012]}>
                  <boxGeometry args={[0.04, 0.08, 0.022]} />
                  <meshStandardMaterial color="#b08b2d" metalness={0.8} roughness={0.2} />
                </mesh>
              </>
            )}

            {/* LE TEXTE 3D */}
            {/* LE TEXTE 3D AVEC SECURITE DE CHARGEMENT */}
            {gravureType !== 'Aucune' &&
              modeGravure === 'texte' &&
              texteGravure && (
                <Suspense fallback={null}>
                  <Text
                    font={fonts[fontStyle]}
                    position={[textPosX, textPosY, LD / 2 + 0.001]}
                    fontSize={actualFontSize}
                    color={colorGravure}
                    anchorX="center"
                    anchorY="middle"
                    maxWidth={W - 0.1}
                    textAlign="center"
                    material-roughness={
                      gravureType.includes('Laser') ? 0.9 : 0.2
                    }
                    material-metalness={
                      gravureType.includes('Laser') ? 0.1 : 0.8
                    }
                  >
                    {texteGravure}
                  </Text>
                </Suspense>
              )}

            {/* L'IMAGE 3D (Corrigé : On dessine bien un mesh 3D et pas du HTML !) */}
            {gravureType !== 'Aucune' &&
              modeGravure === 'image' &&
              logoTexture && (
                <mesh position={[textPosX, textPosY, LD / 2 + 0.002]}>
                  <planeGeometry args={[actualImageScale, actualImageScale]} />
                  <meshStandardMaterial
                    map={logoTexture}
                    transparent={true}
                    color={colorGravure}
                    roughness={gravureType.includes('Laser') ? 0.9 : 0.2}
                    metalness={gravureType.includes('Laser') ? 0.1 : 0.8}
                  />
                </mesh>
              )}
          </mesh>
        </group>
      </group>
    </group>
  );
}

// --- LA PAGE D'INTERFACE ---
export default function ConfiguratorPage({ univers }) {
  const { t } = useTranslation('univers');
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const resolvedUnivers = univers || params.universId || 'vins-spiritueux';
  const incomingDraft = location.state?.draft;

  const initialConfiguration = React.useMemo(() => {
    if (incomingDraft) {
      return {
        ...incomingDraft,
        values: {
          ...incomingDraft.values,
          mesures: incomingDraft.values?.mesures || { L: '', l: '', h: '' },
        },
      };
    }

    return createDraftConfiguration(
      resolvedUnivers,
      configurationService.getTitle(resolvedUnivers)
    );
  }, [incomingDraft, resolvedUnivers]);

  const [taille, setTaille] = useState(initialConfiguration.values.taille);
  const [mesures, setMesures] = useState(initialConfiguration.values.mesures);
  const [essence, setEssence] = useState(initialConfiguration.values.essence);
  const [finition, setFinition] = useState(initialConfiguration.values.finition);
  const [couleurLaque, setCouleurLaque] = useState(
    initialConfiguration.values.couleurLaque
  );
  const [cales, setCales] = useState(initialConfiguration.values.cales);
  const [couleurVelours, setCouleurVelours] = useState(
    initialConfiguration.values.couleurVelours
  );
  const [fermeture, setFermeture] = useState(initialConfiguration.values.fermeture);
  const [gravureType, setGravureType] = useState(
    initialConfiguration.values.gravureType
  );

  const [fontStyle, setFontStyle] = useState(initialConfiguration.values.fontStyle);
  const [tailleTexte, setTailleTexte] = useState(initialConfiguration.values.tailleTexte);
  const [tailleImage, setTailleImage] = useState(initialConfiguration.values.tailleImage);
  const [posX, setPosX] = useState(initialConfiguration.values.posX);
  const [posY, setPosY] = useState(initialConfiguration.values.posY);
  const [quantite, setQuantite] = useState(initialConfiguration.values.quantite);
  const [isOpen, setIsOpen] = useState(initialConfiguration.values.isOpen);
  const [viewSize, setViewSize] = useState('moyen');

  const [texteGravure, setTexteGravure] = useState(
    initialConfiguration.values.texteGravure
  );
  const [modeGravure, setModeGravure] = useState(initialConfiguration.values.modeGravure);
  const [imageGravure, setImageGravure] = useState(initialConfiguration.values.imageGravure);

  const configuration = React.useMemo(
    () =>
      buildConfigurationSnapshot(initialConfiguration, {
        taille,
        mesures,
        essence,
        finition,
        quantite,
      }),
    [initialConfiguration, taille, mesures, essence, finition, quantite]
  );
  const quote = React.useMemo(
    () => calculateConfigurationQuote(configuration),
    [configuration]
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      saveConfigurationDraft(configuration, user?.uid || 'anonymous').catch(() => {});
    }, 800);

    return () => window.clearTimeout(timer);
  }, [configuration, user]);

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
      <ConfigurationPanel
        styles={styles}
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
        cales={cales}
        setCales={setCales}
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
        viewSize={viewSize}
        setViewSize={setViewSize}
        texteGravure={texteGravure}
        setTexteGravure={setTexteGravure}
        modeGravure={modeGravure}
        setModeGravure={setModeGravure}
        handleUploadImage={handleUploadImage}
        quote={quote}
        vinsConfig={vinsConfig}
        onOrder={handleOrder}
        orderPending={isOrdering}
        title={t(`titles.${resolvedUnivers}`, configurationService.getTitle(resolvedUnivers))}
      />

      <Preview3DPanel
        styles={styles}
        taille={taille}
        mesures={mesures}
        essence={essence}
        finition={finition}
        couleurLaque={couleurLaque}
        couleurVelours={couleurVelours}
        isOpen={isOpen}
        fermeture={fermeture}
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

const styles = {
  pageContainer: {
    display: 'flex',
    height: `calc(100vh - ${HEADER_HEIGHT}px)`,
    width: '100vw',
    background: 'linear-gradient(135deg, #050505 0%, #111 45%, #0d0d0d 100%)',
    color: '#f6f1e8',
    fontFamily: '"Optima", "Didot", "Helvetica Neue", sans-serif',
    overflow: 'hidden',
  },
  leftPanel: {
    width: 'min(60%, 900px)',
    minWidth: '320px',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 28px 28px',
    overflowY: 'auto',
    background: 'linear-gradient(145deg, #0f0f0f 0%, #161616 100%)',
    borderRight: '1px solid rgba(212, 175, 55, 0.16)',
  },
  rightPanel3D: {
    flex: 1,
    minWidth: '320px',
    background: 'radial-gradient(circle at top, #2d2418 0%, #030303 60%, #000 100%)',
    borderLeft: '1px solid rgba(212, 175, 55, 0.18)',
    position: 'relative',
    overflow: 'hidden',
  },
  configContainer: {
    width: '100%',
    maxWidth: '760px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  title: {
    fontFamily: '"Didot", "Times New Roman", serif',
    fontSize: '2rem',
    fontWeight: 'normal',
    letterSpacing: '2px',
    color: '#d4af37',
    marginBottom: '24px',
    borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
    paddingBottom: '14px',
  },
  sectionCard: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '18px',
    marginBottom: '16px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.18)',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px',
  },
  sectionEyebrow: {
    color: '#d4af37',
    fontSize: '0.68rem',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    marginBottom: '4px',
  },
  sectionTitle: {
    fontSize: '1rem',
    color: '#f7efe3',
    margin: 0,
    fontWeight: 600,
  },
  sectionBadge: {
    color: '#c7a75b',
    fontSize: '0.72rem',
    border: '1px solid rgba(212, 175, 55, 0.25)',
    borderRadius: '999px',
    padding: '4px 10px',
  },
  sectionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    columnGap: '16px',
    rowGap: '14px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '0.68rem',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    color: '#b6ab95',
    marginBottom: '2px',
  },
  minimalSelect: {
    width: '100%',
    backgroundColor: '#121212',
    color: '#f8f1e2',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '10px',
    padding: '10px 12px',
    fontSize: '0.95rem',
    outline: 'none',
    cursor: 'pointer',
    appearance: 'none',
    boxSizing: 'border-box',
  },
  minimalInput: {
    width: '100%',
    backgroundColor: '#121212',
    color: '#f8f1e2',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '10px',
    padding: '10px 12px',
    fontSize: '0.95rem',
    outline: 'none',
    boxSizing: 'border-box',
  },
  inlineInputs: { display: 'flex', gap: '10px', marginTop: '8px' },
  colorPicker: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    height: '25px',
    width: '25px',
    padding: 0,
  },
  engravingCard: {
    gridColumn: '1 / -1',
    background: 'rgba(212, 175, 55, 0.08)',
    border: '1px solid rgba(212, 175, 55, 0.18)',
    borderRadius: '12px',
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  summaryCard: {
    background: 'rgba(212, 175, 55, 0.08)',
    border: '1px solid rgba(212, 175, 55, 0.2)',
    borderRadius: '16px',
    padding: '16px 18px',
    marginBottom: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },
  summaryLabel: {
    color: '#b6ab95',
    fontSize: '0.7rem',
    letterSpacing: '2px',
    textTransform: 'uppercase',
  },
  summaryValue: {
    color: '#f7efe3',
    fontSize: '1rem',
    marginTop: '4px',
    fontWeight: 600,
  },
  footer: {
    marginTop: '8px',
    paddingTop: '18px',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '12px',
  },
  orderButton: {
    backgroundColor: '#d4af37',
    color: '#000',
    border: 'none',
    padding: '14px 34px',
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    cursor: 'pointer',
    fontWeight: 'bold',
    borderRadius: '999px',
  },
  openButton: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    zIndex: 10,
    padding: '10px 20px',
    backgroundColor: 'rgba(10, 10, 10, 0.82)',
    color: '#d4af37',
    border: '1px solid rgba(212, 175, 55, 0.4)',
    cursor: 'pointer',
    textTransform: 'uppercase',
    fontSize: '0.7rem',
    letterSpacing: '1px',
    borderRadius: '999px',
  },
};
