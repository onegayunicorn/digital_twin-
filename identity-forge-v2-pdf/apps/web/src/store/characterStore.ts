import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { YeeCell } from '../engines/nogap/YeeLatticeNoGap';
import { Vector3D } from '../engines/nogap/NoGapTheoryEngine';

// ─── Identity
type Gender = 'male' | 'female' | 'non-binary' | 'other';

// ─── Facial Vector
interface FacialVector {
  eyes: number;
  nose: number;
  mouth: number;
  jaw: number;
  brows: number;
  cheeks: number;
}

// ─── Appearance
interface Appearance {
  hair: string;
  hairColor: string;
  clothing: string;
  clothingColor: string;
  skinTone: string;
  eyeColor: string;
}

// ─── 24-Hour Lifestyle
type ActivityLevel = 'low' | 'medium' | 'high';

interface Lifestyle {
  wakeTime: string;
  sleepTime: string;
  activity: ActivityLevel;
  occupation: string;
  timezone: string;
}

// ─── Yee Lattice State
interface NoGapState {
  electric: Vector3D;
  magnetic: Vector3D;
  density: number;
  pressure: number;
}

interface LatticeState {
  cells: YeeCell[];
  nogap: NoGapState;
}

// ─── Complete Character State
interface CharacterState {
  // Identity
  gender: Gender;
  heritage: string;
  name: string;

  // Facial Vector
  facialVector: FacialVector;

  // Appearance
  appearance: Appearance;

  // 24-Hour Lifestyle
  lifestyle: Lifestyle;

  // Yee Lattice
  lattice: LatticeState;
}

// ─── Store Actions
interface CharacterStore extends CharacterState {
  // Identity actions
  setGender: (gender: Gender) => void;
  setHeritage: (heritage: string) => void;
  setName: (name: string) => void;

  // Facial Vector actions
  setFacialVector: (key: keyof FacialVector, value: number) => void;

  // Appearance actions
  setAppearance: <K extends keyof Appearance>(key: K, value: Appearance[K]) => void;

  // Lifestyle actions
  setLifestyle: <K extends keyof Lifestyle>(key: K, value: Lifestyle[K]) => void;

  // Lattice actions
  setLattice: (cells: YeeCell[]) => void;

  // Export/Import
  exportCharacter: () => string;
  importCharacter: (data: string) => void;
}

// ─── Default State
const defaultState: CharacterState = {
  // Identity
  gender: 'non-binary',
  heritage: 'Universal',
  name: 'Identity Forge',

  // Facial Vector
  facialVector: {
    eyes: 0.5,
    nose: 0.5,
    mouth: 0.5,
    jaw: 0.5,
    brows: 0.5,
    cheeks: 0.5,
  },

  // Appearance
  appearance: {
    hair: 'default',
    hairColor: '#1a1a2e',
    clothing: 'default',
    clothingColor: '#00e5ff',
    skinTone: '#e8d5c0',
    eyeColor: '#a78bfa',
  },

  // 24-Hour Lifestyle
  lifestyle: {
    wakeTime: '07:00',
    sleepTime: '23:00',
    activity: 'medium',
    occupation: 'Creator',
    timezone: 'UTC',
  },

  // Yee Lattice
  lattice: {
    cells: [],
    nogap: {
      electric: { x: 0, y: 0, z: 0 },
      magnetic: { x: 0, y: 0, z: 0 },
      density: 1.0,
      pressure: 1.0,
    },
  },
};

// ─── Store Creation
export const useCharacterStore = create<CharacterStore>()(
  persist(
    (set, get) => ({
      ...defaultState,

      // ─── Identity Actions ──────────────────────────────────
      setGender: (gender) => set({ gender }),
      setHeritage: (heritage) => set({ heritage }),
      setName: (name) => set({ name }),

      // ─── Facial Vector Actions ─────────────────────────────
      setFacialVector: (key, value) => {
        set((state) => ({
          facialVector: {
            ...state.facialVector,
            [key]: value,
          },
        }));
      },

      // ─── Appearance Actions ────────────────────────────────
      setAppearance: (key, value) => {
        set((state) => ({
          appearance: {
            ...state.appearance,
            [key]: value,
          },
        }));
      },

      // ─── Lifestyle Actions ─────────────────────────────────
      setLifestyle: (key, value) => {
        set((state) => ({
          lifestyle: {
            ...state.lifestyle,
            [key]: value,
          },
        }));
      },

      // ─── Lattice Actions ───────────────────────────────────
      setLattice: (cells) => {
        set((state) => ({
          lattice: {
            ...state.lattice,
            cells,
          },
        }));
      },

      // ─── Export/Import ─────────────────────────────────────
      exportCharacter: () => {
        return JSON.stringify(get(), null, 2);
      },

      importCharacter: (data) => {
        try {
          const parsed = JSON.parse(data);
          set(parsed);
        } catch (e) {
          console.error('Failed to import character:', e);
        }
      },
    }),
    {
      name: 'identity-forge-character',
      version: 2,
    }
  )
);
