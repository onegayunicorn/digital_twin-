import { useState, useEffect, useCallback, useRef } from 'react';
import { ReflectionEngine, ReflectionResult } from '../engines/reflection/ReflectionEngine';
import { LatticePoint, Vector5D, clampVector5D } from '../core/types';

interface UseReflectionOptions {
  resolution?: number;
  seed?: number;
  initialIntensity?: number;
  initialDepth?: number;
}

interface UseReflectionReturn {
  engine: ReflectionEngine | null;
  points: LatticePoint[];
  intensity: number;
  depth: number;
  lastResult: ReflectionResult | null;
  setIntensity: (value: number) => void;
  setDepth: (value: number) => void;
  applyReflection: (depth: number) => ReflectionResult | null;
  getIntensityAt: (position: Vector5D) => number;
  getGradient: (position: Vector5D) => Vector5D;
  reset: () => void;
  isReady: boolean;
}

/**
 * useReflection — React hook for managing the 5D reflection engine
 */
export function useReflection(options: UseReflectionOptions = {}): UseReflectionReturn {
  const { resolution = 32, seed = 42, initialIntensity = 1.0, initialDepth = 0 } = options;

  const engineRef = useRef<ReflectionEngine | null>(null);
  const [points, setPoints] = useState<LatticePoint[]>([]);
  const [intensity, setIntensityState] = useState(initialIntensity);
  const [depth, setDepthState] = useState(initialDepth);
  const [lastResult, setLastResult] = useState<ReflectionResult | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const engine = new ReflectionEngine(resolution, seed);
    engineRef.current = engine;
    setPoints(engine.getLatticeEngine().getPoints());
    setIsReady(true);

    return () => {
      engineRef.current = null;
    };
  }, [resolution, seed]);

  const setIntensity = useCallback((value: number) => {
    const safe = Math.max(0, Math.min(1, value));
    setIntensityState(safe);
    engineRef.current?.setIntensity(safe);
  }, []);

  const setDepth = useCallback((value: number) => {
    const safe = Math.max(0, Math.min(1, value));
    setDepthState(safe);
  }, []);

  const applyReflection = useCallback((depth: number): ReflectionResult | null => {
    if (!engineRef.current) return null;
    const result = engineRef.current.applyReflection(depth);
    setLastResult(result);
    setPoints(result.points);
    return result;
  }, []);

  const getIntensityAt = useCallback((position: Vector5D): number => {
    if (!engineRef.current) return 0;
    return engineRef.current.getIntensityAt(clampVector5D(position));
  }, []);

  const getGradient = useCallback((position: Vector5D): Vector5D => {
    if (!engineRef.current) return [0, 0, 0, 0, 0];
    return engineRef.current.getGradient(clampVector5D(position));
  }, []);

  const reset = useCallback(() => {
    if (!engineRef.current) return;
    engineRef.current.reset();
    setPoints(engineRef.current.getLatticeEngine().getPoints());
    setIntensityState(initialIntensity);
    setDepthState(initialDepth);
    setLastResult(null);
  }, [initialIntensity, initialDepth]);

  return {
    engine: engineRef.current,
    points,
    intensity,
    depth,
    lastResult,
    setIntensity,
    setDepth,
    applyReflection,
    getIntensityAt,
    getGradient,
    reset,
    isReady,
  };
}
