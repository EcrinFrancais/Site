import React, { useState } from 'react';
import HomePage from './pages/HomePage';
import ConfiguratorPage from './pages/ConfiguratorPage';
import AuthPage from './pages/AuthPage';
import ChoixUnivers from './pages/ChoixUnivers'; // 👈 Nouvel import (à placer dans le dossier pages)
import './App.css';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  // 👈 Nouvel état pour mémoriser l'univers choisi (vins, joaillerie, etc.)
  const [universChoisi, setUniversChoisi] = useState(null);

  // 👈 Nouvelle fonction pour gérer le clic sur un univers
  const handleSelectUnivers = (idUnivers) => {
    setUniversChoisi(idUnivers);
    setCurrentPage('config'); // On passe au configurateur
  };

  return (
    <div className="app">
      {/* L'accueil mène à l'authentification */}
      {currentPage === 'home' && (
        <HomePage onStart={() => setCurrentPage('auth')} />
      )}

      {/* L'authentification mène maintenant à l'univers */}
      {currentPage === 'auth' && (
        <AuthPage onStart={() => setCurrentPage('univers')} />
      )}

      {/* 👈 NOUVELLE ÉTAPE : Le choix de l'univers */}
      {currentPage === 'univers' && (
        <ChoixUnivers onSelectUnivers={handleSelectUnivers} />
      )}

      {/* Le configurateur reçoit la donnée "univers" pour afficher les bons produits */}
      {currentPage === 'config' && (
        <ConfiguratorPage
          onStart={() => setCurrentPage('home')}
          univers={universChoisi}
        />
      )}
    </div>
  );
}
