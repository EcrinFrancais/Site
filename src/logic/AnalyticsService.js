// src/logic/AnalyticsService.js
//
// Firebase Analytics (Google Analytics 4), choisi car le projet Firebase est
// déjà utilisé pour Auth/Firestore/Hosting (pas de nouveau compte, gratuit
// sans carte) et un `measurementId` GA4 est déjà configuré dans
// config/firebase.js. Initialisation strictement paresseuse : le SDK n'est
// chargé/instancié qu'au moment où le client accepte les cookies "mesure
// d'audience" dans le bandeau (CookieConsentContext) — jamais avant, pour
// ne poser aucun cookie sans consentement.
import { app } from '../config/firebase';
import { getAnalytics, isSupported, logEvent, setAnalyticsCollectionEnabled } from 'firebase/analytics';

let analyticsInstance = null;
let supportChecked = false;
let isSupportedResult = false;

async function ensureInstance() {
  if (analyticsInstance) return analyticsInstance;
  if (!supportChecked) {
    isSupportedResult = await isSupported().catch(() => false);
    supportChecked = true;
  }
  if (!isSupportedResult) return null;
  analyticsInstance = getAnalytics(app);
  return analyticsInstance;
}

export const AnalyticsService = {
  enable: async () => {
    const instance = await ensureInstance();
    if (instance) setAnalyticsCollectionEnabled(instance, true);
  },

  disable: () => {
    if (analyticsInstance) setAnalyticsCollectionEnabled(analyticsInstance, false);
  },

  logPageView: async (pathname) => {
    const instance = await ensureInstance();
    if (instance) {
      logEvent(instance, 'page_view', { page_path: pathname, page_location: window.location.href });
    }
  },
};
