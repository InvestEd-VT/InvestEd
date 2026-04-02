import { create } from 'zustand';
import educationService, { type Module } from '../services/education.service';

interface EducationState {
  modules: Module[];
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  staleTime: number;
  fetchModules: (options?: { force?: boolean }) => Promise<void>;
  markComplete: (moduleId: string) => Promise<void>;
  clearError: () => void;
}

export const useEducationStore = create<EducationState>((set, get) => ({
  modules: [],
  isLoading: false,
  error: null,
  lastFetched: null,
  staleTime: 60 * 1000, // 1 minute

  clearError: () => set({ error: null }),

  fetchModules: async (options = { force: false }) => {
    const { force } = options as { force: boolean };
    if (get().isLoading) return;

    const { lastFetched, staleTime } = get();
    const now = Date.now();
    if (!force && lastFetched && now - lastFetched < staleTime) return;

    set({ isLoading: true, error: null });
    try {
      const modules = await educationService.getModules();
      set({ modules, isLoading: false, lastFetched: Date.now() });
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to load modules';

      // Dev mock so UI renders while backend is offline
      if (import.meta.env.DEV) {
        set({
          modules: [
            {
              id: 'intro-to-options',
              title: 'Intro to Options',
              description:
                'Learn the fundamentals of options contracts, key terminology, and how options differ from stocks.',
              order: 1,
              completed: false,
              completedAt: null,
            },
          ],
          isLoading: false,
          lastFetched: Date.now(),
          error: null,
        });
        return;
      }

      set({ error: message, isLoading: false });
    }
  },

  markComplete: async (moduleId: string) => {
    try {
      await educationService.completeModule(moduleId);
      set((state) => ({
        modules: state.modules.map((m) =>
          m.id === moduleId ? { ...m, completed: true, completedAt: new Date().toISOString() } : m
        ),
      }));
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to mark complete';
      set({ error: message });
    }
  },
}));

export default useEducationStore;
