// src/logic/ContactManager.js
import { db } from '../config/firebase';
import { addDoc, collection } from 'firebase/firestore';

const DESTINATAIRE = 'ecrinfrancais@gmail.com';

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export const ContactManager = {
  // Écrit dans la collection "mail" au format attendu par l'extension Firebase
  // "Trigger Email" (firestore-send-email) : un document ajouté ici déclenche
  // l'envoi réel de l'e-mail dès que l'extension est installée et configurée.
  envoyerMessage: async ({ nom, email, telephone, message }) => {
    try {
      await addDoc(collection(db, 'mail'), {
        to: [DESTINATAIRE],
        replyTo: email,
        message: {
          subject: `Nouveau message de ${nom} — Formulaire de contact`,
          text: [
            `Nom : ${nom}`,
            `Email : ${email}`,
            `Téléphone : ${telephone || '—'}`,
            '',
            'Message :',
            message,
          ].join('\n'),
          html: [
            `<p><strong>Nom :</strong> ${escapeHtml(nom)}</p>`,
            `<p><strong>Email :</strong> ${escapeHtml(email)}</p>`,
            `<p><strong>Téléphone :</strong> ${escapeHtml(telephone || '—')}</p>`,
            `<p><strong>Message :</strong><br />${escapeHtml(message).replace(/\n/g, '<br />')}</p>`,
          ].join(''),
        },
        createdAt: new Date().toISOString(),
      });
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },
};
