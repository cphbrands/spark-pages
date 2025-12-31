import { db, auth } from './firebase';
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { signInAnonymously, User } from 'firebase/auth';
import { v4 as uuidv4 } from 'uuid';

export type UgcItem = {
  id: string;
  title: string;
  status: 'Ready' | 'Processing' | 'Draft';
  thumb: string;
  updated: string;
};

export type WizardProject = {
  id: string;
  title: string;
  stage: string;
  lastUpdated: string;
  next: string;
};

const ugcCollection = collection(db, 'ugcLibrary');
const wizardCollection = collection(db, 'wizardProjects');

async function ensureSignedIn(): Promise<User | null> {
  if (auth.currentUser) return auth.currentUser;
  try {
    const res = await signInAnonymously(auth);
    return res.user;
  } catch (err) {
    console.warn('Anonymous auth failed; proceeding without auth', err);
    return null;
  }
}

export async function fetchUgcItems(): Promise<UgcItem[]> {
  await ensureSignedIn();
  const snap = await getDocs(ugcCollection);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<UgcItem, 'id'>) }));
}

export async function deleteUgcItem(id: string) {
  await ensureSignedIn();
  await deleteDoc(doc(ugcCollection, id));
}

export async function fetchWizardProjects(): Promise<WizardProject[]> {
  await ensureSignedIn();
  const snap = await getDocs(wizardCollection);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<WizardProject, 'id'>) }));
}

export async function deleteWizardProject(id: string) {
  await ensureSignedIn();
  await deleteDoc(doc(wizardCollection, id));
}

// Simple seed data helpers for fallback/local preview
export const seedUgcItems: UgcItem[] = [
  {
    id: uuidv4(),
    title: 'Testimonial: Sarah K.',
    status: 'Ready',
    thumb: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
    updated: '2h ago',
  },
  {
    id: uuidv4(),
    title: 'Product Demo Walkthrough',
    status: 'Processing',
    thumb: 'https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=600&q=80',
    updated: '5h ago',
  },
  {
    id: uuidv4(),
    title: 'Founder Story Cut',
    status: 'Draft',
    thumb: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80',
    updated: '1d ago',
  },
];

export const seedWizardProjects: WizardProject[] = [
  {
    id: uuidv4(),
    title: 'Fintech onboarding flow',
    stage: 'Iteration 2',
    lastUpdated: 'Yesterday',
    next: 'Refine CTA copy',
  },
  {
    id: uuidv4(),
    title: 'UGC ads for launch',
    stage: 'Draft prompts',
    lastUpdated: '3 days ago',
    next: 'Request creator videos',
  },
  {
    id: uuidv4(),
    title: 'B2B lead magnet page',
    stage: 'Live preview',
    lastUpdated: '1 week ago',
    next: 'Publish + share link',
  },
];
