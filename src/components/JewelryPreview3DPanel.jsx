import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import { useTranslation } from 'react-i18next';
import { CoffretBijou3D } from './CoffretBijou3D';

export default function JewelryPreview3DPanel({
  styles,
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
  setIsOpen,
}) {
  const { t } = useTranslation('configurator');
  return (
    <div style={styles.rightPanel3D}>
      <button onClick={() => setIsOpen(!isOpen)} style={styles.openButton}>
        {isOpen ? t('closeBox') : t('openBox')}
      </button>

      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          cursor: 'grab',
        }}
      >
        <Canvas shadows camera={{ position: [0, 1.4, 7.2], fov: 42 }}>
          <ambientLight intensity={0.8} />
          <directionalLight
            position={[5, 5, 5]}
            intensity={1.2}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <pointLight position={[0, 2, 3]} intensity={0.5} />
          <Suspense
            fallback={
              <group>
                <mesh>
                  <boxGeometry args={[1, 0.6, 1]} />
                  <meshStandardMaterial color="#a67b5b" />
                </mesh>
              </group>
            }
          >
            <CoffretBijou3D
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
            />
            <ContactShadows
              position={[0, -2, 0]}
              opacity={0.5}
              scale={15}
              blur={2.5}
              far={4}
            />
          </Suspense>
          <OrbitControls
            makeDefault
            minPolarAngle={0}
            maxPolarAngle={Math.PI / 2 + 0.1}
          />
        </Canvas>
      </div>
    </div>
  );
}
