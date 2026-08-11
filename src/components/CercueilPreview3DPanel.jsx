import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import { Cercueil3D } from './Cercueil3D';

export default function CercueilPreview3DPanel({
  styles,
  essence,
  finition,
  couleurLaque,
  doublure,
  couleurSatin,
  fermeture,
  isOpen,
  viewSize,
  setViewSize,
  setIsOpen,
}) {
  return (
    <div style={styles.rightPanel3D}>
      <div style={styles.viewSizeGroup}>
        {['petit', 'moyen', 'grand'].map((value) => (
          <button
            key={value}
            onClick={() => setViewSize(value)}
            style={{
              ...styles.viewSizeButton,
              ...(viewSize === value ? styles.viewSizeButtonActive : null),
            }}
          >
            {value}
          </button>
        ))}
      </div>
      <button onClick={() => setIsOpen(!isOpen)} style={styles.openButton}>
        {isOpen ? 'Refermer' : 'Ouvrir'}
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
        <Canvas shadows camera={{ position: [6.8, 7.4, -4.7], fov: 40 }}>
          <ambientLight intensity={0.85} />
          <directionalLight
            position={[5, 6, 5]}
            intensity={1.2}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <pointLight position={[0, 2, 3]} intensity={0.5} />
          <pointLight position={[-2.4, 2.2, 2.6]} intensity={0.6} color="#ffe3ad" />
          <pointLight position={[0, 1.4, 0]} intensity={2.2} distance={6} color="#fff3cf" />
          <Suspense
            fallback={
              <mesh>
                <boxGeometry args={[1, 0.6, 2]} />
                <meshStandardMaterial color="#3a2a20" />
              </mesh>
            }
          >
            <Cercueil3D
              essence={essence}
              finition={finition}
              couleurLaque={couleurLaque}
              doublure={doublure}
              couleurSatin={couleurSatin}
              fermeture={fermeture}
              isOpen={isOpen}
              viewSize={viewSize}
            />
            <ContactShadows position={[0, -2, 0]} opacity={0.5} scale={15} blur={2.5} far={4} />
          </Suspense>
          <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2 + 0.1} />
        </Canvas>
      </div>
    </div>
  );
}
