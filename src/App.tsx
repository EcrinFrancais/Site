import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import ChoixUnivers from './pages/ChoixUnivers';
import ClientSpacePage from './pages/ClientSpacePage';
import ProfilePage from './pages/ProfilePage';
import MentionsLegalesPage from './pages/MentionsLegalesPage';
import OrderSummaryPage from './pages/OrderSummaryPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import { AuthProvider } from './context/AuthContext';
import './App.css';

// Le configurateur embarque Three.js / React Three Fiber : on ne le charge
// que lorsqu'on visite réellement la route, pour garder la page d'accueil légère.
// ConfiguratorRouter aiguille lui-même vers la page vin ou bijouterie selon l'univers.
const ConfiguratorRouter = lazy(() => import('./pages/ConfiguratorRouter'));

export default function App() {
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  return (
    <AuthProvider>
      <div className="app">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage onStart={() => navigate('/auth')} />} />
          <Route path="/auth" element={<AuthPage onStart={() => navigate('/univers')} />} />
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
          <Route path="/commande" element={<OrderSummaryPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}
