import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import admin from 'firebase-admin';

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY;

// Support escaped newlines in env
if (privateKey && privateKey.includes('\\n')) {
  privateKey = privateKey.replace(/\\n/g, '\n');
}

if (!getApps().length) {
  if (projectId && clientEmail && privateKey) {
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      })
    });
  } else {
    // Fallback for GOOGLE_APPLICATION_CREDENTIALS or default creds
    initializeApp();
  }
}

export const adminAuth = getAuth();
export const db = getFirestore();
export const AdminFieldValue = admin.firestore.FieldValue;


