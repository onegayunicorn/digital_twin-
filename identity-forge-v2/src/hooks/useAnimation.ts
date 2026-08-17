import { useState, useEffect, useCallback, useRef } from 'react';
import { HardenedSlideSequencer } from '../engines/animation/HardenedSlideSequencer';
import { FrameData, TransitionType } from '../core/types';

interface UseAnimationOptions {
  autoPlay?: boolean;
  defaultFps?: number;
}

interface UseAnimationReturn {
  sequencer: HardenedSlideSequencer | null;
  animations: any[];
  currentAnimation: any | null;
  currentTime: number;
  isPlaying: boolean;
  createAnimation: (name: string, frames: FrameData[]) => any;
  addFrame: (animationId: string, frame: FrameData) => void;
  play: (animationId: string) => void;
  stop: () => void;
  getFrameAtTime: (animationId: string, time: number) => FrameData | null;
  computeSmoothness: (animationId: string) => number;
  optimizeSmoothness: (animationId: string) => void;
  exportAnimation: (animationId: string) => string;
  importAnimation: (data: string) => any | null;
  deleteAnimation: (animationId: string) => boolean;
}

/**
 * useAnimation — React hook for managing the hardened slide sequencer
 */
export function useAnimation(options: UseAnimationOptions = {}): UseAnimationReturn {
  const { autoPlay = false, defaultFps = 30 } = options;

  const sequencerRef = useRef<HardenedSlideSequencer | null>(null);
  const [animations, setAnimations] = useState<any[]>([]);
  const [currentAnimation, setCurrentAnimation] = useState<any | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    sequencerRef.current = new HardenedSlideSequencer();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      sequencerRef.current = null;
    };
  }, []);

  const refreshAnimations = useCallback(() => {
    if (sequencerRef.current) {
      setAnimations(sequencerRef.current.getAnimations());
      setCurrentAnimation(sequencerRef.current.getCurrentAnimation());
    }
  }, []);

  const createAnimation = useCallback((name: string, frames: FrameData[]) => {
    if (!sequencerRef.current) return null;
    const anim = sequencerRef.current.createAnimation(name, frames, { fps: defaultFps });
    refreshAnimations();
    return anim;
  }, [defaultFps, refreshAnimations]);

  const addFrame = useCallback((animationId: string, frame: FrameData) => {
    sequencerRef.current?.addFrame(animationId, frame);
    refreshAnimations();
  }, [refreshAnimations]);

  const play = useCallback((animationId: string) => {
    if (!sequencerRef.current) return;
    sequencerRef.current.play(animationId);
    setIsPlaying(true);
    refreshAnimations();

    // Time tracking
    const startTime = performance.now();
    const tick = () => {
      if (sequencerRef.current && sequencerRef.current.getIsPlaying()) {
        setCurrentTime(sequencerRef.current.getCurrentTime());
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setIsPlaying(false);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [refreshAnimations]);

  const stop = useCallback(() => {
    sequencerRef.current?.stop();
    setIsPlaying(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  const getFrameAtTime = useCallback((animationId: string, time: number): FrameData | null => {
    if (!sequencerRef.current) return null;
    const anim = sequencerRef.current.getAnimation(animationId);
    if (!anim) return null;
    return sequencerRef.current['getFrameAtTime'](anim, time);
  }, []);

  const computeSmoothness = useCallback((animationId: string): number => {
    if (!sequencerRef.current) return 0;
    const anim = sequencerRef.current.getAnimation(animationId);
    if (!anim) return 0;
    return sequencerRef.current.computeSmoothness(anim);
  }, []);

  const optimizeSmoothness = useCallback((animationId: string) => {
    sequencerRef.current?.optimizeSmoothness(animationId);
    refreshAnimations();
  }, [refreshAnimations]);

  const exportAnimation = useCallback((animationId: string): string => {
    return sequencerRef.current?.exportAnimation(animationId) || '{}';
  }, []);

  const importAnimation = useCallback((data: string): any | null => {
    const result = sequencerRef.current?.importAnimation(data) || null;
    if (result) refreshAnimations();
    return result;
  }, [refreshAnimations]);

  const deleteAnimation = useCallback((animationId: string): boolean => {
    const result = sequencerRef.current?.deleteAnimation(animationId) ?? false;
    if (result) refreshAnimations();
    return result;
  }, [refreshAnimations]);

  return {
    sequencer: sequencerRef.current,
    animations,
    currentAnimation,
    currentTime,
    isPlaying,
    createAnimation,
    addFrame,
    play,
    stop,
    getFrameAtTime,
    computeSmoothness,
    optimizeSmoothness,
    exportAnimation,
    importAnimation,
    deleteAnimation,
  };
}
