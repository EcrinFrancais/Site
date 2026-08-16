import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import textureNoyer from '../textures/noyer.jpg';
import textureEbene from '../textures/ebene.jpg';

// Photos libres de droits (licence Unsplash), en attendant de vraies photos
// d'atelier — à remplacer dès que la manufacture fournit ses propres clichés.
const photoJoaillerieHorlogerie = 'https://images.unsplash.com/photo-1549315309-f0857a904065?auto=format&fit=crop&w=1200&q=80';
const photoFacsonnage = 'https://images.unsplash.com/photo-1497219055242-93359eeed651?auto=format&fit=crop&w=1200&q=80';

const styles = {
  page: {
    backgroundColor: '#0b0b0b',
    color: '#eaeaea',
    fontFamily: "'Montserrat', sans-serif",
  },
  hero: {
    backgroundImage: `linear-gradient(rgba(0,0,0,0.78), rgba(0,0,0,0.6)), url(${textureNoyer})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    padding: '76px 24px 52px',
    textAlign: 'center',
    borderBottom: '3px solid #c5a059',
  },
  eyebrow: {
    fontSize: '0.72rem',
    letterSpacing: '0.24em',
    textTransform: 'uppercase',
    color: '#c5a059',
    marginBottom: '14px',
  },
  heroTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 'clamp(2rem, 3.6vw, 2.9rem)',
    color: '#f2e0b4',
    maxWidth: '900px',
    margin: '0 auto 16px',
    lineHeight: 1.2,
  },
  heroSubtitle: {
    fontFamily: "'Playfair Display', serif",
    fontStyle: 'italic',
    fontSize: '1.1rem',
    maxWidth: '640px',
    margin: '0 auto',
    color: '#e7dcc0',
    lineHeight: 1.7,
    opacity: 0.9,
  },
  section: {
    padding: '100px 24px',
    maxWidth: '1180px',
    margin: '0 auto',
  },
  sectionNarrow: {
    padding: '100px 24px',
    maxWidth: '820px',
    margin: '0 auto',
    textAlign: 'center',
  },
  sectionTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '2.2rem',
    color: '#c5a059',
    marginBottom: '20px',
    textAlign: 'center',
  },
  lead: {
    color: '#b8af96',
    lineHeight: 1.9,
    fontSize: '1.02rem',
    marginBottom: '18px',
  },
  storyLayout: {
    display: 'grid',
    gridTemplateColumns: '0.95fr 1.05fr',
    gap: '48px',
    alignItems: 'center',
  },
  storyImage: {
    position: 'relative',
    minHeight: '440px',
    borderRadius: '24px',
    overflow: 'hidden',
    border: '1px solid rgba(197,160,89,0.18)',
    boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
  },
  storyImageImg: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    filter: 'saturate(0.85) contrast(1.05)',
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '26px',
    marginTop: '48px',
  },
  card: {
    padding: '32px 26px',
    border: '1px solid rgba(197,160,89,0.18)',
    borderRadius: '18px',
    background: 'linear-gradient(145deg, rgba(255,255,255,0.04), rgba(197,160,89,0.06))',
    textAlign: 'left',
  },
  cardIcon: { fontSize: '1.6rem', color: '#efd8a3', display: 'block', marginBottom: '14px' },
  cardTitle: { fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', color: '#f3e7c4', marginBottom: '10px' },
  cardText: { color: '#b9b2a3', lineHeight: 1.7, fontSize: '0.92rem' },
  gallerySection: {
    padding: '0 24px 100px',
    maxWidth: '1180px',
    margin: '0 auto',
  },
  galleryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '26px',
    marginTop: '48px',
  },
  galleryImageWrap: {
    position: 'relative',
    minHeight: '320px',
    borderRadius: '20px',
    overflow: 'hidden',
    border: '1px solid rgba(197,160,89,0.18)',
    boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
  },
  galleryImg: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    filter: 'saturate(0.9) contrast(1.05)',
  },
  galleryCaption: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: '20px 22px',
    background: 'linear-gradient(0deg, rgba(0,0,0,0.82), transparent)',
    color: '#f3e7c4',
    fontSize: '0.85rem',
    lineHeight: 1.5,
  },
  processSection: {
    padding: '100px 24px',
    background: 'linear-gradient(180deg, #101010 0%, #0a0a0a 100%)',
  },
  processGrid: {
    maxWidth: '1180px',
    margin: '56px auto 0',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '2px',
    background: 'rgba(197,160,89,0.18)',
  },
  processStep: {
    background: '#0d0d0d',
    padding: '32px 22px',
  },
  processNumber: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '1.6rem',
    color: '#c5a059',
    marginBottom: '14px',
  },
  processTitle: { color: '#f3e7c4', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' },
  processText: { color: '#948a76', fontSize: '0.86rem', lineHeight: 1.7 },
  valuesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '30px',
    marginTop: '50px',
  },
  valueItem: { textAlign: 'center' },
  valueTitle: { fontFamily: "'Playfair Display', serif", color: '#c5a059', fontSize: '1.15rem', marginBottom: '10px' },
  valueText: { color: '#a79c86', fontSize: '0.9rem', lineHeight: 1.7 },
  ctaSection: {
    padding: '100px 24px 130px',
    textAlign: 'center',
  },
  ctaButtons: { display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '32px' },
  ctaPrimary: {
    padding: '16px 34px',
    background: 'linear-gradient(135deg, rgba(197,160,89,0.16), rgba(197,160,89,0.3))',
    color: '#f6efd8',
    border: '1px solid rgba(197,160,89,0.45)',
    fontSize: '0.86rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
    borderRadius: '999px',
    textDecoration: 'none',
    display: 'inline-block',
  },
  ctaSecondary: {
    padding: '16px 34px',
    background: 'transparent',
    color: '#c5a059',
    border: '1px solid rgba(197,160,89,0.4)',
    fontSize: '0.86rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
    borderRadius: '999px',
    textDecoration: 'none',
    display: 'inline-block',
  },
};

export default function AboutPage() {
  const { t } = useTranslation('about');
  return (
    <div style={styles.page}>
      <header style={styles.hero}>
        <div style={styles.eyebrow}>{t('eyebrow')}</div>
        <h1 style={styles.heroTitle}>{t('heroTitle')}</h1>
        <p style={styles.heroSubtitle}>
          {t('heroSubtitle')}
        </p>
      </header>

      <section style={styles.section}>
        <div style={styles.storyLayout}>
          <div style={styles.storyImage}>
            <img
              src={textureEbene}
              style={styles.storyImageImg}
              alt={t('storyImageAlt')}
            />
          </div>
          <div>
            <h2 style={{ ...styles.sectionTitle, textAlign: 'left' }}>{t('story.title')}</h2>
            <p style={styles.lead}>
              {t('story.lead1')}
            </p>
            <p style={styles.lead}>
              {t('story.lead2')}
            </p>
            <p style={styles.lead}>
              {t('story.lead3')}
            </p>
            <p style={styles.lead}>
              {t('story.lead4')}
            </p>
          </div>
        </div>

        <div style={styles.cardsGrid}>
          <div style={styles.card}>
            <span style={styles.cardIcon}>✦</span>
            <h3 style={styles.cardTitle}>{t('cards.card1.title')}</h3>
            <p style={styles.cardText}>
              {t('cards.card1.text')}
            </p>
          </div>
          <div style={styles.card}>
            <span style={styles.cardIcon}>✎</span>
            <h3 style={styles.cardTitle}>{t('cards.card2.title')}</h3>
            <p style={styles.cardText}>
              {t('cards.card2.text')}
            </p>
          </div>
          <div style={styles.card}>
            <span style={styles.cardIcon}>∞</span>
            <h3 style={styles.cardTitle}>{t('cards.card3.title')}</h3>
            <p style={styles.cardText}>
              {t('cards.card3.text')}
            </p>
          </div>
        </div>
      </section>

      <section style={styles.gallerySection}>
        <div style={styles.galleryGrid}>
          <div style={styles.galleryImageWrap}>
            <img src={photoJoaillerieHorlogerie} style={styles.galleryImg} alt={t('gallery.image1Alt')} />
            <div style={styles.galleryCaption}>{t('gallery.image1Caption')}</div>
          </div>
          <div style={styles.galleryImageWrap}>
            <img src={photoFacsonnage} style={styles.galleryImg} alt={t('gallery.image2Alt')} />
            <div style={styles.galleryCaption}>{t('gallery.image2Caption')}</div>
          </div>
        </div>
      </section>

      <section style={styles.processSection}>
        <h2 style={styles.sectionTitle}>{t('process.title')}</h2>
        <p style={{ ...styles.lead, maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
          {t('process.intro')}
        </p>
        <div style={styles.processGrid}>
          <div style={styles.processStep}>
            <div style={styles.processNumber}>01</div>
            <div style={styles.processTitle}>{t('process.steps.step1.title')}</div>
            <p style={styles.processText}>
              {t('process.steps.step1.text')}
            </p>
          </div>
          <div style={styles.processStep}>
            <div style={styles.processNumber}>02</div>
            <div style={styles.processTitle}>{t('process.steps.step2.title')}</div>
            <p style={styles.processText}>
              {t('process.steps.step2.text')}
            </p>
          </div>
          <div style={styles.processStep}>
            <div style={styles.processNumber}>03</div>
            <div style={styles.processTitle}>{t('process.steps.step3.title')}</div>
            <p style={styles.processText}>
              {t('process.steps.step3.text')}
            </p>
          </div>
          <div style={styles.processStep}>
            <div style={styles.processNumber}>04</div>
            <div style={styles.processTitle}>{t('process.steps.step4.title')}</div>
            <p style={styles.processText}>
              {t('process.steps.step4.text')}
            </p>
          </div>
          <div style={styles.processStep}>
            <div style={styles.processNumber}>05</div>
            <div style={styles.processTitle}>{t('process.steps.step5.title')}</div>
            <p style={styles.processText}>
              {t('process.steps.step5.text')}
            </p>
          </div>
        </div>
      </section>

      <section style={styles.sectionNarrow}>
        <h2 style={styles.sectionTitle}>{t('values.title')}</h2>
        <div style={styles.valuesGrid}>
          <div style={styles.valueItem}>
            <div style={styles.valueTitle}>{t('values.excellence.title')}</div>
            <p style={styles.valueText}>{t('values.excellence.text')}</p>
          </div>
          <div style={styles.valueItem}>
            <div style={styles.valueTitle}>{t('values.discretion.title')}</div>
            <p style={styles.valueText}>{t('values.discretion.text')}</p>
          </div>
          <div style={styles.valueItem}>
            <div style={styles.valueTitle}>{t('values.surMesure.title')}</div>
            <p style={styles.valueText}>{t('values.surMesure.text')}</p>
          </div>
          <div style={styles.valueItem}>
            <div style={styles.valueTitle}>{t('values.durabilite.title')}</div>
            <p style={styles.valueText}>{t('values.durabilite.text')}</p>
          </div>
        </div>
      </section>

      <section style={styles.ctaSection}>
        <h2 style={styles.sectionTitle}>{t('cta.title')}</h2>
        <p style={{ ...styles.lead, maxWidth: '560px', margin: '0 auto', textAlign: 'center' }}>
          {t('cta.lead')}
        </p>
        <div style={styles.ctaButtons}>
          <Link to="/univers" style={styles.ctaPrimary}>{t('cta.primary')}</Link>
          <Link to="/contact" style={styles.ctaSecondary}>{t('cta.secondary')}</Link>
        </div>
      </section>
    </div>
  );
}
