import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { Variable } from './api-tester-types.ts';

// ========== Variable Store ==========

export interface VariableState {
  variables: Variable[];
}

export interface VariableActions {
  addVariable: (variable: Variable) => void;
  updateVariable: (index: number, variable: Partial<Variable>) => void;
  removeVariable: (index: number) => void;
  clearVariables: () => void;
}

export type VariableStore = VariableState & { actions: VariableActions };

export const useVariableStore = create<VariableStore>()(
  persist(
    (set) => ({
      variables: [],

      actions: {
        addVariable: (variable: Variable) =>
          set((state) => ({
            variables: [...state.variables, variable],
          })),

        updateVariable: (index: number, variable: Partial<Variable>) =>
          set((state) => {
            const newVariables = [...state.variables];
            newVariables[index] = { ...newVariables[index], ...variable };
            return { variables: newVariables };
          }),

        removeVariable: (index: number) =>
          set((state) => ({
            variables: state.variables.filter((_, i) => i !== index),
          })),

        clearVariables: () => set({ variables: [] }),
      },
    }),
    {
      name: 'api-tester-variables',
      version: 1,
    },
  ),
);

// Actions - can be used outside of React components
export const variableStoreActions = useVariableStore.getState().actions;

// Selector hooks
export const useVariables = () => useVariableStore((s) => s.variables);
