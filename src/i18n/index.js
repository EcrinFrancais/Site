import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import commonFr from './locales/fr/common.json';
import headerFr from './locales/fr/header.json';
import homeFr from './locales/fr/home.json';
import universFr from './locales/fr/univers.json';
import authFr from './locales/fr/auth.json';
import profileFr from './locales/fr/profile.json';
import clientSpaceFr from './locales/fr/clientSpace.json';
import configuratorFr from './locales/fr/configurator.json';
import aboutFr from './locales/fr/about.json';
import contactFr from './locales/fr/contact.json';
import legalFr from './locales/fr/legal.json';
import orderSummaryFr from './locales/fr/orderSummary.json';

import commonEn from './locales/en/common.json';
import headerEn from './locales/en/header.json';
import homeEn from './locales/en/home.json';
import universEn from './locales/en/univers.json';
import authEn from './locales/en/auth.json';
import profileEn from './locales/en/profile.json';
import clientSpaceEn from './locales/en/clientSpace.json';
import configuratorEn from './locales/en/configurator.json';
import aboutEn from './locales/en/about.json';
import contactEn from './locales/en/contact.json';
import legalEn from './locales/en/legal.json';
import orderSummaryEn from './locales/en/orderSummary.json';

export const supportedLanguages = [
  { code: 'fr', label: 'FR' },
  { code: 'en', label: 'EN' },
];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: {
        common: commonFr,
        header: headerFr,
        home: homeFr,
        univers: universFr,
        auth: authFr,
        profile: profileFr,
        clientSpace: clientSpaceFr,
        configurator: configuratorFr,
        about: aboutFr,
        contact: contactFr,
        legal: legalFr,
        orderSummary: orderSummaryFr,
      },
      en: {
        common: commonEn,
        header: headerEn,
        home: homeEn,
        univers: universEn,
        auth: authEn,
        profile: profileEn,
        clientSpace: clientSpaceEn,
        configurator: configuratorEn,
        about: aboutEn,
        contact: contactEn,
        legal: legalEn,
        orderSummary: orderSummaryEn,
      },
    },
    fallbackLng: 'fr',
    supportedLngs: ['fr', 'en'],
    nonExplicitSupportedLngs: true,
    defaultNS: 'common',
    ns: [
      'common',
      'header',
      'home',
      'univers',
      'auth',
      'profile',
      'clientSpace',
      'configurator',
      'about',
      'contact',
      'legal',
      'orderSummary',
    ],
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'ecrinFrancais.lang',
    },
    interpolation: {
      escapeValue: false,
    },
  });

i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
});
document.documentElement.lang = i18n.resolvedLanguage || i18n.language || 'fr';

export default i18n;
