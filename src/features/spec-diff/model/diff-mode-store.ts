import { create } from 'zustand';

type DiffModeState = {
  isDiffMode: boolean;
  actions: {
    toggleDiffMode: () => void;
    closeDiffMode: () => void;
  };
};

export const useDiffModeStore = create<DiffModeState>()((set) => ({
  isDiffMode: false,
  actions: {
    toggleDiffMode: () => set((s) => ({ isDiffMode: !s.isDiffMode })),
    closeDiffMode: () => set({ isDiffMode: false }),
  },
}));

export const diffModeActions = useDiffModeStore.getState().actions;
export const useIsDiffMode = () => useDiffModeStore((s) => s.isDiffMode);
