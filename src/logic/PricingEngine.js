// src/logic/PricingEngine.js
//
// Modèle de prix reconstruit le 2026-08-13 pour refléter des coûts réalistes
// (bois vendu au m³ multiplié par l'épaisseur réelle des panneaux, quincaillerie
// par type de fermeture, main d'œuvre qui augmente avec la taille de la pièce)
// plutôt que les valeurs d'exemple arbitraires d'origine. Ce sont des ESTIMATIONS
// de marché raisonnables (bois massif/plaqué fin, petite série artisanale) —
// à valider et ajuster avec de vrais tarifs fournisseurs.

// Épaisseur standard des panneaux d'un écrin (bois massif ou plaqué sur âme).
const EPAISSEUR_PANNEAU_M = 0.012; // 12 mm

// Prix au m³ par essence (bois massif/plaqué fin, prêt à l'emploi, petite
// série — donc plus cher que du bois brut en gros volume). Le palissandre et
// l'ébène sont des bois exotiques réglementés (CITES), d'où leur prix très
// supérieur aux essences européennes.
const PRIX_BOIS_M3 = {
  pin: 900,
  peuplier: 1100,
  chene: 2800,
  erable: 3500,
  merisier: 4200,
  noyer: 6500,
  palissandre: 22000,
  ebene: 45000,
};

// Surcoût de finition (Valeurs d'exemple à ajuster)
const PRIX_FINITION = {
  brut: 0,
  'vernis mat': 25,
  'vernis brillant': 35,
  laque: 60,
};

// Quincaillerie par type de fermeture (charnières, loquet, glissières...) —
// coût matière + pose. Clés = libellés exacts de vinsConfig.fermetures.
const PRIX_FERMETURE = {
  'Charnières + fermeture magnétique invisible': 14,
  'Charnières + loquet en laiton': 16,
  'Couvercle coulissant': 6,
  'Tiroir coulissant': 20,
  'Couvercle amovible par emboîtement': 4,
};

// Main d'œuvre : une base fixe (mise en route, découpe, contrôle qualité)
// plus un taux au m² de surface développée (assemblage, ponçage, ajustage) —
// une pièce plus grande demande mécaniquement plus de travail.
const MAIN_OEUVRE_BASE = 30;
const MAIN_OEUVRE_TAUX_M2 = 220;

export const PricingEngine = {
  calculerPrix: ({ longueur, largeur, hauteur, essence, finition, fermeture, qte, isB2B }) => {
    // 1. Surface développée en m² (2 * (Ll + Lh + lh)) — dimensions en cm
    const surfaceM2 = (2 * ((longueur * largeur) + (longueur * hauteur) + (largeur * hauteur))) / 10000;

    // 2. Matière première : quantité de bois réellement utilisée (volume) x prix au m³
    const volumeM3 = surfaceM2 * EPAISSEUR_PANNEAU_M;
    const prixMatiere = volumeM3 * (PRIX_BOIS_M3[essence] || 1500);

    // 3. Finition
    const prixFinition = PRIX_FINITION[finition] || 0;

    // 4. Pièces complémentaires (quincaillerie de fermeture)
    const prixQuincaillerie = PRIX_FERMETURE[fermeture] || 0;

    // 5. Main d'œuvre (base + proportionnelle à la surface à travailler)
    const mainOeuvre = MAIN_OEUVRE_BASE + surfaceM2 * MAIN_OEUVRE_TAUX_M2;

    let prixUnitaireHT = prixMatiere + prixFinition + prixQuincaillerie + mainOeuvre;

    // 6. Remise B2B (Volume)
    if (isB2B && qte >= 10) {
      prixUnitaireHT = prixUnitaireHT * 0.80; // -20%
    }

    const totalHT = prixUnitaireHT * qte;
    const totalTTC = totalHT * 1.20; // TVA 20%

    return {
      unitaireHT: prixUnitaireHT.toFixed(2),
      totalHT: totalHT.toFixed(2),
      totalTTC: totalTTC.toFixed(2),
    };
  },
};
