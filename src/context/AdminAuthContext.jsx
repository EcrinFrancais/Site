import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const AdminAuthContext = createContext({ adminUser: null, isAdmin: false, loading: true });

export function AdminAuthProvider({ children }) {
  const [adminUser, setAdminUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setAdminUser(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      setAdminUser(firebaseUser);
      try {
        const snapshot = await getDoc(doc(db, 'admins', firebaseUser.uid));
        setIsAdmin(snapshot.exists());
      } catch {
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AdminAuthContext.Provider value={{ adminUser, isAdmin, loading }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- hook belongs with its provider/context
export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
