import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const warnMissingEnv = (key: string) => {
  if (!import.meta.env[key as keyof ImportMetaEnv]) {
    console.warn(`Firebase config missing ${key}; using fallback value for local/dev only.`);
  }
};

// Firebase client initialization using Vite env vars
// Set these in .env.local or Vercel project settings (build-time):
// VITE_FIREBASE_API_KEY
// VITE_FIREBASE_AUTH_DOMAIN
// VITE_FIREBASE_PROJECT_ID
// VITE_FIREBASE_STORAGE_BUCKET
// VITE_FIREBASE_MESSAGING_SENDER_ID
// VITE_FIREBASE_APP_ID
const isProd = import.meta.env.PROD;

// Provide safe fallbacks so local preview/e2e can run without real Firebase keys.
warnMissingEnv('VITE_FIREBASE_API_KEY');
warnMissingEnv('VITE_FIREBASE_AUTH_DOMAIN');
warnMissingEnv('VITE_FIREBASE_PROJECT_ID');

const firebaseConfig = {
  apiKey: isProd ? import.meta.env.VITE_FIREBASE_API_KEY : import.meta.env.VITE_FIREBASE_API_KEY || 'demo-key',
  authDomain: isProd
    ? import.meta.env.VITE_FIREBASE_AUTH_DOMAIN
    : import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo-app.firebaseapp.com',
  projectId: isProd ? import.meta.env.VITE_FIREBASE_PROJECT_ID : import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-app',
  storageBucket: isProd
    ? import.meta.env.VITE_FIREBASE_STORAGE_BUCKET
    : import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'demo-app.appspot.com',
  messagingSenderId: isProd
    ? import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID
    : import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '000000000000',
  appId: isProd ? import.meta.env.VITE_FIREBASE_APP_ID : import.meta.env.VITE_FIREBASE_APP_ID || '1:000000000000:web:demo',
};

if (isProd) {
  const missing = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
  ].filter((key) => !import.meta.env[key as keyof ImportMetaEnv]);

  if (missing.length) {
    throw new Error(`Missing Firebase env vars in production build: ${missing.join(', ')}`);
  }
}

// Avoid re-initializing in hot-reload/dev
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
