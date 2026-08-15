// src/hooks/useEngravingUpload.js
//
// Gère l'upload du fichier de gravure (image/logo) vers Cloudinary
// dès sa sélection, pour que l'URL en base soit stable et récupérable côté
// admin (contrairement à l'ancien URL.createObjectURL, valable uniquement
// dans l'onglet du navigateur qui l'a créé). Partagé par les trois pages
// configurateur (vins, bijoux, coffret cadeau).
import { useRef, useState } from 'react';
import { StorageService } from '../logic/StorageService';
import { validateEngravingImage } from '../logic/fileValidation';

export function useEngravingUpload({ configId, initialUrl = null, initialNom = null, onLocalPreview }) {
  const [gravureFichierUrl, setGravureFichierUrl] = useState(initialUrl);
  const [gravureFichierNom, setGravureFichierNom] = useState(initialNom);
  const [gravureUploadState, setGravureUploadState] = useState('idle');
  // Identifie la sélection de fichier la plus récente : si l'utilisateur
  // choisit un second fichier avant que l'upload du premier ne soit terminé,
  // le résultat périmé du premier ne doit pas écraser celui du second.
  const uploadTokenRef = useRef(0);

  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const token = ++uploadTokenRef.current;
    onLocalPreview(URL.createObjectURL(file));
    // On ne touche pas encore à gravureFichierUrl/Nom : tant que ce nouveau
    // fichier n'est pas validé et uploadé avec succès, un fichier déjà
    // uploadé avec succès précédemment reste la référence valide.

    const check = await validateEngravingImage(file);
    if (token !== uploadTokenRef.current) return;
    if (!check.valid) {
      setGravureUploadState('error');
      return;
    }

    setGravureUploadState('uploading');
    try {
      const url = await StorageService.upload(`gravures/${configId}`, file, check.contentType);
      if (token !== uploadTokenRef.current) return;
      setGravureFichierUrl(url);
      setGravureFichierNom(file.name);
      setGravureUploadState('done');
    } catch {
      if (token !== uploadTokenRef.current) return;
      setGravureUploadState('error');
    }
  };

  return { gravureFichierUrl, gravureFichierNom, gravureUploadState, handleUploadImage };
}
