import { clamp01, type CelestialBody, type PhotosyntheticGrowthParams } from "./types";

export class LightGrid {
  private params: PhotosyntheticGrowthParams = {
    P_sun: 100.0, // Base solar radiant power
    eta_atm: 0.88, // Scattering attenuation coefficient
    phi_yield: 0.72, // Quantum efficiency yield
    E_growth: 0.45, // Minimum volumetric energy density threshold
  };

  private solarFlareActive = false;
  private solarFlareTimer = 0;
  private solarFlareIntensity = 1.0;
  private illumination = 0.74;
  private shadowAlignment = 0.38;
  private photonDensity = 0.68;

  constructor(initialParams?: Partial<PhotosyntheticGrowthParams>) {
    if (initialParams) {
      this.params = { ...this.params, ...initialParams };
    }
  }

  setParams(newParams: Partial<PhotosyntheticGrowthParams>) {
    this.params = { ...this.params, ...newParams };
  }

  getParams() {
    return { ...this.params };
  }

  triggerSolarFlare(intensity = 2.5) {
    this.solarFlareActive = true;
    this.solarFlareTimer = 60; // duration in ticks
    this.solarFlareIntensity = intensity;
  }

  // Exact Photosynthetic Growth Spacing Equation:
  // Delta_x = sqrt( (P_sun * eta_atm * phi_yield) / (4 * pi * E_growth) )
  calculateDeltaX(): number {
    const effectivePower = this.solarFlareActive
      ? this.params.P_sun * this.solarFlareIntensity
      : this.params.P_sun;

    const numerator = effectivePower * this.params.eta_atm * this.params.phi_yield;
    const denominator = 4 * Math.PI * Math.max(0.001, this.params.E_growth);
    const delta_x = Math.sqrt(numerator / denominator);
    return Math.round(delta_x * 1000) / 1000;
  }

  step(tick: number, celestialBodies: CelestialBody[] = []) {
    if (this.solarFlareActive) {
      this.solarFlareTimer -= 1;
      if (this.solarFlareTimer <= 0) {
        this.solarFlareActive = false;
        this.solarFlareIntensity = 1.0;
      }
    }

    const delta_x = this.calculateDeltaX();
    const flareBoost = this.solarFlareActive ? (this.solarFlareTimer / 60) * (this.solarFlareIntensity - 1.0) : 0;
    
    // Wave oscillation for ambient light flux
    const wave = 0.5 + 0.5 * Math.sin(tick * 0.12);
    this.illumination = clamp01(0.68 + 0.22 * wave + flareBoost * 0.15);
    this.shadowAlignment = clamp01(0.35 + 0.18 * (1 - wave));
    this.photonDensity = clamp01(this.illumination * 0.75 + (1 - this.shadowAlignment) * 0.2);

    // Compute Umbral Shadow Cones (Anti-Vectors -V_light) for each celestial body
    const umbralCones = celestialBodies
      .filter((b) => b.id !== "sun")
      .map((body) => {
        const [bx, by, bz] = body.position;
        const distToSun = Math.sqrt(bx * bx + by * by + bz * bz);
        const dir: [number, number, number] = distToSun > 0.001
          ? [bx / distToSun, by / distToSun, bz / distToSun]
          : [1, 0, 0];

        // Length of the umbral shadow cone cast behind the body
        const shadowLength = body.radius * 6.5 + (1.0 - this.params.eta_atm) * 4.0;
        
        return {
          bodyId: body.id,
          origin: [bx, by, bz] as [number, number, number],
          direction: dir,
          length: shadowLength,
          radius: body.radius * 1.15,
          isColdCell: true,
        };
      });

    return {
      params: { ...this.params },
      delta_x,
      delta_x_formula: "Δx = √[ (P_sun · η_atm · Φ_yield) / (4π · E_growth) ]",
      solarRadiantPower: this.params.P_sun * (this.solarFlareActive ? this.solarFlareIntensity : 1.0),
      illuminationIntensity: this.illumination,
      shadowAlignment: this.shadowAlignment,
      photonDensity: this.photonDensity,
      solarFlareActive: this.solarFlareActive,
      solarFlareIntensity: this.solarFlareIntensity,
      opticalRayCount: 36,
      umbralCones,
    };
  }
}
