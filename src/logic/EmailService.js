// src/logic/EmailService.js
//
// Envoi de mails via EmailJS (service connecté à Brevo côté dashboard EmailJS).
// Remplace l'ancien mécanisme "écrire dans Firestore + extension Trigger Email",
// qui nécessitait le plan payant Blaze. Ici l'envoi part directement du navigateur,
// sans backend — gratuit, sans carte bancaire.
import emailjs from '@emailjs/browser';

const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;

export const EmailService = {
  // Un seul template EmailJS générique est utilisé pour tous les mails du site
  // (contact, confirmation de commande, changement de statut...). Le sujet et le
  // corps HTML sont entièrement construits par l'appelant, le template ne fait
  // que les injecter (voir README section "Template EmailJS").
  envoyer: async ({ toEmail, replyTo, subject, messageHtml }) => {
    if (!PUBLIC_KEY || !SERVICE_ID || !TEMPLATE_ID) {
      console.error("EmailJS non configuré : variables VITE_EMAILJS_* manquantes dans .env.local");
      return { success: false, error: 'not_configured' };
    }
    try {
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
          to_email: toEmail,
          reply_to: replyTo || '',
          subject,
          message_html: messageHtml,
        },
        { publicKey: PUBLIC_KEY }
      );
      return { success: true };
    } catch (e) {
      return { success: false, error: e?.text || e?.message || 'unknown_error' };
    }
  },
};
