// Regroupe les docs bruts de la collection Firestore "commandes" (un doc par
// écrin) en "commandes" au sens métier — un panier validé en une fois. Les
// anciens docs créés avant l'introduction du panier n'ont pas de basketId :
// on utilise alors l'id du doc lui-même comme identifiant de groupe, ce qui
// en fait une commande à un seul écrin.
export function groupOrdersIntoBaskets(orderDocs) {
  const groups = new Map();

  for (const order of orderDocs) {
    const basketId = order.basketId || order.id;
    if (!groups.has(basketId)) {
      groups.set(basketId, {
        basketId,
        orderIds: [],
        items: [],
        clientId: order.clientId,
        clientProfile: order.clientProfile || {},
        status: order.statut,
        total: 0,
        createdAt: order.createdAt || null,
        // Champs synchronisés sur tous les docs d'un même panier (voir
        // AdminManager.updateBasketStatus/updateBasketNote) : on peut donc
        // les lire depuis n'importe lequel, le premier fait l'affaire.
        note: order.note || '',
        statusHistory: order.statusHistory || [],
        pdfUrl: order.pdfUrl || null,
      });
    }
    const group = groups.get(basketId);
    group.orderIds.push(order.id);
    group.items.push(order);
    group.total += Number(order.total || 0);
    if (!group.createdAt || (order.createdAt && order.createdAt < group.createdAt)) {
      group.createdAt = order.createdAt || group.createdAt;
    }
  }

  return Array.from(groups.values()).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}
