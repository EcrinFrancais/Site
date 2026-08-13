import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useCookieConsent } from '../context/CookieConsentContext';
import { AnalyticsService } from '../logic/AnalyticsService';
import { SiteAnalyticsService } from '../logic/SiteAnalyticsService';

// Ne fait rien tant que le client n'a pas accepté la mesure d'audience dans
// le bandeau cookies — voir AnalyticsService.js pour le détail.
export default function AnalyticsTracker() {
  const location = useLocation();
  const { consent } = useCookieConsent();
  const analyticsAccepted = consent?.analytics === true;

  useEffect(() => {
    if (analyticsAccepted) {
      AnalyticsService.enable();
    } else {
      AnalyticsService.disable();
    }
  }, [analyticsAccepted]);

  useEffect(() => {
    if (analyticsAccepted) {
      AnalyticsService.logPageView(location.pathname);
      SiteAnalyticsService.recordPageView(location.pathname);
    }
  }, [location.pathname, analyticsAccepted]);

  return null;
}
