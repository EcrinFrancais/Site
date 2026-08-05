import { db } from '../config/firebase';
import { collection, addDoc, doc, getDoc, setDoc, deleteDoc, query, where, getDocs } from 'firebase/firestore';

const collectionName = 'configurations';

export const configurationRepository = {
  async save(configuration) {
    const payload = {
      ...configuration,
      updatedAt: new Date().toISOString(),
    };

    if (payload.id && payload.id.startsWith('config-')) {
      const ref = doc(db, collectionName, payload.id);
      await setDoc(ref, payload, { merge: true });
      return payload;
    }

    const ref = await addDoc(collection(db, collectionName), payload);
    return { ...payload, id: ref.id };
  },

  async saveVersion(configuration) {
    const payload = {
      ...configuration,
      updatedAt: new Date().toISOString(),
      version: Number(configuration.version || 1) + 1,
      versions: Array.isArray(configuration.versions) ? configuration.versions : [],
    };

    const revision = {
      version: payload.version,
      updatedAt: payload.updatedAt,
      values: { ...payload.values },
    };

    payload.versions = [...payload.versions, revision];

    return this.save(payload);
  },

  async getById(id) {
    const ref = doc(db, collectionName, id);
    const snapshot = await getDoc(ref);
    return snapshot.exists() ? snapshot.data() : null;
  },

  async listByUser(userId) {
    const q = query(collection(db, collectionName), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() }));
  },

  async remove(id) {
    await deleteDoc(doc(db, collectionName, id));
  },
};
