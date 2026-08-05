// src/logic/ClientManager.js
import { db, auth } from '../config/firebase';
import { collection, addDoc, setDoc, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { escapeHtml } from './ContactManager';
import { OrderStatus } from '../domain/orderStatus';

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
        langue: infosSup.langue || 'fr',
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
    } catch {
      return { success: false };
    }
  },

  deconnexion: async () => {
    await signOut(auth);
  },

  sauvegarderCommande: async (detailsCommande) => {
    try {
      const user = auth.currentUser;
      const docRef = await addDoc(collection(db, "commandes"), {
        clientId: user ? user.uid : "anonyme",
        date: new Date().toLocaleDateString(),
        ...detailsCommande,
        statut: OrderStatus.RECEIVED,
      });

      const destinataire = user?.email || detailsCommande.clientProfile?.email;
      if (destinataire) {
        const numero = docRef.id.slice(0, 8).toUpperCase();
        const univers = detailsCommande.configuration?.universTitle || 'Configuration';
        const quantite = detailsCommande.configuration?.values?.quantite || 1;
        const total = Number(detailsCommande.total || 0).toFixed(2);

        await addDoc(collection(db, 'mail'), {
          to: [destinataire],
          message: {
            subject: `Confirmation de votre commande #${numero} — L'Écrin Français`,
            text: [
              `Merci pour votre commande auprès de L'Écrin Français.`,
              '',
              `Numéro de commande : ${numero}`,
              `Univers : ${univers}`,
              `Quantité : ${quantite}`,
              `Total estimé : ${total} €`,
              '',
              `Notre atelier revient vers vous très prochainement pour confirmer les détails de fabrication.`,
            ].join('\n'),
            html: [
              `<p>Merci pour votre commande auprès de <strong>L'Écrin Français</strong>.</p>`,
              `<p><strong>Numéro de commande :</strong> ${escapeHtml(numero)}</p>`,
              `<p><strong>Univers :</strong> ${escapeHtml(univers)}</p>`,
              `<p><strong>Quantité :</strong> ${escapeHtml(quantite)}</p>`,
              `<p><strong>Total estimé :</strong> ${escapeHtml(total)} €</p>`,
              `<p>Notre atelier revient vers vous très prochainement pour confirmer les détails de fabrication.</p>`,
            ].join(''),
          },
          createdAt: new Date().toISOString(),
        });
      }

      return { success: true, id: docRef.id };
    } catch {
      return { success: false };
    }
  },

  getProfile: async (userId) => {
    try {
      const ref = doc(db, "clients", userId);
      const snapshot = await getDoc(ref);
      return snapshot.exists() ? snapshot.data() : {};
    } catch {
      return {};
    }
  },

  updateProfile: async (userId, profile) => {
    try {
      await setDoc(doc(db, "clients", userId), {
        ...profile,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  getOrders: async (userId) => {
    try {
      const q = query(collection(db, "commandes"), where("clientId", "==", userId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() }));
    } catch {
      return [];
    }
  },

  getProjects: async (userId) => {
    try {
      const q = query(collection(db, "configurations"), where("userId", "==", userId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() }));
    } catch {
      return [];
    }
  },

  saveMessage: async (userId, payload) => {
    try {
      const ref = await addDoc(collection(db, "messages"), { userId, ...payload });
      return { success: true, id: ref.id };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
};