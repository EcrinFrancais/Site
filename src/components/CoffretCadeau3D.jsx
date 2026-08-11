import React, { useState, useEffect, useRef, Suspense } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { getTailleById } from '../data/coffretCadeauConfig';

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

// Note : "Serif" n'a pas d'entrée dédiée — le Text de troika retombe sur sa
// police par défaut (déjà de style serif) tant qu'aucune webfont "classique"
// compatible (.ttf/.otf/.woff) n'a été choisie.
const fonts = {
  SansSerif:
    'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5WZLCzYlKw.woff',
  Script:
    'https://fonts.gstatic.com/s/greatvibes/v14/RWmMoKWR9v4ksMfaWd_JN9XliaO6.woff',
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

// Les teintes de velours sont choisies par nom (voir coffretCadeauConfig.veloursColors) ;
// Three.js ne comprend pas ces libellés français, il faut les convertir en hex.
const veloursColorHex = {
  Grenat: '#6e0f1f',
  Émeraude: '#0b6e4f',
  'Bleu royal': '#1e3a8a',
  Anthracite: '#2b2b2e',
  Ivoire: '#f1e9d2',
};

// --- LE MOTEUR 3D : COFFRET CADEAU NEUTRE (sans cavité imposée) ---
export function CoffretCadeau3D({
  taille,
  mesures,
  essence,
  finition,
  couleurLaque,
  doublure,
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

  const preset = getTailleById(taille);
  let L = preset.dims.L;
  let l = preset.dims.l;
  let h = preset.dims.h;
  if (taille === 'sur_mesure') {
    L = mesures?.L ? Number(mesures.L) : preset.dims.L;
    l = mesures?.l ? Number(mesures.l) : preset.dims.l;
    h = mesures?.h ? Number(mesures.h) : preset.dims.h;
  }

  const [W, H, D] = [L / 10, h / 10, l / 10];
  const T = 0.05;
  const LD = D * 0.1;
  const BD = D * 0.9;

  const estLaque = finition === 'Laque';
  const estBrillant = finition === 'Vernis brillant' || estLaque;
  const textureAAppliquer = estLaque ? null : woodTexture;
  const baseColor = estLaque
    ? couleurLaque
    : woodTexture
    ? woodTints[essence] || '#a67b5b'
    : '#a67b5b';

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
  // Course d'ouverture verticale suffisante pour dégager le contenu.
  const slideOpenDistance = H + 0.15;
  // Le tiroir repose 5 mm sous le bord du coffret (au repos).
  const drawerRecess = 0.05;

  useFrame(() => {
    if (lidRef.current) {
      if (isSlidingTop) {
        lidRef.current.position.y = THREE.MathUtils.lerp(
          lidRef.current.position.y,
          isOpen ? slideOpenDistance : 0,
          0.08
        );
        lidRef.current.position.x = THREE.MathUtils.lerp(lidRef.current.position.x, -W / 2, 0.08);
        lidRef.current.position.z = THREE.MathUtils.lerp(lidRef.current.position.z, D / 2 - LD, 0.08);
        lidRef.current.rotation.y = 0;
      } else if (isSlidingDrawer) {
        lidRef.current.position.y = THREE.MathUtils.lerp(
          lidRef.current.position.y,
          isOpen ? slideOpenDistance : 0,
          0.08
        );
        lidRef.current.position.x = THREE.MathUtils.lerp(lidRef.current.position.x, -W / 2, 0.08);
        lidRef.current.position.z = THREE.MathUtils.lerp(
          lidRef.current.position.z,
          D / 2 - LD - drawerRecess,
          0.08
        );
        lidRef.current.rotation.y = 0;
      } else if (isEmboitement) {
        lidRef.current.position.x = THREE.MathUtils.lerp(
          lidRef.current.position.x,
          isOpen ? W / 2 + 0.2 : -W / 2,
          0.08
        );
        lidRef.current.position.y = THREE.MathUtils.lerp(lidRef.current.position.y, 0, 0.08);
        lidRef.current.position.z = THREE.MathUtils.lerp(lidRef.current.position.z, D / 2 - LD, 0.08);
        lidRef.current.rotation.y = 0;
      } else {
        // Ouverture "porte d'armoire" : la charnière reste fixe sur le bord
        // du coffret (le pivot de la porte), seule la rotation anime.
        const targetRotation = isOpen ? -Math.PI / 2 : 0;
        lidRef.current.rotation.y = THREE.MathUtils.lerp(lidRef.current.rotation.y, targetRotation, 0.08);
        lidRef.current.position.x = THREE.MathUtils.lerp(lidRef.current.position.x, -W / 2, 0.08);
        lidRef.current.position.y = THREE.MathUtils.lerp(lidRef.current.position.y, 0, 0.08);
        lidRef.current.position.z = THREE.MathUtils.lerp(lidRef.current.position.z, D / 2 - LD, 0.08);
      }
    }
  });

  const innerHeight = H - 2 * T;

  let colorGravure = '#3e2723';
  if (gravureType.toLowerCase().includes('dorure') || gravureType.toLowerCase().includes('or'))
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

        {doublure === 'Velours' && (
          <>
            {/* Doublure de velours sur l'ensemble des faces intérieures du
                coffret (fond, côtés, dessus, dessous). */}
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

        {/* COUVERCLE ANIMÉ */}
        <group position={[-W / 2, 0, D / 2 - LD]} ref={lidRef}>
          <mesh position={[W / 2, 0, LD / 2]} castShadow>
            <boxGeometry args={[W, H, LD]} />
            <meshStandardMaterial {...woodMaterialProps} />
            {doublure === 'Velours' && (
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
            {gravureType !== 'Aucune' && modeGravure === 'texte' && texteGravure && (
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
                  material-roughness={gravureType.includes('Laser') ? 0.9 : 0.2}
                  material-metalness={gravureType.includes('Laser') ? 0.1 : 0.8}
                >
                  {texteGravure}
                </Text>
              </Suspense>
            )}

            {/* L'IMAGE 3D */}
            {gravureType !== 'Aucune' && modeGravure === 'image' && logoTexture && (
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
