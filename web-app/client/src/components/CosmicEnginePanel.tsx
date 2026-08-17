import { useState, useMemo } from "react";
import type { CosmicSnapshot, PhotosyntheticGrowthParams } from "../../../engines/cosmic/src";
import type { LayerVisibility } from "./CosmicSimulation3D";

type CosmicEnginePanelProps = {
  snapshot: CosmicSnapshot | null;
  isRunning: boolean;
  onTogglePlay: () => void;
  onStep: () => void;
  onReset: () => void;
  speed: number;
  onChangeSpeed: (speed: number) => void;
  onTriggerSolarFlare: () => void;
  onUpdatePhotosynthetic: (params: Partial<PhotosyntheticGrowthParams>) => void;
  onUpdatePushPullFreq: (freq: number) => void;
  onUpdateMeshFreq: (freq: number) => void;
  onUpdateMeshTension: (tension: number) => void;
  onUpdateVoidPressure: (pressure: number) => void;
  onApplyPreset: (presetId: string) => void;
  layers: LayerVisibility;
  onToggleLayer: (layerKey: keyof LayerVisibility) => void;
  cameraView: "isometric" | "topDown" | "ecliptic" | "solarFocus" | "asteroidPOV";
  onChangeCameraView: (view: "isometric" | "topDown" | "ecliptic" | "solarFocus" | "asteroidPOV") => void;
  selectedBodyId: string | null;
};

export function CosmicEnginePanel({
  snapshot,
  isRunning,
  onTogglePlay,
  onStep,
  onReset,
  speed,
  onChangeSpeed,
  onTriggerSolarFlare,
  onUpdatePhotosynthetic,
  onUpdatePushPullFreq,
  onUpdateMeshFreq,
  onUpdateMeshTension,
  onUpdateVoidPressure,
  onApplyPreset,
  layers,
  onToggleLayer,
  cameraView,
  onChangeCameraView,
  selectedBodyId,
}: CosmicEnginePanelProps) {
  const [activeTab, setActiveTab] = useState<"math" | "lightGrid" | "lattice" | "resonance" | "void" | "telemetry">("math");

  // Photosynthetic equation parameters state
  const params = snapshot?.lightGrid.params ?? {
    P_sun: 100.0,
    eta_atm: 0.88,
    phi_yield: 0.72,
    E_growth: 0.45,
  };

  // Selected celestial body / asteroid details
  const selectedDetails = useMemo(() => {
    if (!snapshot || !selectedBodyId) return null;
    if (selectedBodyId.startsWith("asteroid-")) {
      const id = parseInt(selectedBodyId.replace("asteroid-", ""), 10);
      const ast = snapshot.asteroidSystem.asteroids.find((a) => a.id === id);
      return ast ? { type: "asteroid", data: ast } : null;
    }
    const body = snapshot.lattice.celestialBodies.find((b) => b.id === selectedBodyId);
    return body ? { type: "celestial", data: body } : null;
  }, [snapshot, selectedBodyId]);

  // Export handlers
  const handleExportJSON = () => {
    if (!snapshot) return;
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cosmic-simulation-snapshot-tick-${snapshot.tick}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    if (!snapshot) return;
    const rows = [
      ["Body_ID", "Name", "Mass", "Density_rho", "Distance_AU", "Displacement_Depth", "Pos_X", "Pos_Y", "Pos_Z"],
      ...snapshot.lattice.celestialBodies.map((b) => [
        b.id,
        b.name,
        b.mass,
        b.density,
        b.distance,
        b.displacementDepth,
        b.position[0].toFixed(3),
        b.position[1].toFixed(3),
        b.position[2].toFixed(3),
      ]),
    ];
    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `cosmic-celestial-telemetry-${snapshot.tick}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!snapshot) return null;

  return (
    <div className="flex flex-col gap-4 text-xs">
      {/* 1. Master Simulation Transport & Flare Trigger Bar */}
      <div className="p-3 bg-[#0a0f0d] border border-[rgba(121,215,230,0.25)] rounded flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePlay}
            className={`px-3 py-1.5 rounded font-mono font-bold uppercase transition-colors ${
              isRunning
                ? "bg-[#d9ad7a] text-[#070a09] hover:bg-[#e4be8f]"
                : "bg-[#79d7e6] text-[#070a09] hover:bg-[#92dfeb]"
            }`}
          >
            {isRunning ? "⏸ PAUSE" : "▶ RUN ENGINE"}
          </button>
          <button
            onClick={onStep}
            disabled={isRunning}
            className="px-2.5 py-1.5 bg-[#121c18] border border-[rgba(121,215,230,0.2)] rounded text-[#f4eee4] hover:bg-[#182621] disabled:opacity-40 font-mono"
          >
            STEP ⏭
          </button>
          <button
            onClick={onReset}
            className="px-2.5 py-1.5 bg-[#121c18] border border-[rgba(244,63,94,0.3)] rounded text-[#f87171] hover:bg-[#201518] font-mono"
          >
            ↺ RESET
          </button>
        </div>

        {/* Solar Flare Ejection Surge Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onTriggerSolarFlare}
            className={`px-3 py-1.5 rounded font-mono font-bold uppercase border transition-all ${
              snapshot.lightGrid.solarFlareActive
                ? "bg-[#ef4444] text-[#ffffff] border-[#f87171] shadow-[0_0_12px_rgba(239,68,68,0.6)] animate-pulse"
                : "bg-[#1e1b4b] text-[#fbbf24] border-[#fbbf24] hover:bg-[#2e266df0]"
            }`}
          >
            ⚡ TRIGGER SOLAR FLARE (CME)
          </button>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center gap-1 font-mono">
          <span className="text-[#a4afa5] mr-1">SPEED:</span>
          {[0.25, 0.5, 1.0, 2.0, 4.0].map((s) => (
            <button
              key={s}
              onClick={() => onChangeSpeed(s)}
              className={`px-1.5 py-0.5 rounded border text-[11px] ${
                speed === s
                  ? "bg-[#79d7e6] text-[#070a09] border-[#79d7e6] font-bold"
                  : "bg-[#101815] text-[#a4afa5] border-[rgba(121,215,230,0.15)] hover:text-[#f4eee4]"
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* 2. Preset Scenarios Quick Switcher */}
      <div className="p-2.5 bg-[#0a0f0d] border border-[rgba(121,215,230,0.15)] rounded flex flex-wrap items-center gap-2 font-mono">
        <span className="text-[#a4afa5] font-bold">SCENARIOS:</span>
        <button
          onClick={() => onApplyPreset("standard")}
          className="px-2 py-1 bg-[#121c18] hover:bg-[#192722] border border-[rgba(121,215,230,0.25)] rounded text-[#79d7e6]"
        >
          1. Tri-Structure Baseline
        </button>
        <button
          onClick={() => onApplyPreset("flareSurge")}
          className="px-2 py-1 bg-[#121c18] hover:bg-[#192722] border border-[rgba(251,191,36,0.3)] rounded text-[#fbbf24]"
        >
          2. Solar Flare Grid Expansion
        </button>
        <button
          onClick={() => onApplyPreset("voidCompression")}
          className="px-2 py-1 bg-[#121c18] hover:bg-[#192722] border border-[rgba(129,140,248,0.3)] rounded text-[#818cf8]"
        >
          3. Cosmic Inversion Pressure
        </button>
        <button
          onClick={() => onApplyPreset("deterministicPipe")}
          className="px-2 py-1 bg-[#121c18] hover:bg-[#192722] border border-[rgba(45,212,191,0.3)] rounded text-[#2dd4bf]"
        >
          4. Zero-Force Asteroid Conduit
        </button>
        <button
          onClick={() => onApplyPreset("harmonicPushPull")}
          className="px-2 py-1 bg-[#121c18] hover:bg-[#192722] border border-[rgba(217,173,122,0.3)] rounded text-[#d9ad7a]"
        >
          5. Harmonic Push-Pull Oscillator
        </button>
      </div>

      {/* 3. 3D Viewport Toolbar: Camera Views & Layer Toggles */}
      <div className="p-2.5 bg-[#0c1310] border border-[rgba(121,215,230,0.18)] rounded flex flex-wrap items-center justify-between gap-3 font-mono">
        {/* Camera Views */}
        <div className="flex items-center gap-1">
          <span className="text-[#a4afa5] mr-1">CAMERA:</span>
          {[
            { id: "isometric", label: "Isometric" },
            { id: "topDown", label: "Top-Down" },
            { id: "ecliptic", label: "Ecliptic Plane" },
            { id: "solarFocus", label: "Solar Core" },
            { id: "asteroidPOV", label: "Asteroid Conduit" },
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => onChangeCameraView(c.id as any)}
              className={`px-2 py-0.5 rounded border text-[11px] ${
                cameraView === c.id
                  ? "bg-[#79d7e6] text-[#070a09] border-[#79d7e6] font-bold"
                  : "bg-[#121c18] text-[#a4afa5] border-[rgba(121,215,230,0.15)] hover:text-[#f4eee4]"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Visual Layer Toggles */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[#a4afa5] mr-1">LAYERS:</span>
          {[
            { key: "lattice", label: "Lattice" },
            { key: "lightGrid", label: "Light Grid (V_light)" },
            { key: "shadowGrid", label: "Shadow Cones (-V)" },
            { key: "resonanceMesh", label: "Resonance Mesh" },
            { key: "voidBoundary", label: "Void Pressure" },
            { key: "asteroids", label: "Asteroid Belt" },
            { key: "conduitPipes", label: "Conduit Pipes" },
            { key: "forceVectors", label: "Force Vectors" },
            { key: "labels", label: "Labels" },
          ].map((layer) => {
            const isVisible = layers[layer.key as keyof LayerVisibility];
            return (
              <button
                key={layer.key}
                onClick={() => onToggleLayer(layer.key as keyof LayerVisibility)}
                className={`px-2 py-0.5 rounded text-[10px] border transition-colors ${
                  isVisible
                    ? "bg-[#182d27] text-[#79d7e6] border-[#79d7e6]"
                    : "bg-[#101815] text-[#6b7280] border-[#374151]"
                }`}
              >
                {isVisible ? "✔ " : ""}{layer.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Subsystem & Mathematical Inspection Tabs */}
      <div className="flex border-b border-[rgba(121,215,230,0.2)] gap-1 font-mono">
        {[
          { id: "math", label: "📐 Mathematical Equations" },
          { id: "lightGrid", label: "☀️ 5D Light & Shadow Grid" },
          { id: "lattice", label: "🌌 Equilibrium Lattice" },
          { id: "resonance", label: "🪘 Photonic Resonance Mesh" },
          { id: "void", label: "🪐 Void & Asteroid Conduits" },
          { id: "telemetry", label: "📊 Diagnostics & Export" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-2 border-b-2 font-mono text-xs transition-colors ${
              activeTab === tab.id
                ? "border-[#79d7e6] text-[#79d7e6] bg-[#0d1714] font-bold"
                : "border-transparent text-[#a4afa5] hover:text-[#f4eee4] hover:bg-[#0a0f0d]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT 1: MATHEMATICAL EQUATIONS */}
      {activeTab === "math" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-[#0a0f0d] border border-[rgba(121,215,230,0.18)] rounded">
          {/* Equation 1: Photosynthetic Growth Spacing */}
          <div className="p-3 bg-[#0f1714] border border-[rgba(121,215,230,0.25)] rounded flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-[#fef08a]">1. PHOTOSYNTHETIC GROWTH SPACING</span>
              <span className="font-mono text-xs text-[#79d7e6]">Δx = {snapshot.lightGrid.delta_x.toFixed(4)} AU</span>
            </div>
            <div className="p-2 bg-[#080d0b] rounded font-mono text-center text-[#79d7e6] text-sm border border-[rgba(121,215,230,0.15)]">
              Δx = √ [ (P_sun · η_atm · Φ_yield) / (4π · E_growth) ]
            </div>
            <div className="text-[11px] text-[#a4afa5] leading-relaxed">
              Calculates the geometric side length of the 5D reflection hyper-grid. Determines the distance between resonant biological & photonic absorption nodes.
            </div>
            <div className="grid grid-cols-2 gap-2 font-mono text-[10px] bg-[#0a0f0d] p-2 rounded">
              <div>P_sun: <strong className="text-[#f4eee4]">{params.P_sun} W</strong></div>
              <div>η_atm: <strong className="text-[#f4eee4]">{params.eta_atm}</strong></div>
              <div>Φ_yield: <strong className="text-[#f4eee4]">{params.phi_yield}</strong></div>
              <div>E_growth: <strong className="text-[#f4eee4]">{params.E_growth} J/m³</strong></div>
            </div>
          </div>

          {/* Equation 2: Lattice Density Displacement */}
          <div className="p-3 bg-[#0f1714] border border-[rgba(121,215,230,0.25)] rounded flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-[#38bdf8]">2. LATTICE DENSITY DISPLACEMENT</span>
              <span className="font-mono text-xs text-[#38bdf8]">HARMONIC: {snapshot.lattice.pushPullState}</span>
            </div>
            <div className="p-2 bg-[#080d0b] rounded font-mono text-center text-[#38bdf8] text-sm border border-[rgba(56,189,248,0.15)]">
              D_lattice(r) = - ∑ [ (G · M_i · ρ_i) / |r - r_i|³ ] · (r - r_i)
            </div>
            <div className="text-[11px] text-[#a4afa5] leading-relaxed">
              Models space as a dense fluid lattice whose density is displaced inward by celestial masses & core densities, countered by the harmonic push-pull oscillator cycle.
            </div>
            <div className="grid grid-cols-2 gap-2 font-mono text-[10px] bg-[#0a0f0d] p-2 rounded">
              <div>Fluid Elasticity: <strong className="text-[#f4eee4]">0.82</strong></div>
              <div>Harmonic Phase: <strong className="text-[#f4eee4]">{(snapshot.lattice.harmonicPhase / Math.PI).toFixed(2)}π</strong></div>
              <div>Displacement: <strong className="text-[#f4eee4]">{snapshot.lattice.displacement.toFixed(3)}</strong></div>
              <div>Restoring Force: <strong className="text-[#f4eee4]">{snapshot.lattice.restoringForce.toFixed(3)}</strong></div>
            </div>
          </div>

          {/* Equation 3: Photonic Radiation Pressure */}
          <div className="p-3 bg-[#0f1714] border border-[rgba(121,215,230,0.25)] rounded flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-[#fbbf24]">3. PHOTONIC RADIATION PRESSURE</span>
              <span className="font-mono text-xs text-[#fbbf24]">PROPAGATION: {(snapshot.resonanceMesh.propagationSpeed * 100).toFixed(0)}%</span>
            </div>
            <div className="p-2 bg-[#080d0b] rounded font-mono text-center text-[#fbbf24] text-sm border border-[rgba(251,191,36,0.15)]">
              P_photon = ( I_scattered / c ) · A_asteroid · r̂
            </div>
            <div className="text-[11px] text-[#a4afa5] leading-relaxed">
              Outward radial pressure exerted by resonant photons propagating through the sub-atomic quantum drum-skin mesh onto traveling bodies.
            </div>
            <div className="grid grid-cols-2 gap-2 font-mono text-[10px] bg-[#0a0f0d] p-2 rounded">
              <div>Active Nodes: <strong className="text-[#f4eee4]">{snapshot.resonanceMesh.activeNodes}/{snapshot.resonanceMesh.totalNodes}</strong></div>
              <div>Vibrational Freq: <strong className="text-[#f4eee4]">{snapshot.resonanceMesh.vibrationalFrequency.toFixed(2)}</strong></div>
              <div>Avg Pulse: <strong className="text-[#f4eee4]">{snapshot.resonanceMesh.averagePulse.toFixed(3)}</strong></div>
              <div>Mesh Tension: <strong className="text-[#f4eee4]">{snapshot.resonanceMesh.meshTension.toFixed(2)}</strong></div>
            </div>
          </div>

          {/* Equation 4: Deterministic Net Force Equilibrium */}
          <div className="p-3 bg-[#0f1714] border border-[rgba(121,215,230,0.25)] rounded flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-[#2dd4bf]">4. DETERMINISTIC CONDUIT EQUILIBRIUM</span>
              <span className="font-mono text-xs text-[#2dd4bf]">CERTAINTY: {(snapshot.asteroidSystem.deterministicCertaintyIndex * 100).toFixed(1)}%</span>
            </div>
            <div className="p-2 bg-[#080d0b] rounded font-mono text-center text-[#2dd4bf] text-sm border border-[rgba(45,212,191,0.15)]">
              F_net = D_lattice + P_photon + P_void = 0
            </div>
            <div className="text-[11px] text-[#a4afa5] leading-relaxed">
              Asteroids are locked into deterministic geometric conduits. Any deviation experiences restoring void & lattice pressure forcing it back into the low-displacement channel.
            </div>
            <div className="grid grid-cols-2 gap-2 font-mono text-[10px] bg-[#0a0f0d] p-2 rounded">
              <div>Avg Net Force: <strong className="text-[#f4eee4]">{snapshot.asteroidSystem.averageNetForce.toFixed(3)} N</strong></div>
              <div>In-Conduit Locked: <strong className="text-[#f4eee4]">{snapshot.asteroidSystem.activeConduits}/{snapshot.asteroidSystem.asteroids.length}</strong></div>
              <div>Void Ambient P: <strong className="text-[#f4eee4]">{snapshot.voidField.pressureIndex.toFixed(2)}</strong></div>
              <div>Thermodynamic Tension: <strong className="text-[#f4eee4]">{snapshot.voidField.thermodynamicTension.toFixed(2)}</strong></div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: 5D LIGHT & SHADOW GRID CONTROLS */}
      {activeTab === "lightGrid" && (
        <div className="p-4 bg-[#0a0f0d] border border-[rgba(121,215,230,0.18)] rounded flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[rgba(121,215,230,0.15)] pb-2">
            <span className="font-mono font-bold text-[#fef08a]">5D REFLECTION GRID & PHOTOSYNTHETIC PARAMETERS</span>
            <span className="font-mono text-[#79d7e6]">Current Δx: {snapshot.lightGrid.delta_x.toFixed(4)} AU</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Slider P_sun */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between font-mono text-[11px]">
                <label className="text-[#f4eee4]">Solar Radiant Power Output (P_sun)</label>
                <span className="text-[#fbbf24]">{params.P_sun} W</span>
              </div>
              <input
                type="range"
                min="10"
                max="300"
                step="5"
                value={params.P_sun}
                onChange={(e) => onUpdatePhotosynthetic({ P_sun: parseFloat(e.target.value) })}
                className="accent-[#fbbf24]"
              />
              <span className="text-[10px] text-[#a4afa5]">Radiant power emitted from the central solar core.</span>
            </div>

            {/* Slider eta_atm */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between font-mono text-[11px]">
                <label className="text-[#f4eee4]">Atmospheric/Space Attenuation (η_atm)</label>
                <span className="text-[#79d7e6]">{params.eta_atm}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.02"
                value={params.eta_atm}
                onChange={(e) => onUpdatePhotosynthetic({ eta_atm: parseFloat(e.target.value) })}
                className="accent-[#79d7e6]"
              />
              <span className="text-[10px] text-[#a4afa5]">Transmission coefficient through intervening medium.</span>
            </div>

            {/* Slider phi_yield */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between font-mono text-[11px]">
                <label className="text-[#f4eee4]">Quantum Efficiency Yield (Φ_yield)</label>
                <span className="text-[#2dd4bf]">{params.phi_yield}</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="1.0"
                step="0.05"
                value={params.phi_yield}
                onChange={(e) => onUpdatePhotosynthetic({ phi_yield: parseFloat(e.target.value) })}
                className="accent-[#2dd4bf]"
              />
              <span className="text-[10px] text-[#a4afa5]">Photons absorbed per molecule synthesized.</span>
            </div>

            {/* Slider E_growth */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between font-mono text-[11px]">
                <label className="text-[#f4eee4]">Growth Volumetric Energy Threshold (E_growth)</label>
                <span className="text-[#f87171]">{params.E_growth} J/m³</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="2.0"
                step="0.05"
                value={params.E_growth}
                onChange={(e) => onUpdatePhotosynthetic({ E_growth: parseFloat(e.target.value) })}
                className="accent-[#f87171]"
              />
              <span className="text-[10px] text-[#a4afa5]">Minimum volumetric energy required to sustain resonant nodes.</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: EQUILIBRIUM LATTICE CONTROLS */}
      {activeTab === "lattice" && (
        <div className="p-4 bg-[#0a0f0d] border border-[rgba(121,215,230,0.18)] rounded flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[rgba(121,215,230,0.15)] pb-2">
            <span className="font-mono font-bold text-[#38bdf8]">EQUILIBRIUM FLUID LATTICE DYNAMICS</span>
            <span className="font-mono text-[#d9ad7a]">State: {snapshot.lattice.pushPullState}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between font-mono text-[11px]">
                <label className="text-[#f4eee4]">Harmonic Push-Pull Frequency (ω)</label>
                <span className="text-[#38bdf8]">0.08 rad/tick</span>
              </div>
              <input
                type="range"
                min="0.01"
                max="0.3"
                step="0.01"
                defaultValue="0.08"
                onChange={(e) => onUpdatePushPullFreq(parseFloat(e.target.value))}
                className="accent-[#38bdf8]"
              />
              <span className="text-[10px] text-[#a4afa5]">Controls rate of gravitational contraction vs orbital expansion cycling.</span>
            </div>

            <div className="p-3 bg-[#080d0b] border border-[rgba(56,189,248,0.2)] rounded font-mono text-[11px] flex flex-col gap-1">
              <span className="text-[#38bdf8] font-bold">CELESTIAL MASS DEPRESSIONS:</span>
              <div className="flex flex-wrap gap-2 text-[10px] text-[#a4afa5]">
                {snapshot.lattice.celestialBodies.map((b) => (
                  <div key={b.id} className="bg-[#101815] px-2 py-1 rounded border border-[rgba(121,215,230,0.1)]">
                    <span className="text-[#f4eee4]">{b.name}</span>: Mass {b.mass} | ρ {b.density}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: PHOTONIC RESONANCE MESH CONTROLS */}
      {activeTab === "resonance" && (
        <div className="p-4 bg-[#0a0f0d] border border-[rgba(121,215,230,0.18)] rounded flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[rgba(121,215,230,0.15)] pb-2">
            <span className="font-mono font-bold text-[#fbbf24]">PHOTONIC QUANTUM DRUM-SKIN MESH</span>
            <span className="font-mono text-[#fbbf24]">Active: {snapshot.resonanceMesh.activeNodes}/{snapshot.resonanceMesh.totalNodes} Nodes</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between font-mono text-[11px]">
                <label className="text-[#f4eee4]">Vibrational Frequency (ω_mesh)</label>
                <span className="text-[#fbbf24]">{snapshot.resonanceMesh.vibrationalFrequency.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.02"
                max="0.8"
                step="0.02"
                value={snapshot.resonanceMesh.vibrationalFrequency}
                onChange={(e) => onUpdateMeshFreq(parseFloat(e.target.value))}
                className="accent-[#fbbf24]"
              />
              <span className="text-[10px] text-[#a4afa5]">Natural resonance frequency of sub-atomic drum-skin fabric.</span>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between font-mono text-[11px]">
                <label className="text-[#f4eee4]">Mesh Fabric Tension</label>
                <span className="text-[#a78bfa]">{snapshot.resonanceMesh.meshTension.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={snapshot.resonanceMesh.meshTension}
                onChange={(e) => onUpdateMeshTension(parseFloat(e.target.value))}
                className="accent-[#a78bfa]"
              />
              <span className="text-[10px] text-[#a4afa5]">Elastic restoring tension across quantum interconnected vertices.</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: VOID & ASTEROID CONDUITS */}
      {activeTab === "void" && (
        <div className="p-4 bg-[#0a0f0d] border border-[rgba(121,215,230,0.18)] rounded flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[rgba(121,215,230,0.15)] pb-2">
            <span className="font-mono font-bold text-[#2dd4bf]">VOID FIELD & DETERMINISTIC ASTEROID CONDUITS</span>
            <span className="font-mono text-[#2dd4bf]">Certainty: {(snapshot.asteroidSystem.deterministicCertaintyIndex * 100).toFixed(1)}%</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between font-mono text-[11px]">
                <label className="text-[#f4eee4]">Void Ambient Dark Pressure (P_void)</label>
                <span className="text-[#2dd4bf]">{snapshot.voidField.pressureIndex.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={snapshot.voidField.pressureIndex}
                onChange={(e) => onUpdateVoidPressure(parseFloat(e.target.value))}
                className="accent-[#2dd4bf]"
              />
              <span className="text-[10px] text-[#a4afa5]">Outer cosmos cold compression holding solar center stable.</span>
            </div>

            <div className="p-3 bg-[#080d0b] border border-[rgba(45,212,191,0.2)] rounded font-mono text-[11px] flex flex-col gap-1">
              <span className="text-[#2dd4bf] font-bold">FORCE EQUILIBRIUM (F_net = 0):</span>
              <span className="text-[10px] text-[#a4afa5]">
                Inward Displacement Pull (D_lat) + Outward Radiation Push (P_pho) + Inward Void Containment (P_voi) = 0 N.
              </span>
              <div className="mt-1 text-xs text-[#f4eee4]">
                Active Asteroids in Conduit: <strong>{snapshot.asteroidSystem.activeConduits} / {snapshot.asteroidSystem.asteroids.length}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 6: DIAGNOSTICS & EXPORT */}
      {activeTab === "telemetry" && (
        <div className="p-4 bg-[#0a0f0d] border border-[rgba(121,215,230,0.18)] rounded flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[rgba(121,215,230,0.15)] pb-2">
            <span className="font-mono font-bold text-[#79d7e6]">SIMULATION TELEMETRY & LABORATORY ARCHIVE</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportJSON}
                className="px-2.5 py-1 bg-[#121c18] border border-[rgba(121,215,230,0.25)] rounded text-[#79d7e6] hover:bg-[#182621] font-mono"
              >
                📥 EXPORT SNAPSHOT (.JSON)
              </button>
              <button
                onClick={handleExportCSV}
                className="px-2.5 py-1 bg-[#121c18] border border-[rgba(217,173,122,0.3)] rounded text-[#d9ad7a] hover:bg-[#201c18] font-mono"
              >
                📥 EXPORT FIELD TELEMETRY (.CSV)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-[11px]">
            <div className="p-2.5 bg-[#080d0b] rounded border border-[rgba(121,215,230,0.1)]">
              <span className="text-[#a4afa5]">TICK COUNT:</span>
              <div className="text-sm font-bold text-[#f4eee4]">{snapshot.tick}</div>
            </div>
            <div className="p-2.5 bg-[#080d0b] rounded border border-[rgba(121,215,230,0.1)]">
              <span className="text-[#a4afa5]">GROWTH SPACING (Δx):</span>
              <div className="text-sm font-bold text-[#d9ad7a]">{snapshot.lightGrid.delta_x.toFixed(4)} AU</div>
            </div>
            <div className="p-2.5 bg-[#080d0b] rounded border border-[rgba(121,215,230,0.1)]">
              <span className="text-[#a4afa5]">AVG NET FORCE:</span>
              <div className="text-sm font-bold text-[#2dd4bf]">{snapshot.asteroidSystem.averageNetForce.toFixed(4)} N</div>
            </div>
            <div className="p-2.5 bg-[#080d0b] rounded border border-[rgba(121,215,230,0.1)]">
              <span className="text-[#a4afa5]">SAFETY STATUS:</span>
              <div className="text-sm font-bold text-[#38bdf8]">{snapshot.safety}</div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Selected Specimen Details HUD (if clicked) */}
      {selectedDetails && (
        <div className="p-3 bg-[#0d1613] border border-[rgba(121,215,230,0.35)] rounded flex flex-wrap items-center justify-between gap-3 font-mono text-[11px]">
          {selectedDetails.type === "celestial" ? (
            <>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: (selectedDetails.data as any).color }} />
                <strong className="text-[#f4eee4]">SPECIMEN: {(selectedDetails.data as any).name}</strong>
              </div>
              <div>MASS: <span className="text-[#79d7e6]">{(selectedDetails.data as any).mass}</span></div>
              <div>CORE DENSITY (ρ): <span className="text-[#38bdf8]">{(selectedDetails.data as any).density}</span></div>
              <div>DISPLACEMENT: <span className="text-[#fbbf24]">{((selectedDetails.data as any).displacementDepth).toFixed(2)}</span></div>
              <div>ORBITAL DISTANCE: <span className="text-[#d9ad7a]">{(selectedDetails.data as any).distance} AU</span></div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2dd4bf]" />
                <strong className="text-[#f4eee4]">ASTEROID SPECIMEN #{((selectedDetails.data as any).id)}</strong>
              </div>
              <div>STATUS: <span className="text-[#2dd4bf]">{(selectedDetails.data as any).isInConduit ? "LOCKED IN CONDUIT (F_net ≈ 0)" : "TRANSIENT"}</span></div>
              <div>CERTAINTY: <span className="text-[#79d7e6]">{(((selectedDetails.data as any).certaintyScore) * 100).toFixed(1)}%</span></div>
              <div>RADIUS: <span className="text-[#d9ad7a]">{((selectedDetails.data as any).baseRadius).toFixed(2)} AU</span></div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
