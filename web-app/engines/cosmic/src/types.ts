export type CelestialBody = {
  id: string;
  name: string;
  mass: number; // in relative scale (Sun = 100, Jupiter = 15, Earth = 1.0, etc.)
  density: number; // core density rho_i
  distance: number; // orbital radius
  orbitalSpeed: number; // angular velocity
  radius: number; // visual scale
  color: string;
  emissive?: string;
  hasRings?: boolean;
  angle: number; // current orbit angle in radians
  position: [number, number, number];
  displacementDepth: number; // computed lattice warp depth
  albedo: number; // reflection coefficient for scattered photon pressure
};

export type PhotosyntheticGrowthParams = {
  P_sun: number; // Total radiant power output of the Sun (Watts / normalized units)
  eta_atm: number; // Scattering attenuation coefficient of intervening space/atmosphere (0.0 - 1.0)
  phi_yield: number; // Quantum efficiency yield (photons absorbed per molecule synthesized)
  E_growth: number; // Minimum volumetric energy density threshold (J/m^3 / normalized)
};

export type AsteroidParticle = {
  id: number;
  baseRadius: number;
  angle: number;
  speed: number;
  inclination: number;
  crossSectionArea: number; // A_asteroid
  position: [number, number, number];
  velocity: [number, number, number];
  D_lattice: [number, number, number]; // Inward pull vector (Lattice Density Displacement)
  P_photon: [number, number, number]; // Outward push vector (Photonic Radiation Pressure)
  P_void: [number, number, number]; // Inward cosmic inversion containment vector
  F_net: [number, number, number]; // Total vector sum (should equal 0 at equilibrium)
  isInConduit: boolean; // locked into deterministic track
  certaintyScore: number; // 0.0 - 1.0 (strictness of mathematical path)
};

export type ResonanceMeshNode = {
  id: number;
  x: number;
  y: number;
  z: number;
  restZ: number;
  amplitude: number;
  velocity: number;
  phase: number;
  energyPulse: number;
};

export type CosmicConfig = {
  seed?: number;
  latticeResolution?: number;
  meshResolution?: number;
  asteroidCount?: number;
  photosynthetic?: Partial<PhotosyntheticGrowthParams>;
  pushPullFrequency?: number;
  voidPressure?: number;
};

export type CosmicSnapshot = {
  status: "SIMULATED";
  tick: number;
  time: number;
  
  // 1. Equilibrium Lattice
  lattice: {
    density: number;
    displacement: number;
    restoringForce: number;
    harmonicPhase: number; // 0 to 2*pi
    pushPullState: "PULL_CONTRACTION" | "PUSH_EXPANSION";
    oscillatorRatio: number; // -1.0 to +1.0
    fluidElasticity: number;
    gravitationalWarpDepth: number;
    celestialBodies: CelestialBody[];
    heightGrid: number[][]; // 2D displacement heightmap for 3D visualization
  };

  // 2. 5D Reflection Grid & Photosynthetic Growth
  lightGrid: {
    params: PhotosyntheticGrowthParams;
    delta_x: number; // calculated Photosynthetic Growth Spacing
    delta_x_formula: string;
    solarRadiantPower: number;
    illuminationIntensity: number;
    shadowAlignment: number;
    photonDensity: number;
    solarFlareActive: boolean;
    solarFlareIntensity: number;
    opticalRayCount: number;
    umbralCones: Array<{
      bodyId: string;
      origin: [number, number, number];
      direction: [number, number, number];
      length: number;
      radius: number;
      isColdCell: boolean;
    }>;
  };

  // 3. Photonic Resonance Mesh
  resonanceMesh: {
    activeNodes: number;
    totalNodes: number;
    averagePulse: number;
    propagationSpeed: number;
    vibrationalFrequency: number;
    meshTension: number;
    dampingFactor: number;
    nodes: ResonanceMeshNode[];
    radiationPressureScale: number;
  };

  // 4. Void Field & Cosmic Inversion
  voidField: {
    pressureIndex: number; // Ambient dark pressure pushing inward
    inversionForce: number;
    thermodynamicTension: number; // Tension gradient between hot light and cold void
    entropyIndex: number;
    containmentRadius: number;
    systemStabilized: boolean;
  };

  // 5. Deterministic Asteroid Conduit System
  asteroidSystem: {
    asteroids: AsteroidParticle[];
    averageNetForce: number;
    deterministicCertaintyIndex: number; // ~1.0 when locked into geometric pipe
    equilibriumPipeRadius: number;
    activeConduits: number;
  };

  safety: "within-cap" | "reset-after-cap";
  boundary: string;
};

export const COSMIC_BOUNDARY = "Dimensionless interactive cosmic simulation engine; mathematical models for equilibrium lattice, 5D reflection grid, photonic resonance mesh, and void pressure dynamics.";

export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
