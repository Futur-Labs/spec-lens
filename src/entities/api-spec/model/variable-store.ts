import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { VariableStore } from './variable-types.ts';

export const useVariableStore = create<VariableStore>()(
  persist(
    (set) => ({
      variables: [],

      actions: {
        addVariable: (variable) =>
          set((state) => ({
            variables: [...state.variables, variable],
          })),

        updateVariable: (index, variable) =>
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
      partialize: (state) => ({
        variables: state.variables,
      }),
    },
  ),
);

export const variableStoreActions = useVariableStore.getState().actions;

export const useVariables = () => useVariableStore((s) => s.variables);
