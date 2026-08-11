import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

import textureChene from '../textures/chene.jpg';
import textureEbene from '../textures/ebene.jpg';
import textureNoyer from '../textures/noyer.jpg';
import texturePin from '../textures/pin.jpg';
import texturePalissandre from '../textures/palissandre.jpg';
import textureMerisier from '../textures/merisier.jpg';
import { cercueilConfig } from '../data/cercueilConfig';

// --- Univers "blague" isolé : voir CercueilConfiguratorPage pour le contexte. ---
// Aucun autre composant/logique du site ne dépend de ce fichier.

const texturesBois = {
  Chêne: textureChene,
  Ébène: textureEbene,
  Noyer: textureNoyer,
  Pin: texturePin,
  Palissandre: texturePalissandre,
  Merisier: textureMerisier,
};

const woodTints = {
  Chêne: '#8b5c3a',
  Ébène: '#2a201b',
  Noyer: '#6e3f29',
  Pin: '#b9864f',
  Palissandre: '#4b2722',
  Merisier: '#9b4f36',
};

// --- Géométrie du cercueil : silhouette hexagonale (large aux "épaules",
// plus étroite aux deux extrémités), construite une seule fois via
// ExtrudeGeometry. Les dimensions sont fixes (pas de "sur mesure").
const HW = 1.3; // demi-largeur max (épaules)
const EW = 0.46; // demi-largeur aux extrémités
const HD = 2.7; // demi-longueur
const BULGE_Z = 0.9; // distance au centre des arêtes d'épaule
const T = 0.06; // épaisseur parois / fond
const LID_T = 0.07; // épaisseur du couvercle
const WALL_H = 1.35; // hauteur des parois

function buildHexPath(PathClass, hw, ew, hd, bulgeZ) {
  const p = new PathClass();
  p.moveTo(-ew, hd);
  p.lineTo(ew, hd);
  p.lineTo(hw, bulgeZ);
  p.lineTo(hw, -bulgeZ);
  p.lineTo(ew, -hd);
  p.lineTo(-ew, -hd);
  p.lineTo(-hw, -bulgeZ);
  p.lineTo(-hw, bulgeZ);
  p.closePath();
  return p;
}

const innerScale = (HD - T) / HD;
const outerShapeSolid = buildHexPath(THREE.Shape, HW, EW, HD, BULGE_Z);
const lidShape = buildHexPath(THREE.Shape, HW * 1.02, EW * 1.02, HD * 1.02, BULGE_Z * 1.02);
const ringShape = buildHexPath(THREE.Shape, HW, EW, HD, BULGE_Z);
ringShape.holes.push(
  buildHexPath(THREE.Path, HW - T, Math.max(EW - T, 0.08), HD - T, BULGE_Z * innerScale)
);

const floorGeometry = new THREE.ExtrudeGeometry(outerShapeSolid, { depth: T, bevelEnabled: false });
const wallsGeometry = new THREE.ExtrudeGeometry(ringShape, { depth: WALL_H, bevelEnabled: false });
const lidGeometry = new THREE.ExtrudeGeometry(lidShape, { depth: LID_T, bevelEnabled: false });

function createSmileyTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffd43b';
  ctx.beginPath();
  ctx.arc(256, 256, 230, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#c98a00';
  ctx.stroke();

  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 18;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(175, 210, 46, Math.PI * 1.1, Math.PI * 1.9);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(337, 210, 46, Math.PI * 1.1, Math.PI * 1.9);
  ctx.stroke();

  ctx.fillStyle = 'rgba(255,110,110,0.5)';
  ctx.beginPath();
  ctx.ellipse(120, 300, 34, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(392, 300, 34, 20, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.moveTo(150, 300);
  ctx.quadraticCurveTo(256, 330, 362, 300);
  ctx.quadraticCurveTo(345, 430, 256, 440);
  ctx.quadraticCurveTo(167, 430, 150, 300);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(165, 305);
  ctx.quadraticCurveTo(256, 328, 347, 305);
  ctx.quadraticCurveTo(256, 340, 165, 305);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#c23b4f';
  ctx.beginPath();
  ctx.ellipse(256, 405, 62, 32, 0, 0, Math.PI);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function Cercueil3D({ essence, finition, couleurLaque, doublure, couleurSatin, fermeture, isOpen, viewSize }) {
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
    loader.load(imagePath, (texture) => {
      texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;
      setWoodTexture(texture);
    });
  }, [essence]);

  const smileyTexture = useMemo(() => createSmileyTexture(), []);

  const estLaque = finition === 'Laque';
  const estBrillant = finition === 'Vernis brillant' || estLaque;
  const laqueHex = cercueilConfig.laqueColorHex[couleurLaque] || '#0a0a0a';
  const baseColor = estLaque ? laqueHex : woodTexture ? woodTints[essence] || '#a67b5b' : '#a67b5b';
  const woodMaterialProps = {
    key: `${essence}-${estLaque ? 'laque' : woodTexture ? woodTexture.uuid : 'sans-texture'}`,
    map: estLaque ? null : woodTexture,
    color: baseColor,
    roughness: estBrillant ? 0.14 : 0.8,
    metalness: estBrillant ? 0.1 : 0.02,
  };

  const satinHex = cercueilConfig.satinColorHex[couleurSatin] || '#7a0d1c';

  const lidRef = useRef();
  const targetAngle = isOpen ? 1.55 : 0; // ~89°, façon coffre au trésor
  useFrame(() => {
    if (lidRef.current) {
      lidRef.current.rotation.z = THREE.MathUtils.lerp(lidRef.current.rotation.z, targetAngle, 0.07);
    }
  });

  const modelScale = { petit: 0.62, moyen: 0.76, grand: 0.9 }[viewSize] || 0.76;

  const showGoldHandles = fermeture === 'Poignées dorées';
  const showSilverHandles = fermeture === 'Poignées argentées';
  const showCross = fermeture === 'Croix gravée';
  const handleColor = showSilverHandles ? '#c7c7c7' : '#d4af37';

  return (
    <group
      scale={[modelScale, modelScale, modelScale]}
      position={[0, -WALL_H / 2 + 0.35, 0]}
      rotation={[0, Math.PI / 2, 0]}
    >
      <group rotation={[-Math.PI / 2, 0, 0]}>
        <mesh geometry={wallsGeometry} castShadow receiveShadow>
          <meshStandardMaterial {...woodMaterialProps} />
        </mesh>
        <mesh geometry={floorGeometry} receiveShadow>
          <meshStandardMaterial {...woodMaterialProps} />
        </mesh>

        {doublure === 'Satin' && (
          <mesh position={[0, 0, T + 0.006]}>
            <planeGeometry args={[(HW - T) * 1.7, (HD - T) * 1.85]} />
            <meshStandardMaterial color={satinHex} roughness={0.35} metalness={0.15} side={THREE.DoubleSide} />
          </mesh>
        )}
        {doublure === 'Satin' && (
          <mesh position={[0, HD * 0.62, T + 0.1]}>
            <boxGeometry args={[HW * 1.15, 0.5, 0.2]} />
            <meshStandardMaterial color={satinHex} roughness={0.5} metalness={0.05} />
          </mesh>
        )}

        {/* Le clou du spectacle : un grand smiley hilare au fond du cercueil. */}
        <mesh position={[0, -HD * 0.05, T + (doublure === 'Satin' ? 0.02 : 0.012)]}>
          <planeGeometry args={[1.9, 1.9]} />
          <meshStandardMaterial
            map={smileyTexture}
            emissive="#ffffff"
            emissiveMap={smileyTexture}
            emissiveIntensity={1.1}
            roughness={0.6}
            toneMapped={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      <group ref={lidRef} position={[-HW, WALL_H, 0]}>
        <group rotation={[-Math.PI / 2, 0, 0]}>
          <mesh geometry={lidGeometry} position={[HW, 0, 0]} castShadow>
            <meshStandardMaterial {...woodMaterialProps} />
          </mesh>

          {showCross && (
            <group position={[HW, 0, LID_T + 0.005]}>
              <mesh>
                <boxGeometry args={[0.1, 0.9, 0.03]} />
                <meshStandardMaterial color="#d4af37" metalness={0.7} roughness={0.25} />
              </mesh>
              <mesh position={[0, 0.2, 0]}>
                <boxGeometry args={[0.55, 0.1, 0.03]} />
                <meshStandardMaterial color="#d4af37" metalness={0.7} roughness={0.25} />
              </mesh>
            </group>
          )}

          {(showGoldHandles || showSilverHandles) && (
            <>
              {[HD * 0.55, -HD * 0.55].map((zPos) => (
                <group key={zPos} position={[HW - 0.1, zPos, LID_T + 0.02]}>
                  <mesh rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.05, 0.05, 0.4, 12]} />
                    <meshStandardMaterial color={handleColor} metalness={0.85} roughness={0.2} />
                  </mesh>
                </group>
              ))}
            </>
          )}
        </group>
      </group>
    </group>
  );
}
