import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MorphWeights, FrameData, LatticePoint } from '../core/types';

export interface CharacterState {
  id: string;
  name: string;
  morphWeights: MorphWeights;
  appearance: {
    hair: string;
    clothing: string;
    facialFeatures: string[];
    skinTone: string;
  };
  animation: {
    currentFrame: number;
    isPlaying: boolean;
    fps: number;
  };
  reflection: {
    intensity: number;
    depth: number;
    quality: 'low' | 'medium' | 'high' | 'ultra';
  };
  yeeLattice: LatticePoint[];
  slideFrames: FrameData[];
}

export interface CharacterStore {
  state: CharacterState;
  setMorphWeight: (key: string, value: number) => void;
  setAppearance: (key: string, value: any) => void;
  setAnimation: (key: string, value: any) => void;
  setReflection: (key: string, value: any) => void;
  setYeeLattice: (lattice: LatticePoint[]) => void;
  setSlideFrames: (frames: FrameData[]) => void;
  setName: (name: string) => void;
  exportCharacter: () => string;
  importCharacter: (data: string) => void;
  reset: () => void;
}

const defaultState: CharacterState = {
  id: '',
  name: 'Character',
  morphWeights: {
    eyes: 0.5,
    nose: 0.5,
    mouth: 0.5,
    jaw: 0.5,
    brows: 0.5,
    cheeks: 0.5,
  },
  appearance: {
    hair: 'default',
    clothing: 'default',
    facialFeatures: [],
    skinTone: '#e8d5c0',
  },
  animation: {
    currentFrame: 0,
    isPlaying: false,
    fps: 30,
  },
  reflection: {
    intensity: 1.0,
    depth: 0.5,
    quality: 'ultra',
  },
  yeeLattice: [],
  slideFrames: [],
};

export const useCharacterStore = create<CharacterStore>()(
  persist(
    (set, get) => ({
      state: { ...defaultState, id: Date.now().toString() },

      setMorphWeight: (key: string, value: number) => {
        set((store) => ({
          state: {
            ...store.state,
            morphWeights: {
              ...store.state.morphWeights,
              [key]: Math.max(0, Math.min(1, value)),
            },
          },
        }));
      },

      setAppearance: (key: string, value: any) => {
        set((store) => ({
          state: {
            ...store.state,
            appearance: {
              ...store.state.appearance,
              [key]: value,
            },
          },
        }));
      },

      setAnimation: (key: string, value: any) => {
        set((store) => ({
          state: {
            ...store.state,
            animation: {
              ...store.state.animation,
              [key]: value,
            },
          },
        }));
      },

      setReflection: (key: string, value: any) => {
        set((store) => ({
          state: {
            ...store.state,
            reflection: {
              ...store.state.reflection,
              [key]: value,
            },
          },
        }));
      },

      setYeeLattice: (lattice: LatticePoint[]) => {
        set((store) => ({
          state: {
            ...store.state,
            yeeLattice: lattice,
          },
        }));
      },

      setSlideFrames: (frames: FrameData[]) => {
        set((store) => ({
          state: {
            ...store.state,
            slideFrames: frames,
          },
        }));
      },

      setName: (name: string) => {
        set((store) => ({
          state: { ...store.state, name },
        }));
      },

      exportCharacter: () => {
        return JSON.stringify(get().state, null, 2);
      },

      importCharacter: (data: string) => {
        try {
          const parsed = JSON.parse(data);
          set({ state: { ...defaultState, ...parsed, id: parsed.id || Date.now().toString() } });
        } catch (e) {
          console.error('Failed to import character:', e);
        }
      },

      reset: () => {
        set({ state: { ...defaultState, id: Date.now().toString() } });
      },
    }),
    {
      name: 'identity-forge-character',
      version: 2,
    }
  )
);
