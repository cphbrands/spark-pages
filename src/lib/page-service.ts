import { db, auth } from './firebase';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { signInAnonymously, User } from 'firebase/auth';
import type { Page } from './schemas';

// Basic Firestore helpers for pages. Extend with user scoping as needed.
const pagesCol = collection(db, 'pages');

async function ensureSignedIn(): Promise<User> {
  if (auth.currentUser) return auth.currentUser;
  const result = await signInAnonymously(auth);
  return result.user;
}

export async function savePage(page: Page) {
  await ensureSignedIn();
  await setDoc(doc(pagesCol, page.id), page, { merge: true });
}

export async function loadPage(id: string): Promise<Page | null> {
  await ensureSignedIn();
  const snap = await getDoc(doc(pagesCol, id));
  return snap.exists() ? (snap.data() as Page) : null;
}
