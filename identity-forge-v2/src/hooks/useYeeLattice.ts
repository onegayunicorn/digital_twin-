import { useState, useEffect, useCallback, useRef } from 'react';
import { HardenedYeeLatticeEngine } from '../engines/reflection/HardenedYeeLattice';
import { LatticePoint, Vector5D } from '../core/types';

interface UseYeeLatticeOptions {
  resolution?: number;
  morphTargets?: string[];
  beta?: number;
  seed?: number;
  maxEnergy?: number;
  autoGenerate?: boolean;
}

interface UseYeeLatticeReturn {
  engine: HardenedYeeLatticeEngine | null;
  points: LatticePoint[];
  isGenerating: boolean;
  energy: number;
  morphCenters: Map<string, Vector5D>;
  generate: () => void;
  computeMemberships: (position: Vector5D) => Map<string, number>;
  computeReflection: (point: LatticePoint, depth: number) => LatticePoint;
  getMorphWeights: (target: string) => Float32Array;
  enforceEnergyBound: () => boolean;
  reseed: (seed: number) => void;
}

/**
 * useYeeLattice — React hook for managing the hardened Yee lattice engine
 */
export function useYeeLattice(options: UseYeeLatticeOptions = {}): UseYeeLatticeReturn {
  const {
    resolution = 32,
    morphTargets,
    beta = 4.0,
    seed = 42,
    maxEnergy = 5.0,
    autoGenerate = true,
  } = options;

  const engineRef = useRef<HardenedYeeLatticeEngine | null>(null);
  const [points, setPoints] = useState<LatticePoint[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [energy, setEnergy] = useState(0);
  const [morphCenters, setMorphCenters] = useState<Map<string, Vector5D>>(new Map());

  useEffect(() => {
    const engine = new HardenedYeeLatticeEngine({
      resolution,
      morphTargets,
      beta,
      seed,
      maxEnergy,
    });
    engineRef.current = engine;
    setMorphCenters(engine.getMorphCenters());

    if (autoGenerate) {
      generate();
    }

    return () => {
      engineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolution, beta, seed, maxEnergy]);

  const generate = useCallback(() => {
    if (!engineRef.current) return;
    setIsGenerating(true);
    // Use setTimeout to allow UI to update
    setTimeout(() => {
      if (engineRef.current) {
        const pts = engineRef.current.generateLattice();
        setPoints(pts);
        setEnergy(engineRef.current.computeEnergy());
        setIsGenerating(false);
      }
    }, 0);
  }, []);

  const computeMemberships = useCallback((position: Vector5D): Map<string, number> => {
    if (!engineRef.current) return new Map();
    return engineRef.current.computeMemberships(position);
  }, []);

  const computeReflection = useCallback((point: LatticePoint, depth: number): LatticePoint => {
    if (!engineRef.current) return point;
    return engineRef.current.computeReflection(point, depth);
  }, []);

  const getMorphWeights = useCallback((target: string): Float32Array => {
    if (!engineRef.current) return new Float32Array();
    return engineRef.current.getMorphWeights(target);
  }, []);

  const enforceEnergyBound = useCallback((): boolean => {
    if (!engineRef.current) return false;
    const damped = engineRef.current.enforceEnergyBound();
    if (damped) {
      setPoints(engineRef.current.getPoints());
      setEnergy(engineRef.current.computeEnergy());
    }
    return damped;
  }, []);

  const reseed = useCallback((newSeed: number) => {
    if (!engineRef.current) return;
    engineRef.current.reseed(newSeed);
    generate();
  }, [generate]);

  return {
    engine: engineRef.current,
    points,
    isGenerating,
    energy,
    morphCenters,
    generate,
    computeMemberships,
    computeReflection,
    getMorphWeights,
    enforceEnergyBound,
    reseed,
  };
}
