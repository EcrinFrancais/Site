// src/hooks/useEngravingUpload.js
//
// Gère l'upload du fichier de gravure (image/logo) vers Cloudinary
// dès sa sélection, pour que l'URL en base soit stable et récupérable côté
// admin (contrairement à l'ancien URL.createObjectURL, valable uniquement
// dans l'onglet du navigateur qui l'a créé). Partagé par les trois pages
// configurateur (vins, bijoux, coffret cadeau).
import { useState } from 'react';
import { StorageService } from '../logic/StorageService';
import { validateEngravingImage } from '../logic/fileValidation';

export function useEngravingUpload({ configId, initialUrl = null, initialNom = null, onLocalPreview }) {
  const [gravureFichierUrl, setGravureFichierUrl] = useState(initialUrl);
  const [gravureFichierNom, setGravureFichierNom] = useState(initialNom);
  const [gravureUploadState, setGravureUploadState] = useState('idle');

  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    onLocalPreview(URL.createObjectURL(file));
    setGravureFichierUrl(null);
    setGravureFichierNom(null);

    const check = await validateEngravingImage(file);
    if (!check.valid) {
      setGravureUploadState('error');
      return;
    }

    setGravureUploadState('uploading');
    try {
      const url = await StorageService.upload(`gravures/${configId}`, file, check.contentType);
      setGravureFichierUrl(url);
      setGravureFichierNom(file.name);
      setGravureUploadState('done');
    } catch {
      setGravureUploadState('error');
    }
  };

  return { gravureFichierUrl, gravureFichierNom, gravureUploadState, handleUploadImage };
}
