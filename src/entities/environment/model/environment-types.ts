export type EnvironmentVariable = {
  name: string;
  value: string;
};

export type Environment = {
  id: string;
  name: string;
  baseUrl: string;
  variables: EnvironmentVariable[];
  color: string;
};

type EnvironmentState = {
  environments: Environment[];
  activeEnvironmentIds: string[];
};

type EnvironmentActions = {
  addEnvironment: (env: Environment) => void;
  updateEnvironment: (id: string, updates: Partial<Omit<Environment, 'id'>>) => void;
  removeEnvironment: (id: string) => void;
  toggleEnvironment: (id: string) => void;
};

export type EnvironmentStore = EnvironmentState & { actions: EnvironmentActions };
