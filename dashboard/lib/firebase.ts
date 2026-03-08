import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let _db: Firestore | null = null;

export function getDb(): Firestore {
  if (_db) return _db;

  if (!getApps().length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error(
        'Firebase env variables are not set. ' +
        'Add FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY to Vercel environment variables.'
      );
    }

    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  }

  _db = getFirestore();
  return _db;
}