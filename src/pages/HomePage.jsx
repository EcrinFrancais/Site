import React from 'react';
import { useTranslation } from 'react-i18next';
import TestimonialsSection from '../components/TestimonialsSection';

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
  const { t } = useTranslation('home');
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
      fontSize: 'clamp(2.6rem, 5vw, 4.3rem)',
      color: '#F2E0B4',
      marginBottom: '18px',
      maxWidth: '980px',
      lineHeight: '1.05',
      textTransform: 'uppercase',
      letterSpacing: '0.14em',
      textShadow: '0 8px 24px rgba(0,0,0,0.25)',
    },
    heroSubtitle: {
      fontFamily: "'Playfair Display', serif",
      fontStyle: 'italic',
      fontSize: '1.2rem',
      maxWidth: '780px',
      marginBottom: '42px',
      color: '#F6EFD8',
      fontWeight: '400',
      lineHeight: '1.7',
      opacity: 0.95,
    },
    ctaButton: {
      padding: '16px 34px',
      background: 'linear-gradient(135deg, rgba(197,160,89,0.16), rgba(197,160,89,0.3))',
      color: '#F6EFD8',
      border: '1px solid rgba(197,160,89,0.45)',
      fontSize: '0.92rem',
      fontWeight: '700',
      cursor: 'pointer',
      textTransform: 'uppercase',
      letterSpacing: '0.2em',
      transition: '0.3s',
      borderRadius: '999px',
      backdropFilter: 'blur(6px)',
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
      background: 'linear-gradient(135deg, #080808 0%, #101010 100%)',
      maxWidth: '1320px',
      margin: '0 auto',
      width: '100%',
    },
    storyTitle: {
      fontFamily: "'Playfair Display', serif",
      fontSize: '3rem',
      color: '#C5A059',
      marginBottom: '16px',
      textAlign: 'center',
    },
    storyIntro: {
      textAlign: 'center',
      color: '#b8af96',
      maxWidth: '720px',
      margin: '0 auto 48px',
      lineHeight: '1.8',
      fontSize: '1rem',
    },
    storyLayout: {
      display: 'grid',
      gridTemplateColumns: '1.05fr 0.95fr',
      gap: '44px',
      alignItems: 'center',
    },
    storyText: { display: 'grid', gap: '18px' },
    paragraph: {
      lineHeight: '1.9',
      color: '#D9D1C2',
      margin: 0,
      fontSize: '1.02rem',
    },
    highlightBox: {
      border: '1px solid rgba(197, 160, 89, 0.24)',
      borderRadius: '18px',
      padding: '18px 20px',
      background: 'rgba(255,255,255,0.04)',
      color: '#EEDBB5',
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      fontSize: '0.82rem',
    },
    imageComposition: {
      position: 'relative',
      minHeight: '480px',
      borderRadius: '24px',
      overflow: 'hidden',
      boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
      border: '1px solid rgba(197, 160, 89, 0.18)',
      background: 'linear-gradient(140deg, rgba(197,160,89,0.12), rgba(0,0,0,0.2))',
    },
    imgBack: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      objectPosition: 'center',
      filter: 'saturate(0.8) contrast(1.05)',
    },
    imgOverlay: {
      position: 'absolute',
      inset: '0',
      background: 'linear-gradient(120deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%)',
    },
    imageCaption: {
      position: 'absolute',
      bottom: '20px',
      left: '20px',
      right: '20px',
      padding: '16px 18px',
      background: 'rgba(8,8,8,0.72)',
      border: '1px solid rgba(197, 160, 89, 0.25)',
      borderRadius: '14px',
      color: '#F2E2B4',
      backdropFilter: 'blur(8px)',
      lineHeight: '1.6',
    },

    sectionSavoirFaire: {
      padding: '120px 40px',
      background: 'linear-gradient(180deg, #101010 0%, #0a0a0a 100%)',
    },
    gridSavoirFaire: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '28px',
      maxWidth: '1280px',
      margin: '0 auto',
    },
    cardSF: {
      textAlign: 'center',
      padding: '36px 24px',
      border: '1px solid rgba(197,160,89,0.18)',
      borderRadius: '20px',
      background: 'linear-gradient(145deg, rgba(255,255,255,0.05), rgba(197,160,89,0.08))',
      transition: '0.3s',
      boxShadow: '0 12px 32px rgba(0,0,0,0.18)',
      position: 'relative',
      overflow: 'hidden',
    },
    iconSF: {
      fontSize: '2.2rem',
      marginBottom: '16px',
      color: '#EFD8A3',
      display: 'block',
    },
    titleSF: {
      fontFamily: "'Playfair Display', serif",
      fontSize: '1.45rem',
      color: '#F3E7C4',
      marginBottom: '14px',
    },
    textSF: { color: '#b9b2a3', lineHeight: '1.8', fontSize: '0.96rem' },

    footer: {
      padding: '80px 40px',
      textAlign: 'center',
      borderTop: '1px solid rgba(197,160,89,0.16)',
      backgroundColor: '#080808',
      color: '#7d7569',
      fontSize: '0.85rem',
      letterSpacing: '1px',
    },
  };

  return (
    <div style={styles.container}>
      {/* HERO */}
      <header style={styles.hero}>
        <BrandLogo size={120} /> {/* Grand Logo au centre */}
        <div style={{ height: '30px' }}></div>
        <h1 style={styles.heroTitle}>
          {t('hero.titleLine1')}
          <br />
          {t('hero.titleLine2')}
        </h1>
        <p style={styles.heroSubtitle}>
          {t('hero.subtitle')}
        </p>
        <button style={styles.ctaButton} onClick={() => onStart('auth')}>
          {t('hero.cta')}
        </button>
      </header>

      {/* BANDEAU */}
      <section style={styles.statsBar}>
        <div style={styles.statItem}>
          <div style={styles.statTitle}>{t('stats.heritage.title')}</div>
          <div style={styles.statSub}>{t('stats.heritage.sub')}</div>
        </div>
        <div style={styles.statItem}>
          <div style={styles.statTitle}>{t('stats.manufacture.title')}</div>
          <div style={styles.statSub}>{t('stats.manufacture.sub')}</div>
        </div>
        <div style={styles.statItem}>
          <div style={styles.statTitle}>{t('stats.piece.title')}</div>
          <div style={styles.statSub}>{t('stats.piece.sub')}</div>
        </div>
      </section>

      {/* HISTOIRE */}
      <section style={styles.sectionStory}>
        <h2 style={styles.storyTitle}>{t('story.title')}</h2>
        <p style={styles.storyIntro}>
          {t('story.intro')}
        </p>
        <div style={styles.storyLayout}>
          <div style={styles.storyText}>
            <div style={styles.highlightBox}>{t('story.highlight')}</div>
            <p style={styles.paragraph}>
              {t('story.paragraph1')}
            </p>
            <p style={styles.paragraph}>
              {t('story.paragraph2')}
            </p>
            <p style={styles.paragraph}>
              {t('story.paragraph3')}
            </p>
          </div>
          <div style={styles.imageComposition}>
            <img
              src="https://images.unsplash.com/photo-1780745167657-9144974347c4?auto=format&fit=crop&w=1400"
              style={styles.imgBack}
              alt={t('story.imageAlt')}
            />
            <div style={styles.imgOverlay}></div>
            <div style={styles.imageCaption}>
              {t('story.imageCaption')}
            </div>
          </div>
        </div>
      </section>

      {/* SAVOIR-FAIRE */}
      <section style={styles.sectionSavoirFaire}>
        <div style={styles.gridSavoirFaire}>
          <div style={styles.cardSF}>
            <span style={styles.iconSF}>✦</span>
            <h3 style={styles.titleSF}>{t('savoirFaire.card1.title')}</h3>
            <p style={styles.textSF}>
              {t('savoirFaire.card1.text')}
            </p>
          </div>
          <div style={styles.cardSF}>
            <span style={styles.iconSF}>✎</span>
            <h3 style={styles.titleSF}>{t('savoirFaire.card2.title')}</h3>
            <p style={styles.textSF}>
              {t('savoirFaire.card2.text')}
            </p>
          </div>
          <div style={styles.cardSF}>
            <span style={styles.iconSF}>∞</span>
            <h3 style={styles.titleSF}>{t('savoirFaire.card3.title')}</h3>
            <p style={styles.textSF}>
              {t('savoirFaire.card3.text')}
            </p>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
          <button style={styles.ctaButton} onClick={onStart}>
            {t('savoirFaire.cta')}
          </button>
        </div>
      </section>

      {/* TÉMOIGNAGES (n'apparaît que s'il existe au moins un avis approuvé) */}
      <TestimonialsSection />

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
          {t('footer.brand')}
        </div>
        <p>{t('footer.tagline')}</p>
        <p style={{ marginTop: '20px', fontSize: '0.75rem', opacity: 0.7 }}>
          <a href="/mentions-legales" style={{ color: 'inherit', textDecoration: 'none' }}>
            {t('footer.legal')}
          </a>
        </p>
      </footer>
    </div>
  );
};

export default HomePage;
