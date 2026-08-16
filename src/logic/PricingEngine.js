// src/logic/PricingEngine.js
//
// Modèle de prix reconstruit le 2026-08-13 (bois au m³, quincaillerie par
// fermeture, main d'œuvre proportionnelle à la surface) puis complété le
// 2026-08-16 (finition proportionnelle à la surface au lieu d'un flat fee,
// intérieur/cales au forfait, gravure au cm² + frais logo — les 3 postes que
// le CDC prévoit en section F mais qui étaient encore à 0€ ou non scalables).
// Ce sont des ESTIMATIONS de marché raisonnables (bois massif/plaqué fin,
// petite série artisanale) — à valider et ajuster avec de vrais tarifs
// fournisseurs.

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

// Finition : une base fixe (préparation, mise en cabine) plus un taux au m²
// (produit + temps d'application/séchage) — avant, un flat fee facturait
// pareil un petit écrin bijou et un grand coffret cadeau.
const FINITION_BASE = {
  brut: 0,
  'vernis mat': 8,
  'vernis brillant': 12,
  laque: 18,
};
const FINITION_TAUX_M2 = {
  brut: 0,
  'vernis mat': 55,
  'vernis brillant': 80,
  laque: 150,
};

// Intérieur (cales) : prix forfaitaire selon le type, indépendant de la
// taille (CDC : "Prix forfaitaire selon le type"). Le velours gainé coûte
// plus cher que les cales bois (tissu + collage + choix de coloris).
// N'existe que pour l'univers Vins pour l'instant (seul configurateur avec
// ce champ) ; les autres univers passent `cales: undefined` → 0€.
const PRIX_CALES = {
  Bois: 10,
  Velours: 25,
};

// Gravure : prix à la surface (cm²) + frais techniques si logo (CDC).
// La taille réelle de la gravure n'est pas mesurée précisément par le
// configurateur (tailleTexte/tailleImage sont des curseurs en % d'un
// gabarit), donc on part d'une surface de référence à 100% par mode et on
// la fait varier au carré du curseur (une gravure 2x plus "grande" occupe
// une surface ~4x plus grande, pas 2x).
const GRAVURE_SURFACE_REF_CM2 = {
  texte: 30, // ex: une inscription courte type "Cuvée 2024"
  image: 20, // ex: un logo compact
};
const PRIX_GRAVURE_CM2 = {
  'Gravure laser': 1.2,
  'Gravure mécanique': 1.8,
  Sérigraphie: 0.6,
};
const FRAIS_TECHNIQUE_LOGO = 18; // vectorisation/calibrage, uniquement en mode image

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
  calculerPrix: ({
    longueur, largeur, hauteur, essence, finition, fermeture, qte, isB2B,
    cales, gravureType, modeGravure, tailleTexte, tailleImage,
  }) => {
    // 1. Surface développée en m² (2 * (Ll + Lh + lh)) — dimensions en cm
    const surfaceM2 = (2 * ((longueur * largeur) + (longueur * hauteur) + (largeur * hauteur))) / 10000;

    // 2. Matière première : quantité de bois réellement utilisée (volume) x prix au m³
    const volumeM3 = surfaceM2 * EPAISSEUR_PANNEAU_M;
    const prixMatiere = volumeM3 * (PRIX_BOIS_M3[essence] || 1500);

    // 3. Finition (base fixe + taux au m², cf. définition des constantes)
    const prixFinition = (FINITION_BASE[finition] || 0) + surfaceM2 * (FINITION_TAUX_M2[finition] || 0);

    // 4. Pièces complémentaires (quincaillerie de fermeture). Contrairement à
    // la finition ('brut' coûte réellement 0€), aucune fermeture n'est
    // gratuite : si le libellé reçu ne correspond à aucune clé connue (bug
    // amont ou nouvelle option pas encore tarifée), on retombe sur la
    // quincaillerie la moins chère plutôt que de facturer 0€ en silence.
    const prixQuincaillerie = PRIX_FERMETURE[fermeture] ?? Math.min(...Object.values(PRIX_FERMETURE));

    // 4bis. Intérieur (cales) : forfait selon le type, cf. définition de PRIX_CALES.
    const prixCales = PRIX_CALES[cales] || 0;

    // 4ter. Gravure : surface de référence (au carré du curseur de taille) x
    // prix au cm² selon le procédé, + frais techniques fixes en mode logo.
    const prixGravure = (() => {
      if (!gravureType || gravureType === 'Aucune') return 0;
      const tarifCm2 = PRIX_GRAVURE_CM2[gravureType];
      if (!tarifCm2) return 0;
      const mode = modeGravure === 'image' ? 'image' : 'texte';
      const curseur = (mode === 'image' ? tailleImage : tailleTexte) ?? 100;
      const ratio = (curseur / 100) ** 2;
      const surfaceCm2 = GRAVURE_SURFACE_REF_CM2[mode] * ratio;
      const fraisLogo = mode === 'image' ? FRAIS_TECHNIQUE_LOGO : 0;
      return surfaceCm2 * tarifCm2 + fraisLogo;
    })();

    // 5. Main d'œuvre (base + proportionnelle à la surface à travailler)
    const mainOeuvre = MAIN_OEUVRE_BASE + surfaceM2 * MAIN_OEUVRE_TAUX_M2;

    let prixUnitaireHT = prixMatiere + prixFinition + prixQuincaillerie + prixCales + prixGravure + mainOeuvre;

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
