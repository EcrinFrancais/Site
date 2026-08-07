import React, { useState, useMemo, useRef, useEffect, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { getSousType } from '../data/bijouxConfig';

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

// Mêmes teintes que le configurateur vin (nom -> hex), dupliquées ici pour ne
// pas dépendre du fichier vin.
const veloursColorHex = {
  Grenat: '#6e0f1f',
  Émeraude: '#0b6e4f',
  'Bleu royal': '#1e3a8a',
  Anthracite: '#2b2b2e',
  Ivoire: '#f1e9d2',
};

const fonts = {
  SansSerif: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5WZLCzYlKw.woff',
  Script: 'https://fonts.gstatic.com/s/greatvibes/v14/RWmMoKWR9v4ksMfaWd_JN9XliaO6.woff',
};

// Or plus saturé et plus brillant qu'un doré terne : couleur plus chaude,
// moins de metalness pure (qui assombrit sans environnement réfléchi) et une
// légère émissivité pour que les bijoux restent bien visibles quel que soit
// l'angle de vue.
const metalMaterialProps = {
  color: '#f5c542',
  metalness: 0.85,
  roughness: 0.1,
  emissive: '#6b4400',
  emissiveIntensity: 0.12,
};
const gemMaterialProps = {
  color: '#bfe3ff',
  roughness: 0.05,
  metalness: 0,
  transparent: true,
  opacity: 0.9,
  transmission: 0.55,
  clearcoat: 0.6,
};
// Vitre du couvercle "à fenêtre" : plus claire et plus transparente qu'une
// pierre, pour laisser deviner le bijou en dessous sans le déformer.
const glassPaneMaterialProps = {
  color: '#eef6ff',
  roughness: 0.04,
  metalness: 0,
  transparent: true,
  opacity: 0.4,
  transmission: 0.92,
  clearcoat: 1,
};

// Silhouette du coffret vue du dessus, centrée sur l'origine. `width` est
// l'étendue en X, `depth` l'étendue en Z. Les trois formes proposées sont
// combinables librement avec n'importe quelle famille de bijou.
function getFootprintShape(formeGenerale, width, depth) {
  const shape = new THREE.Shape();

  if (formeGenerale === 'rond') {
    shape.absellipse(0, 0, width / 2, depth / 2, 0, Math.PI * 2, false, 0);
    return shape;
  }

  if (formeGenerale === 'coeur') {
    const steps = 64;
    const rawPoints = [];
    for (let i = 0; i <= steps; i += 1) {
      const t = (i / steps) * Math.PI * 2;
      const x = 16 * Math.sin(t) ** 3;
      const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      rawPoints.push([x, y]);
    }
    const xs = rawPoints.map((p) => p[0]);
    const ys = rawPoints.map((p) => p[1]);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const scaleX = width / (maxX - minX);
    const scaleY = depth / (maxY - minY);
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    rawPoints.forEach(([x, y], i) => {
      const px = (x - centerX) * scaleX;
      // La pointe du cœur (minimum de y dans la formule) doit se retrouver à
      // l'avant du coffret (+z, côté charnière du couvercle) : on inverse le signe.
      const pz = -(y - centerY) * scaleY;
      if (i === 0) shape.moveTo(px, pz);
      else shape.lineTo(px, pz);
    });
    shape.closePath();
    return shape;
  }

  // rectangulaire (par défaut)
  const hw = width / 2;
  const hd = depth / 2;
  shape.moveTo(-hw, -hd);
  shape.lineTo(hw, -hd);
  shape.lineTo(hw, hd);
  shape.lineTo(-hw, hd);
  shape.closePath();
  return shape;
}

// Anneau (parois) : silhouette extérieure percée d'une silhouette intérieure
// (même forme, réduite) — approximation par mise à l'échelle uniforme plutôt
// qu'un vrai offset géométrique, largement suffisante pour un rendu stylisé.
function buildWallRingShape(formeGenerale, width, depth, wallThickness) {
  const outer = getFootprintShape(formeGenerale, width, depth);
  const inner = getFootprintShape(
    formeGenerale,
    Math.max(width - wallThickness * 2, 0.05),
    Math.max(depth - wallThickness * 2, 0.05)
  );
  outer.holes.push(new THREE.Path(inner.getPoints(64)));
  return outer;
}

// --- LE MOTEUR 3D : CRÉATION DE L'ÉCRIN BIJOUTERIE ---
export function CoffretBijou3D({
  famille,
  sousType,
  formeGenerale,
  essence,
  finition,
  couleurVelours,
  isOpen,
  gravureType,
  texteGravure,
  modeGravure,
  imageGravure,
  fontStyle,
  tailleTexte,
  tailleImage,
  posX,
  posY,
  viewSize,
  dims,
}) {
  const [woodTexture, setWoodTexture] = useState(null);
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

  const estLaque = finition === 'Laque';
  const estBrillant = finition === 'Vernis brillant' || estLaque;
  const textureAAppliquer = estLaque ? null : woodTexture;
  const baseColor = woodTexture ? woodTints[essence] || '#a67b5b' : '#a67b5b';

  const woodMaterialProps = {
    key: `${essence}-${textureAAppliquer ? textureAAppliquer.uuid : 'sans-texture'}`,
    map: textureAAppliquer,
    color: baseColor,
    roughness: estBrillant ? 0.12 : 0.78,
    metalness: estBrillant ? 0.12 : 0.02,
  };

  const resolvedVelvetColor = veloursColorHex[couleurVelours] || couleurVelours;

  const sousTypeInfo = getSousType(famille, sousType);
  const effectiveDims = dims || sousTypeInfo?.dims || { L: 9, l: 9, h: 6 };
  const W = effectiveDims.L / 10;
  const D = effectiveDims.l / 10;
  const H = effectiveDims.h / 10;
  const T = 0.035;

  const isDrawerCase = sousType === 'montre-tiroir';
  const isWindowCase = sousType === 'montre-fenetre';

  const outerFootprint = useMemo(
    () => getFootprintShape(formeGenerale, W, D),
    [formeGenerale, W, D]
  );
  const wallShape = useMemo(
    () => buildWallRingShape(formeGenerale, W, D, T),
    [formeGenerale, W, D]
  );
  const liningWallShape = useMemo(
    () => buildWallRingShape(formeGenerale, W - 2 * T, D - 2 * T, 0.02),
    [formeGenerale, W, D]
  );
  const liningFootprint = useMemo(
    () => getFootprintShape(formeGenerale, Math.max(W - 2 * T - 0.02, 0.05), Math.max(D - 2 * T - 0.02, 0.05)),
    [formeGenerale, W, D]
  );
  const lidFootprint = useMemo(
    () => getFootprintShape(formeGenerale, Math.max(W - 0.02, 0.05), Math.max(D - 0.02, 0.05)),
    [formeGenerale, W, D]
  );
  const frameThickness = Math.min(Math.max(Math.min(W, D) * 0.14, 0.06), 0.16);
  const lidFrameShape = useMemo(
    () => buildWallRingShape(formeGenerale, Math.max(W - 0.02, 0.05), Math.max(D - 0.02, 0.05), frameThickness),
    [formeGenerale, W, D, frameThickness]
  );
  const lidGlassFootprint = useMemo(
    () =>
      getFootprintShape(
        formeGenerale,
        Math.max(W - 0.02 - 2 * frameThickness, 0.05),
        Math.max(D - 0.02 - 2 * frameThickness, 0.05)
      ),
    [formeGenerale, W, D, frameThickness]
  );

  const wallHeight = H - T;
  const wallExtrude = useMemo(() => ({ depth: wallHeight, bevelEnabled: false, curveSegments: 32 }), [wallHeight]);
  const liningWallExtrude = useMemo(
    () => ({ depth: Math.max(wallHeight - 0.02, 0.01), bevelEnabled: false, curveSegments: 32 }),
    [wallHeight]
  );
  const floorExtrude = useMemo(() => ({ depth: T, bevelEnabled: false, curveSegments: 32 }), [T]);
  const liningFloorExtrude = useMemo(() => ({ depth: 0.01, bevelEnabled: false, curveSegments: 32 }), []);
  const lidExtrude = useMemo(() => ({ depth: T, bevelEnabled: false, curveSegments: 32 }), [T]);
  const glassExtrude = useMemo(
    () => ({ depth: Math.max(T * 0.5, 0.008), bevelEnabled: false, curveSegments: 32 }),
    [T]
  );

  const lidRef = useRef();
  useFrame(() => {
    if (lidRef.current) {
      const targetRotation = !isDrawerCase && isOpen ? -2.1 : 0;
      lidRef.current.rotation.x = THREE.MathUtils.lerp(lidRef.current.rotation.x, targetRotation, 0.08);
    }
  });

  const drawerRef = useRef();
  useFrame(() => {
    if (drawerRef.current) {
      const targetZ = isDrawerCase && isOpen ? D * 0.48 : 0;
      drawerRef.current.position.z = THREE.MathUtils.lerp(drawerRef.current.position.z, targetZ, 0.09);
    }
  });

  let colorGravure = '#3e2723';
  if (gravureType.toLowerCase().includes('dorure') || gravureType.toLowerCase().includes('or'))
    colorGravure = '#d4af37';
  if (gravureType.toLowerCase().includes('argent')) colorGravure = '#c0c0c0';

  const textPosX = (posX / 100) * W - W / 2;
  const textPosZ = (posY / 100) * D - D / 2;
  const actualFontSize = 0.09 * (tailleTexte / 100);
  const actualImageScale = 0.2 * (tailleImage / 100);
  const modelScale = { petit: 0.58, moyen: 0.72, grand: 0.86 }[viewSize] || 0.72;

  const cushionH = Math.max(H * 0.35, 0.06);

  const lidEngraving = (
    <>
      {/* Le mesh parent (couvercle) applique déjà une rotation de +90° sur X
          pour se coucher à plat (astuce d'extrusion partagée avec les parois/
          cales) : les coordonnées locales ici sont donc (x=largeur, y=ce qui
          deviendra la profondeur monde, z=léger décalage vertical), et il faut
          une rotation supplémentaire de 180° sur X pour que le texte regarde
          vers le haut une fois la rotation du parent appliquée. */}
      {gravureType !== 'Aucune' && modeGravure === 'texte' && texteGravure && (
        <Suspense fallback={null}>
          <Text
            font={fonts[fontStyle]}
            position={[textPosX, textPosZ, -0.002]}
            rotation={[Math.PI, 0, 0]}
            fontSize={actualFontSize}
            color={colorGravure}
            anchorX="center"
            anchorY="middle"
            maxWidth={W - 0.05}
            textAlign="center"
            material-side={THREE.DoubleSide}
            material-roughness={gravureType.includes('Laser') ? 0.9 : 0.2}
            material-metalness={gravureType.includes('Laser') ? 0.1 : 0.8}
          >
            {texteGravure}
          </Text>
        </Suspense>
      )}

      {gravureType !== 'Aucune' && modeGravure === 'image' && logoTexture && (
        <mesh position={[textPosX, textPosZ, -0.002]} rotation={[Math.PI, 0, 0]}>
          <planeGeometry args={[actualImageScale, actualImageScale]} />
          <meshStandardMaterial
            map={logoTexture}
            transparent={true}
            color={colorGravure}
            side={THREE.DoubleSide}
            roughness={gravureType.includes('Laser') ? 0.9 : 0.2}
            metalness={gravureType.includes('Laser') ? 0.1 : 0.8}
          />
        </mesh>
      )}
    </>
  );

  return (
    <group scale={[modelScale, modelScale, modelScale]} position={[0, -(H + T) / 2 + 0.15, 0]}>
      {/* FOND */}
      <mesh position={[0, T, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <extrudeGeometry args={[outerFootprint, floorExtrude]} />
        <meshStandardMaterial {...woodMaterialProps} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, T + 0.011, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <extrudeGeometry args={[liningFootprint, liningFloorExtrude]} />
        <meshStandardMaterial color={resolvedVelvetColor} roughness={0.9} metalness={0.05} side={THREE.DoubleSide} />
      </mesh>

      {/* PAROIS */}
      <mesh position={[0, H, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <extrudeGeometry args={[wallShape, wallExtrude]} />
        <meshStandardMaterial {...woodMaterialProps} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, H - 0.011, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <extrudeGeometry args={[liningWallShape, liningWallExtrude]} />
        <meshStandardMaterial color={resolvedVelvetColor} roughness={0.9} metalness={0.05} side={THREE.DoubleSide} />
      </mesh>

      {/* AMÉNAGEMENT + BIJOU */}
      <group position={[0, T, 0]}>
        {sousType === 'bague-coussinet' && (
          <>
            <mesh position={[0, cushionH / 2, 0]} castShadow receiveShadow>
              <boxGeometry args={[Math.min(W - 2 * T - 0.06, 0.5), cushionH, Math.min(D - 2 * T - 0.06, 0.5)]} />
              <meshStandardMaterial color={resolvedVelvetColor} roughness={0.9} metalness={0.05} />
            </mesh>
            <mesh position={[0, cushionH + 0.002, 0]}>
              <boxGeometry args={[0.32, 0.01, 0.03]} />
              <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
            </mesh>
            <mesh position={[0, cushionH + 0.06, 0]} rotation={[0.15, 0.3, 0]} castShadow>
              <torusGeometry args={[0.14, 0.02, 16, 32]} />
              <meshStandardMaterial {...metalMaterialProps} />
            </mesh>
            <mesh position={[0, cushionH + 0.17, 0.012]}>
              <octahedronGeometry args={[0.044, 0]} />
              <meshPhysicalMaterial {...gemMaterialProps} />
            </mesh>
          </>
        )}

        {sousType === 'boucles-fentes' && (
          <>
            <mesh position={[0, 0.01, 0]} castShadow receiveShadow>
              <boxGeometry args={[Math.min(W - 2 * T - 0.06, 0.7), 0.02, Math.min(D - 2 * T - 0.06, 0.7)]} />
              <meshStandardMaterial color={resolvedVelvetColor} roughness={0.9} metalness={0.05} />
            </mesh>
            {[-1, 1].map((side) => (
              <group key={side} position={[side * Math.min(W * 0.16, 0.14), 0.02, 0]}>
                <mesh position={[0, 0.02, 0]} castShadow>
                  <cylinderGeometry args={[0.009, 0.009, 0.04, 8]} />
                  <meshStandardMaterial {...metalMaterialProps} />
                </mesh>
                <mesh position={[0, 0.05, 0]} castShadow>
                  <sphereGeometry args={[0.034, 16, 16]} />
                  <meshStandardMaterial {...metalMaterialProps} />
                </mesh>
              </group>
            ))}
          </>
        )}

        {sousType === 'boucles-coussinet-crochets' && (
          <EarringHookCushionInsert W={W} D={D} T={T} resolvedVelvetColor={resolvedVelvetColor} />
        )}

        {sousType === 'boucles-plat-velours' && (
          <EarringFlatVelvetInsert W={W} D={D} T={T} resolvedVelvetColor={resolvedVelvetColor} />
        )}

        {sousType === 'collier-allonge' && (
          <NecklaceInsert W={W} T={T} resolvedVelvetColor={resolvedVelvetColor} />
        )}

        {sousType === 'collier-pendentif-seul' && (
          <PendantOnlyInsert W={W} D={D} T={T} resolvedVelvetColor={resolvedVelvetColor} />
        )}

        {sousType === 'bracelet-allonge' && (
          <>
            <mesh position={[0, 0.045, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
              <torusGeometry args={[Math.min(W, D) / 2 - T - 0.06, 0.032, 12, 32, Math.PI]} />
              <meshStandardMaterial color={resolvedVelvetColor} roughness={0.9} metalness={0.05} />
            </mesh>
            <mesh position={[0, 0.09, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <torusGeometry args={[Math.min(W, D) / 2 - T - 0.06, 0.018, 12, 32, Math.PI]} />
              <meshStandardMaterial {...metalMaterialProps} />
            </mesh>
          </>
        )}

        {sousType === 'bracelet-manchette' && (
          <CuffBraceletInsert W={W} D={D} H={H} T={T} resolvedVelvetColor={resolvedVelvetColor} />
        )}

        {sousType === 'montre-coussin' && (
          <>
            <mesh position={[0, cushionH / 2, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[Math.min(W, D) / 2 - T - 0.08, Math.min(W, D) / 2 - T - 0.08, cushionH, 32]} />
              <meshStandardMaterial color={resolvedVelvetColor} roughness={0.9} metalness={0.05} />
            </mesh>
            <mesh position={[0, cushionH * 0.5, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <torusGeometry args={[Math.min(W, D) / 2 - T - 0.08, 0.03, 12, 32, Math.PI * 1.6]} />
              <meshStandardMaterial {...metalMaterialProps} roughness={0.4} metalness={0.6} />
            </mesh>
            {/* sangle élastique qui maintient le bracelet contre le coussin */}
            <mesh position={[0, cushionH * 0.5, (Math.min(W, D) / 2 - T - 0.08) * 0.55]} castShadow>
              <boxGeometry args={[0.05, cushionH * 0.94, 0.012]} />
              <meshStandardMaterial color="#1a1a1a" roughness={0.85} />
            </mesh>
            <mesh position={[0, cushionH + 0.017, 0]} castShadow>
              <cylinderGeometry args={[0.085, 0.085, 0.032, 24]} />
              <meshStandardMaterial {...metalMaterialProps} />
            </mesh>
            <mesh position={[0, cushionH + 0.036, 0]}>
              <cylinderGeometry args={[0.072, 0.072, 0.004, 24]} />
              <meshStandardMaterial color="#f4f1ea" roughness={0.4} />
            </mesh>
          </>
        )}

        {sousType === 'montre-socle-rigide' && (
          <WatchStandInsert W={W} D={D} H={H} T={T} resolvedVelvetColor={resolvedVelvetColor} />
        )}

        {sousType === 'montre-fenetre' && (
          <>
            <mesh position={[0, cushionH / 2, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[Math.min(W, D) / 2 - T - 0.08, Math.min(W, D) / 2 - T - 0.08, cushionH, 32]} />
              <meshStandardMaterial color={resolvedVelvetColor} roughness={0.9} metalness={0.05} />
            </mesh>
            <mesh position={[0, cushionH * 0.5, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <torusGeometry args={[Math.min(W, D) / 2 - T - 0.08, 0.03, 12, 32, Math.PI * 1.6]} />
              <meshStandardMaterial {...metalMaterialProps} roughness={0.4} metalness={0.6} />
            </mesh>
            <mesh position={[0, cushionH + 0.017, 0]} castShadow>
              <cylinderGeometry args={[0.085, 0.085, 0.032, 24]} />
              <meshStandardMaterial {...metalMaterialProps} />
            </mesh>
            <mesh position={[0, cushionH + 0.036, 0]}>
              <cylinderGeometry args={[0.072, 0.072, 0.004, 24]} />
              <meshStandardMaterial color="#f4f1ea" roughness={0.4} />
            </mesh>
          </>
        )}

        {/* Le contenu de l'écrin "tiroir" vit dans le tiroir coulissant
            ci-dessous, pas dans cet aménagement fixe. */}

        {sousType === 'parure-multi' && (
          <>
            <mesh position={[0, 0.02, -D * 0.16]} castShadow receiveShadow>
              <boxGeometry args={[W - 2 * T - 0.08, 0.03, D * 0.28]} />
              <meshStandardMaterial color={resolvedVelvetColor} roughness={0.9} metalness={0.05} />
            </mesh>
            <mesh position={[0, 0.05, -D * 0.16]} castShadow>
              <torusGeometry args={[(W - 2 * T - 0.2) / 2, 0.009, 12, 32, Math.PI]} />
              <meshStandardMaterial {...metalMaterialProps} />
            </mesh>

            <mesh position={[0, cushionH * 0.6 + 0.02, D * 0.2]} castShadow receiveShadow>
              <boxGeometry args={[W - 2 * T - 0.1, cushionH * 0.6, D * 0.36]} />
              <meshStandardMaterial color={resolvedVelvetColor} roughness={0.85} metalness={0.05} />
            </mesh>
            <mesh
              position={[-W * 0.14, cushionH * 0.6 + 0.09, D * 0.2]}
              rotation={[0.15, 0.3, 0]}
              castShadow
            >
              <torusGeometry args={[0.06, 0.011, 12, 24]} />
              <meshStandardMaterial {...metalMaterialProps} />
            </mesh>
            {[-1, 1].map((side) => (
              <mesh key={side} position={[W * 0.1 + side * 0.06, cushionH * 0.6 + 0.07, D * 0.2]} castShadow>
                <sphereGeometry args={[0.02, 12, 12]} />
                <meshStandardMaterial {...metalMaterialProps} />
              </mesh>
            ))}
          </>
        )}
      </group>

      {isDrawerCase && (
        <group ref={drawerRef} position={[0, T, 0]}>
          <WatchDrawerContents W={W} D={D} T={T} resolvedVelvetColor={resolvedVelvetColor} />
        </group>
      )}

      {/* COUVERCLE : charnière arrière (sauf tiroir, dont le couvercle reste
          fixe puisque l'ouverture se fait par le tiroir coulissant) */}
      <group position={[0, H, -D / 2]} ref={lidRef}>
        {isWindowCase ? (
          <>
            <mesh position={[0, T, D / 2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <extrudeGeometry args={[lidFrameShape, lidExtrude]} />
              <meshStandardMaterial {...woodMaterialProps} side={THREE.DoubleSide} />
              {lidEngraving}
            </mesh>
            <mesh position={[0, T * 0.55, D / 2]} rotation={[Math.PI / 2, 0, 0]}>
              <extrudeGeometry args={[lidGlassFootprint, glassExtrude]} />
              <meshPhysicalMaterial {...glassPaneMaterialProps} side={THREE.DoubleSide} />
            </mesh>
          </>
        ) : (
          <mesh position={[0, T, D / 2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <extrudeGeometry args={[lidFootprint, lidExtrude]} />
            <meshStandardMaterial {...woodMaterialProps} side={THREE.DoubleSide} />
            {lidEngraving}
          </mesh>
        )}
        <mesh position={[0, -0.006, D / 2]} rotation={[Math.PI / 2, 0, 0]}>
          <extrudeGeometry args={[lidFootprint, liningFloorExtrude]} />
          <meshStandardMaterial color={resolvedVelvetColor} roughness={0.9} metalness={0.05} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}

// Insert "collier" isolé dans son propre composant pour pouvoir mémoïser la
// courbe de la chaîne proprement (elle dépend de la largeur du coffret).
function NecklaceInsert({ W, T, resolvedVelvetColor }) {
  const ridgeH = 0.06;
  const halfSpan = W / 2 - T - 0.1;

  const chainCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-halfSpan, ridgeH * 0.55, 0),
        new THREE.Vector3(-halfSpan * 0.5, ridgeH + 0.02, 0),
        new THREE.Vector3(0, ridgeH - 0.03, 0.015),
        new THREE.Vector3(halfSpan * 0.5, ridgeH + 0.02, 0),
        new THREE.Vector3(halfSpan, ridgeH * 0.55, 0),
      ]),
    [halfSpan]
  );

  return (
    <>
      <mesh position={[0, ridgeH / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[halfSpan * 2, ridgeH, 0.05]} />
        <meshStandardMaterial color={resolvedVelvetColor} roughness={0.9} metalness={0.05} />
      </mesh>
      <mesh castShadow>
        <tubeGeometry args={[chainCurve, 64, 0.009, 8, false]} />
        <meshStandardMaterial {...metalMaterialProps} />
      </mesh>
      <mesh position={[0, ridgeH - 0.055, 0.015]} castShadow>
        <octahedronGeometry args={[0.055, 0]} />
        <meshPhysicalMaterial {...gemMaterialProps} />
      </mesh>
    </>
  );
}

// Écrin à pendentif seul : la chaîne repose enroulée en spirale au fond de
// l'écrin, le pendentif est présenté debout sur une petite tige centrale.
function PendantOnlyInsert({ W, D, T, resolvedVelvetColor }) {
  const standH = 0.09;
  const spiralCurve = useMemo(() => {
    const pts = [];
    const turns = 2.4;
    const steps = 48;
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      const angle = t * Math.PI * 2 * turns;
      const r = 0.02 + t * Math.min(W, D) * 0.15;
      pts.push(new THREE.Vector3(Math.cos(angle) * r, 0.006, Math.sin(angle) * r));
    }
    return new THREE.CatmullRomCurve3(pts);
  }, [W, D]);

  return (
    <>
      <mesh position={[0, 0.01, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[Math.min(W, D) / 2 - T - 0.06, Math.min(W, D) / 2 - T - 0.06, 0.02, 32]} />
        <meshStandardMaterial color={resolvedVelvetColor} roughness={0.9} metalness={0.05} />
      </mesh>
      <mesh castShadow>
        <tubeGeometry args={[spiralCurve, 96, 0.007, 8, false]} />
        <meshStandardMaterial {...metalMaterialProps} />
      </mesh>
      <mesh position={[0, standH / 2, 0]} castShadow>
        <cylinderGeometry args={[0.004, 0.004, standH, 8]} />
        <meshStandardMaterial {...metalMaterialProps} />
      </mesh>
      <mesh position={[0, standH + 0.01, 0]} rotation={[0.1, 0.2, 0]} castShadow>
        <torusGeometry args={[0.024, 0.005, 12, 24]} />
        <meshStandardMaterial {...metalMaterialProps} />
      </mesh>
      <mesh position={[0, standH - 0.03, 0]} castShadow>
        <octahedronGeometry args={[0.045, 0]} />
        <meshPhysicalMaterial {...gemMaterialProps} />
      </mesh>
    </>
  );
}

// Boucles pendantes suspendues à des petits crochets métalliques sur une
// tige, pour qu'elles ne touchent jamais le coussin et ne se déforment pas.
function EarringHookCushionInsert({ W, D, T, resolvedVelvetColor }) {
  const ridgeH = 0.045;
  const postH = 0.11;
  const hookSpan = Math.min(W * 0.2, 0.17);

  return (
    <>
      <mesh position={[0, ridgeH / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[Math.min(W - 2 * T - 0.06, 0.7), ridgeH, Math.min(D - 2 * T - 0.06, 0.45)]} />
        <meshStandardMaterial color={resolvedVelvetColor} roughness={0.9} metalness={0.05} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * hookSpan, ridgeH, 0]}>
          <mesh position={[0, postH / 2, 0]} castShadow>
            <cylinderGeometry args={[0.005, 0.005, postH, 8]} />
            <meshStandardMaterial {...metalMaterialProps} />
          </mesh>
          <mesh position={[0, postH, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <torusGeometry args={[0.018, 0.004, 8, 16, Math.PI * 1.4]} />
            <meshStandardMaterial {...metalMaterialProps} />
          </mesh>
          <mesh position={[0, postH - 0.028, 0]} castShadow>
            <torusGeometry args={[0.022, 0.006, 12, 24]} />
            <meshStandardMaterial {...metalMaterialProps} />
          </mesh>
          <mesh position={[0, postH - 0.062, 0]} castShadow>
            <octahedronGeometry args={[0.03, 0]} />
            <meshPhysicalMaterial {...gemMaterialProps} />
          </mesh>
        </group>
      ))}
    </>
  );
}

// Support plat simple : puces ou clips posés à plat, sans tige verticale.
function EarringFlatVelvetInsert({ W, D, T, resolvedVelvetColor }) {
  const discR = 0.045;
  return (
    <>
      <mesh position={[0, 0.008, 0]} castShadow receiveShadow>
        <boxGeometry args={[Math.min(W - 2 * T - 0.06, 0.75), 0.016, Math.min(D - 2 * T - 0.06, 0.55)]} />
        <meshStandardMaterial color={resolvedVelvetColor} roughness={0.9} metalness={0.05} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * Math.min(W * 0.16, 0.15), 0.017, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[discR, discR, 0.01, 32]} />
            <meshStandardMaterial {...metalMaterialProps} />
          </mesh>
          <mesh position={[0, 0, 0.008]}>
            <cylinderGeometry args={[discR * 0.55, discR * 0.55, 0.004, 32]} />
            <meshPhysicalMaterial {...gemMaterialProps} />
          </mesh>
        </group>
      ))}
    </>
  );
}

// Manchette rigide : l'anneau ouvert reste debout, enroulé autour d'un socle
// capitonné, pour conserver sa forme (contrairement au bracelet souple posé
// à plat de l'écrin allongé horizontal).
function CuffBraceletInsert({ W, D, H, T, resolvedVelvetColor }) {
  const cuffR = Math.min(W, D) / 2 - T - 0.09;
  const standH = Math.max(H * 0.4, 0.09);
  return (
    <>
      <mesh position={[0, 0.012, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[cuffR + 0.05, cuffR + 0.06, 0.024, 32]} />
        <meshStandardMaterial color={resolvedVelvetColor} roughness={0.9} metalness={0.05} />
      </mesh>
      <mesh position={[0, standH / 2 + 0.02, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.036, standH, 24]} />
        <meshStandardMaterial color={resolvedVelvetColor} roughness={0.85} metalness={0.05} />
      </mesh>
      <mesh position={[0, standH + 0.02, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[cuffR, 0.026, 16, 40, Math.PI * 1.75]} />
        <meshStandardMaterial {...metalMaterialProps} />
      </mesh>
    </>
  );
}

// Socle rigide (montre) : la montre s'enroule debout autour d'un pied
// capitonné massif, à la différence du coussin fixe posé à plat.
function WatchStandInsert({ W, D, H, T, resolvedVelvetColor }) {
  const standR = Math.min(W, D) * 0.09;
  const standH = Math.max(H * 0.55, 0.13);
  const bandR = Math.min(W, D) / 2 - T - 0.1;
  return (
    <>
      <mesh position={[0, 0.01, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[Math.min(W, D) / 2 - T - 0.07, Math.min(W, D) / 2 - T - 0.07, 0.02, 32]} />
        <meshStandardMaterial color={resolvedVelvetColor} roughness={0.9} metalness={0.05} />
      </mesh>
      <mesh position={[0, standH / 2 + 0.02, 0]} castShadow>
        <cylinderGeometry args={[standR, standR * 1.15, standH, 24]} />
        <meshStandardMaterial color={resolvedVelvetColor} roughness={0.85} metalness={0.05} />
      </mesh>
      <mesh position={[0, standH * 0.62, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[bandR * 0.55, 0.024, 14, 32, Math.PI * 1.7]} />
        <meshStandardMaterial {...metalMaterialProps} roughness={0.35} metalness={0.65} />
      </mesh>
      <mesh position={[0, standH + 0.02, 0]} castShadow>
        <cylinderGeometry args={[0.075, 0.075, 0.03, 32]} />
        <meshStandardMaterial {...metalMaterialProps} />
      </mesh>
      <mesh position={[0, standH + 0.038, 0]}>
        <cylinderGeometry args={[0.062, 0.062, 0.004, 32]} />
        <meshStandardMaterial color="#f4f1ea" roughness={0.35} />
      </mesh>
    </>
  );
}

// Contenu du tiroir capitonné qui glisse hors de l'écrin "coulissant" — la
// montre repose sur un petit coussin bas, façade dorée visible côté avant.
function WatchDrawerContents({ W, D, T, resolvedVelvetColor }) {
  const trayW = Math.max(W - 2 * T - 0.12, 0.2);
  const trayD = Math.max(D * 0.62, 0.16);
  const trayWallH = 0.045;
  const cushionH = 0.05;
  const bandR = Math.max(Math.min(trayW, trayD) / 2 - 0.05, 0.05);
  return (
    <group>
      <mesh position={[0, trayWallH / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[trayW, trayWallH, trayD]} />
        <meshStandardMaterial color={resolvedVelvetColor} roughness={0.9} metalness={0.05} />
      </mesh>
      <mesh position={[0, trayWallH + cushionH / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[bandR - 0.02, bandR - 0.02, cushionH, 32]} />
        <meshStandardMaterial color={resolvedVelvetColor} roughness={0.88} metalness={0.05} />
      </mesh>
      <mesh position={[0, trayWallH + cushionH * 0.55, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[bandR, 0.02, 12, 32, Math.PI * 1.6]} />
        <meshStandardMaterial {...metalMaterialProps} roughness={0.35} metalness={0.65} />
      </mesh>
      <mesh position={[0, trayWallH + cushionH + 0.014, 0]} castShadow>
        <cylinderGeometry args={[0.065, 0.065, 0.026, 24]} />
        <meshStandardMaterial {...metalMaterialProps} />
      </mesh>
      <mesh position={[0, trayWallH + cushionH + 0.03, 0]}>
        <cylinderGeometry args={[0.054, 0.054, 0.003, 24]} />
        <meshStandardMaterial color="#f4f1ea" roughness={0.4} />
      </mesh>
      {/* façade dorée du tiroir, visible de face une fois le tiroir refermé */}
      <mesh position={[0, trayWallH * 1.5, trayD / 2 + 0.006]} castShadow>
        <boxGeometry args={[trayW * 0.9, trayWallH * 1.6, 0.012]} />
        <meshStandardMaterial {...metalMaterialProps} roughness={0.3} />
      </mesh>
    </group>
  );
}
