// src/logic/StorageService.js
//
// Upload de fichiers vers Cloudinary (upload "unsigned" depuis le navigateur,
// sans backend). Choisi à la place de Firebase Storage : depuis février 2026,
// Firebase exige le plan payant Blaze (carte bancaire) pour activer Storage,
// même pour un usage qui resterait gratuit — refusé par l'utilisateur, comme
// pour l'email (voir EmailService.js). Cloudinary a un forfait gratuit
// (~25 Go/mois) accessible sans carte.
//
// Configuration requise dans .env.local (voir .env.example) :
// VITE_CLOUDINARY_CLOUD_NAME, VITE_CLOUDINARY_UPLOAD_PRESET (preset créé en
// mode "Unsigned" dans Settings > Upload du dashboard Cloudinary).
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const StorageService = {
  // `folder` range les fichiers dans le dashboard Cloudinary (ex: "gravures/abc123") ;
  // Cloudinary génère lui-même un identifiant unique pour chaque fichier.
  upload: async (folder, fileOrBlob, contentType) => {
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      throw new Error('cloudinary_not_configured');
    }

    const resourceType = contentType === 'application/pdf' ? 'raw' : 'image';
    const formData = new FormData();
    formData.append('file', fileOrBlob);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', folder);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('upload_failed');
    }

    const data = await response.json();
    return data.secure_url;
  },
};
