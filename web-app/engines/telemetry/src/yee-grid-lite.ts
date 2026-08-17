export type YeeGridLiteConfig = {
  nx: number;
  ny: number;
  nz: number;
  seed?: number;
  energyCap?: number;
};

export type MicroCellSnapshot = {
  fidelity: number;
  coherence: number;
  intensity: number;
  decoherence: number;
  amplitude: number;
  velocity: number;
  phase: number;
};

export type GridStepReport = {
  status: "SIMULATED";
  step: number;
  average: MicroCellSnapshot;
  normalizedEnergy: number;
  safety: "within-cap" | "reset-after-cap";
  boundary: string;
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export class YeeGridLite {
  readonly totalCells: number;
  readonly fidelity: Float32Array;
  readonly coherence: Float32Array;
  readonly intensity: Float32Array;
  readonly decoherence: Float32Array;
  readonly amplitude: Float32Array;
  readonly velocity: Float32Array;
  readonly phase: Float32Array;
  private readonly config: YeeGridLiteConfig;
  private readonly seed: number;
  private stepIndex = 0;

  constructor(config: YeeGridLiteConfig) {
    if (![config.nx, config.ny, config.nz].every((value) => Number.isInteger(value) && value > 0 && value <= 32)) {
      throw new Error("YeeGridLite dimensions must be positive integers no larger than 32.");
    }
    this.config = { ...config, energyCap: config.energyCap ?? 0.88 };
    this.seed = config.seed ?? 783;
    this.totalCells = config.nx * config.ny * config.nz;
    this.fidelity = new Float32Array(this.totalCells);
    this.coherence = new Float32Array(this.totalCells);
    this.intensity = new Float32Array(this.totalCells);
    this.decoherence = new Float32Array(this.totalCells);
    this.amplitude = new Float32Array(this.totalCells);
    this.velocity = new Float32Array(this.totalCells);
    this.phase = new Float32Array(this.totalCells);
    this.seedGaussian({ x: 0.5, y: 0.5, z: 0.5 }, 0.22);
  }

  index(x: number, y: number, z: number): number {
    return x + this.config.nx * (y + this.config.ny * z);
  }

  seedGaussian(center: { x: number; y: number; z: number }, sigma = 0.22): void {
    const { nx, ny, nz } = this.config;
    for (let z = 0; z < nz; z += 1) {
      for (let y = 0; y < ny; y += 1) {
        for (let x = 0; x < nx; x += 1) {
          const i = this.index(x, y, z);
          const dx = x / Math.max(1, nx - 1) - center.x;
          const dy = y / Math.max(1, ny - 1) - center.y;
          const dz = z / Math.max(1, nz - 1) - center.z;
          const gaussian = Math.exp(-(dx * dx + dy * dy + dz * dz) / (2 * sigma * sigma));
          const jitter = 0.02 * Math.sin((i + this.seed) * 0.37);
          this.fidelity[i] = clamp01(0.62 + gaussian * 0.3 + jitter);
          this.coherence[i] = clamp01(0.48 + gaussian * 0.4 + jitter);
          this.intensity[i] = clamp01(gaussian * 0.76);
          this.decoherence[i] = clamp01(0.2 + (1 - gaussian) * 0.45);
          this.amplitude[i] = clamp01(gaussian * 0.52);
          this.velocity[i] = 0;
          this.phase[i] = (i % 31) / 31;
        }
      }
    }
  }

  step(dt = 0.08): GridStepReport {
    this.stepIndex += 1;
    const t = this.stepIndex * dt;
    for (let i = 0; i < this.totalCells; i += 1) {
      const drive = 0.03 * (0.5 + 0.5 * Math.sin(t * 2.4 + i * 0.07));
      this.phase[i] = (this.phase[i] + dt * 0.12 + drive) % 1;
      this.intensity[i] = clamp01(this.intensity[i] * 0.985 + drive);
      this.velocity[i] = clamp01(this.velocity[i] * 0.91 + Math.abs(Math.sin(this.phase[i] * Math.PI * 2)) * 0.04);
      this.amplitude[i] = clamp01(this.amplitude[i] * 0.98 + this.intensity[i] * 0.035 - this.decoherence[i] * 0.01);
      this.decoherence[i] = clamp01(this.decoherence[i] * 0.995 + this.intensity[i] * 0.008);
      this.coherence[i] = clamp01(this.coherence[i] * 0.994 + this.fidelity[i] * 0.018 - this.decoherence[i] * 0.012);
      this.fidelity[i] = clamp01(this.fidelity[i] * 0.997 + this.coherence[i] * 0.006 - this.decoherence[i] * 0.004);
    }
    const average = this.average();
    const normalizedEnergy = clamp01((average.intensity + average.amplitude + average.velocity) / 3);
    if (normalizedEnergy > (this.config.energyCap ?? 0.88)) {
      this.seedGaussian({ x: 0.5, y: 0.5, z: 0.5 }, 0.22);
      return { status: "SIMULATED", step: this.stepIndex, average: this.average(), normalizedEnergy, safety: "reset-after-cap", boundary: "Dimensionless visual field model; no physical field or hardware output." };
    }
    return { status: "SIMULATED", step: this.stepIndex, average, normalizedEnergy, safety: "within-cap", boundary: "Dimensionless visual field model; no physical field or hardware output." };
  }

  average(): MicroCellSnapshot {
    const keys: (keyof MicroCellSnapshot)[] = ["fidelity", "coherence", "intensity", "decoherence", "amplitude", "velocity", "phase"];
    const result = Object.fromEntries(keys.map((key) => [key, 0])) as MicroCellSnapshot;
    for (let i = 0; i < this.totalCells; i += 1) {
      result.fidelity += this.fidelity[i];
      result.coherence += this.coherence[i];
      result.intensity += this.intensity[i];
      result.decoherence += this.decoherence[i];
      result.amplitude += this.amplitude[i];
      result.velocity += this.velocity[i];
      result.phase += this.phase[i];
    }
    for (const key of keys) result[key] = clamp01(result[key] / this.totalCells);
    return result;
  }
}
