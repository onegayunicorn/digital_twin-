import { clamp01, type CelestialBody } from "./types";

export class EquilibriumLattice {
  private density = 0.58;
  private displacement = 0.32;
  private restoringForce = 0.46;
  private harmonicPhase = 0;
  private pushPullFrequency = 0.08;
  private fluidElasticity = 0.82;
  private G = 1.0;
  private readonly resolution: number;
  private celestialBodies: CelestialBody[];

  constructor(seed = 441, resolution = 21) {
    this.resolution = resolution;
    this.celestialBodies = this.initCelestialBodies();
  }

  private initCelestialBodies(): CelestialBody[] {
    return [
      {
        id: "sun",
        name: "Solar Core (Sun)",
        mass: 80.0,
        density: 1.41,
        distance: 0,
        orbitalSpeed: 0,
        radius: 1.6,
        color: "#f59e0b",
        emissive: "#fbbf24",
        angle: 0,
        position: [0, 0, 0],
        displacementDepth: 2.2,
        albedo: 1.0,
      },
      {
        id: "mercury",
        name: "Mercury",
        mass: 0.38,
        density: 5.43,
        distance: 3.2,
        orbitalSpeed: 0.045,
        radius: 0.32,
        color: "#9ca3af",
        angle: 0.8,
        position: [3.2, 0, 0],
        displacementDepth: 0.28,
        albedo: 0.12,
      },
      {
        id: "venus",
        name: "Venus",
        mass: 0.82,
        density: 5.24,
        distance: 4.8,
        orbitalSpeed: 0.032,
        radius: 0.48,
        color: "#fbbf24",
        angle: 2.1,
        position: [4.8, 0, 0],
        displacementDepth: 0.42,
        albedo: 0.75,
      },
      {
        id: "earth",
        name: "Earth & Moon",
        mass: 1.0,
        density: 5.51,
        distance: 6.6,
        orbitalSpeed: 0.024,
        radius: 0.52,
        color: "#38bdf8",
        emissive: "#0284c7",
        angle: 4.2,
        position: [6.6, 0, 0],
        displacementDepth: 0.56,
        albedo: 0.39,
      },
      {
        id: "mars",
        name: "Mars",
        mass: 0.53,
        density: 3.93,
        distance: 8.5,
        orbitalSpeed: 0.019,
        radius: 0.4,
        color: "#f87171",
        angle: 1.3,
        position: [8.5, 0, 0],
        displacementDepth: 0.35,
        albedo: 0.25,
      },
      {
        id: "jupiter",
        name: "Jupiter",
        mass: 14.5,
        density: 1.33,
        distance: 12.0,
        orbitalSpeed: 0.011,
        radius: 1.05,
        color: "#fde047",
        angle: 5.6,
        position: [12.0, 0, 0],
        displacementDepth: 1.45,
        albedo: 0.52,
      },
      {
        id: "saturn",
        name: "Saturn",
        mass: 8.2,
        density: 0.69,
        distance: 15.8,
        orbitalSpeed: 0.0075,
        radius: 0.88,
        color: "#e2e8f0",
        hasRings: true,
        angle: 3.7,
        position: [15.8, 0, 0],
        displacementDepth: 1.05,
        albedo: 0.47,
      },
    ];
  }

  setPushPullFrequency(freq: number) {
    this.pushPullFrequency = Math.max(0.01, Math.min(0.5, freq));
  }

  setMassMultiplier(factor: number) {
    this.celestialBodies.forEach((b) => {
      if (b.id !== "sun") b.displacementDepth = (b.mass * factor * b.density) / 8;
    });
  }

  // Calculates the inward Density Displacement vector D_lattice at point r
  // D_lattice = - sum_i [ G * M_i * rho_i / |r - r_i|^3 ] * (r - r_i)
  calculateDisplacementVector(x: number, y: number, z: number): [number, number, number] {
    let dx = 0;
    let dy = 0;
    let dz = 0;
    const eps = 0.5; // Softening parameter to prevent singularity

    for (const body of this.celestialBodies) {
      const rx = x - body.position[0];
      const ry = y - body.position[1];
      const rz = z - body.position[2];
      const distSq = rx * rx + ry * ry + rz * rz + eps * eps;
      const dist = Math.sqrt(distSq);
      const distCube = dist * dist * dist;
      
      const factor = (this.G * body.mass * body.density) / distCube;
      dx -= factor * rx;
      dy -= factor * ry;
      dz -= factor * rz;
    }

    return [dx, dy, dz];
  }

  step(tick: number, speedMultiplier = 1.0) {
    this.harmonicPhase = (this.harmonicPhase + this.pushPullFrequency * speedMultiplier) % (2 * Math.PI);
    const oscillatorRatio = Math.sin(this.harmonicPhase);
    const pushPullState = oscillatorRatio >= 0 ? "PUSH_EXPANSION" : "PULL_CONTRACTION";

    // Update planetary orbital positions
    for (const body of this.celestialBodies) {
      if (body.distance > 0) {
        body.angle = (body.angle + body.orbitalSpeed * speedMultiplier) % (2 * Math.PI);
        // Harmonic orbital pulsation
        const harmonicDistance = body.distance * (1 + 0.04 * Math.sin(this.harmonicPhase + body.angle));
        body.position = [
          Math.cos(body.angle) * harmonicDistance,
          0.12 * Math.sin(body.angle * 2 + this.harmonicPhase), // slight 3D ecliptic tilt
          Math.sin(body.angle) * harmonicDistance,
        ];
      }
    }

    // Compute harmonic oscillator push-pull balance
    const pullMagnitude = 0.5 + 0.5 * Math.sin(this.harmonicPhase);
    const pushMagnitude = 0.5 + 0.5 * Math.cos(this.harmonicPhase);
    
    this.displacement = clamp01(0.35 + 0.3 * pullMagnitude);
    this.restoringForce = clamp01(0.4 + 0.35 * pushMagnitude);
    this.density = clamp01(0.55 + 0.15 * Math.sin(this.harmonicPhase * 2));

    // Generate 2D height grid (fluid lattice sheet warping)
    const heightGrid: number[][] = [];
    const span = 18;
    const stepSize = (span * 2) / (this.resolution - 1);

    for (let i = 0; i < this.resolution; i++) {
      const row: number[] = [];
      const gx = -span + i * stepSize;
      for (let j = 0; j < this.resolution; j++) {
        const gz = -span + j * stepSize;
        
        // Sum displacement depressions from Sun & planets
        let totalDip = 0;
        for (const body of this.celestialBodies) {
          const distSq = (gx - body.position[0]) ** 2 + (gz - body.position[2]) ** 2;
          const dip = (body.displacementDepth * 1.5) / (1 + distSq * 0.45);
          totalDip += dip;
        }

        // Add harmonic fluid ripple wave
        const distToCenter = Math.sqrt(gx * gx + gz * gz);
        const wave = 0.08 * Math.sin(distToCenter * 0.8 - this.harmonicPhase * 3);
        const zDisplacement = -totalDip + wave;

        row.push(zDisplacement);
      }
      heightGrid.push(row);
    }

    return {
      density: this.density,
      displacement: this.displacement,
      restoringForce: this.restoringForce,
      harmonicPhase: this.harmonicPhase,
      pushPullState: pushPullState as "PULL_CONTRACTION" | "PUSH_EXPANSION",
      oscillatorRatio,
      fluidElasticity: this.fluidElasticity,
      gravitationalWarpDepth: 2.2,
      celestialBodies: this.celestialBodies,
      heightGrid,
    };
  }

  getCelestialBodies() {
    return this.celestialBodies;
  }
}
