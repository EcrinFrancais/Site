import React from 'react';

// --- LE LOGO (Code SVG vectoriel) ---
// Ce composant dessine le logo directement à l'écran
const BrandLogo = ({ size = 60, color = '#C5A059' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'block' }}
  >
    {/* Cadre extérieur (La Boîte) */}
    <rect x="5" y="5" width="90" height="90" stroke={color} strokeWidth="2" />
    {/* Cadre intérieur (L'épaisseur du bois) */}
    <rect
      x="12"
      y="12"
      width="76"
      height="76"
      stroke={color}
      strokeWidth="1"
      strokeOpacity="0.6"
    />
    {/* Les Initiales "EF" stylisées au centre */}
    <text
      x="50"
      y="62"
      fontFamily="'Playfair Display', serif"
      fontSize="40"
      fill={color}
      textAnchor="middle"
      fontWeight="bold"
    >
      ÉF
    </text>
    {/* Petit détail : L'ouverture (un trait fin en bas) */}
    <rect x="40" y="92" width="20" height="6" fill="#0B0B0B" />{' '}
    {/* Masque pour couper le cadre */}
    <line x1="42" y1="95" x2="58" y2="95" stroke={color} strokeWidth="1" />
  </svg>
);

const HomePage = ({ onStart }) => {
  // --- STYLES ---
  const styles = {
    container: {
      backgroundColor: '#0B0B0B',
      color: '#EAEAEA',
      fontFamily: "'Montserrat', sans-serif",
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
    },

    // NAVIGATION AVEC LOGO
    nav: {
      padding: '15px 40px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid rgba(197, 160, 89, 0.2)',
      background: 'rgba(11, 11, 11, 0.95)',
      position: 'fixed',
      width: '100%',
      zIndex: 100,
      boxSizing: 'border-box',
      backdropFilter: 'blur(5px)',
    },
    brandBlock: { display: 'flex', alignItems: 'center', gap: '15px' },
    brandName: {
      fontFamily: "'Playfair Display', serif",
      fontSize: '1.2rem',
      color: '#C5A059',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: '2px',
      lineHeight: '1.2',
    },
    navSpacer: { height: '90px' },

    // HERO
    hero: {
      backgroundImage:
        'linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.5)), url(https://images.unsplash.com/photo-1610555356070-d0efb6505f81?q=80&w=1920&auto=format&fit=crop)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      height: '90vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      padding: '20px',
      position: 'relative',
      borderBottom: '3px solid #C5A059',
    },
    heroTitle: {
      fontFamily: "'Playfair Display', serif",
      fontSize: '4rem',
      color: '#C5A059',
      marginBottom: '25px',
      maxWidth: '1000px',
      lineHeight: '1.1',
      textTransform: 'uppercase',
      letterSpacing: '2px',
    },
    heroSubtitle: {
      fontFamily: "'Playfair Display', serif",
      fontStyle: 'italic',
      fontSize: '1.5rem',
      maxWidth: '800px',
      marginBottom: '50px',
      color: '#FFF',
      fontWeight: '400',
    },
    ctaButton: {
      padding: '20px 60px',
      backgroundColor: 'transparent',
      color: '#C5A059',
      border: '2px solid #C5A059',
      fontSize: '1rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      textTransform: 'uppercase',
      letterSpacing: '3px',
      transition: '0.3s',
    },

    // RESTE DU SITE...
    statsBar: {
      display: 'flex',
      justifyContent: 'space-around',
      flexWrap: 'wrap',
      padding: '50px 20px',
      backgroundColor: '#111',
      borderBottom: '1px solid #222',
    },
    statItem: { textAlign: 'center', margin: '20px' },
    statTitle: {
      fontSize: '1.2rem',
      fontFamily: "'Playfair Display', serif",
      color: '#C5A059',
      marginBottom: '5px',
    },
    statSub: {
      fontSize: '0.85rem',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      color: '#888',
    },

    sectionStory: {
      padding: '120px 40px',
      backgroundColor: '#0B0B0B',
      maxWidth: '1200px',
      margin: '0 auto',
    },
    storyTitle: {
      fontFamily: "'Playfair Display', serif",
      fontSize: '3rem',
      color: '#C5A059',
      marginBottom: '50px',
      textAlign: 'center',
    },
    storyLayout: {
      display: 'flex',
      gap: '80px',
      alignItems: 'center',
      flexWrap: 'wrap',
    },
    storyText: { flex: '1 1 500px' },
    dropCap: {
      float: 'left',
      fontSize: '4rem',
      lineHeight: '0.8',
      marginRight: '15px',
      color: '#C5A059',
      fontFamily: "'Playfair Display', serif'",
    },
    paragraph: {
      lineHeight: '2',
      color: '#CCC',
      marginBottom: '30px',
      fontSize: '1.05rem',
      textAlign: 'justify',
    },
    imageComposition: {
      flex: '1 1 500px',
      position: 'relative',
      height: '500px',
    },
    imgBack: {
      position: 'absolute',
      top: 0,
      right: 0,
      width: '80%',
      height: '80%',
      objectFit: 'cover',
      filter: 'sepia(20%) brightness(0.6)',
    },
    imgFront: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '60%',
      height: '60%',
      objectFit: 'cover',
      border: '5px solid #0B0B0B',
      boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
    },

    sectionSavoirFaire: { padding: '120px 40px', backgroundColor: '#101010' },
    gridSavoirFaire: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
      gap: '50px',
      maxWidth: '1300px',
      margin: '0 auto',
    },
    cardSF: {
      textAlign: 'center',
      padding: '40px 20px',
      border: '1px solid #222',
      transition: '0.3s',
    },
    iconSF: {
      fontSize: '2.5rem',
      marginBottom: '20px',
      color: '#C5A059',
      display: 'block',
    },
    titleSF: {
      fontFamily: "'Playfair Display', serif",
      fontSize: '1.8rem',
      color: '#EAEAEA',
      marginBottom: '20px',
    },
    textSF: { color: '#999', lineHeight: '1.8' },

    footer: {
      padding: '80px 40px',
      textAlign: 'center',
      borderTop: '1px solid #222',
      backgroundColor: '#080808',
      color: '#555',
      fontSize: '0.85rem',
      letterSpacing: '1px',
    },
  };

  return (
    <div style={styles.container}>
      {/* NAVIGATION AVEC LOGO */}
      <nav style={styles.nav}>
        {/* BLOC LOGO + TITRE */}
        <div style={styles.brandBlock}>
          <BrandLogo size={50} />
          <div style={styles.brandName}>
            L'ÉCRIN
            <br />
            FRANÇAIS
          </div>
        </div>

        <button
          onClick={onStart}
          style={{
            background: 'none',
            border: 'none',
            color: '#C5A059',
            cursor: 'pointer',
            fontSize: '0.9rem',
            letterSpacing: '2px',
            textTransform: 'uppercase',
          }}
        >
          Accéder à l'Atelier
        </button>
      </nav>
      <div style={styles.navSpacer}></div>

      {/* HERO */}
      <header style={styles.hero}>
        <BrandLogo size={120} /> {/* Grand Logo au centre */}
        <div style={{ height: '30px' }}></div>
        <h1 style={styles.heroTitle}>
          Haute Facture de
          <br />
          Coffrets & Écrins
        </h1>
        <p style={styles.heroSubtitle}>
          "Parce que protéger vos objets d'exception est un art qui traverse le
          temps."
        </p>
        <button style={styles.ctaButton} onClick={() => onStart('auth')}>
          Concevoir votre Ouvrage
        </button>
      </header>

      {/* BANDEAU */}
      <section style={styles.statsBar}>
        <div style={styles.statItem}>
          <div style={styles.statTitle}>Héritage</div>
          <div style={styles.statSub}>15 Ans d'Excellence</div>
        </div>
        <div style={styles.statItem}>
          <div style={styles.statTitle}>Manufacture</div>
          <div style={styles.statSub}>Propriétaire au Portugal</div>
        </div>
        <div style={styles.statItem}>
          <div style={styles.statTitle}>Pièce Unique</div>
          <div style={styles.statSub}>Design Sur-Mesure</div>
        </div>
      </section>

      {/* HISTOIRE */}
      <section style={styles.sectionStory}>
        <h2 style={styles.storyTitle}>L'Esprit de la Manufacture</h2>
        <div style={styles.storyLayout}>
          <div style={styles.storyText}>
            <p style={styles.paragraph}>
              <span style={styles.dropCap}>D</span>
              epuis quinze ans, L'Écrin Français perpétue la tradition du bel
              ouvrage. Dans le secret de nos ateliers, nous façonnons pour les
              grandes Maisons des gardiens de bois et de velours, destinés à
              traverser les époques.
            </p>
            <p style={styles.paragraph}>
              Notre singularité réside dans cette double identité : l'âme de
              l'artisanat bourguignon alliée à la puissance de{' '}
              <strong>notre propre manufacture au Portugal</strong>. Cette
              maîtrise intégrale nous permet de travailler les essences les plus
              nobles avec une précision chirurgicale.
            </p>
            <p style={styles.paragraph}>
              Aujourd'hui, nous mettons ce savoir-faire confidentiel à la portée
              des esthètes. Pour que chaque objet précieux trouve enfin l'écrin
              qu'il mérite.
            </p>
          </div>
          <div style={styles.imageComposition}>
            <img
              src="https://images.unsplash.com/photo-1605722557346-6014e767425e?auto=format&fit=crop&w=800"
              style={styles.imgBack}
              alt="Atelier"
            />
            <img
              src="https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800"
              style={styles.imgFront}
              alt="Geste de l'artisan"
            />
          </div>
        </div>
      </section>

      {/* SAVOIR-FAIRE */}
      <section style={styles.sectionSavoirFaire}>
        <div style={styles.gridSavoirFaire}>
          <div style={styles.cardSF}>
            <span style={styles.iconSF}>✦</span>
            <h3 style={styles.titleSF}>Maîtrise d'Œuvre</h3>
            <p style={styles.textSF}>
              Sans intermédiaire. De la sélection de l'arbre à la pose de la
              dernière charnière, tout est réalisé au sein de notre manufacture.
            </p>
          </div>
          <div style={styles.cardSF}>
            <span style={styles.iconSF}>✎</span>
            <h3 style={styles.titleSF}>L'Art du Sur-Mesure</h3>
            <p style={styles.textSF}>
              Chaque projet est une page blanche. Dimensions au millimètre,
              marquage à chaud ou gravure laser : nous donnons corps à votre
              imaginaire.
            </p>
          </div>
          <div style={styles.cardSF}>
            <span style={styles.iconSF}>∞</span>
            <h3 style={styles.titleSF}>De l'Unité à la Série</h3>
            <p style={styles.textSF}>
              Que vous souhaitiez une pièce unique ou une série limitée pour
              votre marque, notre outil industriel s'adapte avec la même
              exigence.
            </p>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
          <button style={styles.ctaButton} onClick={onStart}>
            Débuter la Configuration
          </button>
        </div>
      </section>

      {/* FOOTER AVEC LOGO */}
      <footer style={styles.footer}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '20px',
          }}
        >
          <BrandLogo size={60} color="#555" /> {/* Logo plus discret en bas */}
        </div>
        <div
          style={{
            color: '#C5A059',
            fontFamily: "'Playfair Display', serif",
            fontSize: '1.2rem',
            marginBottom: '30px',
          }}
        >
          L'ÉCRIN FRANÇAIS
        </div>
        <p>MANUFACTURE AU PORTUGAL — DESIGN EN BOURGOGNE</p>
        <p style={{ marginTop: '20px', fontSize: '0.75rem', opacity: 0.7 }}>
          MENTIONS LÉGALES & CGV — TOUS DROITS RÉSERVÉS 2024
        </p>
      </footer>
    </div>
  );
};

export default HomePage;
