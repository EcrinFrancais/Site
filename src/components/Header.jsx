import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useUnsavedChanges } from '../context/UnsavedChangesContext';
import { ClientManager } from '../logic/ClientManager';
import { supportedLanguages } from '../i18n';
import UnsavedChangesModal from './UnsavedChangesModal';

export const HEADER_HEIGHT = 64;

const styles = {
  bar: {
    position: 'sticky',
    top: 0,
    zIndex: 200,
    height: `${HEADER_HEIGHT}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    padding: '0 28px',
    background: 'linear-gradient(180deg, #151210, #0f0d0b)',
    borderBottom: '1px solid rgba(197, 160, 89, 0.22)',
    boxSizing: 'border-box',
    fontFamily: 'Montserrat, sans-serif',
  },
  brand: { display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', flexShrink: 0 },
  brandMark: {
    width: '32px',
    height: '32px',
    border: '1px solid #c5a059',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Playfair Display, serif',
    color: '#c5a059',
    fontSize: '0.85rem',
    flexShrink: 0,
  },
  brandWord: {
    fontFamily: 'Playfair Display, serif',
    fontSize: '0.82rem',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: '#f5ebd7',
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
  },
  nav: { display: 'flex', alignItems: 'center', gap: '26px' },
  navLink: {
    fontSize: '0.72rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    textDecoration: 'none',
    paddingBottom: '4px',
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    whiteSpace: 'nowrap',
  },
  pillButton: {
    fontSize: '0.72rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#c5a059',
    background: 'transparent',
    border: '1px solid rgba(197, 160, 89, 0.5)',
    borderRadius: '999px',
    padding: '8px 18px',
    cursor: 'pointer',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  rightGroup: { display: 'flex', alignItems: 'center', gap: '18px', flexShrink: 0 },
  cartButton: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '38px',
    height: '38px',
    border: '1px solid rgba(197, 160, 89, 0.22)',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.02)',
    color: '#c5a059',
    textDecoration: 'none',
    flexShrink: 0,
  },
  cartBadge: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    minWidth: '16px',
    height: '16px',
    padding: '0 4px',
    borderRadius: '999px',
    background: '#c5a059',
    color: '#151210',
    fontSize: '0.62rem',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #151210',
    boxSizing: 'content-box',
  },
  accountWrap: { position: 'relative', flexShrink: 0 },
  accountButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '5px 12px 5px 5px',
    border: '1px solid rgba(197, 160, 89, 0.22)',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.02)',
    cursor: 'pointer',
    color: '#f5ebd7',
  },
  avatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: 'rgba(197, 160, 89, 0.16)',
    color: '#c5a059',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.68rem',
    fontWeight: 700,
    flexShrink: 0,
  },
  accountName: { fontSize: '0.76rem', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  caret: { color: '#948a76', fontSize: '0.6rem' },
  menu: {
    position: 'absolute',
    top: 'calc(100% + 10px)',
    right: 0,
    width: '230px',
    background: '#17140f',
    border: '1px solid rgba(197, 160, 89, 0.22)',
    borderRadius: '10px',
    boxShadow: '0 20px 40px -12px rgba(0,0,0,0.7)',
    padding: '8px',
  },
  menuEmail: {
    fontSize: '0.7rem',
    color: '#948a76',
    padding: '8px 10px 10px',
    borderBottom: '1px solid rgba(197, 160, 89, 0.22)',
    marginBottom: '6px',
    wordBreak: 'break-all',
  },
  menuItem: {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    background: 'none',
    border: 'none',
    fontSize: '0.78rem',
    color: '#dccfab',
    padding: '9px 10px',
    borderRadius: '6px',
    textDecoration: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  menuItemDanger: { color: '#d88b7c' },
  menuDivider: { height: '1px', background: 'rgba(197, 160, 89, 0.22)', margin: '6px 2px' },
  langSwitch: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    border: '1px solid rgba(197, 160, 89, 0.3)',
    borderRadius: '999px',
    padding: '3px',
    flexShrink: 0,
  },
  langButton: {
    fontSize: '0.68rem',
    letterSpacing: '0.08em',
    color: '#948a76',
    background: 'transparent',
    border: 'none',
    borderRadius: '999px',
    padding: '5px 10px',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  langButtonActive: {
    color: '#0f0d0b',
    background: '#c5a059',
  },
};

function initialsFor(profile, user) {
  const prenom = profile?.prenom?.trim();
  const nom = profile?.nom?.trim();
  if (prenom && nom) return `${prenom[0]}${nom[0]}`.toUpperCase();
  if (user?.email) return user.email[0].toUpperCase();
  return '?';
}

function displayNameFor(profile, user) {
  const prenom = profile?.prenom?.trim();
  const nom = profile?.nom?.trim();
  if (prenom && nom) return `${prenom} ${nom.charAt(0)}.`;
  return user?.email || '';
}

export default function Header() {
  const { user, profile, loading } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('header');
  const { isDirty, runSaveHandler } = useUnsavedChanges();
  const [menuOpen, setMenuOpen] = useState(false);
  // Fonction à exécuter (navigation ou déconnexion) une fois que l'utilisateur
  // a répondu à la modale "modifications non enregistrées". null = modale fermée.
  const [pendingAction, setPendingAction] = useState(null);
  const wrapRef = useRef(null);
  const activeLanguage = (i18n.resolvedLanguage || i18n.language || 'fr').slice(0, 2);

  // Si la page courante (un configurateur) a des modifications non
  // enregistrées, on propose de les enregistrer avant de quitter plutôt que
  // de laisser le lien naviguer directement.
  const guardNavigation = (to) => (event) => {
    if (!isDirty) return;
    event.preventDefault();
    setPendingAction(() => () => navigate(to));
  };

  const handleModalSave = async () => {
    const action = pendingAction;
    const saved = await runSaveHandler();
    setPendingAction(null);
    if (saved && action) action();
  };

  const handleModalDiscard = () => {
    const action = pendingAction;
    setPendingAction(null);
    if (action) action();
  };

  const handleModalCancel = () => {
    setPendingAction(null);
  };

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (event) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  const handleLogout = async (event) => {
    if (isDirty) {
      event.preventDefault();
      setMenuOpen(false);
      setPendingAction(() => async () => {
        await ClientManager.deconnexion();
        navigate('/');
      });
      return;
    }
    setMenuOpen(false);
    await ClientManager.deconnexion();
    navigate('/');
  };

  return (
    <>
    <header style={styles.bar}>
      <Link to="/" style={styles.brand} onClick={guardNavigation('/')}>
        <span style={styles.brandMark}>ÉF</span>
        <span style={styles.brandWord}>L'Écrin Français</span>
      </Link>

      <nav style={styles.nav}>
        <NavLink to="/univers" className="nav-link" style={styles.navLink} onClick={guardNavigation('/univers')}>{t('nav.univers')}</NavLink>
        <NavLink to="/a-propos" className="nav-link" style={styles.navLink} onClick={guardNavigation('/a-propos')}>{t('nav.about')}</NavLink>
        <NavLink to="/contact" className="nav-link" style={styles.navLink} onClick={guardNavigation('/contact')}>{t('nav.contact')}</NavLink>
        <NavLink to="/client" className="nav-link" style={styles.navLink} onClick={guardNavigation('/client')}>{t('nav.client')}</NavLink>
      </nav>

      <div style={styles.rightGroup}>
        <div style={styles.langSwitch}>
          {supportedLanguages.map(({ code, label }) => (
            <button
              key={code}
              type="button"
              onClick={() => i18n.changeLanguage(code)}
              style={code === activeLanguage ? { ...styles.langButton, ...styles.langButtonActive } : styles.langButton}
            >
              {label}
            </button>
          ))}
        </div>

        <Link to="/panier" style={styles.cartButton} onClick={guardNavigation('/panier')} aria-label={t('cart')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8h12l-1 12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 8Z" />
            <path d="M9 8V6a3 3 0 0 1 6 0v2" />
          </svg>
          {count > 0 && <span style={styles.cartBadge}>{count}</span>}
        </Link>

        {!loading && !user && (
          <Link to="/auth" style={styles.pillButton} onClick={guardNavigation('/auth')}>{t('signIn')}</Link>
        )}

        {!loading && user && (
          <div style={styles.accountWrap} ref={wrapRef}>
            <button type="button" style={styles.accountButton} onClick={() => setMenuOpen((open) => !open)}>
              <span style={styles.avatar}>{initialsFor(profile, user)}</span>
              <span style={styles.accountName}>{displayNameFor(profile, user)}</span>
              <span style={styles.caret}>▾</span>
            </button>
            {menuOpen && (
              <div style={styles.menu}>
                <div style={styles.menuEmail}>{user.email}</div>
                <Link
                  to="/profil"
                  style={styles.menuItem}
                  onClick={(event) => {
                    guardNavigation('/profil')(event);
                    if (!isDirty) setMenuOpen(false);
                  }}
                >
                  {t('menu.profile')}
                </Link>
                <Link
                  to="/client"
                  style={styles.menuItem}
                  onClick={(event) => {
                    guardNavigation('/client')(event);
                    if (!isDirty) setMenuOpen(false);
                  }}
                >
                  {t('menu.projects')}
                </Link>
                <div style={styles.menuDivider}></div>
                <button type="button" style={{ ...styles.menuItem, ...styles.menuItemDanger }} onClick={handleLogout}>
                  {t('menu.signOut')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
    {pendingAction && (
      <UnsavedChangesModal onSave={handleModalSave} onDiscard={handleModalDiscard} onCancel={handleModalCancel} />
    )}
    </>
  );
}
