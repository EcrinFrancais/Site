import React, { createContext, useContext, useEffect, useState } from 'react';
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

  return <AuthContext.Provider value={{ user, profile, loading }}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- hook belongs with its provider/context
export function useAuth() {
  return useContext(AuthContext);
}
