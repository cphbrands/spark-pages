import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Page } from './schemas';
import type { ReferenceInput } from './api-schemas';
import { saveDraft, loadDraft } from './draft-service';

export type WizardStep =
  | 'prompt'
  | 'generate'
  | 'edit-page'
  | 'ugc-prompt'
  | 'ugc-video'
  | 'finalize';

export interface WizardDraft {
  id: string;
  step: WizardStep;
  prompt: string;
  niche?: string;
  reference?: ReferenceInput;
  pageId?: string;
  pageSnapshot?: Page;
  ugcPrompt?: string;
  ugcStyle?: 'ugc' | 'cinematic';
  imageUrl?: string;
  updatedAt: string;
}

interface WizardState {
  draftId: string;
  step: WizardStep;
  prompt: string;
  niche?: string;
  reference?: ReferenceInput;
  imageUrl?: string;
  pageId?: string;
  ugcPrompt?: string;
  ugcStyle: 'ugc' | 'cinematic';
  isSaving?: boolean;
  lastSavedAt?: string;
  setPrompt: (value: string) => void;
  setReference: (value: ReferenceInput | undefined, imageUrl?: string) => void;
  setPageId: (id: string | undefined) => void;
  setStep: (step: WizardStep) => void;
  setDraftId: (id: string) => void;
  setUgcPrompt: (prompt: string | undefined) => void;
  setUgcStyle: (style: 'ugc' | 'cinematic') => void;
  reset: () => void;
  saveDraftToCloud: (pageSnapshot?: Page) => Promise<void>;
  loadDraftFromCloud: (id: string) => Promise<WizardDraft | null>;
}

const initialState: Pick<WizardState, 'step' | 'prompt' | 'reference' | 'niche' | 'pageId' | 'ugcPrompt' | 'ugcStyle' | 'imageUrl'> = {
  step: 'prompt',
  prompt: '',
  reference: undefined,
  niche: undefined,
  pageId: undefined,
  ugcPrompt: undefined,
  ugcStyle: 'ugc',
  imageUrl: undefined,
};

export const useWizardStore = create<WizardState>()(
  persist(
    (set, get) => ({
      draftId: uuidv4(),
      ...initialState,
      setPrompt: (value) => set({ prompt: value }),
      setReference: (ref, imageUrl) => set({ reference: ref, imageUrl }),
      setPageId: (id) => set({ pageId: id }),
      setStep: (step) => set({ step }),
      setDraftId: (id) => set({ draftId: id }),
      setUgcPrompt: (prompt) => set({ ugcPrompt: prompt }),
      setUgcStyle: (style) => set({ ugcStyle: style }),
      reset: () => set({
        draftId: uuidv4(),
        ...initialState,
        lastSavedAt: undefined,
      }),
      saveDraftToCloud: async (pageSnapshot?: Page) => {
        const state = get();
        const updatedAt = new Date().toISOString();
        set({ isSaving: true });
        try {
          const draft: WizardDraft = {
            id: state.draftId,
            step: state.step,
            prompt: state.prompt,
            niche: state.niche,
            reference: state.reference,
            pageId: state.pageId,
            pageSnapshot,
            ugcPrompt: state.ugcPrompt,
            ugcStyle: state.ugcStyle,
            imageUrl: state.imageUrl,
            updatedAt,
          };
          await saveDraft(draft);
          set({ lastSavedAt: updatedAt });
        } finally {
          set({ isSaving: false });
        }
      },
      loadDraftFromCloud: async (id: string) => {
        const draft = await loadDraft(id);
        if (!draft) return null;
        set({
          draftId: draft.id,
          step: draft.step,
          prompt: draft.prompt,
          niche: draft.niche,
          reference: draft.reference,
          pageId: draft.pageId,
          ugcPrompt: draft.ugcPrompt,
          ugcStyle: draft.ugcStyle || 'ugc',
          imageUrl: draft.imageUrl,
          lastSavedAt: draft.updatedAt,
        });
        return draft;
      },
    }),
    {
      name: 'wizard-storage',
      partialize: (state) => ({
        draftId: state.draftId,
        step: state.step,
        prompt: state.prompt,
        niche: state.niche,
        reference: state.reference,
        pageId: state.pageId,
        ugcPrompt: state.ugcPrompt,
        ugcStyle: state.ugcStyle,
        imageUrl: state.imageUrl,
        lastSavedAt: state.lastSavedAt,
      }),
    }
  )
);
