// src/logic/AdminManager.js
import { db, auth } from '../config/firebase';
import { collection, getDocs, doc, getDoc, setDoc, writeBatch, arrayUnion } from 'firebase/firestore';
import {
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import { groupOrdersIntoBaskets } from '../domain/basket';

const ADMIN_EMAIL_DOMAIN = 'ecrinfrancais.local';

export function resolveAdminEmail(identifiant) {
  const trimmed = (identifiant || '').trim();
  if (trimmed.includes('@')) return trimmed;
  return `${trimmed.toLowerCase()}@${ADMIN_EMAIL_DOMAIN}`;
}

export const AdminManager = {
  loginAdmin: async (identifiant, password) => {
    const email = resolveAdminEmail(identifiant);
    let userCredential;
    try {
      userCredential = await signInWithEmailAndPassword(auth, email, password);
    } catch {
      return { success: false, error: 'invalid_credentials' };
    }

    const user = userCredential.user;
    const adminRef = doc(db, 'admins', user.uid);
    const adminSnapshot = await getDoc(adminRef);
    if (!adminSnapshot.exists()) {
      await signOut(auth);
      return { success: false, error: 'not_admin' };
    }

    const previousLastLoginAt = adminSnapshot.data()?.lastLoginAt || null;
    const now = new Date().toISOString();

    let newOrdersCount = 0;
    if (previousLastLoginAt) {
      const orderDocs = await AdminManager.getAllOrders();
      const baskets = groupOrdersIntoBaskets(orderDocs);
      newOrdersCount = baskets.filter((basket) => basket.createdAt && basket.createdAt > previousLastLoginAt).length;
    }

    await setDoc(adminRef, { email, lastLoginAt: now }, { merge: true });

    return { success: true, newOrdersCount, previousLastLoginAt };
  },

  logoutAdmin: async () => {
    await signOut(auth);
  },

  getAllOrders: async () => {
    const snapshot = await getDocs(collection(db, 'commandes'));
    return snapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() }));
  },

  updateBasketStatus: async (orderIds, newStatus) => {
    try {
      const historyEntry = { status: newStatus, changedAt: new Date().toISOString() };
      const batch = writeBatch(db);
      orderIds.forEach((orderId) => {
        batch.update(doc(db, 'commandes', orderId), {
          statut: newStatus,
          statusHistory: arrayUnion(historyEntry),
        });
      });
      await batch.commit();
      return { success: true, historyEntry };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  updateBasketNote: async (orderIds, note) => {
    try {
      const batch = writeBatch(db);
      orderIds.forEach((orderId) => {
        batch.update(doc(db, 'commandes', orderId), { note });
      });
      await batch.commit();
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  getAllReviews: async () => {
    const snapshot = await getDocs(collection(db, 'avis'));
    return snapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() }));
  },

  updateReviewStatus: async (reviewId, statut) => {
    try {
      await setDoc(
        doc(db, 'avis', reviewId),
        { statut, moderatedAt: new Date().toISOString() },
        { merge: true }
      );
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  changeAdminPassword: async (currentPassword, newPassword) => {
    const user = auth.currentUser;
    if (!user || !user.email) return { success: false, error: 'not_authenticated' };
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },
};
