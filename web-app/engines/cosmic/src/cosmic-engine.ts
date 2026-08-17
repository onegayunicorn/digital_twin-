import { EquilibriumLattice } from "./lattice";
import { LightGrid } from "./light-grid";
import { ResonanceMesh } from "./resonance-mesh";
import { VoidField } from "./void-field";
import { COSMIC_BOUNDARY, clamp01, type CosmicConfig, type CosmicSnapshot, type PhotosyntheticGrowthParams } from "./types";

export class CosmicEngine {
  private readonly lattice: EquilibriumLattice;
  private readonly lightGrid: LightGrid;
  private readonly mesh: ResonanceMesh;
  private readonly voidField: VoidField;
  private readonly energyCap = 0.98;
  private tick = 0;
  private time = 0;
  private speedMultiplier = 1.0;

  constructor(config: CosmicConfig = {}) {
    const seed = config.seed ?? 441;
    const latticeRes = config.latticeResolution ?? 21;
    const meshRes = config.meshResolution ?? 8;
    const asteroidCount = config.asteroidCount ?? 36;

    this.lattice = new EquilibriumLattice(seed, latticeRes);
    this.lightGrid = new LightGrid(config.photosynthetic);
    this.mesh = new ResonanceMesh(meshRes);
    this.voidField = new VoidField(asteroidCount);

    if (config.pushPullFrequency) {
      this.lattice.setPushPullFrequency(config.pushPullFrequency);
    }
    if (config.voidPressure) {
      this.voidField.setAmbientPressure(config.voidPressure);
    }
  }

  setSpeed(speed: number) {
    this.speedMultiplier = Math.max(0.1, Math.min(5.0, speed));
  }

  setPhotosyntheticParams(params: Partial<PhotosyntheticGrowthParams>) {
    this.lightGrid.setParams(params);
  }

  triggerSolarFlare(intensity = 2.5) {
    this.lightGrid.triggerSolarFlare(intensity);
  }

  setPushPullFrequency(freq: number) {
    this.lattice.setPushPullFrequency(freq);
  }

  setMeshFrequency(freq: number) {
    this.mesh.setVibrationalFrequency(freq);
  }

  setMeshTension(tension: number) {
    this.mesh.setMeshTension(tension);
  }

  setVoidPressure(pressure: number) {
    this.voidField.setAmbientPressure(pressure);
  }

  step(): CosmicSnapshot {
    this.tick += 1;
    this.time += 0.05 * this.speedMultiplier;

    // 1. Step Equilibrium Lattice (Planets orbit, fluid lattice heightmap calculated)
    const lattice = this.lattice.step(this.tick, this.speedMultiplier);
    
    // 2. Step 5D Light Grid (Calculate Delta_x, umbral shadow cones, flare state)
    const lightGrid = this.lightGrid.step(this.tick, lattice.celestialBodies);
    
    // 3. Step Photonic Resonance Mesh (Drum-skin wave equation, radiation pressure)
    const flareBoost = lightGrid.solarFlareActive ? (lightGrid.solarFlareIntensity - 1.0) * 0.4 : 0;
    const resonanceMesh = this.mesh.step(this.tick, lattice.celestialBodies, flareBoost);
    
    // 4. Step Void Field & Deterministic Asteroids (F_net = D_lattice + P_photon + P_void)
    const { voidField, asteroidSystem } = this.voidField.step(
      this.tick,
      this.lattice,
      this.mesh,
      lightGrid.delta_x,
      this.speedMultiplier
    );

    const normalizedEnergy = clamp01(
      (lattice.displacement + lightGrid.photonDensity + resonanceMesh.propagationSpeed + voidField.pressureIndex) / 4
    );
    const safety = normalizedEnergy > this.energyCap ? "reset-after-cap" : "within-cap";

    return {
      status: "SIMULATED",
      tick: this.tick,
      time: this.time,
      lattice,
      lightGrid,
      resonanceMesh,
      voidField,
      asteroidSystem,
      safety,
      boundary: COSMIC_BOUNDARY,
    };
  }

  getLattice() {
    return this.lattice;
  }

  getLightGrid() {
    return this.lightGrid;
  }

  getMesh() {
    return this.mesh;
  }

  getVoidField() {
    return this.voidField;
  }
}
