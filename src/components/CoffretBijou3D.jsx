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

const metalMaterialProps = { color: '#d9b45c', metalness: 0.9, roughness: 0.18 };
const gemMaterialProps = {
  color: '#bfe3ff',
  roughness: 0.05,
  metalness: 0,
  transparent: true,
  opacity: 0.9,
  transmission: 0.55,
  clearcoat: 0.6,
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
  const dims = sousTypeInfo?.dims || { L: 9, l: 9, h: 6 };
  const W = dims.L / 10;
  const D = dims.l / 10;
  const H = dims.h / 10;
  const T = 0.035;

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

  const wallHeight = H - T;
  const wallExtrude = useMemo(() => ({ depth: wallHeight, bevelEnabled: false, curveSegments: 32 }), [wallHeight]);
  const liningWallExtrude = useMemo(
    () => ({ depth: Math.max(wallHeight - 0.02, 0.01), bevelEnabled: false, curveSegments: 32 }),
    [wallHeight]
  );
  const floorExtrude = useMemo(() => ({ depth: T, bevelEnabled: false, curveSegments: 32 }), [T]);
  const liningFloorExtrude = useMemo(() => ({ depth: 0.01, bevelEnabled: false, curveSegments: 32 }), []);
  const lidExtrude = useMemo(() => ({ depth: T, bevelEnabled: false, curveSegments: 32 }), [T]);

  const lidRef = useRef();
  useFrame(() => {
    if (lidRef.current) {
      const targetRotation = isOpen ? -2.1 : 0;
      lidRef.current.rotation.x = THREE.MathUtils.lerp(lidRef.current.rotation.x, targetRotation, 0.08);
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
        {famille === 'bague' && (
          <>
            <mesh position={[0, cushionH / 2, 0]} castShadow receiveShadow>
              <boxGeometry args={[Math.min(W - 2 * T - 0.06, 0.5), cushionH, Math.min(D - 2 * T - 0.06, 0.5)]} />
              <meshStandardMaterial color={resolvedVelvetColor} roughness={0.9} metalness={0.05} />
            </mesh>
            <mesh position={[0, cushionH + 0.002, 0]}>
              <boxGeometry args={[0.32, 0.01, 0.03]} />
              <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
            </mesh>
            <mesh position={[0, cushionH + 0.045, 0]} rotation={[0.15, 0.3, 0]} castShadow>
              <torusGeometry args={[0.09, 0.012, 16, 32]} />
              <meshStandardMaterial {...metalMaterialProps} />
            </mesh>
            <mesh position={[0, cushionH + 0.13, 0.01]}>
              <octahedronGeometry args={[0.026, 0]} />
              <meshPhysicalMaterial {...gemMaterialProps} />
            </mesh>
          </>
        )}

        {famille === 'boucles' && (
          <>
            <mesh position={[0, 0.01, 0]} castShadow receiveShadow>
              <boxGeometry args={[Math.min(W - 2 * T - 0.06, 0.7), 0.02, Math.min(D - 2 * T - 0.06, 0.7)]} />
              <meshStandardMaterial color={resolvedVelvetColor} roughness={0.9} metalness={0.05} />
            </mesh>
            {[-1, 1].map((side) => (
              <group key={side} position={[side * Math.min(W * 0.16, 0.14), 0.02, 0]}>
                <mesh position={[0, 0.015, 0]} castShadow>
                  <cylinderGeometry args={[0.006, 0.006, 0.03, 8]} />
                  <meshStandardMaterial {...metalMaterialProps} />
                </mesh>
                <mesh position={[0, 0.035, 0]} castShadow>
                  <sphereGeometry args={[0.02, 16, 16]} />
                  <meshStandardMaterial {...metalMaterialProps} />
                </mesh>
              </group>
            ))}
          </>
        )}

        {famille === 'collier' && (
          <NecklaceInsert W={W} T={T} resolvedVelvetColor={resolvedVelvetColor} />
        )}

        {famille === 'bracelet' && (
          <>
            <mesh position={[0, 0.045, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
              <torusGeometry args={[Math.min(W, D) / 2 - T - 0.06, 0.032, 12, 32, Math.PI]} />
              <meshStandardMaterial color={resolvedVelvetColor} roughness={0.9} metalness={0.05} />
            </mesh>
            <mesh position={[0, 0.085, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <torusGeometry args={[Math.min(W, D) / 2 - T - 0.06, 0.011, 12, 32, Math.PI]} />
              <meshStandardMaterial {...metalMaterialProps} />
            </mesh>
          </>
        )}

        {famille === 'montre' && (
          <>
            <mesh position={[0, cushionH / 2, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[Math.min(W, D) / 2 - T - 0.08, Math.min(W, D) / 2 - T - 0.08, cushionH, 32]} />
              <meshStandardMaterial color={resolvedVelvetColor} roughness={0.9} metalness={0.05} />
            </mesh>
            <mesh position={[0, cushionH * 0.5, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <torusGeometry args={[Math.min(W, D) / 2 - T - 0.08, 0.02, 12, 32, Math.PI * 1.6]} />
              <meshStandardMaterial {...metalMaterialProps} roughness={0.5} metalness={0.3} />
            </mesh>
            <mesh position={[0, cushionH + 0.014, 0]} castShadow>
              <cylinderGeometry args={[0.06, 0.06, 0.025, 24]} />
              <meshStandardMaterial {...metalMaterialProps} />
            </mesh>
            <mesh position={[0, cushionH + 0.028, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.003, 24]} />
              <meshStandardMaterial color="#f4f1ea" roughness={0.4} />
            </mesh>
          </>
        )}

        {famille === 'parure' && (
          <>
            <mesh position={[0, 0.02, -D * 0.16]} castShadow receiveShadow>
              <boxGeometry args={[W - 2 * T - 0.08, 0.03, D * 0.28]} />
              <meshStandardMaterial color={resolvedVelvetColor} roughness={0.9} metalness={0.05} />
            </mesh>
            <mesh position={[0, 0.05, -D * 0.16]} castShadow>
              <torusGeometry args={[(W - 2 * T - 0.2) / 2, 0.006, 12, 32, Math.PI]} />
              <meshStandardMaterial {...metalMaterialProps} />
            </mesh>

            <mesh position={[0, cushionH * 0.6 + 0.02, D * 0.2]} castShadow receiveShadow>
              <boxGeometry args={[W - 2 * T - 0.1, cushionH * 0.6, D * 0.36]} />
              <meshStandardMaterial color={resolvedVelvetColor} roughness={0.85} metalness={0.05} />
            </mesh>
            <mesh
              position={[-W * 0.14, cushionH * 0.6 + 0.08, D * 0.2]}
              rotation={[0.15, 0.3, 0]}
              castShadow
            >
              <torusGeometry args={[0.045, 0.007, 12, 24]} />
              <meshStandardMaterial {...metalMaterialProps} />
            </mesh>
            {[-1, 1].map((side) => (
              <mesh key={side} position={[W * 0.1 + side * 0.045, cushionH * 0.6 + 0.06, D * 0.2]} castShadow>
                <sphereGeometry args={[0.013, 12, 12]} />
                <meshStandardMaterial {...metalMaterialProps} />
              </mesh>
            ))}
          </>
        )}
      </group>

      {/* COUVERCLE ANIMÉ : charnière arrière, s'ouvre comme un coffre */}
      <group position={[0, H, -D / 2]} ref={lidRef}>
        <mesh position={[0, T, D / 2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <extrudeGeometry args={[lidFootprint, lidExtrude]} />
          <meshStandardMaterial {...woodMaterialProps} side={THREE.DoubleSide} />

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
        </mesh>
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
        <tubeGeometry args={[chainCurve, 64, 0.006, 8, false]} />
        <meshStandardMaterial {...metalMaterialProps} />
      </mesh>
      <mesh position={[0, ridgeH - 0.055, 0.015]} castShadow>
        <octahedronGeometry args={[0.035, 0]} />
        <meshPhysicalMaterial {...gemMaterialProps} />
      </mesh>
    </>
  );
}
