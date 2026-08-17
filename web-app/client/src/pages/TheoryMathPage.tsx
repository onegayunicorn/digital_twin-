import React, { useState } from "react";
import { useSimulation } from "@/contexts/SimulationContext";
import {
  Compass,
  Sparkles,
  Calculator,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  Atom,
  Eye,
  Sliders,
  CheckCircle2,
  Cpu,
  BookOpen,
  Orbit,
} from "lucide-react";

export const TheoryMathPage: React.FC = () => {
  const { setActiveTab, params, setParams, deltaX, radiationFlux, coherenceRate, applySimulationPreset } = useSimulation();

  // Local interactive equation solver state
  const [calcP, setCalcP] = useState<number>(params.P_sun);
  const [calcEta, setCalcEta] = useState<number>(params.eta_atm);
  const [calcPhi, setCalcPhi] = useState<number>(params.phi_yield);
  const [calcE, setCalcE] = useState<number>(params.E_growth);

  // Live calculation
  const calculatedDeltaX = Math.sqrt(
    Math.max(0.001, (calcP * calcEta * calcPhi) / (4 * Math.PI * Math.max(0.01, calcE)))
  );
  const calculatedFlux = (calcP * calcEta) / (4 * Math.PI);

  const handleApplyCalcToSim = () => {
    setParams((prev) => ({
      ...prev,
      P_sun: calcP,
      eta_atm: calcEta,
      phi_yield: calcPhi,
      E_growth: calcE,
    }));
    setActiveTab(2); // Jump to simulation
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 sm:pb-12">
      {/* Hero Header */}
      <div className="relative border-b border-border/60 bg-gradient-to-b from-card/60 via-background to-background px-4 py-10 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-mono font-medium text-primary mb-4">
            <BookOpen className="h-3.5 w-3.5" />
            <span>PAGE 1 // THEORETICAL FOUNDATION & MATHEMATICAL LEDGER</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground font-mono">
            Cosmic Tri-Structure & Mathematical Field Equations
          </h1>
          <p className="mt-3 max-w-3xl text-sm sm:text-base text-muted-foreground leading-relaxed">
            The Sovereign Orchestrator models the universe as a unified tri-structure: a fluid space equilibrium lattice deformed by mass displacement, a 5D photosynthetic reflection grid with umbral shadows, a sub-atomic photonic resonance drum-skin mesh, and an outer void pressure boundary enforcing deterministic asteroid conduits.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab(2)}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-[0_0_20px_rgba(20,184,166,0.35)] transition-all hover:bg-primary/90"
            >
              <span>Launch 3D Simulation (Page 2)</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => setActiveTab(3)}
              className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground transition-all hover:border-primary/50 hover:bg-accent"
            >
              <Cpu className="h-4 w-4 text-primary" />
              <span>Ask DeepSeek V4 AI (Page 3)</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-8 py-8 space-y-10">
        {/* Section 1: Photosynthetic Spacing Equation & Interactive Playground */}
        <section className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/70 pb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/15 text-teal-400 border border-teal-500/30">
                <Calculator className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold font-mono text-foreground">1. Photosynthetic Growth Spacing Equation</h2>
                <p className="text-xs text-muted-foreground">Derivation of hyper-cube grid spacing Δx under solar photon flux</p>
              </div>
            </div>
            <span className="font-mono text-xs text-teal-400 font-semibold bg-teal-950/40 border border-teal-500/30 rounded-lg px-3 py-1">
              Δx = {calculatedDeltaX.toFixed(3)} AU
            </span>
          </div>

          <div className="mt-6 space-y-6">
            {/* LaTeX Display Block */}
            <div className="rounded-xl border border-teal-500/30 bg-teal-950/20 p-5 text-center font-mono text-base sm:text-xl text-teal-300 font-bold overflow-x-auto shadow-[0_0_15px_rgba(20,184,166,0.1)]">
              Δx = √ [ ( P_sun · η_atm · Φ_yield ) / ( 4π · E_growth ) ]
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Equation Term Explanations */}
              <div className="space-y-3 text-xs sm:text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">Variable Definitions & Physical Interpretation:</p>
                <ul className="space-y-2 font-mono">
                  <li className="flex items-start gap-2">
                    <span className="text-teal-400 font-bold">P_sun:</span>
                    <span>Total solar irradiance at 1 AU (~100–300 W/m²)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-400 font-bold">η_atm:</span>
                    <span>Atmospheric transmission coefficient (0.0 – 1.0)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-400 font-bold">Φ_yield:</span>
                    <span>Photosynthetic quantum yield efficiency (0.0 – 1.0)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-400 font-bold">E_growth:</span>
                    <span>Energy cost per unit volume of biological synthesis (J/m³)</span>
                  </li>
                </ul>
              </div>

              {/* Interactive Equation Calculator Sandbox */}
              <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <span className="text-xs font-bold font-mono text-foreground flex items-center gap-1.5">
                    <Sliders className="h-3.5 w-3.5 text-primary" />
                    Interactive Parameter Solver
                  </span>
                  <span className="text-[11px] font-mono text-primary font-semibold">
                    Flux: {calculatedFlux.toFixed(2)} W/sr
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-muted-foreground">P_sun (Solar Power):</span>
                      <span className="text-foreground font-bold">{calcP} W/m²</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="300"
                      value={calcP}
                      onChange={(e) => setCalcP(Number(e.target.value))}
                      className="w-full accent-primary h-1.5 bg-border rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-muted-foreground">η_atm (Atmosphere):</span>
                      <span className="text-foreground font-bold">{calcEta.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.01"
                      value={calcEta}
                      onChange={(e) => setCalcEta(Number(e.target.value))}
                      className="w-full accent-primary h-1.5 bg-border rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-muted-foreground">Φ_yield (Quantum Yield):</span>
                      <span className="text-foreground font-bold">{calcPhi.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.01"
                      value={calcPhi}
                      onChange={(e) => setCalcPhi(Number(e.target.value))}
                      className="w-full accent-primary h-1.5 bg-border rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-muted-foreground">E_growth (Growth Cost):</span>
                      <span className="text-foreground font-bold">{calcE.toFixed(2)} J/m³</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1.5"
                      step="0.05"
                      value={calcE}
                      onChange={(e) => setCalcE(Number(e.target.value))}
                      className="w-full accent-primary h-1.5 bg-border rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                <button
                  onClick={handleApplyCalcToSim}
                  className="w-full rounded-lg bg-primary/20 border border-primary/40 py-2 text-xs font-bold text-primary hover:bg-primary/30 transition-all flex items-center justify-center gap-2"
                >
                  <span>Apply Calculated Parameters to Page 2 Simulation</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Fluid Space Equilibrium Lattice Displacement */}
        <section className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 border-b border-border/70 pb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              <Orbit className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-mono text-foreground">2. Fluid Space Equilibrium Lattice Displacement</h2>
              <p className="text-xs text-muted-foreground">Gravitational mass displacement and harmonic push-pull breathing</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-5 text-center font-mono text-base sm:text-xl text-cyan-300 font-bold shadow-[0_0_15px_rgba(6,182,212,0.1)]">
              D_lattice(r) = - ∑ [ ( G · M_i · ρ_i ) / r_i³ ] · r_i
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Space is not empty vacuum, but an ultra-dense incompressible fluid lattice. Massive bodies like the Sun and planetary spheres displace fluid volume proportional to their density ρ and gravitational constant G. As bodies orbit, the lattice experiences cyclical push-pull compression oscillations ω = 2πf, producing gravitational radiation waves that dynamically ripple through the 3D mesh.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="rounded-xl border border-border/80 bg-muted/20 p-3">
                <span className="text-[10px] font-mono text-muted-foreground uppercase">Solar Displacement Depth</span>
                <p className="text-sm font-mono font-bold text-foreground">h_sun = -2.85 AU</p>
              </div>
              <div className="rounded-xl border border-border/80 bg-muted/20 p-3">
                <span className="text-[10px] font-mono text-muted-foreground uppercase">Earth Displacement</span>
                <p className="text-sm font-mono font-bold text-foreground">h_earth = -0.42 AU</p>
              </div>
              <div className="rounded-xl border border-border/80 bg-muted/20 p-3">
                <span className="text-[10px] font-mono text-muted-foreground uppercase">Push-Pull Breathing</span>
                <p className="text-sm font-mono font-bold text-cyan-400">f = {params.pushPullFreq} Hz</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Sub-Atomic Photonic Resonance Drum-Skin Mesh */}
        <section className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 border-b border-border/70 pb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30">
              <Atom className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-mono text-foreground">3. Sub-Atomic Photonic Resonance Drum-Skin Mesh</h2>
              <p className="text-xs text-muted-foreground">Radial wave propagation across the photonic boundary membrane</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-purple-500/30 bg-purple-950/20 p-5 text-center font-mono text-base sm:text-xl text-purple-300 font-bold shadow-[0_0_15px_rgba(168,85,247,0.1)]">
              ∇²ψ - ( 1 / c² ) · ( ∂²ψ / ∂t² ) - γ · ( ∂ψ / ∂t ) = 0
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              The photonic resonance layer operates as a 2D/3D elastic drum-skin membrane. When solar flares or high-frequency photon bursts impact the grid, standing Bessel wavemodes J₀(kr)cos(ωt) resonate outwards, distributing energetic tension across the entire system.
            </p>
          </div>
        </section>

        {/* Section 4: Void Inversion & Deterministic Asteroid Conduits */}
        <section className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 border-b border-border/70 pb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-mono text-foreground">4. Void Inversion & Deterministic Conduit Equilibrium</h2>
              <p className="text-xs text-muted-foreground">Zero-net-force balance theorem and asteroid trajectory stability</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-5 text-center font-mono text-base sm:text-xl text-emerald-300 font-bold shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              F_net = D_lattice + P_photon + P_void = 0
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Outer space contains a high-tension <strong>Void Boundary Field (P_void)</strong> pushing inward. Celestial bodies and asteroid belts settle into deterministic equilibrium conduits where the outward radiation pressure, fluid lattice displacement, and inward void pressure sum to exactly zero.
            </p>
          </div>
        </section>

        {/* Section 5: Merkle Chain & Sovereign Engine Topology */}
        <section className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-border/70 pb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <h3 className="text-base font-bold font-mono text-foreground">5. Sovereign Engine Merkle Verification Tree</h3>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-semibold bg-emerald-950/50 border border-emerald-500/40 px-2.5 py-1 rounded-lg">
              COHERENCE: {coherenceRate} 🟢
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            {[
              { name: "Alchemical Engine", root: "0xALC_997" },
              { name: "5D Mesh Engine", root: "0xGEO_997" },
              { name: "Bloch Sphere Engine", root: "0xBLO_997" },
              { name: "Singularity Engine", root: "0xSIN_997" },
              { name: "Reality Engine v2", root: "0xREA_997" },
              { name: "Phoenix Engine", root: "0xPHO_997" },
              { name: "Quantum Sim", root: "0xQTM_997" },
              { name: "J09 Dilithium3", root: "0xJ09_997" },
            ].map((e) => (
              <div key={e.name} className="rounded-lg border border-border/70 bg-muted/20 p-2.5">
                <span className="text-[10px] text-muted-foreground block truncate">{e.name}</span>
                <span className="text-emerald-400 font-bold">{e.root}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
