import React, { useState, Suspense, useRef, useEffect } from 'react';
import { vinsConfig } from '../data/vinsConfig';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  OrbitControls,
  ContactShadows,
  Text,
  Environment,
  RoundedBox,
} from '@react-three/drei';

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

const fonts = {
  Serif:
    'https://cdn.jsdelivr.net/gh/mrdoob/three.js/examples/fonts/gentilis_bold.typeface.json', // Une police interne à Three.js, très fiable
  SansSerif:
    'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5WZLCzYlKw.woff',
  Script:
    'https://fonts.gstatic.com/s/greatvibes/v14/RWmMoKWR9v4ksMfaWd_JN9XliaO6.woff',
};

// --- LE MOTEUR 3D : CRÉATION DU COFFRET ---
function Coffret3D({
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
  fontStyle,
  tailleTexte,
  tailleImage,
  posX,
  posY,
}) {
  const [woodTexture, setWoodTexture] = useState(null);
  const [bottleRatio, setBottleRatio] = useState(1); // 1 par défaut

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
  const baseColor = estLaque
    ? couleurLaque
    : woodTexture
    ? '#ffffff'
    : '#a67b5b';

  const woodMaterialProps = {
    key: textureAAppliquer ? textureAAppliquer.uuid : 'sans-texture',
    map: textureAAppliquer,
    color: baseColor,
    roughness: estBrillant ? 0.1 : 0.8,
    metalness: estBrillant ? 0.2 : 0,
  };

  const lidRef = useRef();
  useFrame(() => {
    if (lidRef.current) {
      const targetRotation = isOpen ? -Math.PI / 1.4 : 0;
      lidRef.current.rotation.y = THREE.MathUtils.lerp(
        lidRef.current.rotation.y,
        targetRotation,
        0.08
      );
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

  return (
    <group position={[0, H / 2 - 1.5, 0]}>
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

            {/* LE TEXTE 3D */}
            {/* LE TEXTE 3D AVEC SECURITE DE CHARGEMENT */}
            {gravureType !== 'Aucune' &&
              modeGravure === 'texte' &&
              texteGravure && (
                <Suspense fallback={null}>
                  <Text
                    // font={fonts[fontStyle]}
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
export default function ConfiguratorPage({ onStart, univers }) {
  const [taille, setTaille] = useState('bouteille');
  const [mesures, setMesures] = useState({ L: '', l: '', h: '' });
  const [essence, setEssence] = useState(vinsConfig.essences[0]);
  const [finition, setFinition] = useState(vinsConfig.finitions[0]);
  const [couleurLaque, setCouleurLaque] = useState('#800020');
  const [cales, setCales] = useState(vinsConfig.cales[0]);
  const [couleurVelours, setCouleurVelours] = useState(
    vinsConfig.veloursColors[0]
  );
  const [fermeture, setFermeture] = useState(vinsConfig.fermetures[0]);
  const [gravureType, setGravureType] = useState(vinsConfig.gravureTypes[0]);

  const [fontStyle, setFontStyle] = useState('Serif');
  const [tailleTexte, setTailleTexte] = useState(100);
  const [tailleImage, setTailleImage] = useState(100);
  const [posX, setPosX] = useState(50);
  const [posY, setPosY] = useState(50);
  const [quantite, setQuantite] = useState(1);
  const [isOpen, setIsOpen] = useState(false);

  const [texteGravure, setTexteGravure] = useState('');
  const [modeGravure, setModeGravure] = useState('texte');
  const [imageGravure, setImageGravure] = useState(null);

  const handleUploadImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageGravure(URL.createObjectURL(file));
    }
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.leftPanel}>
        <div style={styles.header}>
          <button onClick={onStart} style={styles.backButton}>
            ← Retour
          </button>
          <div style={styles.logoContainer}>
            <span style={styles.logoText}>L'ÉCRIN FRANÇAIS</span>
          </div>
          <div style={{ width: '60px' }}></div>
        </div>

        <div style={styles.configContainer}>
          <h1 style={styles.title}>Vins & Spiritueux</h1>

          <div style={styles.cleanGrid}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Taille du coffret</label>
              <select
                value={taille}
                onChange={(e) => setTaille(e.target.value)}
                style={styles.minimalSelect}
              >
                {vinsConfig.tailles.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
              {taille === 'sur_mesure' && (
                <div style={styles.inlineInputs}>
                  <input
                    type="number"
                    placeholder="L(cm)"
                    onChange={(e) =>
                      setMesures({ ...mesures, L: e.target.value })
                    }
                    style={styles.minimalInput}
                  />
                  <input
                    type="number"
                    placeholder="l(cm)"
                    onChange={(e) =>
                      setMesures({ ...mesures, l: e.target.value })
                    }
                    style={styles.minimalInput}
                  />
                  <input
                    type="number"
                    placeholder="H(cm)"
                    onChange={(e) =>
                      setMesures({ ...mesures, h: e.target.value })
                    }
                    style={styles.minimalInput}
                  />
                </div>
              )}
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Essence de bois</label>
              <select
                value={essence}
                onChange={(e) => setEssence(e.target.value)}
                style={styles.minimalSelect}
              >
                {vinsConfig.essences.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Finition</label>
              <select
                value={finition}
                onChange={(e) => setFinition(e.target.value)}
                style={styles.minimalSelect}
              >
                {vinsConfig.finitions.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
              {finition === 'Laque' && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    marginTop: '10px',
                  }}
                >
                  <label style={styles.label}>Couleur :</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[
                      '#800020',
                      '#000000',
                      '#ffffff',
                      '#003366',
                      '#214e34',
                    ].map((color) => (
                      <button
                        key={color}
                        onClick={() => setCouleurLaque(color)}
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          backgroundColor: color,
                          border:
                            couleurLaque === color
                              ? '2px solid #d4af37'
                              : '1px solid #333',
                          cursor: 'pointer',
                          padding: 0,
                        }}
                      />
                    ))}
                  </div>
                  <input
                    type="color"
                    value={couleurLaque}
                    onChange={(e) => setCouleurLaque(e.target.value)}
                    style={styles.colorPicker}
                  />
                </div>
              )}
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Aménagement</label>
              <select
                value={cales}
                onChange={(e) => setCales(e.target.value)}
                style={styles.minimalSelect}
              >
                {vinsConfig.cales.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {cales === 'Velours' && (
                <select
                  value={couleurVelours}
                  onChange={(e) => setCouleurVelours(e.target.value)}
                  style={{ ...styles.minimalSelect, marginTop: '10px' }}
                >
                  {vinsConfig.veloursColors.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Fermeture</label>
              <select
                value={fermeture}
                onChange={(e) => setFermeture(e.target.value)}
                style={styles.minimalSelect}
              >
                {vinsConfig.fermetures.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Gravure</label>
              <select
                value={gravureType}
                onChange={(e) => setGravureType(e.target.value)}
                style={styles.minimalSelect}
              >
                {vinsConfig.gravureTypes.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            {/* LE PANNEAU DE CONTRÔLE (Remis à sa bonne place dans l'interface HTML) */}
            {gravureType !== 'Aucune' && (
              <div
                style={{
                  ...styles.fieldGroup,
                  gridColumn: '1 / -1',
                  padding: '15px',
                  border: '1px solid #333',
                  borderRadius: '5px',
                }}
              >
                <label style={styles.label}>
                  Personnalisation de la Gravure
                </label>

                <div
                  style={{
                    display: 'flex',
                    gap: '10px',
                    marginTop: '10px',
                    marginBottom: '15px',
                  }}
                >
                  <button
                    onClick={() => setModeGravure('texte')}
                    style={{
                      ...styles.minimalSelect,
                      width: '50%',
                      padding: '5px',
                      border:
                        modeGravure === 'texte'
                          ? '1px solid #d4af37'
                          : '1px solid #333',
                    }}
                  >
                    Texte
                  </button>
                  <button
                    onClick={() => setModeGravure('image')}
                    style={{
                      ...styles.minimalSelect,
                      width: '50%',
                      padding: '5px',
                      border:
                        modeGravure === 'image'
                          ? '1px solid #d4af37'
                          : '1px solid #333',
                    }}
                  >
                    Image / Logo
                  </button>
                </div>

                {modeGravure === 'texte' ? (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '15px',
                    }}
                  >
                    <input
                      type="text"
                      value={texteGravure}
                      onChange={(e) => setTexteGravure(e.target.value)}
                      placeholder="Saisir le texte..."
                      style={styles.minimalInput}
                    />

                    <div style={{ display: 'flex', gap: '20px' }}>
                      <div style={{ width: '50%' }}>
                        <label style={{ ...styles.label, fontSize: '0.6rem' }}>
                          Police
                        </label>
                        <select
                          value={fontStyle}
                          onChange={(e) => setFontStyle(e.target.value)}
                          style={styles.minimalSelect}
                        >
                          <option value="Serif">Classique</option>
                          <option value="SansSerif">Moderne</option>
                          <option value="Script">Manuscrite</option>
                        </select>
                      </div>
                      <div style={{ width: '50%' }}>
                        <label style={{ ...styles.label, fontSize: '0.6rem' }}>
                          Taille : {tailleTexte}%
                        </label>
                        <input
                          type="range"
                          min="30"
                          max="200"
                          value={tailleTexte}
                          onChange={(e) => setTailleTexte(e.target.value)}
                          style={{ width: '100%' }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '15px',
                    }}
                  >
                    <input
                      type="file"
                      accept="image/png, image/jpeg"
                      onChange={handleUploadImage}
                      style={{
                        ...styles.minimalInput,
                        fontSize: '0.8rem',
                        color: '#888',
                      }}
                    />
                    <div>
                      <label style={{ ...styles.label, fontSize: '0.6rem' }}>
                        Zoom Image : {tailleImage}%
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="300"
                        value={tailleImage}
                        onChange={(e) => setTailleImage(e.target.value)}
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>
                )}

                <div
                  style={{
                    marginTop: '20px',
                    borderTop: '1px solid #333',
                    paddingTop: '15px',
                  }}
                >
                  <label style={{ ...styles.label, fontSize: '0.6rem' }}>
                    Position Horizontale (Gauche/Droite)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={posX}
                    onChange={(e) => setPosX(e.target.value)}
                    style={{ width: '100%', marginBottom: '10px' }}
                  />

                  <label style={{ ...styles.label, fontSize: '0.6rem' }}>
                    Position Verticale (Haut/Bas)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={posY}
                    onChange={(e) => setPosY(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            )}
          </div>

          <div style={styles.footer}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <label style={styles.label}>Quantité :</label>
              <input
                type="number"
                min="1"
                value={quantite}
                onChange={(e) => setQuantite(e.target.value)}
                style={{
                  ...styles.minimalInput,
                  width: '60px',
                  textAlign: 'center',
                }}
              />
            </div>
            <button style={styles.orderButton}>Ajouter au panier</button>
          </div>
        </div>
      </div>

      <div style={styles.rightPanel3D}>
        <button onClick={() => setIsOpen(!isOpen)} style={styles.openButton}>
          {isOpen ? 'Fermer le coffret' : 'Ouvrir le coffret'}
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
          <Canvas shadows camera={{ position: [0, 2, 6], fov: 45 }}>
            <ambientLight intensity={0.8} />
            <directionalLight
              position={[5, 5, 5]}
              intensity={1.2}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />{' '}
            <pointLight position={[0, 2, 3]} intensity={0.5} />
            <Suspense
              fallback={
                <group>
                  <mesh>
                    <boxGeometry args={[1, 3, 1]} />
                    <meshStandardMaterial color="#a67b5b" />
                  </mesh>
                </group>
              }
            >
              <Coffret3D
                taille={taille}
                mesures={mesures}
                essence={essence}
                finition={finition}
                couleurLaque={couleurLaque}
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
    </div>
  );
}

const styles = {
  pageContainer: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    backgroundColor: '#050505',
    color: '#eaeaea',
    fontFamily: '"Optima", "Didot", "Helvetica Neue", sans-serif',
    overflow: 'hidden',
  },
  leftPanel: {
    width: '65%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '30px',
    overflowY: 'auto',
  },
  rightPanel3D: {
    width: '35%',
    backgroundColor: '#0a0a0a',
    borderLeft: '1px solid #1a1a1a',
    position: 'relative',
  },
  header: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  logoText: {
    fontFamily: '"Didot", "Times New Roman", serif',
    fontSize: '1.5rem',
    letterSpacing: '5px',
    color: '#fff',
    textTransform: 'uppercase',
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: '#666',
    cursor: 'pointer',
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  configContainer: {
    width: '100%',
    maxWidth: '700px',
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
    marginBottom: '30px',
    borderBottom: '1px solid #1a1a1a',
    paddingBottom: '15px',
  },
  cleanGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    columnGap: '60px',
    rowGap: '25px',
  },
  fieldGroup: { display: 'flex', flexDirection: 'column' },
  label: {
    fontSize: '0.7rem',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    color: '#888',
    marginBottom: '10px',
  },
  minimalSelect: {
    width: '100%',
    backgroundColor: 'transparent',
    color: '#fff',
    border: 'none',
    borderBottom: '1px solid #333',
    padding: '5px 0 10px 0',
    fontSize: '0.95rem',
    outline: 'none',
    cursor: 'pointer',
    appearance: 'none',
  },
  minimalInput: {
    width: '100%',
    backgroundColor: 'transparent',
    color: '#fff',
    border: 'none',
    borderBottom: '1px solid #333',
    padding: '5px 0 10px 0',
    fontSize: '0.95rem',
    outline: 'none',
  },
  inlineInputs: { display: 'flex', gap: '10px', marginTop: '10px' },
  colorPicker: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    height: '25px',
    width: '25px',
    padding: 0,
  },
  footer: {
    marginTop: '30px',
    paddingTop: '20px',
    borderTop: '1px solid #1a1a1a',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '20px',
  },
  orderButton: {
    backgroundColor: '#d4af37',
    color: '#000',
    border: 'none',
    padding: '15px 40px',
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  openButton: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    zIndex: 10,
    padding: '10px 20px',
    backgroundColor: '#1a1a1a',
    color: '#d4af37',
    border: '1px solid #d4af37',
    cursor: 'pointer',
    textTransform: 'uppercase',
    fontSize: '0.7rem',
    letterSpacing: '1px',
  },
};
