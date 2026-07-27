// src/pages/AuthPage.jsx
import React, { useState } from 'react';
import { ClientManager } from '../logic/ClientManager';

export default function AuthPage({ onStart }) {
  const [isLogin, setIsLogin] = useState(true);
  const [type, setType] = useState('particulier');

  // Identifiants (en premier)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // Le nouveau champ

  // Identité
  const [genre, setGenre] = useState('');
  const [prenom, setPrenom] = useState('');
  const [nomFamille, setNomFamille] = useState('');

  // Pro
  const [entreprise, setEntreprise] = useState('');
  const [siret, setSiret] = useState('');

  // Contact
  const [indicatif, setIndicatif] = useState('+33');
  const [telephone, setTelephone] = useState('');

  // Adresse
  const [numeroVoie, setNumeroVoie] = useState('');
  const [voie, setVoie] = useState('');
  const [complementVoie, setComplementVoie] = useState('');
  const [codePostal, setCodePostal] = useState('');
  const [ville, setVille] = useState('');
  const [pays, setPays] = useState('France');

  // Préférences
  const [passion, setPassion] = useState('');
  const [attente, setAttente] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLogin) {
      const res = await ClientManager.connexion(email, password);
      if (res.success) onStart('config');
      else alert('Identifiants incorrects.');
    } else {
      // Vérification des mots de passe
      if (password !== confirmPassword) {
        alert('Les mots de passe ne correspondent pas. Veuillez vérifier.');
        return; // On arrête tout si ce n'est pas identique
      }

      const res = await ClientManager.inscription(email, password, {
        type,
        genre,
        prenom,
        nomFamille,
        entreprise,
        siret,
        indicatif,
        telephone,
        numeroVoie,
        voie,
        complementVoie,
        codePostal,
        ville,
        pays,
        passion,
        attente,
      });
      if (res.success) onStart('config');
      else alert('Erreur : ' + res.error);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-overlay"></div>

      <div className="auth-luxury-card">
        <h3 className="auth-brand">L'Écrin Français</h3>

        <h2>{isLogin ? 'Espace Privé' : 'Carnet Client'}</h2>
        <p className="auth-subtitle">
          {isLogin
            ? 'Veuillez vous identifier pour accéder à votre atelier.'
            : "Confiez-nous vos coordonnées pour un service d'exception."}
        </p>

        <div className={!isLogin ? 'scrollable-form' : ''}>
          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="luxury-toggle">
                <span
                  className={type === 'particulier' ? 'active' : ''}
                  onClick={() => setType('particulier')}
                >
                  Particulier
                </span>
                <span
                  className={type === 'entreprise' ? 'active' : ''}
                  onClick={() => setType('entreprise')}
                >
                  Entreprise
                </span>
              </div>
            )}

            {/* --- 1. LES IDENTIFIANTS (DÉSORMAIS EN HAUT) --- */}
            <div className="input-group">
              <input
                type="email"
                placeholder=" "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <label>
                Adresse e-mail {!isLogin ? '(Votre identifiant)' : ''}
              </label>
            </div>

            {isLogin ? (
              <div className="input-group">
                <input
                  type="password"
                  placeholder=" "
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <label>Mot de passe</label>
              </div>
            ) : (
              <div className="input-row">
                <div className="input-group" style={{ flex: 1 }}>
                  <input
                    type="password"
                    placeholder=" "
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <label>Créer un mot de passe</label>
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <input
                    type="password"
                    placeholder=" "
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <label>Confirmer le mot de passe</label>
                </div>
              </div>
            )}

            {!isLogin && (
              <>
                {/* --- 2. IDENTITÉ --- */}
                <div className="input-row">
                  <div className="input-group" style={{ flex: 0.5 }}>
                    <select
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      required
                    >
                      <option value="" disabled>
                        Civilité
                      </option>
                      <option value="Monsieur">M.</option>
                      <option value="Madame">Mme</option>
                      <option value="Non défini">Autre</option>
                    </select>
                  </div>
                  <div className="input-group" style={{ flex: 1 }}>
                    <input
                      type="text"
                      placeholder=" "
                      value={prenom}
                      onChange={(e) => setPrenom(e.target.value)}
                      required
                    />
                    <label>Prénom</label>
                  </div>
                  <div className="input-group" style={{ flex: 1 }}>
                    <input
                      type="text"
                      placeholder=" "
                      value={nomFamille}
                      onChange={(e) => setNomFamille(e.target.value)}
                      required
                    />
                    <label>Nom</label>
                  </div>
                </div>

                {type === 'entreprise' && (
                  <div className="input-row">
                    <div className="input-group" style={{ flex: 1.5 }}>
                      <input
                        type="text"
                        placeholder=" "
                        value={entreprise}
                        onChange={(e) => setEntreprise(e.target.value)}
                        required
                      />
                      <label>Nom de l'entreprise</label>
                    </div>
                    <div className="input-group" style={{ flex: 1 }}>
                      <input
                        type="text"
                        placeholder=" "
                        value={siret}
                        onChange={(e) => setSiret(e.target.value)}
                        required
                      />
                      <label>N° SIRET / TVA</label>
                    </div>
                  </div>
                )}

                {/* --- 3. TÉLÉPHONE --- */}
                <div className="input-row">
                  <div className="input-group" style={{ flex: 0.6 }}>
                    <select
                      value={indicatif}
                      onChange={(e) => setIndicatif(e.target.value)}
                      required
                    >
                      <option value="+33">🇫🇷 +33</option>
                      <option value="+32">🇧🇪 +32</option>
                      <option value="+41">🇨🇭 +41</option>
                      <option value="+352">🇱🇺 +352</option>
                      <option value="+1">🇺🇸/🇨🇦 +1</option>
                      <option value="+44">🇬🇧 +44</option>
                    </select>
                  </div>
                  <div className="input-group" style={{ flex: 1.4 }}>
                    <input
                      type="tel"
                      placeholder=" "
                      value={telephone}
                      onChange={(e) => setTelephone(e.target.value)}
                      required
                    />
                    <label>Numéro de téléphone</label>
                  </div>
                </div>

                {/* --- 4. ADRESSE STRUCTURÉE --- */}
                <div className="input-row">
                  <div className="input-group" style={{ flex: 0.4 }}>
                    <input
                      type="text"
                      placeholder=" "
                      value={numeroVoie}
                      onChange={(e) => setNumeroVoie(e.target.value)}
                      required
                    />
                    <label>N°</label>
                  </div>
                  <div className="input-group" style={{ flex: 1.6 }}>
                    <input
                      type="text"
                      placeholder=" "
                      value={voie}
                      onChange={(e) => setVoie(e.target.value)}
                      required
                    />
                    <label>Voie (Rue, Avenue...)</label>
                  </div>
                </div>

                <div className="input-group">
                  <input
                    type="text"
                    placeholder=" "
                    value={complementVoie}
                    onChange={(e) => setComplementVoie(e.target.value)}
                  />
                  <label>Complément (Bâtiment, Étage...) - Option</label>
                </div>

                <div className="input-row">
                  <div className="input-group" style={{ flex: 0.7 }}>
                    <input
                      type="text"
                      placeholder=" "
                      value={codePostal}
                      onChange={(e) => setCodePostal(e.target.value)}
                      required
                    />
                    <label>Code Postal</label>
                  </div>
                  <div className="input-group" style={{ flex: 1.3 }}>
                    <input
                      type="text"
                      placeholder=" "
                      value={ville}
                      onChange={(e) => setVille(e.target.value)}
                      required
                    />
                    <label>Ville</label>
                  </div>
                </div>

                <div className="input-group">
                  <input
                    type="text"
                    placeholder=" "
                    value={pays}
                    onChange={(e) => setPays(e.target.value)}
                    required
                  />
                  <label>Pays</label>
                </div>

                {/* --- 5. PRÉFÉRENCES --- */}
                <div className="input-group">
                  <select
                    value={passion}
                    onChange={(e) => setPassion(e.target.value)}
                    required
                  >
                    <option value="" disabled>
                      Que souhaitez-vous conserver ?
                    </option>
                    <option value="vins">Grands Crus & Spiritueux</option>
                    <option value="horlogerie">Horlogerie de collection</option>
                    <option value="joaillerie">Joaillerie</option>
                    <option value="cigares">Cigares</option>
                    <option value="autre">Autre objet précieux</option>
                  </select>
                </div>

                <div className="input-group" style={{ marginBottom: '25px' }}>
                  <textarea
                    placeholder=" "
                    value={attente}
                    onChange={(e) => setAttente(e.target.value)}
                    rows="2"
                  ></textarea>
                  <label>Une attente particulière ? (Optionnel)</label>
                </div>
              </>
            )}

            <button className="btn-gold-solid" type="submit">
              {isLogin
                ? "Accéder à l'atelier"
                : 'Créer mon dossier et configurer'}
            </button>
          </form>
        </div>

        <div className="auth-footer">
          <span onClick={() => setIsLogin(!isLogin)}>
            {isLogin
              ? 'Nouveau client ? Créer un compte'
              : "Déjà client ? S'identifier"}
          </span>
        </div>
      </div>
    </div>
  );
}
