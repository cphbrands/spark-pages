import { getFirestore, doc, setDoc, getDoc } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Expect a base64-encoded service account JSON in FIREBASE_SERVICE_ACCOUNT
const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!getApps().length) {
  if (!serviceAccountBase64) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT env var (base64 JSON) is required for Firestore job store');
  }
  const serviceAccount = JSON.parse(Buffer.from(serviceAccountBase64, 'base64').toString());
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();
const COLLECTION = 'ugcVideoJobs';

export type JobRecord = {
  status: 'processing' | 'ready' | 'error';
  createdAt: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  prompt?: string;
  error?: string;
  metadata?: { aiGenerated: boolean };
};

export async function createJob(id: string, record: JobRecord) {
  await setDoc(doc(db, COLLECTION, id), record);
}

export async function updateJob(id: string, updates: Partial<JobRecord>) {
  const ref = doc(db, COLLECTION, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const data = snap.data() as JobRecord;
  await setDoc(ref, { ...data, ...updates }, { merge: true });
}

export async function getJob(id: string) {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return undefined;
  return snap.data() as JobRecord;
}

export async function hasJob(id: string) {
  const snap = await getDoc(doc(db, COLLECTION, id));
  return snap.exists();
}
