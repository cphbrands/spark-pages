import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db, auth } from './config';
import { Lead } from '../schemas';

const LEADS_COLLECTION = 'leads';

// Convert Firestore timestamp to ISO string
const convertTimestamps = (data: any): any => {
  if (data?.createdAt instanceof Timestamp) {
    data.createdAt = data.createdAt.toDate().toISOString();
  }
  return data;
};

// Add a new lead (public - no auth required)
export async function addLead(
  leadData: Omit<Lead, 'id' | 'createdAt'>
): Promise<string> {
  const docRef = await addDoc(collection(db, LEADS_COLLECTION), {
    ...leadData,
    createdAt: Timestamp.now(),
  });

  return docRef.id;
}

// Get all leads for current user's pages
export async function getLeads(): Promise<Lead[]> {
  const userId = auth.currentUser?.uid;
  if (!userId) return [];

  // First get all user's page IDs
  const pagesQuery = query(
    collection(db, 'pages'),
    where('userId', '==', userId)
  );
  const pagesSnapshot = await getDocs(pagesQuery);
  const pageIds = pagesSnapshot.docs.map((doc) => doc.id);

  if (pageIds.length === 0) return [];

  // Then get leads for those pages
  const leadsQuery = query(
    collection(db, LEADS_COLLECTION),
    where('pageId', 'in', pageIds),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(leadsQuery);
  return snapshot.docs.map((doc) => {
    const data = convertTimestamps(doc.data());
    return { ...data, id: doc.id } as Lead;
  });
}

// Get leads for a specific page
export async function getLeadsByPage(pageId: string): Promise<Lead[]> {
  const q = query(
    collection(db, LEADS_COLLECTION),
    where('pageId', '==', pageId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = convertTimestamps(doc.data());
    return { ...data, id: doc.id } as Lead;
  });
}

// Delete a lead
export async function deleteLead(leadId: string): Promise<void> {
  const docRef = doc(db, LEADS_COLLECTION, leadId);
  await deleteDoc(docRef);
}
