

export interface Proposal {
  style: string;
  redesignedImage: string; // base64 string
  moodBoard: string; // base6  4 string
  description: string;
  objectsUsed: string; // Add this field
  furnitureRecommendation: string; // Add this field for furniture recommendation
  colorPalette: string[]; // Added for color palette
}

export enum AppView {
  UPLOAD = 'UPLOAD',
  LOADING = 'LOADING',
  RESULTS = 'RESULTS',
  REFINEMENT = 'REFINEMENT',
}

export const DECOR_STYLES = [
  "Moderno",
  "Escandinavo",
  "Industrial",
] as const;

export type DecorStyle = typeof DECOR_STYLES[number];