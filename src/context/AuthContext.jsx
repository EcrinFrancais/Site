import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import i18n from '../i18n';
import { auth } from '../config/firebase';
import { ClientManager } from '../logic/ClientManager';

const AuthContext = createContext({ user: null, profile: null, loading: true });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      if (!firebaseUser) {
        setProfile(null);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) return;
    ClientManager.getProfile(user.uid).then((fetchedProfile) => {
      setProfile(fetchedProfile);
      if (fetchedProfile?.langue && fetchedProfile.langue !== i18n.language) {
        i18n.changeLanguage(fetchedProfile.langue);
      }
    });
  }, [user]);

  // Permet à une page (ex. ProfilePage après enregistrement) de forcer un
  // rechargement du profil, pour que le reste de l'app (ex. le panier au
  // moment de la commande) voie immédiatement les changements.
  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const fetchedProfile = await ClientManager.getProfile(user.uid);
    setProfile(fetchedProfile);
  }, [user]);

  return <AuthContext.Provider value={{ user, profile, loading, refreshProfile }}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- hook belongs with its provider/context
export function useAuth() {
  return useContext(AuthContext);
}
