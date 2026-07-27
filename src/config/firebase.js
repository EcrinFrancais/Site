// Import des outils de Firebase
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyDgsnp8IQvo9HdgKmPyxYrlrprXylVD4-I',
  authDomain: 'lecrinfrancais-cfae4.firebaseapp.com',
  projectId: 'lecrinfrancais-cfae4',
  storageBucket: 'lecrinfrancais-cfae4.firebasestorage.app',
  messagingSenderId: '695690121373',
  appId: '1:695690121373:web:fdcbc7e4c4fcb1aeefc474',
  measurementId: 'G-5G1JP5752Y',
};

// On allume le moteur Firebase avec les clés
const app = initializeApp(firebaseConfig);

// Export de l'authentification et de la base de données pour les utiliser dans les autres fichiers du site
export const auth = getAuth(app);
export const db = getFirestore(app);
