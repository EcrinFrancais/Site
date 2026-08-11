import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'ecrinFrancais.cookieConsent';

function readStoredConsent() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStoredConsent(consent) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  } catch {
    // Stockage indisponible (navigation privée stricte, quota...) : le bandeau
    // se réaffichera simplement à la prochaine visite, sans bloquer le site.
  }
}

const CookieConsentContext = createContext(null);

export function CookieConsentProvider({ children }) {
  const [consent, setConsent] = useState(() => readStoredConsent());
  const [forceOpen, setForceOpen] = useState(false);

  useEffect(() => {
    if (consent) writeStoredConsent(consent);
  }, [consent]);

  const acceptAll = useCallback(() => {
    setConsent({ necessary: true, analytics: true, decidedAt: new Date().toISOString() });
    setForceOpen(false);
  }, []);

  const rejectAll = useCallback(() => {
    setConsent({ necessary: true, analytics: false, decidedAt: new Date().toISOString() });
    setForceOpen(false);
  }, []);

  const reopen = useCallback(() => setForceOpen(true), []);

  const value = {
    consent,
    isBannerVisible: forceOpen || !consent,
    acceptAll,
    rejectAll,
    reopen,
  };

  return <CookieConsentContext.Provider value={value}>{children}</CookieConsentContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- hook belongs with its provider/context
export function useCookieConsent() {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) {
    throw new Error('useCookieConsent must be used within a CookieConsentProvider');
  }
  return ctx;
}
