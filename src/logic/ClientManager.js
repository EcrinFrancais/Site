// src/logic/ClientManager.js
import { db, auth } from '../config/firebase';
import { collection, addDoc, setDoc, doc } from "firebase/firestore";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

export const ClientManager = {
  inscription: async (email, password, infosSup) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "clients", user.uid), {
        email: email,
        type: infosSup.type,
        // Identité structurée
        genre: infosSup.genre,
        prenom: infosSup.prenom,
        nom: infosSup.nomFamille,
        entreprise: infosSup.entreprise || '',
        siret: infosSup.siret || '',
        // Téléphone international
        telephone: `${infosSup.indicatif} ${infosSup.telephone}`,
        // Adresse structurée
        adresse: {
          numero: infosSup.numeroVoie,
          voie: infosSup.voie,
          complement: infosSup.complementVoie,
          codePostal: infosSup.codePostal,
          ville: infosSup.ville,
          pays: infosSup.pays
        },
        passion: infosSup.passion || '',
        attente: infosSup.attente || '',
        dateInscription: new Date().toLocaleDateString()
      });
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  connexion: async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (e) {
      return { success: false };
    }
  },

  sauvegarderCommande: async (detailsCommande) => {
    try {
      const user = auth.currentUser;
      const docRef = await addDoc(collection(db, "commandes"), {
        clientId: user ? user.uid : "anonyme",
        date: new Date().toLocaleDateString(),
        ...detailsCommande,
        statut: "Nouvelle"
      });
      return { success: true, id: docRef.id };
    } catch (e) {
      return { success: false };
    }
  }
};