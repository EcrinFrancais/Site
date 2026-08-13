// src/logic/SiteAnalyticsService.js
//
// En plus de Firebase Analytics (GA4, voir AnalyticsService.js), on écrit un
// événement léger dans Firestore à chaque visite : c'est ce qui alimente
// l'onglet "Audience" du back office (nombre de connexions, origine, pages
// consultées, par semaine) directement dans l'admin, sans avoir besoin
// d'aller chercher les chiffres dans la console Google Analytics.
//
// Deux collections :
// - "visites" : un document par session de navigation (premier chargement
//   de l'onglet), avec le référent (d'où vient le visiteur).
// - "pageVues" : un document par page consultée au sein de cette session.
//
// Même déclenchement que GA4 (gated par le consentement "mesure d'audience"
// du bandeau cookies) et même philosophie best-effort : un échec d'écriture
// ne doit jamais bloquer la navigation du visiteur.
import { db } from '../config/firebase';
import { collection, addDoc } from 'firebase/firestore';

const SESSION_ID_KEY = 'ecrinFrancais.analyticsSessionId';
const SESSION_RECORDED_KEY = 'ecrinFrancais.analyticsSessionRecorded';

function getSessionId() {
  let id = window.sessionStorage.getItem(SESSION_ID_KEY);
  if (!id) {
    id = `s-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    window.sessionStorage.setItem(SESSION_ID_KEY, id);
  }
  return id;
}

function getReferrerDomain() {
  if (!document.referrer) return 'direct';
  try {
    const host = new URL(document.referrer).hostname.replace(/^www\./, '');
    return host === window.location.hostname ? 'direct' : host;
  } catch {
    return 'direct';
  }
}

export const SiteAnalyticsService = {
  recordPageView: async (path) => {
    const sessionId = getSessionId();

    if (window.sessionStorage.getItem(SESSION_RECORDED_KEY) !== '1') {
      window.sessionStorage.setItem(SESSION_RECORDED_KEY, '1');
      try {
        await addDoc(collection(db, 'visites'), {
          sessionId,
          referrerDomain: getReferrerDomain(),
          landingPath: path,
          createdAt: new Date().toISOString(),
        });
      } catch {
        // best-effort : ne doit jamais gêner la navigation du visiteur
      }
    }

    try {
      await addDoc(collection(db, 'pageVues'), {
        sessionId,
        path,
        createdAt: new Date().toISOString(),
      });
    } catch {
      // best-effort
    }
  },
};
