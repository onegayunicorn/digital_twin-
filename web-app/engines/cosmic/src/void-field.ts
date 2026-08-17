import { clamp01, type AsteroidParticle } from "./types";
import type { EquilibriumLattice } from "./lattice";
import type { ResonanceMesh } from "./resonance-mesh";

export class VoidField {
  private ambientPressure = 0.62; // P_void
  private inversionForce = 0.58;
  private containmentRadius = 18.0;
  private thermodynamicTension = 0.71;
  private entropyIndex = 0.42;
  private asteroids: AsteroidParticle[] = [];

  constructor(asteroidCount = 36) {
    this.initAsteroids(asteroidCount);
  }

  private initAsteroids(count: number) {
    this.asteroids = [];
    const baseRadius = 10.2; // Asteroid belt radius between Mars & Jupiter
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * 2 * Math.PI + (Math.random() * 0.1 - 0.05);
      const radSpread = baseRadius + (Math.sin(i * 3.7) * 0.45);
      const speed = 0.015 + (Math.random() * 0.004);
      const inclination = (Math.sin(i * 2.1) * 0.25);
      
      this.asteroids.push({
        id: i + 1,
        baseRadius: radSpread,
        angle,
        speed,
        inclination,
        crossSectionArea: 0.8 + (i % 5) * 0.15,
        position: [
          Math.cos(angle) * radSpread,
          inclination,
          Math.sin(angle) * radSpread,
        ],
        velocity: [
          -Math.sin(angle) * speed * radSpread,
          0,
          Math.cos(angle) * speed * radSpread,
        ],
        D_lattice: [0, 0, 0],
        P_photon: [0, 0, 0],
        P_void: [0, 0, 0],
        F_net: [0, 0, 0],
        isInConduit: true,
        certaintyScore: 0.99997,
      });
    }
  }

  setAmbientPressure(pressure: number) {
    this.ambientPressure = Math.max(0.1, Math.min(1.0, pressure));
  }

  setContainmentRadius(radius: number) {
    this.containmentRadius = Math.max(12.0, Math.min(30.0, radius));
  }

  // Calculate Inward Void Containment Pressure at position (x, y, z)
  // Outer cosmos dark pressure pushing inward toward the solar core
  calculateVoidInwardVector(x: number, y: number, z: number): [number, number, number] {
    const distSq = x * x + y * y + z * z;
    const dist = Math.sqrt(distSq);
    if (dist < 0.1) return [0, 0, 0];

    // Inward pressure grows as you approach outer cosmos boundary
    const boundaryProximity = Math.max(0, dist / this.containmentRadius);
    const magnitude = this.ambientPressure * (0.2 + 0.8 * (boundaryProximity ** 2)) * 0.35;

    return [
      -(x / dist) * magnitude,
      -(y / dist) * magnitude,
      -(z / dist) * magnitude,
    ];
  }

  step(
    tick: number,
    lattice: EquilibriumLattice,
    mesh: ResonanceMesh,
    delta_x: number,
    speedMultiplier = 1.0
  ) {
    const drift = 0.5 + 0.5 * Math.cos(tick * 0.08);
    this.thermodynamicTension = clamp01(0.65 + 0.2 * drift);
    this.inversionForce = clamp01(this.ambientPressure * 0.85 + this.thermodynamicTension * 0.15);
    this.entropyIndex = clamp01(0.48 - this.inversionForce * 0.12);

    let totalNetForceMagnitude = 0;
    let inConduitCount = 0;

    // Step each asteroid through the deterministic force equilibrium pipe
    for (const ast of this.asteroids) {
      ast.angle = (ast.angle + ast.speed * speedMultiplier) % (2 * Math.PI);
      const currentRadius = ast.baseRadius;
      
      const px = Math.cos(ast.angle) * currentRadius;
      const py = ast.inclination * Math.sin(ast.angle * 2);
      const pz = Math.sin(ast.angle) * currentRadius;
      ast.position = [px, py, pz];

      // 1. Inward Pull: Lattice Density Displacement
      const D_lat = lattice.calculateDisplacementVector(px, py, pz);
      // 2. Outward Push: Photonic Radiation Pressure
      const P_pho = mesh.calculateRadiationPressureVector(px, py, pz, ast.crossSectionArea, delta_x);
      // 3. Inward Void Containment: Outer Cosmos Pressure
      const P_voi = this.calculateVoidInwardVector(px, py, pz);

      // 4. Net Vector Sum: F_net = D_lattice + P_photon + P_void
      const fx = D_lat[0] + P_pho[0] + P_voi[0];
      const fy = D_lat[1] + P_pho[1] + P_voi[1];
      const fz = D_lat[2] + P_pho[2] + P_voi[2];
      const netMag = Math.sqrt(fx * fx + fy * fy + fz * fz);

      ast.D_lattice = D_lat;
      ast.P_photon = P_pho;
      ast.P_void = P_voi;
      ast.F_net = [fx, fy, fz];

      // If net force is near zero (equilibrium pipe), asteroid certainty is near 1.0
      ast.isInConduit = netMag < 0.8;
      ast.certaintyScore = clamp01(1.0 - netMag * 0.4);
      if (ast.isInConduit) inConduitCount++;
      totalNetForceMagnitude += netMag;
    }

    const averageNetForce = totalNetForceMagnitude / Math.max(1, this.asteroids.length);
    const deterministicCertaintyIndex = clamp01(1.0 - averageNetForce * 0.3);

    return {
      voidField: {
        pressureIndex: this.ambientPressure,
        inversionForce: this.inversionForce,
        thermodynamicTension: this.thermodynamicTension,
        entropyIndex: this.entropyIndex,
        containmentRadius: this.containmentRadius,
        systemStabilized: true,
      },
      asteroidSystem: {
        asteroids: this.asteroids,
        averageNetForce,
        deterministicCertaintyIndex,
        equilibriumPipeRadius: 10.2,
        activeConduits: inConduitCount,
      },
    };
  }
}
