// src/logic/ClientManager.js
import { db, auth } from '../config/firebase';
import { collection, addDoc, setDoc, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { escapeHtml } from './ContactManager';
import { EmailService } from './EmailService';
import { OrderStatus } from '../domain/orderStatus';
import { createOrderDraft } from './orderModel';
import { estimateShippingCost } from './shippingService';
import { StorageService } from './StorageService';
import { OrderPdfService } from './OrderPdfService';

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

        await EmailService.envoyer({
          toEmail: destinataire,
          subject: `Confirmation de votre commande #${numero} — L'Écrin Français`,
          messageHtml: [
            `<p>Merci pour votre commande auprès de <strong>L'Écrin Français</strong>.</p>`,
            `<p><strong>Numéro de commande :</strong> ${escapeHtml(numero)}</p>`,
            `<p><strong>Univers :</strong> ${escapeHtml(univers)}</p>`,
            `<p><strong>Quantité :</strong> ${escapeHtml(quantite)}</p>`,
            `<p><strong>Total estimé :</strong> ${escapeHtml(total)} €</p>`,
            `<p>Notre atelier revient vers vous très prochainement pour confirmer les détails de fabrication.</p>`,
          ].join(''),
        });
      }

      return { success: true, id: docRef.id };
    } catch {
      return { success: false };
    }
  },

  sauvegarderPanier: async (cartItems, profile) => {
    try {
      const user = auth.currentUser;
      const basketId = `basket-${Date.now()}`;
      const shippingCostTTC = estimateShippingCost(cartItems);
      const totalWeightKg = cartItems.reduce((sum, item) => sum + Number(item.estimatedWeightKg || 0), 0);
      const numero = basketId.slice(-8).toUpperCase();
      const lignes = cartItems.map((item) => {
        const univers = item.universTitle || item.configuration?.universTitle || 'Configuration';
        const quantite = item.quantite || 1;
        const total = Number(item.quote?.totalTTC || 0).toFixed(2);
        return `- ${univers} — Quantité : ${quantite} — Total : ${total} €`;
      });
      const totalGeneral = (
        cartItems.reduce((sum, item) => sum + Number(item.quote?.totalTTC || 0), 0) + shippingCostTTC
      ).toFixed(2);

      // PDF récapitulatif : généré côté client (jsPDF, gratuit) et stocké sur
      // Cloudinary (voir StorageService.js) — AVANT la création des commandes,
      // pour pouvoir inclure pdfUrl dès le addDoc ci-dessous. Les règles
      // Firestore autorisent la création d'une commande par n'importe qui,
      // mais réservent sa modification aux admins (protection du back
      // office) : une mise à jour ultérieure du champ pdfUrl échouerait donc
      // silencieusement. EmailJS ne peut pas joindre de fichier binaire sur
      // son forfait gratuit, donc le mail contient un lien plutôt qu'une
      // vraie pièce jointe.
      let pdfUrl = null;
      try {
        const pdfBlob = OrderPdfService.genererRecapitulatif({
          numero,
          date: new Date().toLocaleDateString(),
          items: cartItems,
          shippingCostTTC,
          totalGeneral,
          profile,
        });
        pdfUrl = await StorageService.upload(`commandes/${basketId}`, pdfBlob, 'application/pdf');
      } catch {
        // Le PDF est un plus, pas un bloquant : la commande reste valide sans lui.
      }

      // Chaque article du panier devient sa propre commande Firestore ; les
      // écritures sont indépendantes les unes des autres et peuvent partir
      // en parallèle plutôt qu'attendre chaque addDoc l'un après l'autre.
      const orderIds = await Promise.all(cartItems.map((item) => {
        const shippingShareTTC = totalWeightKg > 0
          ? shippingCostTTC * (Number(item.estimatedWeightKg || 0) / totalWeightKg)
          : shippingCostTTC / cartItems.length;

        const orderDraft = createOrderDraft(item.configuration, item.quote, profile || {}, {
          shippingShareTTC,
          basketId,
        });

        return addDoc(collection(db, "commandes"), {
          clientId: user ? user.uid : "anonyme",
          date: new Date().toLocaleDateString(),
          ...orderDraft,
          statut: OrderStatus.RECEIVED,
          pdfUrl,
        }).then((docRef) => docRef.id);
      }));

      // Notification interne à l'atelier, avec les coordonnées complètes du client.
      const destinataire = user?.email || profile?.email;
      const p = profile || {};
      const adresseLignes = p.adresse
        ? [p.adresse.numero, p.adresse.voie, p.adresse.complement].filter(Boolean).join(' ')
        : '';
      const coordonnees = [
        `Nom : ${[p.prenom, p.nom].filter(Boolean).join(' ') || '—'}`,
        `E-mail : ${destinataire || '—'}`,
        `Téléphone : ${p.telephone || '—'}`,
        `Adresse : ${adresseLignes || '—'}${p.adresse ? `, ${[p.adresse.codePostal, p.adresse.ville, p.adresse.pays].filter(Boolean).join(' ')}` : ''}`,
        ...(p.entreprise ? [`Entreprise : ${p.entreprise}${p.siret ? ` (SIRET ${p.siret})` : ''}`] : []),
      ];

      // Les deux emails (confirmation client, notification atelier) ne
      // dépendent pas l'un de l'autre : ils partent en parallèle.
      await Promise.all([
        destinataire
          ? EmailService.envoyer({
              toEmail: destinataire,
              subject: `Confirmation de votre commande #${numero} — L'Écrin Français`,
              messageHtml: [
                `<p>Merci pour votre commande auprès de <strong>L'Écrin Français</strong>.</p>`,
                `<p><strong>Numéro de commande :</strong> ${escapeHtml(numero)}</p>`,
                `<ul>${lignes.map((ligne) => `<li>${escapeHtml(ligne.replace(/^- /, ''))}</li>`).join('')}</ul>`,
                `<p><strong>Livraison :</strong> ${escapeHtml(shippingCostTTC.toFixed(2))} €</p>`,
                `<p><strong>Total général :</strong> ${escapeHtml(totalGeneral)} €</p>`,
                pdfUrl ? `<p><a href="${escapeHtml(pdfUrl)}">Télécharger le récapitulatif PDF de votre commande</a></p>` : '',
                `<p>Notre atelier revient vers vous très prochainement pour confirmer les détails de fabrication.</p>`,
              ].join(''),
            })
          : Promise.resolve(),
        EmailService.envoyer({
          toEmail: 'ecrinfrancais@gmail.com',
          subject: `Nouvelle commande #${numero} — L'Écrin Français`,
          messageHtml: [
            `<p><strong>Nouvelle commande reçue.</strong></p>`,
            `<p><strong>Numéro de commande :</strong> ${escapeHtml(numero)}</p>`,
            `<ul>${lignes.map((ligne) => `<li>${escapeHtml(ligne.replace(/^- /, ''))}</li>`).join('')}</ul>`,
            `<p><strong>Livraison :</strong> ${escapeHtml(shippingCostTTC.toFixed(2))} €</p>`,
            `<p><strong>Total général :</strong> ${escapeHtml(totalGeneral)} €</p>`,
            pdfUrl ? `<p><a href="${escapeHtml(pdfUrl)}">Télécharger le récapitulatif PDF</a></p>` : '',
            `<p><strong>Coordonnées du client :</strong></p>`,
            `<ul>${coordonnees.map((ligne) => `<li>${escapeHtml(ligne)}</li>`).join('')}</ul>`,
          ].join(''),
        }),
      ]);

      return { success: true, orderIds, basketId };
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
  },

  // Un avis est toujours créé "en_attente" : il n'apparaît publiquement
  // qu'une fois approuvé par un admin (voir AdminManager.updateReviewStatus).
  submitReview: async (userId, payload) => {
    try {
      const ref = await addDoc(collection(db, "avis"), {
        clientId: userId,
        ...payload,
        statut: 'en_attente',
        createdAt: new Date().toISOString(),
      });
      return { success: true, id: ref.id };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  getApprovedReviews: async (max = 6) => {
    try {
      const q = query(collection(db, "avis"), where("statut", "==", "approuve"));
      const snapshot = await getDocs(q);
      return snapshot.docs
        .map((docItem) => ({ id: docItem.id, ...docItem.data() }))
        .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
        .slice(0, max);
    } catch {
      return [];
    }
  },

  // Paniers (basketId) déjà commentés par ce client, pour ne pas proposer
  // deux fois le formulaire d'avis sur la même commande livrée.
  getMyReviewedBasketIds: async (userId) => {
    try {
      const q = query(collection(db, "avis"), where("clientId", "==", userId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((docItem) => docItem.data().basketId).filter(Boolean);
    } catch {
      return [];
    }
  },
};