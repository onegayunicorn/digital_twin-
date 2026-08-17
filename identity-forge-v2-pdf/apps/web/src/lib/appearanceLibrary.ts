/**
 * APPEARANCE LIBRARY — Complete character appearance catalog
 */

export interface HairStyle {
  id: string;
  name: string;
  type: 'short' | 'medium' | 'long' | 'curly' | 'straight' | 'styled';
  colors: string[];
}

export interface ClothingItem {
  id: string;
  name: string;
  type: 'top' | 'bottom' | 'full' | 'accessory';
  style: 'casual' | 'formal' | 'sporty' | 'cyberpunk' | 'sovereign';
  colors: string[];
}

export interface FacialDetail {
  id: string;
  name: string;
  type: 'eyes' | 'nose' | 'mouth' | 'jaw' | 'brows' | 'cheeks';
  variants: number[];
}

export const HairLibrary: HairStyle[] = [
  {
    id: 'hair-1',
    name: 'Short Classic',
    type: 'short',
    colors: ['#1a1a2e', '#2d2d44', '#4a4a6a'],
  },
  {
    id: 'hair-2',
    name: 'Medium Flow',
    type: 'medium',
    colors: ['#1a1a2e', '#2d2d44', '#4a4a6a'],
  },
  {
    id: 'hair-3',
    name: 'Long Waves',
    type: 'long',
    colors: ['#1a1a2e', '#2d2d44', '#4a4a6a'],
  },
  {
    id: 'hair-4',
    name: 'Cyberpunk Mohawk',
    type: 'styled',
    colors: ['#00e5ff', '#a78bfa', '#ff6b6b'],
  },
  {
    id: 'hair-5',
    name: 'Sovereign Crown',
    type: 'styled',
    colors: ['#f5d58a', '#00e5ff', '#a78bfa'],
  },
];

export const ClothingLibrary: ClothingItem[] = [
  {
    id: 'cloth-1',
    name: 'Sovereign Suit',
    type: 'full',
    style: 'sovereign',
    colors: ['#0a0a1a', '#1a1a2e', '#2d2d44'],
  },
  {
    id: 'cloth-2',
    name: 'Cyber Jacket',
    type: 'top',
    style: 'cyberpunk',
    colors: ['#00e5ff', '#a78bfa', '#1a1a2e'],
  },
  {
    id: 'cloth-3',
    name: 'Casual Hoodie',
    type: 'top',
    style: 'casual',
    colors: ['#2d2d44', '#4a4a6a', '#6a6a8a'],
  },
  {
    id: 'cloth-4',
    name: 'Tech Pants',
    type: 'bottom',
    style: 'sporty',
    colors: ['#1a1a2e', '#2d2d44', '#00e5ff'],
  },
  {
    id: 'cloth-5',
    name: 'Formal Blazer',
    type: 'top',
    style: 'formal',
    colors: ['#0a0a1a', '#1a1a2e', '#2d2d44'],
  },
];

export const FacialDetailLibrary: FacialDetail[] = [
  {
    id: 'face-1',
    name: 'Almond Eyes',
    type: 'eyes',
    variants: [0.3, 0.5, 0.7],
  },
  {
    id: 'face-2',
    name: 'Roman Nose',
    type: 'nose',
    variants: [0.3, 0.5, 0.7],
  },
  {
    id: 'face-3',
    name: 'Full Lips',
    type: 'mouth',
    variants: [0.3, 0.5, 0.7],
  },
  {
    id: 'face-4',
    name: 'Strong Jaw',
    type: 'jaw',
    variants: [0.3, 0.5, 0.7],
  },
  {
    id: 'face-5',
    name: 'Arched Brows',
    type: 'brows',
    variants: [0.3, 0.5, 0.7],
  },
  {
    id: 'face-6',
    name: 'High Cheeks',
    type: 'cheeks',
    variants: [0.3, 0.5, 0.7],
  },
];

// ─── Convenience Functions ─────────────────────────────────────

export function getHairById(id: string): HairStyle | undefined {
  return HairLibrary.find((h) => h.id === id);
}

export function getClothingById(id: string): ClothingItem | undefined {
  return ClothingLibrary.find((c) => c.id === id);
}

export function getFacialDetailById(id: string): FacialDetail | undefined {
  return FacialDetailLibrary.find((f) => f.id === id);
}

export function getHairStylesByType(
  type: HairStyle['type']
): HairStyle[] {
  return HairLibrary.filter((h) => h.type === type);
}

export function getClothingByStyle(
  style: ClothingItem['style']
): ClothingItem[] {
  return ClothingLibrary.filter((c) => c.style === style);
}

export function getFacialDetailsByType(
  type: FacialDetail['type']
): FacialDetail[] {
  return FacialDetailLibrary.filter((f) => f.type === type);
}
