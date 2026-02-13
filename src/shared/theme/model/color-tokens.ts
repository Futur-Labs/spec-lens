import { colorPrimitives as p } from './color-primitives';

export type SemanticColors = {
  bg: {
    base: string;
    elevated: string;
    subtle: string;
    overlay: string;
    overlayHover: string;
    input: string;
    autoComplete: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    disabled: string;
    onBrand: string;
  };
  border: {
    default: string;
    subtle: string;
    input: string;
    focus: string;
  };
  interactive: {
    primary: string;
    primaryHover: string;
    primaryActive: string;
  };
  feedback: {
    success: string;
    error: string;
    warning: string;
    info: string;
  };
};

export const darkColors: SemanticColors = {
  bg: {
    base: p.neutral[50],
    elevated: p.neutral[100],
    subtle: p.neutral[150],
    overlay: p.whiteAlpha[5],
    overlayHover: p.whiteAlpha[10],
    input: p.whiteAlpha[5],
    autoComplete: p.whiteAlpha[5],
  },
  text: {
    primary: p.neutral[1000],
    secondary: p.neutral[850],
    tertiary: p.neutral[750],
    disabled: p.neutral[700],
    onBrand: p.neutral[1300],
  },
  border: {
    default: p.whiteAlpha[10],
    subtle: p.whiteAlpha[8],
    input: p.whiteAlpha[10],
    focus: p.brand[500],
  },
  interactive: {
    primary: p.brand[500],
    primaryHover: p.brand[400],
    primaryActive: p.brand[600],
  },
  feedback: {
    success: p.green[500],
    error: p.red[500],
    warning: p.amber[500],
    info: p.blue[500],
  },
};

export const lightColors: SemanticColors = {
  bg: {
    base: p.neutral[1300],
    elevated: p.neutral[1200],
    subtle: p.neutral[1100],
    overlay: p.blackAlpha[3],
    overlayHover: p.blackAlpha[8],
    input: p.neutral[1300],
    autoComplete: p.neutral[1300],
  },
  text: {
    primary: p.neutral[200],
    secondary: p.neutral[400],
    tertiary: p.neutral[600],
    disabled: p.neutral[800],
    onBrand: p.neutral[1300],
  },
  border: {
    default: p.neutral[900],
    subtle: p.blackAlpha[8],
    input: p.neutral[900],
    focus: p.brand[500],
  },
  interactive: {
    primary: p.brand[500],
    primaryHover: p.brand[400],
    primaryActive: p.brand[600],
  },
  feedback: {
    success: p.green[500],
    error: p.red[500],
    warning: p.amber[500],
    info: p.blue[500],
  },
};
