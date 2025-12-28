import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db, auth } from './config';
import { Page } from '../schemas';

const PAGES_COLLECTION = 'pages';

// Convert Firestore timestamp to ISO string
const convertTimestamps = (data: any): any => {
  if (data?.createdAt instanceof Timestamp) {
    data.createdAt = data.createdAt.toDate().toISOString();
  }
  if (data?.updatedAt instanceof Timestamp) {
    data.updatedAt = data.updatedAt.toDate().toISOString();
  }
  return data;
};

// Get all pages for current user
export async function getPages(): Promise<Page[]> {
  const userId = auth.currentUser?.uid;
  if (!userId) return [];

  const q = query(
    collection(db, PAGES_COLLECTION),
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = convertTimestamps(doc.data());
    return { ...data, id: doc.id } as Page;
  });
}

// Get a single page by ID
export async function getPage(pageId: string): Promise<Page | null> {
  const docRef = doc(db, PAGES_COLLECTION, pageId);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) return null;

  const data = convertTimestamps(snapshot.data());
  return { ...data, id: snapshot.id } as Page;
}

// Get page by slug (for public pages)
export async function getPageBySlug(slug: string): Promise<Page | null> {
  const q = query(
    collection(db, PAGES_COLLECTION),
    where('meta.slug', '==', slug),
    where('status', '==', 'published')
  );

  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  const data = convertTimestamps(doc.data());
  return { ...data, id: doc.id } as Page;
}

// Create a new page
export async function createPage(page: Omit<Page, 'id'>): Promise<string> {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('Not authenticated');

  const docRef = await addDoc(collection(db, PAGES_COLLECTION), {
    ...page,
    userId,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  return docRef.id;
}

// Update a page
export async function updatePage(
  pageId: string,
  updates: Partial<Page>
): Promise<void> {
  const docRef = doc(db, PAGES_COLLECTION, pageId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
}

// Delete a page
export async function deletePage(pageId: string): Promise<void> {
  const docRef = doc(db, PAGES_COLLECTION, pageId);
  await deleteDoc(docRef);
}

// Publish a page
export async function publishPage(pageId: string): Promise<void> {
  await updatePage(pageId, { status: 'published' });
}

// Unpublish a page
export async function unpublishPage(pageId: string): Promise<void> {
  await updatePage(pageId, { status: 'draft' });
}
