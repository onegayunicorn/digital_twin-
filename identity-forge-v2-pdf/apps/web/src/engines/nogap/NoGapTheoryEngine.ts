/**
 * NO GAP THEORY ENGINE — Continuous Medium Framework
 * Transforms Yee Lattice into an alive digital twin
 *
 * Physical Mapping:
 * - Electric Field (E)  → Medium Displacement Vector
 * - Magnetic Field (B)  → Local Vorticity
 * - Vacuum Permittivity (ε₀) → Medium Bulk Compressibility
 * - Vacuum Permeability (μ₀) → Medium Mass Density
 */

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface NoGapField {
  electric: {
    displacement: Vector3D; // Medium displacement
    field: Vector3D;        // Electric field
  };
  magnetic: {
    vorticity: Vector3D;    // Local vorticity
    field: Vector3D;        // Magnetic field
  };
  medium: {
    density: number;        // Mass density (μ₀)
    compressibility: number; // Bulk compressibility (ε₀)
    pressure: number;       // Background pressure scalar
  };
  cfl: {
    dt: number;             // Time step
    dx: number;             // Spatial step
    stability: number;      // CFL stability factor
  };
}

export class NoGapTheoryEngine {
  private field: NoGapField;
  private cflCondition: number = 0.5; // CFL stability limit
  private lattice: Vector3D[];
  private timeStep: number = 0.001;
  private spatialStep: number = 0.01;

  constructor() {
    this.field = this.initializeField();
    this.lattice = [];
  }

  private initializeField(): NoGapField {
    return {
      electric: {
        displacement: { x: 0, y: 0, z: 0 },
        field: { x: 0, y: 0, z: 0 },
      },
      magnetic: {
        vorticity: { x: 0, y: 0, z: 0 },
        field: { x: 0, y: 0, z: 0 },
      },
      medium: {
        density: 1.0,         // μ₀
        compressibility: 1.0, // ε₀
        pressure: 1.0,
      },
      cfl: {
        dt: this.timeStep,
        dx: this.spatialStep,
        stability: 0.5,
      },
    };
  }

  // ─── Electric Field → Medium Displacement ──────────────────
  setElectricDisplacement(d: Vector3D): void {
    this.field.electric.displacement = d;
    this.field.electric.field = this.displacementToField(d);
  }

  private displacementToField(d: Vector3D): Vector3D {
    // E = -∇ · d (medium displacement gradient)
    return {
      x: -d.x / this.spatialStep,
      y: -d.y / this.spatialStep,
      z: -d.z / this.spatialStep,
    };
  }

  // ─── Magnetic Field → Local Vorticity ─────────────────────
  setMagneticVorticity(v: Vector3D): void {
    this.field.magnetic.vorticity = v;
    this.field.magnetic.field = this.vorticityToField(v);
  }

  private vorticityToField(v: Vector3D): Vector3D {
    // B = ∇ × v (curl of vorticity)
    return {
      x: this.curlX(v),
      y: this.curlY(v),
      z: this.curlZ(v),
    };
  }

  private curlX(v: Vector3D): number {
    return (v.y - v.z) / this.spatialStep;
  }

  private curlY(v: Vector3D): number {
    return (v.z - v.x) / this.spatialStep;
  }

  private curlZ(v: Vector3D): number {
    return (v.x - v.y) / this.spatialStep;
  }

  // ─── Medium Properties ─────────────────────────────────────
  setMediumDensity(density: number): void {
    this.field.medium.density = density; // μ₀
    this.updateCFLCondition();
  }

  setMediumCompressibility(compressibility: number): void {
    this.field.medium.compressibility = compressibility; // ε₀
    this.updateCFLCondition();
  }

  private updateCFLCondition(): void {
    // CFL stability: dt ≤ dx / (c * sqrt(μ₀ * ε₀))
    const c = 1 / Math.sqrt(
      this.field.medium.density * this.field.medium.compressibility
    );
    this.cflCondition = (this.timeStep * c) / this.spatialStep;
    this.field.cfl.stability = this.cflCondition;
  }

  // ─── Yee Lattice Integration ───────────────────────────────
  addLatticePoint(point: Vector3D): void {
    this.lattice.push(point);
  }

  getLattice(): Vector3D[] {
    return this.lattice;
  }

  // ─── Field Evolution (Time Step) ───────────────────────────
  evolveField(): void {
    // Update electric field from displacement
    this.field.electric.field = this.displacementToField(
      this.field.electric.displacement
    );

    // Update magnetic field from vorticity
    this.field.magnetic.field = this.vorticityToField(
      this.field.magnetic.vorticity
    );

    // Update medium pressure from density
    this.field.medium.pressure = this.field.medium.density * 0.5;

    // Check CFL stability
    this.updateCFLCondition();
  }

  // ─── No Gap Sampling ───────────────────────────────────────
  sampleAtPoint(point: Vector3D): NoGapField {
    // Interpolate field values at arbitrary point
    // No gaps — continuous sampling
    const sample: NoGapField = JSON.parse(JSON.stringify(this.field));

    // Apply background pressure based on position
    sample.medium.pressure =
      this.field.medium.pressure *
      (1 +
        this.field.medium.compressibility *
          (point.x * point.x + point.y * point.y + point.z * point.z));

    return sample;
  }

  // ─── CFL Stability Check ───────────────────────────────────
  isStable(): boolean {
    return this.cflCondition <= 1.0;
  }

  getCFLFactor(): number {
    return this.cflCondition;
  }

  getFieldState(): NoGapField {
    return this.field;
  }

  getPhysicalMappings(): Record<string, string> {
    return {
      "Electric Field (E)": "Medium Displacement Vector",
      "Magnetic Field (B)": "Local Vorticity",
      "Vacuum Permeability (μ₀)": "Medium Mass Density",
      "Vacuum Permittivity (ε₀)": "Medium Bulk Compressibility",
    };
  }
}
