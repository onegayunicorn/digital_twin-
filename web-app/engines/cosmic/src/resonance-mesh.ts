import { clamp01, type CelestialBody, type ResonanceMeshNode } from "./types";

export class ResonanceMesh {
  private readonly resolution: number;
  private nodes: ResonanceMeshNode[] = [];
  private vibrationalFrequency = 0.16;
  private meshTension = 0.78;
  private dampingFactor = 0.94;
  private propagationSpeed = 0.85;

  constructor(resolution = 8) {
    this.resolution = Math.max(4, Math.min(16, resolution));
    this.initNodes();
  }

  private initNodes() {
    this.nodes = [];
    const span = 16;
    const step = (span * 2) / (this.resolution - 1);
    let id = 0;

    for (let i = 0; i < this.resolution; i++) {
      const x = -span + i * step;
      for (let j = 0; j < this.resolution; j++) {
        const z = -span + j * step;
        const distCenter = Math.sqrt(x * x + z * z);
        this.nodes.push({
          id: id++,
          x,
          y: 0,
          z,
          restZ: 0,
          amplitude: 0.2 + 0.1 * Math.sin(distCenter),
          velocity: 0,
          phase: distCenter * 0.4,
          energyPulse: 0.3,
        });
      }
    }
  }

  setVibrationalFrequency(freq: number) {
    this.vibrationalFrequency = Math.max(0.02, Math.min(1.0, freq));
  }

  setMeshTension(tension: number) {
    this.meshTension = Math.max(0.1, Math.min(1.0, tension));
  }

  setDampingFactor(damping: number) {
    this.dampingFactor = Math.max(0.7, Math.min(0.99, damping));
  }

  // Calculate radiation pressure vector P_photon at position (x, y, z)
  // P_photon = (I_scattered / c) * A_asteroid * r_hat
  calculateRadiationPressureVector(
    x: number,
    y: number,
    z: number,
    asteroidArea: number,
    delta_x: number
  ): [number, number, number] {
    const distSq = x * x + y * y + z * z;
    const dist = Math.sqrt(distSq);
    if (dist < 0.1) return [0, 0, 0];

    // Light intensity derived from growth spacing delta_x: I_scattered ~ (delta_x^2) / distSq
    const I_scattered = (delta_x * delta_x * 0.85) / Math.max(1.0, distSq);
    const c = 3.0; // Scaled speed of light constant
    const magnitude = (I_scattered / c) * asteroidArea * 1.8;

    return [
      (x / dist) * magnitude,
      (y / dist) * magnitude,
      (z / dist) * magnitude,
    ];
  }

  step(tick: number, celestialBodies: CelestialBody[] = [], solarFlareBoost = 0) {
    // Propagate drum-skin 2D wave equation on nodes
    for (const node of this.nodes) {
      // Harmonic wave driving
      const naturalDrive = Math.sin(tick * this.vibrationalFrequency + node.phase) * this.meshTension * 0.35;
      
      // Excitation caused by proximity to moving planets
      let planetaryExcitation = 0;
      for (const body of celestialBodies) {
        const distSq = (node.x - body.position[0]) ** 2 + (node.z - body.position[2]) ** 2;
        if (distSq < 16.0) {
          planetaryExcitation += (body.mass * 0.08) / (1 + distSq);
        }
      }

      // Acceleration: F = -k*x + drive + excitation
      const restoring = -0.4 * node.amplitude * this.meshTension;
      const acceleration = restoring + naturalDrive + planetaryExcitation + solarFlareBoost * 0.5;

      node.velocity = (node.velocity + acceleration * 0.2) * this.dampingFactor;
      node.amplitude = clamp01(Math.abs(node.amplitude + node.velocity));
      node.y = Math.sin(node.phase + tick * this.vibrationalFrequency) * node.amplitude * 0.8;
      node.energyPulse = clamp01(node.amplitude * 1.2 + planetaryExcitation);
    }

    const totalNodes = this.nodes.length;
    const activeNodes = this.nodes.filter((n) => n.energyPulse > 0.25).length;
    const averagePulse = this.nodes.reduce((sum, n) => sum + n.energyPulse, 0) / Math.max(1, totalNodes);
    const propagationSpeed = clamp01(this.propagationSpeed * 0.95 + (averagePulse * 1.1 + solarFlareBoost) * 0.05);

    return {
      activeNodes,
      totalNodes,
      averagePulse,
      propagationSpeed,
      vibrationalFrequency: this.vibrationalFrequency,
      meshTension: this.meshTension,
      dampingFactor: this.dampingFactor,
      nodes: this.nodes,
      radiationPressureScale: 1.8,
    };
  }
}
