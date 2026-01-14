type Variable = {
  name: string;
  value: string;
  description?: string;
};

type VariableState = {
  variables: Variable[];
};

type VariableActions = {
  addVariable: (variable: Variable) => void;
  updateVariable: (index: number, variable: Partial<Variable>) => void;
  removeVariable: (index: number) => void;
  clearVariables: () => void;
};

export type VariableStore = VariableState & { actions: VariableActions };
