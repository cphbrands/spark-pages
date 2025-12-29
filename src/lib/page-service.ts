import { db } from './firebase';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import type { Page } from './schemas';

// Basic Firestore helpers for pages. Extend with user scoping as needed.
const pagesCol = collection(db, 'pages');

export async function savePage(page: Page) {
  await setDoc(doc(pagesCol, page.id), page, { merge: true });
}

export async function loadPage(id: string): Promise<Page | null> {
  const snap = await getDoc(doc(pagesCol, id));
  return snap.exists() ? (snap.data() as Page) : null;
}
