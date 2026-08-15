import React, { useState, useMemo, Suspense, useRef, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { vinsConfig } from '../data/vinsConfig';
import { useFrame } from '@react-three/fiber';
import { configurationService } from '../logic/configurationService';
import { createDraftConfiguration, calculateConfigurationQuote, buildConfigurationSnapshot, saveConfigurationDraft } from '../application/configurationUseCases';
import { createCartItem } from '../domain/cartItem';
import { estimateItemWeightKg } from '../logic/shippingService';
import { useEngravingUpload } from '../hooks/useEngravingUpload';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useUnsavedChanges } from '../context/UnsavedChangesContext';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import ConfigurationPanel from '../components/ConfigurationPanel';
import Preview3DPanel from '../components/Preview3DPanel';
import AddToCartModal from '../components/AddToCartModal';
import { HEADER_HEIGHT } from '../components/Header';

import bottleLabelImage from '../textures/etiquette-auxey-duresse.jpg';
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

// Silhouette d'une cale de calage : un bloc qui épouse le contour circulaire
// de la bouteille (vu du dessus) sans former un anneau fermé. L'ouverture est
// un couloir à parois verticales, tangentes au cercle (donc large exactement
// du diamètre de la bouteille à cet endroit), afin que la bouteille puisse
// réellement y glisser sans toucher la cale.
function buildCaleShape({ halfWidth, zBack, zFront, radius }) {
  const shape = new THREE.Shape();
  shape.moveTo(-halfWidth, zFront);
  shape.lineTo(-radius, zFront);
  shape.lineTo(-radius, 0);
  // Demi-cercle arrière (le "C") : tout le tour sauf l'ouverture avant.
  shape.absarc(0, 0, radius, Math.PI, 0, false);
  shape.lineTo(radius, zFront);
  shape.lineTo(halfWidth, zFront);
  shape.lineTo(halfWidth, zBack);
  shape.lineTo(-halfWidth, zBack);
  shape.closePath();

  return shape;
}

// --- LE MOTEUR 3D : CRÉATION DU COFFRET ---
export function Coffret3D({
  taille,
  mesures,
  essence,
  finition,
  couleurLaque,
  couleurVelours,
  cales,
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
  const [labelRatio, setLabelRatio] = useState(400 / 293); // ratio par défaut

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

  const [labelTexture, setLabelTexture] = useState(null);
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(
      bottleLabelImage,
      (texture) => {
        texture.minFilter = THREE.LinearFilter;
        texture.colorSpace = THREE.SRGBColorSpace;
        setLabelRatio(texture.image.width / texture.image.height);
        setLabelTexture(texture);
      },
      undefined,
      (error) => {
        console.error('Erreur étiquette :', error);
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

  // Les teintes de velours sont choisies par nom (voir vinsConfig.veloursColors) ;
  // Three.js ne comprend pas ces libellés français, il faut les convertir en hex.
  const veloursColorHex = {
    Grenat: '#6e0f1f',
    Émeraude: '#0b6e4f',
    'Bleu royal': '#1e3a8a',
    Anthracite: '#2b2b2e',
    Ivoire: '#f1e9d2',
  };
  const resolvedVelvetColor = veloursColorHex[couleurVelours] || couleurVelours;

  const woodMaterialProps = {
    key: `${essence}-${textureAAppliquer ? textureAAppliquer.uuid : 'sans-texture'}`,
    map: textureAAppliquer,
    color: baseColor,
    roughness: estBrillant ? 0.12 : 0.78,
    metalness: estBrillant ? 0.12 : 0.02,
  };

  const lidRef = useRef();
  const isSlidingTop = fermeture === 'Couvercle coulissant';
  const isSlidingDrawer = fermeture === 'Tiroir coulissant';
  const isEmboitement = fermeture === 'Couvercle amovible par emboîtement';
  const isLatch = fermeture === 'Charnières + loquet en laiton';
  // Course d'ouverture verticale suffisante pour dégager la bouteille.
  const slideOpenDistance = H + 0.15;
  // Le tiroir repose 5 mm sous le bord du coffret (au repos).
  const drawerRecess = 0.05;

  useFrame(() => {
    if (lidRef.current) {
      if (isSlidingTop) {
        // Même emplacement que la porte à charnières (sur le devant du
        // coffret) ; coulisse vers le haut à l'ouverture au lieu de pivoter.
        lidRef.current.position.y = THREE.MathUtils.lerp(
          lidRef.current.position.y,
          isOpen ? slideOpenDistance : 0,
          0.08
        );
        lidRef.current.position.x = THREE.MathUtils.lerp(
          lidRef.current.position.x,
          -W / 2,
          0.08
        );
        lidRef.current.position.z = THREE.MathUtils.lerp(
          lidRef.current.position.z,
          D / 2 - LD,
          0.08
        );
        lidRef.current.rotation.y = 0;
      } else if (isSlidingDrawer) {
        // Coulisse dans des rainures de part et d'autre du coffret, en
        // retrait de 5 mm vers l'intérieur (par rapport au plan de la
        // porte) ; glisse vers le haut à l'ouverture, assez haut pour
        // dégager la bouteille.
        lidRef.current.position.y = THREE.MathUtils.lerp(
          lidRef.current.position.y,
          isOpen ? slideOpenDistance : 0,
          0.08
        );
        lidRef.current.position.x = THREE.MathUtils.lerp(
          lidRef.current.position.x,
          -W / 2,
          0.08
        );
        lidRef.current.position.z = THREE.MathUtils.lerp(
          lidRef.current.position.z,
          D / 2 - LD - drawerRecess,
          0.08
        );
        lidRef.current.rotation.y = 0;
      } else if (isEmboitement) {
        // Au repos, le couvercle amovible occupe le même plan que la porte
        // (bord aligné avec le coffret) ; à l'ouverture, il glisse
        // entièrement à côté du coffret plutôt que de flotter devant.
        lidRef.current.position.x = THREE.MathUtils.lerp(
          lidRef.current.position.x,
          isOpen ? W / 2 + 0.2 : -W / 2,
          0.08
        );
        lidRef.current.position.y = THREE.MathUtils.lerp(
          lidRef.current.position.y,
          0,
          0.08
        );
        lidRef.current.position.z = THREE.MathUtils.lerp(
          lidRef.current.position.z,
          D / 2 - LD,
          0.08
        );
        lidRef.current.rotation.y = 0;
      } else {
        // Ouverture "porte d'armoire" : la charnière reste fixe sur le bord
        // du coffret (le pivot de la porte), seule la rotation anime.
        const targetRotation = isOpen ? -Math.PI / 2 : 0;
        lidRef.current.rotation.y = THREE.MathUtils.lerp(
          lidRef.current.rotation.y,
          targetRotation,
          0.08
        );
        lidRef.current.position.x = THREE.MathUtils.lerp(
          lidRef.current.position.x,
          -W / 2,
          0.08
        );
        lidRef.current.position.y = THREE.MathUtils.lerp(
          lidRef.current.position.y,
          0,
          0.08
        );
        lidRef.current.position.z = THREE.MathUtils.lerp(
          lidRef.current.position.z,
          D / 2 - LD,
          0.08
        );
      }
    }
  });

  const innerHeight = H - 2 * T;

  // Un peu plus petite en hauteur, et centrée en profondeur dans le coffret.
  const bottleHeight = innerHeight * 0.92;
  const bottlePosZ = 0;

  // --- SILHOUETTE 3D DE LA BOUTEILLE (verre bourguignon) ---
  // Rayon calculé sur une hauteur de référence fixe (indépendante du réglage
  // ci-dessus) pour pouvoir ajuster la hauteur sans jamais élargir la bouteille.
  const bottleGlassRadius = Math.min(
    innerHeight * 0.9 * 0.135,
    (W - 2 * T) * 0.4
  );
  // Rayon du col (fraction du rayon du corps), réutilisé aussi pour caler la
  // cale de calage sous le goulot.
  const neckRadiusFrac = 0.27;
  // Profil [rayon relatif, hauteur relative] du fond au goulot, révolutionné
  // en LatheGeometry. Contrairement à une bordelaise (épaule haute et
  // anguleuse), la bourguignonne a une pente longue, continue et lissée
  // (courbe smoothstep) du corps jusqu'au col, sans rupture nette.
  const bottleProfile = useMemo(() => {
    const points = [];
    const addPoint = (rFrac, yFrac) =>
      points.push(
        new THREE.Vector2(rFrac * bottleGlassRadius, yFrac * bottleHeight)
      );

    // Talon / fond légèrement renfoncé
    addPoint(0.0, 0.0);
    addPoint(0.7, 0.012);
    addPoint(0.95, 0.03);
    addPoint(1.0, 0.06);

    // Corps cylindrique
    addPoint(1.0, 0.56);

    // Épaule bourguignonne : longue pente continue et lissée
    const shoulderStart = 0.56;
    const shoulderEnd = 0.87;
    const shoulderSteps = 10;
    for (let i = 1; i <= shoulderSteps; i += 1) {
      const t = i / shoulderSteps;
      const smooth = t * t * (3 - 2 * t); // smoothstep
      const rFrac = 1.0 - (1.0 - neckRadiusFrac) * smooth;
      const yFrac = shoulderStart + (shoulderEnd - shoulderStart) * t;
      addPoint(rFrac, yFrac);
    }

    // Col cylindrique
    addPoint(neckRadiusFrac, 0.94);

    // Bague de la capsule, puis bouchon fermé
    addPoint(0.33, 0.965);
    addPoint(0.29, 0.98);
    addPoint(0.0, 1.0);

    return points;
  }, [bottleGlassRadius, bottleHeight, neckRadiusFrac]);
  // Centrée verticalement par rapport au coffret (et non posée sur le fond).
  const bottleBottomY = -bottleHeight / 2;

  // --- CALES EN BOIS : maintiennent la bouteille sous le goulot et en pied ---
  // Chaque cale est un bloc de la largeur intérieure du coffret, percé d'un
  // trou qui épouse le rayon de la bouteille à cette hauteur, mais laissé
  // ouvert sur l'avant pour pouvoir y glisser la bouteille latéralement.
  const caleHalfWidth = W / 2 - T;
  const caleZBack = -BD / 2 + T;
  const caleZFront = BD / 2 - LD / 2 - 0.01;
  const caleClearance = 0.015;
  const caleThickness = Math.max(0.05, bottleHeight * 0.05);

  const neckCaleCenterY = bottleBottomY + bottleHeight * 0.9;
  const neckCaleRadius = neckRadiusFrac * bottleGlassRadius + caleClearance;
  const baseCaleCenterY = bottleBottomY + bottleHeight * 0.15;
  const baseCaleRadius = bottleGlassRadius + caleClearance;

  const caleExtrudeSettings = useMemo(
    () => ({ depth: caleThickness, bevelEnabled: false, curveSegments: 32 }),
    [caleThickness]
  );

  const neckCaleShape = useMemo(
    () =>
      buildCaleShape({
        halfWidth: caleHalfWidth,
        zBack: caleZBack,
        zFront: caleZFront,
        radius: neckCaleRadius,
      }),
    [caleHalfWidth, caleZBack, caleZFront, neckCaleRadius]
  );

  const baseCaleShape = useMemo(
    () =>
      buildCaleShape({
        halfWidth: caleHalfWidth,
        zBack: caleZBack,
        zFront: caleZFront,
        radius: baseCaleRadius,
      }),
    [caleHalfWidth, caleZBack, caleZFront, baseCaleRadius]
  );

  // Étiquette enroulée sur ~95% du tour du corps, centrée côté face avant
  // (theta=0 pointe vers +z avec cette paramétrisation de cylindre).
  const labelThetaLength = Math.PI * 0.95;
  const labelHeight = (labelThetaLength * bottleGlassRadius) / labelRatio;
  const labelCenterY = bottleBottomY + bottleHeight * 0.35;

  let colorGravure = '#3e2723';
  if (
    gravureType.toLowerCase().includes('dorure') ||
    gravureType.toLowerCase().includes('or')
  )
    colorGravure = '#d4af37';
  if (gravureType.toLowerCase().includes('argent')) colorGravure = '#c0c0c0';

  const textPosX = (posX / 100) * W - W / 2;
  const textPosY = H / 2 - (posY / 100) * H;
  const actualFontSize = 0.13 * (tailleTexte / 100);
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

        {cales === 'Velours' && (
          <>
            {/* Doublure de velours sur l'ensemble des faces intérieures du
                coffret (fond, côtés, dessus, dessous), pour donner
                l'impression que la bouteille repose entièrement sur du
                velours de cette couleur. */}
            <mesh position={[0, 0, -BD / 2 + T + 0.005]}>
              <boxGeometry args={[W - 2 * T - 0.02, innerHeight - 0.02, 0.01]} />
              <meshStandardMaterial color={resolvedVelvetColor} roughness={0.9} metalness={0.1} />
            </mesh>
            <mesh position={[-W / 2 + T + 0.005, 0, T / 2]} rotation={[0, Math.PI / 2, 0]}>
              <boxGeometry args={[BD - T - 0.02, innerHeight - 0.02, 0.01]} />
              <meshStandardMaterial color={resolvedVelvetColor} roughness={0.9} metalness={0.1} />
            </mesh>
            <mesh position={[W / 2 - T - 0.005, 0, T / 2]} rotation={[0, Math.PI / 2, 0]}>
              <boxGeometry args={[BD - T - 0.02, innerHeight - 0.02, 0.01]} />
              <meshStandardMaterial color={resolvedVelvetColor} roughness={0.9} metalness={0.1} />
            </mesh>
            <mesh position={[0, -H / 2 + T + 0.005, T / 2]} rotation={[Math.PI / 2, 0, 0]}>
              <boxGeometry args={[W - 2 * T - 0.02, BD - T - 0.02, 0.01]} />
              <meshStandardMaterial color={resolvedVelvetColor} roughness={0.9} metalness={0.1} />
            </mesh>
            <mesh position={[0, H / 2 - T - 0.005, T / 2]} rotation={[Math.PI / 2, 0, 0]}>
              <boxGeometry args={[W - 2 * T - 0.02, BD - T - 0.02, 0.01]} />
              <meshStandardMaterial color={resolvedVelvetColor} roughness={0.9} metalness={0.1} />
            </mesh>
          </>
        )}

        {cales === 'Bois' && (
          <>
            {/* Cale sous le goulot */}
            <mesh
              position={[0, neckCaleCenterY + caleThickness / 2, 0]}
              rotation={[Math.PI / 2, 0, 0]}
              castShadow
              receiveShadow
            >
              <extrudeGeometry args={[neckCaleShape, caleExtrudeSettings]} />
              <meshStandardMaterial {...woodMaterialProps} side={THREE.DoubleSide} />
            </mesh>
            {/* Cale en pied de bouteille */}
            <mesh
              position={[0, baseCaleCenterY + caleThickness / 2, 0]}
              rotation={[Math.PI / 2, 0, 0]}
              castShadow
              receiveShadow
            >
              <extrudeGeometry args={[baseCaleShape, caleExtrudeSettings]} />
              <meshStandardMaterial {...woodMaterialProps} side={THREE.DoubleSide} />
            </mesh>
          </>
        )}

        {/* ✅ BOUTEILLE DANS LE COFFRET */}
        {/* Verre 3D (silhouette bourguignonne) : donne du volume sous tous
            les angles, y compris de profil. */}
        <mesh position={[0, bottleBottomY, bottlePosZ]} castShadow receiveShadow>
          <latheGeometry args={[bottleProfile, 32]} />
          <meshPhysicalMaterial
            color="#132018"
            roughness={0.15}
            metalness={0}
            transparent
            opacity={0.9}
            transmission={0.3}
            thickness={0.05}
            clearcoat={0.4}
          />
        </mesh>

        {/* Étiquette enroulée sur le corps du verre (et non un plan plat
            devant), pour un rendu correct sous tous les angles. */}
        {labelTexture && (
          <mesh position={[0, labelCenterY, bottlePosZ]}>
            <cylinderGeometry
              args={[
                bottleGlassRadius + 0.004,
                bottleGlassRadius + 0.004,
                labelHeight,
                32,
                1,
                true,
                -labelThetaLength / 2,
                labelThetaLength,
              ]}
            />
            <meshStandardMaterial
              map={labelTexture}
              side={THREE.DoubleSide}
              roughness={0.85}
            />
          </mesh>
        )}

        {/* COUVERCLE ANIMÉ */}
        <group position={[-W / 2, 0, D / 2 - LD]} ref={lidRef}>
          <mesh position={[W / 2, 0, LD / 2]} castShadow>
            <boxGeometry args={[W, H, LD]} />
            <meshStandardMaterial {...woodMaterialProps} />
            {cales === 'Velours' && (
              <mesh position={[0, 0, -LD / 2 - 0.005]}>
                <boxGeometry args={[W - 0.02, H - 0.02, 0.01]} />
                <meshStandardMaterial color={resolvedVelvetColor} roughness={0.9} metalness={0.1} />
              </mesh>
            )}
            {isLatch && (
              <mesh position={[W / 2 + 0.012, 0, 0]}>
                <boxGeometry args={[0.025, 0.14, Math.min(0.06, LD * 0.8)]} />
                <meshStandardMaterial color="#b08b2d" metalness={0.8} roughness={0.2} />
              </mesh>
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
  const { t } = useTranslation(['univers', 'configurator']);
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { setIsDirty: setGlobalDirty, registerSaveHandler } = useUnsavedChanges();
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

  const [name, setName] = useState(initialConfiguration.name || '');
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
  // La valeur par défaut du squelette de config ('Charnière') ne correspond
  // à aucune des options réelles de vinsConfig.fermetures (qui sont des
  // libellés complets) : sans ce garde-fou, PricingEngine ne reconnaît pas
  // la valeur par défaut et facture 0€ de quincaillerie tant que le client
  // ne touche pas au menu déroulant.
  const [fermeture, setFermeture] = useState(
    vinsConfig.fermetures.includes(initialConfiguration.values.fermeture)
      ? initialConfiguration.values.fermeture
      : vinsConfig.fermetures[0]
  );
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
          taille,
          mesures,
          essence,
          finition,
          couleurLaque,
          cales,
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
          gravureFichierUrl,
          gravureFichierNom,
        },
        { name }
      ),
    [
      initialConfiguration, taille, mesures, essence, finition, couleurLaque, cales,
      couleurVelours, fermeture, gravureType, fontStyle, tailleTexte, tailleImage,
      posX, posY, quantite, isOpen, texteGravure, modeGravure, imageGravure,
      gravureFichierUrl, gravureFichierNom, name,
    ]
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

  // Suivi des modifications non enregistrées : on ne regarde pas seulement
  // `configuration` (qui n'embarque qu'un sous-ensemble des champs pour le
  // devis) mais bien tous les réglages éditables, pour que le bouton
  // "Enregistrer comme brouillon" et l'avertissement de navigation restent
  // fiables même sur des champs comme la fermeture ou la gravure.
  const [isDirty, setIsDirty] = useState(false);
  const [draftSaveState, setDraftSaveState] = useState('idle');
  const isFirstEditRef = useRef(true);
  useEffect(() => {
    if (isFirstEditRef.current) {
      isFirstEditRef.current = false;
      return;
    }
    setIsDirty(true);
  }, [
    name, taille, mesures, essence, finition, couleurLaque, cales, couleurVelours,
    fermeture, gravureType, fontStyle, tailleTexte, tailleImage, posX, posY,
    quantite, isOpen, texteGravure, modeGravure, imageGravure,
    gravureFichierUrl, gravureFichierNom,
  ]);

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
      const snapshot = buildConfigurationSnapshot(
        initialConfiguration,
        {
          taille, mesures, essence, finition, couleurLaque, cales, couleurVelours,
          fermeture, gravureType, fontStyle, tailleTexte, tailleImage, posX, posY,
          quantite, isOpen, texteGravure, modeGravure, imageGravure,
          gravureFichierUrl, gravureFichierNom,
        },
        { name: nameToUse }
      );
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
      // Réinitialise l'état global (et non le state local, qui ne
      // re-render plus une fois le composant démonté) pour que la page
      // suivante ne reste pas coincée avec un avertissement obsolète.
      setGlobalDirty(false);
      registerSaveHandler(null);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

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
      <ConfigurationPanel
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
        texteGravure={texteGravure}
        setTexteGravure={setTexteGravure}
        modeGravure={modeGravure}
        setModeGravure={setModeGravure}
        handleUploadImage={handleUploadImage}
        gravureUploadState={gravureUploadState}
        gravureFichierNom={gravureFichierNom}
        quote={quote}
        vinsConfig={vinsConfig}
        onOrder={handleOrder}
        orderPending={isOrdering}
        onSaveDraft={handleSaveDraft}
        draftSaveState={draftSaveState}
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
        cales={cales}
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
        setViewSize={setViewSize}
        setIsOpen={setIsOpen}
      />

      {showAddedModal && (
        <AddToCartModal onContinue={handleContinueConfiguring} onGoToCart={handleGoToCart} />
      )}
    </div>
  );
}

const styles = {
  pageContainer: {
    display: 'flex',
    justifyContent: 'center',
    height: `calc(100vh - ${HEADER_HEIGHT}px)`,
    width: '100%',
    background: 'linear-gradient(135deg, #050505 0%, #111 45%, #0d0d0d 100%)',
    color: '#f6f1e8',
    fontFamily: '"Optima", "Didot", "Helvetica Neue", sans-serif',
    overflow: 'hidden',
    boxSizing: 'border-box',
  },
  leftPanel: {
    width: 'min(60%, 900px)',
    minWidth: '320px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 28px 28px',
    overflowY: 'auto',
    background: 'linear-gradient(145deg, #0f0f0f 0%, #161616 100%)',
    borderRight: '1px solid rgba(212, 175, 55, 0.16)',
  },
  rightPanel3D: {
    width: 'min(40%, 600px)',
    minWidth: '320px',
    boxSizing: 'border-box',
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
  secondaryButton: {
    backgroundColor: 'transparent',
    color: '#d4af37',
    border: '1px solid rgba(212, 175, 55, 0.5)',
    padding: '14px 28px',
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
  viewSizeGroup: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    zIndex: 10,
    display: 'flex',
    gap: '8px',
  },
  viewSizeButton: {
    padding: '10px 16px',
    borderRadius: '999px',
    backgroundColor: 'rgba(10, 10, 10, 0.82)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    color: '#f7efe3',
    cursor: 'pointer',
    textTransform: 'capitalize',
    fontSize: '0.7rem',
    letterSpacing: '1px',
  },
  viewSizeButtonActive: {
    border: '1px solid #d4af37',
    background: 'rgba(212, 175, 55, 0.16)',
    color: '#d4af37',
  },
};
