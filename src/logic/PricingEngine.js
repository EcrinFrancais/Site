// src/logic/PricingEngine.js

// Dictionnaire des prix au m2 par essence de bois (Valeurs d'exemple à ajuster)
// Clés sans accent : les services de pricing (pricingService, bijouxPricingService,
// coffretCadeauPricingService) normalisent l'essence en retirant les accents
// avant de l'utiliser comme clé ici.
const PRIX_BOIS_M2 = {
  pin: 45,
  peuplier: 55,
  chene: 120,
  noyer: 180,
  erable: 150,
  merisier: 160,
  palissandre: 450,
  ebene: 800
};

// Dictionnaire des finitions (Surcoût)
const PRIX_FINITION = {
  brut: 0,
  'vernis mat': 25,
  'vernis brillant': 35,
  laque: 60
};

export const PricingEngine = {
  calculerPrix: (longueur, largeur, hauteur, essence, finition, qte, isB2B) => {
    // 1. Calcul de la surface développée en m2 (2 * (Ll + Lh + lh))
    // On divise par 10000 car les dimensions sont en cm
    const surfaceM2 = (2 * ((longueur * largeur) + (longueur * hauteur) + (largeur * hauteur))) / 10000;
    
    // 2. Prix de la matière première
    const prixMatiere = surfaceM2 * (PRIX_BOIS_M2[essence] || 100);

    // 3. Prix de la finition
    const prixFinition = PRIX_FINITION[finition] || 0;

    // 4. Frais fixes (Main d'oeuvre de base)
    const fraisFixes = 85; 

    // Total Unitaire Hors Taxe
    let prixUnitaireHT = prixMatiere + prixFinition + fraisFixes;

    // 5. Remise B2B (Volume)
    if (isB2B && qte >= 10) {
      prixUnitaireHT = prixUnitaireHT * 0.80; // -20%
    }

    const totalHT = prixUnitaireHT * qte;
    const totalTTC = totalHT * 1.20; // TVA 20%

    return {
      unitaireHT: prixUnitaireHT.toFixed(2),
      totalHT: totalHT.toFixed(2),
      totalTTC: totalTTC.toFixed(2)
    };
  }
};