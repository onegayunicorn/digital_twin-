import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSimulation } from "@/contexts/SimulationContext";
import { CosmicSimulation3D, type LayerVisibility } from "@/components/CosmicSimulation3D";
import { MultiPlatformAspectFrame } from "@/components/MultiPlatformAspectFrame";
import { CosmicEngine, type CosmicSnapshot } from "../../../engines/cosmic/src";
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Layers,
  Zap,
  Sliders,
  Maximize2,
  Camera,
  ShieldCheck,
  Activity,
  Orbit,
  ArrowRight,
  Info,
  Download,
  FileJson,
} from "lucide-react";
import { CosmicEnginePanel } from "@/components/CosmicEnginePanel";

export const SimulationPage: React.FC = () => {
  const {
    params,
    setParams,
    updateParam,
    layers,
    toggleLayer,
    isPaused,
    setIsPaused,
    flareActive,
    triggerSolarFlare,
    cameraPreset,
    setCameraPreset,
    deltaX,
    radiationFlux,
    lastAppliedPreset,
    applySimulationPreset,
    refreshKey,
    setActiveTab,
  } = useSimulation();

  // Reference to physical CosmicEngine instance
  const engineRef = useRef<CosmicEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = new CosmicEngine({
      seed: 441,
      latticeResolution: 25,
      meshResolution: 10,
      asteroidCount: params.asteroidCount || 48,
    });
  }

  const [snapshot, setSnapshot] = useState<CosmicSnapshot | null>(() => engineRef.current?.step() ?? null);
  const [selectedBodyId, setSelectedBodyId] = useState<string | null>("sun");

  // Keep engine in sync with context parameters
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setPhotosyntheticParams({
        P_sun: params.P_sun,
        eta_atm: params.eta_atm,
        phi_yield: params.phi_yield,
        E_growth: params.E_growth,
      });
      engineRef.current.setVoidPressure(params.voidPressure);
      engineRef.current.setPushPullFrequency(params.pushPullFreq);
      engineRef.current.setSpeed(params.speed);
    }
  }, [params, refreshKey]);

  // Handle flare triggers
  useEffect(() => {
    if (flareActive && engineRef.current) {
      engineRef.current.triggerSolarFlare(3.5);
    }
  }, [flareActive]);

  // Simulation physics loop
  useEffect(() => {
    if (isPaused) return;
    const interval = window.setInterval(() => {
      if (engineRef.current) {
        const next = engineRef.current.step();
        setSnapshot(next);
      }
    }, 45);
    return () => window.clearInterval(interval);
  }, [isPaused]);

  const handleStep = () => {
    if (engineRef.current) {
      const next = engineRef.current.step();
      setSnapshot(next);
    }
  };

  const handleReset = () => {
    engineRef.current = new CosmicEngine({
      seed: 441,
      latticeResolution: 25,
      meshResolution: 10,
      asteroidCount: params.asteroidCount || 48,
    });
    if (engineRef.current) {
      engineRef.current.setSpeed(params.speed);
      setSnapshot(engineRef.current.step());
    }
  };

  const handleExportJson = () => {
    const data = {
      timestamp: new Date().toISOString(),
      preset: lastAppliedPreset,
      parameters: params,
      tick: snapshot?.tick,
      latticeDisplacementSun: snapshot?.lattice.heightGrid[12]?.[12],
      deltaX_AU: deltaX,
      coherence: 0.99997,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sovereign_cosmic_run_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const presets = [
    { name: "Default Equilibrium", desc: "Balanced tri-structure" },
    { name: "Solar Flare Surge", desc: "3.5x radiant shockwave" },
    { name: "Deep Void Inversion", desc: "High boundary compression" },
    { name: "Deterministic Conduit Belt", desc: "Zero-net-force channels" },
    { name: "High Harmonic Drum-Skin Resonance", desc: "Standing Bessel waves" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 sm:pb-12">
      {/* Simulation Top Bar */}
      <div className="border-b border-border/70 bg-card/40 px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/15 text-teal-400 border border-teal-500/30">
              <Orbit className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-foreground">PAGE 2 // 3D COSMIC ENGINE</span>
                <span className="rounded bg-teal-950/60 border border-teal-500/40 px-2 py-0.5 font-mono text-[10px] text-teal-300 font-bold">
                  Δx = {deltaX.toFixed(2)} AU
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground">
                WebGL Fluid Lattice · 5D Reflection Grid · Photonic Drum-Skin
              </span>
            </div>
          </div>

          {/* Quick Playback Deck */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                isPaused
                  ? "bg-emerald-500 text-emerald-950 hover:bg-emerald-400"
                  : "bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30"
              }`}
            >
              {isPaused ? <Play className="h-3.5 w-3.5 fill-current" /> : <Pause className="h-3.5 w-3.5" />}
              <span>{isPaused ? "Resume" : "Pause"}</span>
            </button>

            <button
              onClick={handleStep}
              className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium hover:bg-accent text-foreground"
              title="Single Time Step"
            >
              Step
            </button>

            <button
              onClick={handleReset}
              className="rounded-lg border border-border bg-card p-1.5 text-xs font-medium hover:bg-accent text-muted-foreground hover:text-foreground"
              title="Reset Simulation"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={triggerSolarFlare}
              className="flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-950/30 px-3 py-1.5 text-xs font-bold text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)] hover:bg-amber-950/50"
            >
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span>Solar Flare</span>
            </button>

            <button
              onClick={handleExportJson}
              className="flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent"
              title="Export Run Record"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Simulation Viewport & Controls Grid */}
      <div className="mx-auto max-w-7xl px-3 sm:px-6 py-6 space-y-6">
        {/* 3D WebGL Canvas Stage wrapped in Multi-Platform Aspect Frame */}
        <MultiPlatformAspectFrame
          title="3D Cosmic Simulation Engine"
          badge="7-Layer WebGL Fluid Lattice"
          defaultHeight={580}
        >
          <div className="relative w-full h-full min-h-[480px]">
            <CosmicSimulation3D
              snapshot={snapshot}
              layers={layers}
              selectedBodyId={selectedBodyId}
              onSelectBody={setSelectedBodyId}
              cameraView={cameraPreset}
            />

            {/* Camera View Selector Overlay */}
            <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-1.5 rounded-xl border border-border/60 bg-background/80 p-1 backdrop-blur-md">
              <span className="px-2 font-mono text-[10px] text-muted-foreground uppercase">Camera:</span>
              {(
                [
                  { id: "isometric", label: "Isometric" },
                  { id: "topDown", label: "Top-Down" },
                  { id: "ecliptic", label: "Ecliptic" },
                  { id: "solarFocus", label: "Solar Focus" },
                  { id: "asteroidPOV", label: "Asteroid Conduit" },
                ] as const
              ).map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCameraPreset(c.id)}
                  className={`rounded-lg px-2.5 py-1 font-mono text-[11px] transition-all ${
                    cameraPreset === c.id
                      ? "bg-primary text-primary-foreground font-bold"
                      : "text-muted-foreground hover:text-foreground hover:bg-card"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Real-Time Mathematical Telemetry Overlay HUD */}
            <div className="absolute bottom-3 left-3 z-10 rounded-xl border border-border/60 bg-background/85 p-3 backdrop-blur-md font-mono text-xs space-y-1 shadow-lg max-w-[280px] sm:max-w-xs">
              <div className="flex items-center justify-between border-b border-border/50 pb-1">
                <span className="text-primary font-bold text-[11px] uppercase flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  Live Field Inspector
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold">T = {snapshot?.tick || 0}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground">Photosynthetic Spacing:</span>
                <span className="text-teal-400 font-bold">Δx = {deltaX.toFixed(3)} AU</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground">Void Pressure Index:</span>
                <span className="text-purple-400 font-bold">P_void = {params.voidPressure.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground">Drum-Skin Frequency:</span>
                <span className="text-cyan-400 font-bold">f_mesh = {params.meshFreq.toFixed(2)} Hz</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground">Solar Irradiance:</span>
                <span className="text-amber-400 font-bold">{params.P_sun} W/m²</span>
              </div>
            </div>
          </div>
        </MultiPlatformAspectFrame>

        {/* 7 Layer Toggles Deck */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border/70 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              <h3 className="font-mono text-sm font-bold text-foreground">7-Layer Visual Rendering Matrix</h3>
            </div>
            <span className="text-xs text-muted-foreground font-mono">Toggle components in 3D WebGL</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {[
              { id: "lattice", label: "Fluid Lattice", color: "text-teal-400" },
              { id: "lightGrid", label: "5D Light Grid", color: "text-amber-400" },
              { id: "shadowGrid", label: "Umbral Shadows", color: "text-indigo-400" },
              { id: "resonanceMesh", label: "Photonic Mesh", color: "text-purple-400" },
              { id: "voidBoundary", label: "Void Shell", color: "text-rose-400" },
              { id: "asteroids", label: "Asteroid Belt", color: "text-emerald-400" },
              { id: "conduitPipes", label: "Conduit Pipes", color: "text-cyan-400" },
              { id: "forceVectors", label: "Force Vectors", color: "text-lime-400" },
            ].map((layer) => {
              // @ts-ignore
              const isLayerOn = layers[layer.id];
              return (
                <button
                  key={layer.id}
                  // @ts-ignore
                  onClick={() => toggleLayer(layer.id)}
                  className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-center font-mono text-xs transition-all ${
                    isLayerOn
                      ? "border-primary/50 bg-primary/10 text-foreground font-semibold shadow-[0_0_10px_rgba(20,184,166,0.15)]"
                      : "border-border/60 bg-muted/20 text-muted-foreground opacity-50 hover:opacity-100"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full mb-1 ${isLayerOn ? "bg-primary" : "bg-muted"}`} />
                  <span className="text-[11px] leading-tight">{layer.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Preset Scenarios & Parameter Tuning */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Preset Scenarios */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3">
            <h3 className="font-mono text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/70 pb-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Cosmic Scenario Presets
            </h3>
            <div className="space-y-2">
              {presets.map((p) => (
                <div
                  key={p.name}
                  onClick={() => applySimulationPreset(p.name)}
                  className={`group cursor-pointer rounded-xl border p-3 transition-all ${
                    lastAppliedPreset === p.name
                      ? "border-primary bg-primary/15 text-foreground"
                      : "border-border/70 bg-muted/15 hover:border-primary/40 hover:bg-muted/30 text-muted-foreground"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-foreground group-hover:text-primary">
                      {p.name}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 text-primary transition-opacity" />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Parameter Sliders */}
          <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border/70 pb-2">
              <h3 className="font-mono text-sm font-bold text-foreground flex items-center gap-2">
                <Sliders className="h-4 w-4 text-primary" />
                Physical Parameter Matrix
              </h3>
              <button
                onClick={() => setActiveTab(3)}
                className="text-xs font-mono text-primary hover:underline flex items-center gap-1"
              >
                <span>Synthesize with DeepSeek V4 AI</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">P_sun (Solar Power):</span>
                  <span className="font-bold text-foreground">{params.P_sun} W/m²</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="300"
                  value={params.P_sun}
                  onChange={(e) => updateParam("P_sun", Number(e.target.value))}
                  className="w-full accent-primary h-1.5 bg-border rounded-lg cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Void Pressure (P_void):</span>
                  <span className="font-bold text-purple-400">{params.voidPressure.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.02"
                  value={params.voidPressure}
                  onChange={(e) => updateParam("voidPressure", Number(e.target.value))}
                  className="w-full accent-primary h-1.5 bg-border rounded-lg cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lattice Push-Pull Breathing:</span>
                  <span className="font-bold text-cyan-400">{params.pushPullFreq.toFixed(2)} Hz</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="0.3"
                  step="0.01"
                  value={params.pushPullFreq}
                  onChange={(e) => updateParam("pushPullFreq", Number(e.target.value))}
                  className="w-full accent-primary h-1.5 bg-border rounded-lg cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Drum-Skin Wave Frequency:</span>
                  <span className="font-bold text-teal-400">{params.meshFreq.toFixed(2)} Hz</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.6"
                  step="0.01"
                  value={params.meshFreq}
                  onChange={(e) => updateParam("meshFreq", Number(e.target.value))}
                  className="w-full accent-primary h-1.5 bg-border rounded-lg cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Simulation Speed:</span>
                  <span className="font-bold text-foreground">{params.speed.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.25"
                  max="3.0"
                  step="0.25"
                  value={params.speed}
                  onChange={(e) => updateParam("speed", Number(e.target.value))}
                  className="w-full accent-primary h-1.5 bg-border rounded-lg cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quantum Yield (Φ_yield):</span>
                  <span className="font-bold text-foreground">{params.phi_yield.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="1.0"
                  step="0.02"
                  value={params.phi_yield}
                  onChange={(e) => updateParam("phi_yield", Number(e.target.value))}
                  className="w-full accent-primary h-1.5 bg-border rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
