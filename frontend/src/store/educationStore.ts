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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load modules';

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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to mark complete';
      set({ error: message });
    }
  },
}));

export default useEducationStore;
