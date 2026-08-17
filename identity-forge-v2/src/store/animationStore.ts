import { create } from 'zustand';
import { FrameData, TransitionType } from '../core/types';

interface AnimationStoreState {
  animations: Map<string, {
    id: string;
    name: string;
    frames: FrameData[];
    fps: number;
    loop: boolean;
    transitionStyle: TransitionType;
  }>;
  currentAnimationId: string | null;
  currentTime: number;
  isPlaying: boolean;
  snapshots: { timestamp: number; label: string; data: any }[];
}

interface AnimationStoreActions {
  createAnimation: (name: string, frames: FrameData[]) => string;
  deleteAnimation: (id: string) => void;
  setCurrentAnimation: (id: string | null) => void;
  addFrame: (animationId: string, frame: FrameData) => void;
  removeFrame: (animationId: string, frameIndex: number) => void;
  updateFrame: (animationId: string, frameIndex: number, updates: Partial<FrameData>) => void;
  play: () => void;
  pause: () => void;
  setTime: (time: number) => void;
  setFps: (animationId: string, fps: number) => void;
  saveSnapshot: (label: string) => void;
  restoreSnapshot: (timestamp: number) => void;
  deleteSnapshot: (timestamp: number) => void;
  reset: () => void;
}

export type AnimationStore = AnimationStoreState & AnimationStoreActions;

export const useAnimationStore = create<AnimationStore>((set, get) => ({
  animations: new Map(),
  currentAnimationId: null,
  currentTime: 0,
  isPlaying: false,
  snapshots: [],

  createAnimation: (name: string, frames: FrameData[]) => {
    const id = `anim-${Date.now()}`;
    set((state) => {
      const newAnims = new Map(state.animations);
      newAnims.set(id, {
        id,
        name,
        frames,
        fps: 30,
        loop: true,
        transitionStyle: '5d',
      });
      return { animations: newAnims, currentAnimationId: id };
    });
    return id;
  },

  deleteAnimation: (id: string) => {
    set((state) => {
      const newAnims = new Map(state.animations);
      newAnims.delete(id);
      return {
        animations: newAnims,
        currentAnimationId: state.currentAnimationId === id ? null : state.currentAnimationId,
      };
    });
  },

  setCurrentAnimation: (id: string | null) => {
    set({ currentAnimationId: id, currentTime: 0 });
  },

  addFrame: (animationId: string, frame: FrameData) => {
    set((state) => {
      const anim = state.animations.get(animationId);
      if (!anim) return state;
      const newAnims = new Map(state.animations);
      newAnims.set(animationId, { ...anim, frames: [...anim.frames, frame] });
      return { animations: newAnims };
    });
  },

  removeFrame: (animationId: string, frameIndex: number) => {
    set((state) => {
      const anim = state.animations.get(animationId);
      if (!anim) return state;
      const newAnims = new Map(state.animations);
      newAnims.set(animationId, {
        ...anim,
        frames: anim.frames.filter((_, i) => i !== frameIndex),
      });
      return { animations: newAnims };
    });
  },

  updateFrame: (animationId: string, frameIndex: number, updates: Partial<FrameData>) => {
    set((state) => {
      const anim = state.animations.get(animationId);
      if (!anim) return state;
      const newAnims = new Map(state.animations);
      newAnims.set(animationId, {
        ...anim,
        frames: anim.frames.map((f, i) => (i === frameIndex ? { ...f, ...updates } : f)),
      });
      return { animations: newAnims };
    });
  },

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  setTime: (time: number) => set({ currentTime: Math.max(0, time) }),

  setFps: (animationId: string, fps: number) => {
    set((state) => {
      const anim = state.animations.get(animationId);
      if (!anim) return state;
      const newAnims = new Map(state.animations);
      newAnims.set(animationId, { ...anim, fps: Math.max(1, Math.min(120, fps)) });
      return { animations: newAnims };
    });
  },

  saveSnapshot: (label: string) => {
    set((state) => ({
      snapshots: [
        ...state.snapshots,
        { timestamp: Date.now(), label, data: JSON.parse(JSON.stringify(Array.from(state.animations.entries()))) },
      ],
    }));
  },

  restoreSnapshot: (timestamp: number) => {
    set((state) => {
      const snap = state.snapshots.find((s) => s.timestamp === timestamp);
      if (!snap) return state;
      return { animations: new Map(snap.data) };
    });
  },

  deleteSnapshot: (timestamp: number) => {
    set((state) => ({
      snapshots: state.snapshots.filter((s) => s.timestamp !== timestamp),
    }));
  },

  reset: () => {
    set({
      animations: new Map(),
      currentAnimationId: null,
      currentTime: 0,
      isPlaying: false,
      snapshots: [],
    });
  },
}));
