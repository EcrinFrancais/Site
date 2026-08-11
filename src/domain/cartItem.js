function generateCartItemId() {
  return `cart-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createCartItem(configuration, quote = {}, estimatedWeightKg = 0) {
  const snapshot = JSON.parse(JSON.stringify(configuration));
  return {
    id: generateCartItemId(),
    addedAt: new Date().toISOString(),
    universId: snapshot.universId,
    universTitle: snapshot.universTitle,
    name: snapshot.name || '',
    configuration: snapshot,
    quantite: snapshot.values?.quantite || 1,
    quote: {
      unitaireHT: quote.unitaireHT,
      totalHT: quote.totalHT,
      totalTTC: quote.totalTTC,
    },
    estimatedWeightKg,
  };
}
