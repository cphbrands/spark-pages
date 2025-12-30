import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { signInAnonymously, User } from 'firebase/auth';
import { db, auth } from './firebase';
import type { WizardDraft } from './wizard-store';

const draftsCol = collection(db, 'page_drafts');

async function ensureSignedIn(): Promise<User | null> {
  if (auth.currentUser) return auth.currentUser;
  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (err) {
    // Allow unauthenticated access if rules permit
    return null;
  }
}

export async function saveDraft(draft: WizardDraft) {
  await ensureSignedIn();
  await setDoc(doc(draftsCol, draft.id), draft, { merge: true });
}

export async function loadDraft(id: string): Promise<WizardDraft | null> {
  await ensureSignedIn();
  const snap = await getDoc(doc(draftsCol, id));
  return snap.exists() ? (snap.data() as WizardDraft) : null;
}
