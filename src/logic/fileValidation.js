// src/logic/fileValidation.js
//
// Contrôle des fichiers image envoyés par le client (gravure) avant upload.
// Ce n'est pas un antivirus (pas de backend disponible sans passer à un plan
// payant) : on vérifie que le fichier est réellement une image du type
// annoncé — via sa signature binaire, pas seulement son extension — et
// qu'il ne dépasse pas une taille raisonnable. Combiné au fait que le
// fichier n'est jamais exécuté (uniquement affiché en <img> côté admin),
// cela élimine la classe de risque la plus courante (exécutable renommé en
// .png).
const IMAGE_SIGNATURES = [
  { contentType: 'image/png', bytes: [0x89, 0x50, 0x4e, 0x47] },
  { contentType: 'image/jpeg', bytes: [0xff, 0xd8, 0xff] },
];

export const MAX_ENGRAVING_FILE_BYTES = 5 * 1024 * 1024;

export async function validateEngravingImage(file, maxSizeBytes = MAX_ENGRAVING_FILE_BYTES) {
  if (!file) return { valid: false, reason: 'missing' };
  if (file.size > maxSizeBytes) return { valid: false, reason: 'too_large' };

  const header = new Uint8Array(await file.slice(0, 4).arrayBuffer());
  const match = IMAGE_SIGNATURES.find((sig) => sig.bytes.every((byte, i) => header[i] === byte));
  if (!match) return { valid: false, reason: 'invalid_signature' };

  return { valid: true, contentType: match.contentType };
}
