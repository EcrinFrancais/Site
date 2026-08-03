import React from 'react';
import { useTranslation } from 'react-i18next';
import { universData } from '../config/univers';

export default function ChoixUnivers({ onSelectUnivers }) {
  const { t } = useTranslation('univers');
  return (
    <div style={styles.container}>
      <h1 style={styles.titre}>{t('pageTitle')}</h1>

      <div style={styles.grille}>
        {universData.map((univers) => (
          <div
            key={univers.id}
            style={{ ...styles.pave, backgroundImage: `url(${univers.image})` }}
            onClick={() => onSelectUnivers(univers.id)}
            className="univers-card" // Pratique si vous voulez ajouter du CSS pour le survol (:hover)
          >
            <div style={styles.overlay}>
              <h2 style={styles.paveTitre}>{t(`titles.${univers.id}`, univers.titre)}</h2>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Styles "Luxe" intégrés (vous pouvez les déplacer dans un fichier CSS)
const styles = {
  container: {
    padding: '40px 20px',
    textAlign: 'center',
    backgroundColor: '#111', // Fond sombre élégant
    minHeight: '100vh',
    color: '#fff',
  },
  titre: {
    fontFamily: 'serif',
    fontWeight: '300',
    letterSpacing: '2px',
    marginBottom: '40px',
    fontSize: '2.5rem',
  },
  grille: {
    display: 'flex',
    justifyContent: 'center',
    gap: '30px',
    flexWrap: 'wrap',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  pave: {
    width: '320px',
    height: '450px',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    borderRadius: '8px',
    cursor: 'pointer',
    overflow: 'hidden',
    position: 'relative',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
    transition: 'transform 0.3s ease', // Animation fluide
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Voile noir pour rendre le texte lisible
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.3s ease',
  },
  paveTitre: {
    fontFamily: 'serif',
    fontSize: '2rem',
    letterSpacing: '3px',
    textTransform: 'uppercase',
    color: '#fff',
    textShadow: '2px 2px 4px rgba(0,0,0,0.6)', // Ombre pour détacher le texte
  },
};
