import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  // process the secret key so that it is read correctly
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

export const db = (() => {
  // Check if we have not already initialized the application before
  if (!getApps().length) {
    initializeApp({
      credential: cert(serviceAccount as any),
    });
  }
  return getFirestore();
})();