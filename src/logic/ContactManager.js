// src/logic/ContactManager.js
import { EmailService } from './EmailService';

const DESTINATAIRE = 'ecrinfrancais@gmail.com';

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export const ContactManager = {
  envoyerMessage: async ({ nom, email, telephone, message }) => {
    return EmailService.envoyer({
      toEmail: DESTINATAIRE,
      replyTo: email,
      subject: `Nouveau message de ${nom} — Formulaire de contact`,
      messageHtml: [
        `<p><strong>Nom :</strong> ${escapeHtml(nom)}</p>`,
        `<p><strong>Email :</strong> ${escapeHtml(email)}</p>`,
        `<p><strong>Téléphone :</strong> ${escapeHtml(telephone || '—')}</p>`,
        `<p><strong>Message :</strong><br />${escapeHtml(message).replace(/\n/g, '<br />')}</p>`,
      ].join(''),
    });
  },
};
