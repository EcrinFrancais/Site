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
import jewelryConfiguratorFr from './locales/fr/jewelryConfigurator.json';
import giftBoxConfiguratorFr from './locales/fr/giftBoxConfigurator.json';
import aboutFr from './locales/fr/about.json';
import contactFr from './locales/fr/contact.json';
import legalFr from './locales/fr/legal.json';
import orderSummaryFr from './locales/fr/orderSummary.json';
import cartFr from './locales/fr/cart.json';
import adminFr from './locales/fr/admin.json';
import cookiesFr from './locales/fr/cookies.json';
import reviewsFr from './locales/fr/reviews.json';

import commonEn from './locales/en/common.json';
import headerEn from './locales/en/header.json';
import homeEn from './locales/en/home.json';
import universEn from './locales/en/univers.json';
import authEn from './locales/en/auth.json';
import profileEn from './locales/en/profile.json';
import clientSpaceEn from './locales/en/clientSpace.json';
import configuratorEn from './locales/en/configurator.json';
import jewelryConfiguratorEn from './locales/en/jewelryConfigurator.json';
import giftBoxConfiguratorEn from './locales/en/giftBoxConfigurator.json';
import aboutEn from './locales/en/about.json';
import contactEn from './locales/en/contact.json';
import legalEn from './locales/en/legal.json';
import orderSummaryEn from './locales/en/orderSummary.json';
import cartEn from './locales/en/cart.json';
import adminEn from './locales/en/admin.json';
import cookiesEn from './locales/en/cookies.json';
import reviewsEn from './locales/en/reviews.json';

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
        jewelryConfigurator: jewelryConfiguratorFr,
        giftBoxConfigurator: giftBoxConfiguratorFr,
        about: aboutFr,
        contact: contactFr,
        legal: legalFr,
        orderSummary: orderSummaryFr,
        cart: cartFr,
        admin: adminFr,
        cookies: cookiesFr,
        reviews: reviewsFr,
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
        jewelryConfigurator: jewelryConfiguratorEn,
        giftBoxConfigurator: giftBoxConfiguratorEn,
        about: aboutEn,
        contact: contactEn,
        legal: legalEn,
        orderSummary: orderSummaryEn,
        cart: cartEn,
        admin: adminEn,
        cookies: cookiesEn,
        reviews: reviewsEn,
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
      'jewelryConfigurator',
      'giftBoxConfigurator',
      'about',
      'contact',
      'legal',
      'orderSummary',
      'cart',
      'admin',
      'cookies',
      'reviews',
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
