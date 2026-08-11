import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import ChoixUnivers from './pages/ChoixUnivers';
import ClientSpacePage from './pages/ClientSpacePage';
import ProfilePage from './pages/ProfilePage';
import MentionsLegalesPage from './pages/MentionsLegalesPage';
import OrderSummaryPage from './pages/OrderSummaryPage';
import CartPage from './pages/CartPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { UnsavedChangesProvider } from './context/UnsavedChangesContext';
import { CookieConsentProvider } from './context/CookieConsentContext';
import CookieConsentBanner from './components/CookieConsentBanner';
import './App.css';

// Le configurateur embarque Three.js / React Three Fiber : on ne le charge
// que lorsqu'on visite réellement la route, pour garder la page d'accueil légère.
// ConfiguratorRouter aiguille lui-même vers la page vin ou bijouterie selon l'univers.
const ConfiguratorRouter = lazy(() => import('./pages/ConfiguratorRouter'));
// Back office indépendant de l'espace client : sa propre auth (AdminAuthProvider),
// son propre chrome (pas de Header client), chargé uniquement sur /admin/*.
const AdminApp = lazy(() => import('./pages/admin/AdminApp'));

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation('common');
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return (
      <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0b0b0b' }} />}>
        <Routes>
          <Route path="/admin/*" element={<AdminApp />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <AuthProvider>
      <CartProvider>
        <UnsavedChangesProvider>
          <CookieConsentProvider>
            <div className="app">
              <Header />
              <Routes>
                <Route path="/" element={<HomePage onStart={() => navigate('/univers')} />} />
                <Route path="/auth" element={<AuthPage onStart={(path) => navigate(path || '/univers')} />} />
                <Route
                  path="/univers"
                  element={<ChoixUnivers onSelectUnivers={(id) => navigate(`/config/${id}`)} />}
                />
                <Route
                  path="/config/:universId"
                  element={
                    <Suspense fallback={<div className="configurator-loading">{t('loading.workshop')}</div>}>
                      <ConfiguratorRouter />
                    </Suspense>
                  }
                />
                <Route
                  path="/client"
                  element={
                    <ProtectedRoute>
                      <ClientSpacePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profil"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/mentions-legales" element={<MentionsLegalesPage />} />
                <Route path="/a-propos" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/panier" element={<CartPage />} />
                <Route path="/commande" element={<OrderSummaryPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <CookieConsentBanner />
            </div>
          </CookieConsentProvider>
        </UnsavedChangesProvider>
      </CartProvider>
    </AuthProvider>
  );
}
