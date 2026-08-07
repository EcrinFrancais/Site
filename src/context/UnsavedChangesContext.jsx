import React, { createContext, useCallback, useContext, useRef, useState } from 'react';

// Permet à une page de configurateur de signaler qu'elle a des modifications
// non enregistrées et d'exposer sa propre routine de sauvegarde (avec
// éventuelle demande de nom de projet), pour que la navigation globale
// (en-tête) puisse proposer d'enregistrer avant de quitter la page.
const UnsavedChangesContext = createContext(null);

export function UnsavedChangesProvider({ children }) {
  const [isDirty, setIsDirty] = useState(false);
  const saveHandlerRef = useRef(null);

  const registerSaveHandler = useCallback((handler) => {
    saveHandlerRef.current = handler;
  }, []);

  // Retourne true si on peut poursuivre la navigation (sauvegarde réussie ou
  // absente), false si l'utilisateur a annulé en cours de route (ex. refus de
  // nommer le projet).
  const runSaveHandler = useCallback(async () => {
    if (!saveHandlerRef.current) return true;
    return saveHandlerRef.current();
  }, []);

  const value = { isDirty, setIsDirty, registerSaveHandler, runSaveHandler };

  return <UnsavedChangesContext.Provider value={value}>{children}</UnsavedChangesContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- hook belongs with its provider/context
export function useUnsavedChanges() {
  const ctx = useContext(UnsavedChangesContext);
  if (!ctx) {
    throw new Error('useUnsavedChanges must be used within an UnsavedChangesProvider');
  }
  return ctx;
}
