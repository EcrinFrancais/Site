// src/logic/OrderPdfService.js
//
// Génère le PDF récapitulatif d'une commande, entièrement côté client
// (jsPDF, pas de backend). Le PDF est ensuite uploadé sur Firebase Storage
// par ClientManager, qui en récupère l'URL pour l'insérer dans le mail de
// confirmation — EmailJS ne peut pas joindre de fichier binaire sur son
// forfait gratuit (voir StorageService.js).
import { jsPDF } from 'jspdf';

function describeCaracteristiques(item) {
  const v = item.configuration?.values || {};
  const dims = v.dims || v.mesures;
  const dimsLabel = dims && (dims.L || dims.l || dims.h)
    ? `${dims.L || '—'} × ${dims.l || '—'} × ${dims.h || '—'} cm`
    : null;

  const gravureLabel = v.gravureType && v.gravureType !== 'Aucune'
    ? `${v.gravureType}${v.texteGravure ? ` — "${v.texteGravure}"` : ''}${v.gravureFichierNom ? ` (fichier : ${v.gravureFichierNom})` : ''}`
    : 'Aucune';

  return [
    v.taille && ['Taille', v.taille],
    dimsLabel && ['Dimensions', dimsLabel],
    v.essence && ['Essence', v.essence],
    v.finition && ['Finition', v.finition],
    v.cales && ['Calage', v.cales],
    v.couleurVelours && ['Couleur du velours', v.couleurVelours],
    v.fermeture && ['Fermeture', v.fermeture],
    ['Gravure', gravureLabel],
  ].filter(Boolean);
}

export const OrderPdfService = {
  genererRecapitulatif: ({ numero, date, items, shippingCostTTC, totalGeneral, profile }) => {
    const doc = new jsPDF();
    const marginX = 20;
    let y = 22;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text("L'Écrin Français", marginX, y);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    y += 8;
    doc.text(`Récapitulatif de commande #${numero}`, marginX, y);
    y += 6;
    doc.setTextColor(120);
    doc.text(`Date : ${date}`, marginX, y);
    doc.setTextColor(0);
    y += 10;

    const p = profile || {};
    const nomClient = [p.prenom, p.nom].filter(Boolean).join(' ');
    if (nomClient || p.email) {
      doc.setFont('helvetica', 'bold');
      doc.text('Client', marginX, y);
      doc.setFont('helvetica', 'normal');
      y += 6;
      if (nomClient) { doc.text(nomClient, marginX, y); y += 5; }
      if (p.email) { doc.text(p.email, marginX, y); y += 5; }
      y += 4;
    }

    items.forEach((item, index) => {
      if (y > 265) { doc.addPage(); y = 22; }
      const config = item.configuration || {};
      const univers = item.universTitle || config.universTitle || 'Configuration';
      const quantite = config.values?.quantite || item.quantite || 1;
      const totalItem = Number(item.quote?.totalTTC ?? item.total ?? 0);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(`${index + 1}. ${config.name || univers}`, marginX, y);
      y += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      if (config.name) { doc.text(univers, marginX, y); y += 5; }

      describeCaracteristiques(item).forEach(([label, value]) => {
        if (y > 270) { doc.addPage(); y = 22; }
        doc.setTextColor(120);
        doc.text(`${label} :`, marginX + 2, y);
        doc.setTextColor(0);
        doc.text(String(value), marginX + 55, y);
        y += 5;
      });

      doc.text(`Quantité : ${quantite}`, marginX + 2, y);
      y += 5;
      doc.setFont('helvetica', 'bold');
      doc.text(`Total : ${totalItem.toFixed(2)} €`, marginX + 2, y);
      doc.setFont('helvetica', 'normal');
      y += 10;
    });

    if (y > 260) { doc.addPage(); y = 22; }
    doc.setDrawColor(200);
    doc.line(marginX, y, 190, y);
    y += 8;
    doc.text(`Livraison : ${Number(shippingCostTTC || 0).toFixed(2)} €`, marginX, y);
    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`Total général TTC : ${Number(totalGeneral || 0).toFixed(2)} €`, marginX, y);

    return doc.output('blob');
  },
};
