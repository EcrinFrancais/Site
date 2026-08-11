import React from 'react';
import { cercueilConfig } from '../data/cercueilConfig';

export default function CercueilConfigurationPanel({
  styles,
  essence,
  setEssence,
  finition,
  setFinition,
  couleurLaque,
  setCouleurLaque,
  doublure,
  setDoublure,
  couleurSatin,
  setCouleurSatin,
  fermeture,
  setFermeture,
  onBack,
}) {
  return (
    <div style={styles.leftPanel}>
      <div style={styles.configContainer}>
        <h1 style={styles.title}>⚰️ Cercueil — Édition Spéciale</h1>
        <p style={{ color: '#b6ab95', fontSize: '0.85rem', marginTop: '-14px', marginBottom: '24px' }}>
          Univers gag, juste pour rire — configurez le bois, la finition, la doublure et la fermeture.
        </p>

        <div style={styles.sectionCard}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Bois & finition</h2>
          </div>
          <div style={styles.sectionGrid}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Essence</label>
              <select value={essence} onChange={(e) => setEssence(e.target.value)} style={styles.minimalSelect}>
                {cercueilConfig.essences.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Finition</label>
              <select value={finition} onChange={(e) => setFinition(e.target.value)} style={styles.minimalSelect}>
                {cercueilConfig.finitions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            {finition === 'Laque' && (
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Couleur de laque</label>
                <select
                  value={couleurLaque}
                  onChange={(e) => setCouleurLaque(e.target.value)}
                  style={styles.minimalSelect}
                >
                  {cercueilConfig.laqueColors.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        <div style={styles.sectionCard}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Doublure intérieure</h2>
          </div>
          <div style={styles.sectionGrid}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Doublure</label>
              <select value={doublure} onChange={(e) => setDoublure(e.target.value)} style={styles.minimalSelect}>
                {cercueilConfig.doublures.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            {doublure === 'Satin' && (
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Couleur du satin</label>
                <select
                  value={couleurSatin}
                  onChange={(e) => setCouleurSatin(e.target.value)}
                  style={styles.minimalSelect}
                >
                  {cercueilConfig.satinColors.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        <div style={styles.sectionCard}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Fermeture</h2>
          </div>
          <div style={styles.sectionGrid}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Ornement</label>
              <select value={fermeture} onChange={(e) => setFermeture(e.target.value)} style={styles.minimalSelect}>
                {cercueilConfig.fermetures.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div style={styles.footer}>
          <button style={styles.secondaryButton} onClick={onBack}>
            Retour aux univers
          </button>
        </div>
      </div>
    </div>
  );
}
