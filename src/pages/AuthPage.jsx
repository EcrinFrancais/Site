// src/pages/AuthPage.jsx
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ClientManager } from '../logic/ClientManager';
import { useAuth } from '../context/AuthContext';

export default function AuthPage({ onStart }) {
  const { t, i18n } = useTranslation('auth');
  const { user, loading } = useAuth();
  const location = useLocation();
  const redirectTo = location.state?.from || '/univers';
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

  useEffect(() => {
    if (!loading && user) {
      onStart(redirectTo);
    }
  }, [loading, user, onStart, redirectTo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLogin) {
      const res = await ClientManager.connexion(email, password);
      if (res.success) onStart(redirectTo);
      else alert(t('errors.invalidCredentials'));
    } else {
      // Vérification des mots de passe
      if (password !== confirmPassword) {
        alert(t('errors.passwordMismatch'));
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
        langue: i18n.language,
      });
      if (res.success) onStart(redirectTo);
      else alert(t('errors.genericPrefix') + res.error);
    }
  };

  if (loading || user) {
    return null;
  }

  return (
    <div className="auth-page-container">
      <div className="auth-overlay"></div>

      <div className="auth-luxury-card">
        <h3 className="auth-brand">{t('brand', { ns: 'common' })}</h3>

        <h2>{isLogin ? t('titleLogin') : t('titleSignup')}</h2>
        <p className="auth-subtitle">
          {isLogin
            ? t('subtitleLogin')
            : t('subtitleSignup')}
        </p>

        <div className={!isLogin ? 'scrollable-form' : ''}>
          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="luxury-toggle">
                <span
                  className={type === 'particulier' ? 'active' : ''}
                  onClick={() => setType('particulier')}
                >
                  {t('toggle.particulier')}
                </span>
                <span
                  className={type === 'entreprise' ? 'active' : ''}
                  onClick={() => setType('entreprise')}
                >
                  {t('toggle.entreprise')}
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
                {t('email.label')} {!isLogin ? t('email.signupSuffix') : ''}
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
                <label>{t('password.login')}</label>
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
                  <label>{t('password.create')}</label>
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <input
                    type="password"
                    placeholder=" "
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <label>{t('password.confirm')}</label>
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
                        {t('civility.placeholder')}
                      </option>
                      <option value="Monsieur">{t('civility.monsieur')}</option>
                      <option value="Madame">{t('civility.madame')}</option>
                      <option value="Non défini">{t('civility.autre')}</option>
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
                    <label>{t('firstName')}</label>
                  </div>
                  <div className="input-group" style={{ flex: 1 }}>
                    <input
                      type="text"
                      placeholder=" "
                      value={nomFamille}
                      onChange={(e) => setNomFamille(e.target.value)}
                      required
                    />
                    <label>{t('lastName')}</label>
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
                      <label>{t('company')}</label>
                    </div>
                    <div className="input-group" style={{ flex: 1 }}>
                      <input
                        type="text"
                        placeholder=" "
                        value={siret}
                        onChange={(e) => setSiret(e.target.value)}
                        required
                      />
                      <label>{t('siret')}</label>
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
                    <label>{t('phone')}</label>
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
                    <label>{t('address.number')}</label>
                  </div>
                  <div className="input-group" style={{ flex: 1.6 }}>
                    <input
                      type="text"
                      placeholder=" "
                      value={voie}
                      onChange={(e) => setVoie(e.target.value)}
                      required
                    />
                    <label>{t('address.street')}</label>
                  </div>
                </div>

                <div className="input-group">
                  <input
                    type="text"
                    placeholder=" "
                    value={complementVoie}
                    onChange={(e) => setComplementVoie(e.target.value)}
                  />
                  <label>{t('address.complement')}</label>
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
                    <label>{t('address.postalCode')}</label>
                  </div>
                  <div className="input-group" style={{ flex: 1.3 }}>
                    <input
                      type="text"
                      placeholder=" "
                      value={ville}
                      onChange={(e) => setVille(e.target.value)}
                      required
                    />
                    <label>{t('address.city')}</label>
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
                  <label>{t('address.country')}</label>
                </div>

                {/* --- 5. PRÉFÉRENCES --- */}
                <div className="input-group">
                  <select
                    value={passion}
                    onChange={(e) => setPassion(e.target.value)}
                    required
                  >
                    <option value="" disabled>
                      {t('passion.placeholder')}
                    </option>
                    <option value="vins">{t('passion.vins')}</option>
                    <option value="horlogerie">{t('passion.horlogerie')}</option>
                    <option value="joaillerie">{t('passion.joaillerie')}</option>
                    <option value="cigares">{t('passion.cigares')}</option>
                    <option value="autre">{t('passion.autre')}</option>
                  </select>
                </div>

                <div className="input-group" style={{ marginBottom: '25px' }}>
                  <textarea
                    placeholder=" "
                    value={attente}
                    onChange={(e) => setAttente(e.target.value)}
                    rows="2"
                  ></textarea>
                  <label>{t('expectation')}</label>
                </div>
              </>
            )}

            <button className="btn-gold-solid" type="submit">
              {isLogin
                ? t('submitLogin')
                : t('submitSignup')}
            </button>
          </form>
        </div>

        <div className="auth-footer">
          <span onClick={() => setIsLogin(!isLogin)}>
            {isLogin
              ? t('switchToSignup')
              : t('switchToLogin')}
          </span>
        </div>
      </div>
    </div>
  );
}
