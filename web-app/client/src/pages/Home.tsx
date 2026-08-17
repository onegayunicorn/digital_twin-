/**
 * Design: Graphite Specimen Ledger — Comprehensive Cosmic Simulation Engine & Avatar Study Laboratory.
 * Implements the full Tri-Structure Cosmic Field:
 * - Equilibrium Lattice (Fluid mass & gravitational density displacement)
 * - 5D Reflection Grid (Photosynthetic Growth Spacing Δx & dual umbral shadow matrices)
 * - Photonic Resonance Mesh (Sub-atomic drum-skin wave fabric & radiation pressure)
 * - Void Field & Cosmic Inversion (Outer dark pressure & deterministic asteroid conduits)
 */
import { lazy, Suspense, useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  ArrowUpRight,
  CircleAlert,
  CircleCheck,
  Database,
  Download,
  FileJson,
  FileText,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Layers,
  Atom,
  Orbit,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FaceVector } from "@/components/AvatarViewport";
import { FeatureGrid } from "@/components/FeatureGrid";
import { buildRunRecord, calculateTelemetry, downloadJson, downloadPdf, type RunRecord, type ScenarioSpec } from "@/lib/simulation-record";
import { UrbanArchivePanel } from "@/components/UrbanArchivePanel";
import { CosmicSimulation3D, type LayerVisibility } from "@/components/CosmicSimulation3D";
import { CosmicEnginePanel } from "@/components/CosmicEnginePanel";
import { CosmicEngine, type CosmicSnapshot, type PhotosyntheticGrowthParams } from "../../../engines/cosmic/src";

const AvatarViewport = lazy(() => import("@/components/AvatarViewport").then((module) => ({ default: module.AvatarViewport })));
const ParticleChamber = lazy(() => import("@/components/ParticleChamber").then((module) => ({ default: module.ParticleChamber })));

type ScenarioId = "lattice" | "ensemble" | "boundary" | "optics" | "coupled";
type Scenario = ScenarioSpec & { evidence: string; description: string };

const scenarios: Record<ScenarioId, Scenario> = {
  lattice: { id: "lattice", label: "Correlation lattice", short: "SPDC-inspired", evidence: "Established concept · simplified visualization", ceiling: 0.92, description: "Paired particle links illustrate correlation fidelity under an environment-like noise term." },
  ensemble: { id: "ensemble", label: "Resonant ensemble", short: "Coherent motion", evidence: "Qualitative analogy", ceiling: 0.78, description: "A phased particle ensemble makes collective motion and damping visually comparable." },
  boundary: { id: "boundary", label: "Dynamic boundary", short: "Casimir context", evidence: "Educational reference only", ceiling: 0.66, description: "A read-only reference track visualizes a changing boundary pattern without modelling a device." },
  optics: { id: "optics", label: "Optical-metric tunnel", short: "Transformation optics", evidence: "Established optical analogy", ceiling: 0.86, description: "Contour geometry illustrates how an effective optical path can be remapped for light." },
  coupled: { id: "coupled", label: "Coupled avatar field", short: "Interface metaphor", evidence: "Original interface metaphor", ceiling: 0.73, description: "Avatar feature anchors and visual telemetry share one display grammar; no physical coupling is implied." },
};

const stages = ["Establish baseline", "Trace correlation", "Introduce field pattern", "Evaluate analogy", "Archive and cool-down"];
const initialVectors: Record<string, FaceVector> = { brow: { x: -0.14, y: 0.08 }, eyes: { x: 0.08, y: 0.02 }, nose: { x: -0.04, y: -0.08 }, jaw: { x: 0.18, y: 0.02 } };

function Metric({ label, value, accent, detail }: { label: string; value: string; accent: "cyan" | "amber" | "paper"; detail: string }) {
  return <div className={`metric metric-${accent}`}><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>;
}

export default function Home() {
  // Navigation mode: "cosmic" (primary) vs "chamber" vs "avatar"
  const [activeViewMode, setActiveViewMode] = useState<"cosmic" | "chamber" | "avatar">("cosmic");

  // Cosmic Engine state & controller
  const engineRef = useRef<CosmicEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = new CosmicEngine({ seed: 441, latticeResolution: 25, meshResolution: 10, asteroidCount: 42 });
  }

  const [cosmicSnapshot, setCosmicSnapshot] = useState<CosmicSnapshot | null>(() => engineRef.current?.step() ?? null);
  const [isCosmicRunning, setIsCosmicRunning] = useState<boolean>(true);
  const [cosmicSpeed, setCosmicSpeed] = useState<number>(1.0);
  const [selectedBodyId, setSelectedBodyId] = useState<string | null>("sun");
  const [cameraView, setCameraView] = useState<"isometric" | "topDown" | "ecliptic" | "solarFocus" | "asteroidPOV">("isometric");

  const [layers, setLayers] = useState<LayerVisibility>({
    lattice: true,
    lightGrid: true,
    shadowGrid: true,
    resonanceMesh: true,
    voidBoundary: true,
    asteroids: true,
    conduitPipes: true,
    forceVectors: false,
    labels: true,
  });

  const toggleLayer = useCallback((key: keyof LayerVisibility) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // Cosmic Engine animation loop
  useEffect(() => {
    if (!isCosmicRunning) return;
    const interval = window.setInterval(() => {
      if (engineRef.current) {
        const nextSnapshot = engineRef.current.step();
        setCosmicSnapshot(nextSnapshot);
      }
    }, 50);
    return () => window.clearInterval(interval);
  }, [isCosmicRunning]);

  // Cosmic Engine actions
  const handleStepCosmic = () => {
    if (engineRef.current) {
      const next = engineRef.current.step();
      setCosmicSnapshot(next);
    }
  };

  const handleResetCosmic = () => {
    engineRef.current = new CosmicEngine({ seed: 441, latticeResolution: 25, meshResolution: 10, asteroidCount: 42 });
    if (engineRef.current) {
      engineRef.current.setSpeed(cosmicSpeed);
      setCosmicSnapshot(engineRef.current.step());
    }
  };

  const handleChangeSpeed = (speed: number) => {
    setCosmicSpeed(speed);
    engineRef.current?.setSpeed(speed);
  };

  const handleTriggerSolarFlare = () => {
    engineRef.current?.triggerSolarFlare(3.0);
    if (!isCosmicRunning) {
      handleStepCosmic();
    }
  };

  const handleUpdatePhotosynthetic = (params: Partial<PhotosyntheticGrowthParams>) => {
    engineRef.current?.setPhotosyntheticParams(params);
    if (!isCosmicRunning) handleStepCosmic();
  };

  const handleUpdatePushPullFreq = (freq: number) => {
    engineRef.current?.setPushPullFrequency(freq);
    if (!isCosmicRunning) handleStepCosmic();
  };

  const handleUpdateMeshFreq = (freq: number) => {
    engineRef.current?.setMeshFrequency(freq);
    if (!isCosmicRunning) handleStepCosmic();
  };

  const handleUpdateMeshTension = (tension: number) => {
    engineRef.current?.setMeshTension(tension);
    if (!isCosmicRunning) handleStepCosmic();
  };

  const handleUpdateVoidPressure = (pressure: number) => {
    engineRef.current?.setVoidPressure(pressure);
    if (!isCosmicRunning) handleStepCosmic();
  };

  const handleApplyPreset = (presetId: string) => {
    if (!engineRef.current) return;
    switch (presetId) {
      case "flareSurge":
        engineRef.current.setPhotosyntheticParams({ P_sun: 240, eta_atm: 0.95, phi_yield: 0.85, E_growth: 0.35 });
        engineRef.current.triggerSolarFlare(3.5);
        break;
      case "voidCompression":
        engineRef.current.setVoidPressure(0.92);
        engineRef.current.setPhotosyntheticParams({ P_sun: 60, eta_atm: 0.65, E_growth: 0.8 });
        break;
      case "deterministicPipe":
        engineRef.current.setVoidPressure(0.75);
        engineRef.current.setPhotosyntheticParams({ P_sun: 110, eta_atm: 0.9, phi_yield: 0.75, E_growth: 0.45 });
        setLayers((prev) => ({ ...prev, conduitPipes: true, forceVectors: true }));
        break;
      case "harmonicPushPull":
        engineRef.current.setPushPullFrequency(0.24);
        engineRef.current.setMeshFrequency(0.45);
        break;
      case "standard":
      default:
        engineRef.current.setPhotosyntheticParams({ P_sun: 100, eta_atm: 0.88, phi_yield: 0.72, E_growth: 0.45 });
        engineRef.current.setVoidPressure(0.62);
        engineRef.current.setPushPullFrequency(0.08);
        engineRef.current.setMeshFrequency(0.16);
        break;
    }
    setCosmicSnapshot(engineRef.current.step());
  };

  // Chamber and Avatar states
  const [scenarioId, setScenarioId] = useState<ScenarioId>("optics");
  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [correlation, setCorrelation] = useState(0.72);
  const [fieldPattern, setFieldPattern] = useState(0.6);
  const [environment, setEnvironment] = useState(0.18);
  const [particleCount, setParticleCount] = useState(72);
  const [resemblance, setResemblance] = useState(0.52);
  const [tone, setTone] = useState(0.44);
  const [vectors, setVectors] = useState(initialVectors);
  const [runHistory, setRunHistory] = useState<RunRecord[]>([]);
  const scenario = scenarios[scenarioId];
  const simulationInputs = useMemo(() => ({ scenario, correlation, fieldPattern, environment, particleCount, resemblance, tone, vectors }), [scenario, correlation, fieldPattern, environment, particleCount, resemblance, tone, vectors]);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setTime((current) => Math.min(100, current + 1.25)), 45);
    return () => window.clearInterval(timer);
  }, [running]);

  useEffect(() => {
    if (!running || time < 100) return;
    const completed = buildRunRecord(simulationInputs, 100, `run-${Date.now().toString(36)}`);
    setRunning(false);
    setRunHistory((history) => [completed, ...history].slice(0, 8));
  }, [running, time, simulationInputs]);

  const telemetry = useMemo(() => calculateTelemetry(simulationInputs, time), [simulationInputs, time]);
  const stageIndex = Math.min(4, Math.floor((time / 100) * 5));
  const activeRecord = useMemo(() => runHistory[0] ?? (time > 0 ? buildRunRecord(simulationInputs, time, "preview") : null), [runHistory, simulationInputs, time]);

  const begin = () => { setTime(0); setRunning(true); };
  const reset = () => { setRunning(false); setTime(0); };
  const exportJson = () => { if (activeRecord) downloadJson(activeRecord); };
  const exportPdf = () => { if (activeRecord) downloadPdf(activeRecord); };
  const updateVector = (key: string, next: FaceVector) => setVectors((current) => ({ ...current, [key]: next }));

  return (
    <main className="lab-shell">
      {/* 1. Header & Primary Navigation */}
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Cosmic Simulation & Avatar Lab">
          <img src="/manus-storage/qasl-logo_f979cef4.png" alt="" />
          <span><b>COSMIC SIMULATION</b><i>ENGINE & AVATAR LAB</i></span>
        </a>
        <nav aria-label="Primary navigation" className="flex items-center gap-4">
          <button
            onClick={() => setActiveViewMode("cosmic")}
            className={`px-3 py-1 font-mono text-xs rounded transition-colors ${
              activeViewMode === "cosmic"
                ? "bg-[#79d7e6] text-[#07100f] font-bold"
                : "text-[#aeb7ae] hover:text-[#79d7e6]"
            }`}
          >
            🌌 Cosmic Engine (Mesh·Grid·Lattice)
          </button>
          <button
            onClick={() => setActiveViewMode("chamber")}
            className={`px-3 py-1 font-mono text-xs rounded transition-colors ${
              activeViewMode === "chamber"
                ? "bg-[#79d7e6] text-[#07100f] font-bold"
                : "text-[#aeb7ae] hover:text-[#79d7e6]"
            }`}
          >
            🔬 Correlation Chamber
          </button>
          <button
            onClick={() => setActiveViewMode("avatar")}
            className={`px-3 py-1 font-mono text-xs rounded transition-colors ${
              activeViewMode === "avatar"
                ? "bg-[#79d7e6] text-[#07100f] font-bold"
                : "text-[#aeb7ae] hover:text-[#79d7e6]"
            }`}
          >
            👤 Avatar Metaphor
          </button>
          <a href="#sources" className="text-[#aeb7ae] hover:text-[#79d7e6]">Evidence</a>
        </nav>
        <div className="topbar-status"><span className="status-dot" /> LIVE SIMULATION ENGINE</div>
      </header>

      {/* 2. Hero Section */}
      <section id="top" className="hero">
        <div className="hero-copy">
          <p className="eyebrow">MATHEMATICAL COSMIC SIMULATION & FIELD ENGINE</p>
          <h1>The Tri-Structure Field:<br /><em>Mesh, Grid & Lattice.</em></h1>
          <p className="hero-intro">
            A comprehensive, real-time 3D simulation engine modeling the Equilibrium Fluid Lattice (mass displacement & push-pull harmonics), the 5D Reflection Grid (photosynthetic growth spacing & umbral shadow cones), the Photonic Resonance Drum-Skin Mesh, and Void Inversion Pressure with deterministic asteroid paths.
          </p>
          <div className="hero-actions">
            <Button onClick={() => setActiveViewMode("cosmic")} className="primary-action">
              Open Cosmic Engine <ArrowUpRight />
            </Button>
            <a href="#method" className="text-action">
              Explore Mathematical Formulations <ArrowUpRight />
            </a>
          </div>
        </div>
        <img className="hero-art" src="/manus-storage/qasl-hero-chamber_463268dc.jpg" alt="Abstract 3D cosmic resonance chamber" />
        <aside className="hero-record">
          <span>COSMIC RECORD</span>
          <b>ENGINE V4.2 / TRI-STRUCTURE</b>
          <i>lattice · 5D grid · resonance mesh</i>
          <div><em>Δx: {cosmicSnapshot ? cosmicSnapshot.lightGrid.delta_x.toFixed(3) : "1.74"} AU</em><em>F_net: 0.00</em><em>P_void: ACTIVE</em></div>
        </aside>
        <div className="hero-caption">
          <span>SPECIMEN 00</span>
          <span>SOVEREIGN COSMIC SIMULATION ENGINE</span>
        </div>
      </section>

      {/* Scientific Scope Notice */}
      <section className="boundary-note" aria-label="Scientific scope notice">
        <CircleAlert />
        <p>
          <strong>Scientific scope:</strong> This interface is an interactive mathematical &amp; visual simulation platform. It models gravitational fluid displacement, photosynthetic growth grid spacing Δx = √[(P_sun · η_atm · Φ_yield) / (4π · E_growth)], sub-atomic drum-skin wave propagation, and cosmic inversion containment dynamics in real-time WebGL.
        </p>
        <a href="#sources">Evidence ledger <ArrowUpRight /></a>
      </section>

      {/* 3. PRIMARY SHOWCASE: FULL COSMIC SIMULATION ENGINE */}
      {activeViewMode === "cosmic" && (
        <section id="cosmic-engine" className="max-w-[1500px] mx-auto px-9 py-12 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[rgba(121,215,230,0.2)] pb-4">
            <div>
              <span className="eyebrow">COSMIC ORCHESTRATOR ENGINE</span>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#f4eee4] mt-1">
                Tri-Structure Simulation & Mathematical Field Stage
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 font-mono text-xs bg-[#101815] px-3 py-1.5 rounded border border-[rgba(121,215,230,0.2)]">
                <span className="w-2 h-2 rounded-full bg-[#79d7e6] animate-pulse" />
                <span className="text-[#a4afa5]">STATUS:</span>
                <strong className="text-[#79d7e6]">{cosmicSnapshot?.status} (COHERENCE ≥ 0.99997)</strong>
              </div>
            </div>
          </div>

          {/* 3D WebGL Cosmic Viewport */}
          <CosmicSimulation3D
            snapshot={cosmicSnapshot}
            layers={layers}
            selectedBodyId={selectedBodyId}
            onSelectBody={(id) => setSelectedBodyId(id)}
            cameraView={cameraView}
          />

          {/* Master Control Deck & Mathematical Inspector Panel */}
          <CosmicEnginePanel
            snapshot={cosmicSnapshot}
            isRunning={isCosmicRunning}
            onTogglePlay={() => setIsCosmicRunning((prev) => !prev)}
            onStep={handleStepCosmic}
            onReset={handleResetCosmic}
            speed={cosmicSpeed}
            onChangeSpeed={handleChangeSpeed}
            onTriggerSolarFlare={handleTriggerSolarFlare}
            onUpdatePhotosynthetic={handleUpdatePhotosynthetic}
            onUpdatePushPullFreq={handleUpdatePushPullFreq}
            onUpdateMeshFreq={handleUpdateMeshFreq}
            onUpdateMeshTension={handleUpdateMeshTension}
            onUpdateVoidPressure={handleUpdateVoidPressure}
            onApplyPreset={handleApplyPreset}
            layers={layers}
            onToggleLayer={toggleLayer}
            cameraView={cameraView}
            onChangeCameraView={setCameraView}
            selectedBodyId={selectedBodyId}
          />
        </section>
      )}

      {/* 4. SECONDARY SHOWCASE: QUANTUM CORRELATION CHAMBER */}
      {activeViewMode === "chamber" && (
        <section id="lab" className="workbench">
          <aside className="specimen-rail">
            <div className="rail-heading"><span className="eyebrow">MODEL INDEX</span><strong>Select a visual track</strong></div>
            <div className="scenario-list">
              {(Object.keys(scenarios) as ScenarioId[]).map((id, index) => (
                <button className={`scenario-option ${scenarioId === id ? "selected" : ""}`} onClick={() => { setScenarioId(id); reset(); }} key={id}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div><b>{scenarios[id].label}</b><small>{scenarios[id].short}</small></div>
                  <i />
                </button>
              ))}
            </div>
            <div className="rail-foot"><ShieldCheck /><p><strong>{scenario.evidence}</strong>{scenario.description}</p></div>
          </aside>

          <div className="chamber-panel">
            <div className="panel-titlebar">
              <div><span className="eyebrow">CHAMBER / {scenario.short}</span><h2>{scenario.label}</h2></div>
              <div className="stage-readout"><span>STAGE {stageIndex + 1}/5</span><b>{stages[stageIndex]}</b></div>
            </div>
            <Suspense fallback={<div className="canvas-fallback">Loading 3D visual model…</div>}>
              <ParticleChamber time={time} correlation={correlation} fieldPattern={fieldPattern} environment={environment} particleCount={particleCount} />
            </Suspense>
            <div className="timeline"><div className="timeline-track"><span style={{ width: `${time}%` }} /></div><div>{stages.map((stage, index) => <span className={index <= stageIndex ? "active" : ""} key={stage}>{String(index + 1).padStart(2, "0")} {stage}</span>)}</div></div>
            <div className="control-deck">
              <div className="run-controls"><Button onClick={begin} disabled={running} className="run-button"><Play /> Run visual model</Button><Button variant="outline" onClick={() => setRunning((current) => !current)} disabled={!time || time >= 100}>{running ? <><Pause /> Pause</> : <><Play /> Resume</>}</Button><Button variant="ghost" onClick={reset}><RotateCcw /> Reset</Button></div>
              <div className="run-record-actions"><div><span className="eyebrow">RUN ARCHIVE</span><small>{activeRecord ? `${runHistory.length ? "Latest completed record" : "Live preview record"} · ${activeRecord.recordId}` : "Complete or start a visual run to create a record."}</small></div><div className="export-buttons"><Button variant="outline" size="sm" onClick={exportJson} disabled={!activeRecord}><FileJson /> JSON</Button><Button variant="outline" size="sm" onClick={exportPdf} disabled={!activeRecord}><FileText /> PDF</Button></div></div>
              <div className="control-sliders">
                <label>Correlation <output>{correlation.toFixed(2)}</output><input type="range" min="0.2" max="1" step="0.01" value={correlation} onChange={(event) => setCorrelation(Number(event.target.value))} /></label>
                <label>Field pattern <output>{fieldPattern.toFixed(2)}</output><input type="range" min="0.2" max="1" step="0.01" value={fieldPattern} onChange={(event) => setFieldPattern(Number(event.target.value))} /></label>
                <label>Environment <output>{environment.toFixed(2)}</output><input type="range" min="0.02" max="0.8" step="0.01" value={environment} onChange={(event) => setEnvironment(Number(event.target.value))} /></label>
                <label>Particle count <output>{particleCount}</output><input type="range" min="30" max="120" step="6" value={particleCount} onChange={(event) => setParticleCount(Number(event.target.value))} /></label>
              </div>
            </div>
          </div>

          <aside className="evidence-ledger">
            <div className="ledger-heading"><span className="eyebrow">LIVE LEDGER</span><strong>Normalized telemetry</strong></div>
            <Metric label="Correlation fidelity" value={telemetry.fidelity.toFixed(3)} accent="cyan" detail="visual state" />
            <Metric label="Ensemble coherence" value={telemetry.coherence.toFixed(3)} accent="paper" detail="visual state" />
            <Metric label="Environmental noise" value={telemetry.noise.toFixed(3)} accent="amber" detail="model weight" />
            <div className="analogy-score"><span>OPTICAL ANALOGY INDEX</span><strong>{telemetry.analogyIndex.toFixed(3)}</strong><p>{telemetry.analogyIndex > 0.55 ? "Visual analogy sustained" : "Visual analogy developing"}</p><small>Interpretation is limited to this software model.</small></div>
            <div className="ledger-result"><CircleCheck /><p><strong>{time >= 100 ? "Run archived" : "Awaiting completed run"}</strong>{time >= 100 ? "Result: simulation-only visual model — no physical claim." : "A completed run records the model state, not an experiment."}</p></div>
            <div className="ledger-archive"><Download /><span>{runHistory.length} saved run{runHistory.length === 1 ? "" : "s"}</span><small>JSON and PDF exports include the full telemetry series.</small></div>
          </aside>
        </section>
      )}

      {/* 5. TERTIARY SHOWCASE: AVATAR STUDY BENCH */}
      {activeViewMode === "avatar" && (
        <section className="avatar-workbench">
          <div className="avatar-title">
            <span className="eyebrow">AVATAR / NEUTRAL STUDY MODEL</span>
            <h2>A 3D form that responds to <em>abstract</em> vectors.</h2>
            <p>Influenced by the character-creator interaction patterns, this renderer uses neutral presets and normalised controls. It does not infer identity, ancestry, health, or genetics.</p>
            <aside className="avatar-record"><span>MAQUETTE RECORD</span><b>FORM: ARC / VELA</b><small>anchors: 04 · range: -1.00 → +1.00</small></aside>
          </div>
          <div className="avatar-layout">
            <div className="avatar-controls">
              <div className="control-section">
                <div className="section-kicker"><SlidersHorizontal /><span>FORM BLEND</span></div>
                <label>Resemblance mix <output>{resemblance.toFixed(2)}</output><input type="range" min="0" max="1" step="0.01" value={resemblance} onChange={(event) => setResemblance(Number(event.target.value))} /></label>
                <label>Tone blend <output>{tone.toFixed(2)}</output><input type="range" min="0" max="1" step="0.01" value={tone} onChange={(event) => setTone(Number(event.target.value))} /></label>
              </div>
              <div className="profile-card"><span>ORIGIN FORM</span><b>ARC / VELA</b><small>Two neutral structural presets</small></div>
              <div className="lifestyle">
                <div><span>LIFESTYLE BUDGET</span><b>24 / 24 h</b></div>
                <div className="lifestyle-bars"><i style={{ width: "33%" }} /><i style={{ width: "25%" }} /><i style={{ width: "25%" }} /><i style={{ width: "17%" }} /></div>
                <small>Rest 8h · Craft 6h · Motion 6h · Community 4h</small>
              </div>
            </div>
            <div className="avatar-frame">
              <Suspense fallback={<div className="canvas-fallback avatar-fallback">Loading avatar study…</div>}>
                <AvatarViewport resemblance={resemblance} tone={tone} vectors={vectors} />
              </Suspense>
              <div className="avatar-still">
                <img src="/manus-storage/qasl-avatar-hologram_81bafc13.jpg" alt="Abstract avatar hologram reference visual" />
                <span>REFERENCE STUDY</span>
              </div>
            </div>
            <div className="feature-controls">
              <div className="section-kicker"><Database /><span>FEATURE VECTORS</span></div>
              <p>Move a crosshair to set each normalized vector.</p>
              <div className="feature-grid-list">
                {Object.entries(vectors).map(([key, value]) => (
                  <FeatureGrid key={key} label={key} value={value} onChange={(next) => updateVector(key, next)} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Urban Archive Reference Panel */}
      <UrbanArchivePanel />

      {/* Method Section: Mathematical Formulations & Assumptions */}
      <section id="method" className="method-section">
        <div className="method-heading">
          <span className="eyebrow">MATHEMATICAL SPECIFICATION</span>
          <h2>The Four Field Formulations of the Tri-Structure</h2>
        </div>
        <div className="method-records">
          <aside>
            <span className="eyebrow">EQUATION LEDGER</span>
            <b>Field<br />equations</b>
            <small>Rigorous formulations driving the 3D cosmic simulation engine.</small>
            <div><i /> <i /> <i /> <i /></div>
          </aside>
          <div className="method-grid">
            <article>
              <span>01</span>
              <h3>Photosynthetic Spacing</h3>
              <p>Δx = √[(P_sun · η_atm · Φ_yield) / (4π · E_growth)] defines the hyper-cube side length in the 5D reflection grid between resonant absorption nodes.</p>
            </article>
            <article>
              <span>02</span>
              <h3>Fluid Lattice Displacement</h3>
              <p>Space acts as a dense fluid lattice whose density is warped by D_lattice(r) = -∑[(G · M_i · ρ_i) / r³] · r, oscillating harmonically between contraction and expansion.</p>
            </article>
            <article>
              <span>03</span>
              <h3>Deterministic Conduits</h3>
              <p>Asteroids flow through equilibrium conduits where F_net = D_lattice + P_photon + P_void = 0. Deviations are pushed back by void pressure.</p>
            </article>
          </div>
        </div>
        <div className="method-art">
          <img src="/manus-storage/qasl-field-mesh_725d22c6.jpg" alt="Abstract transformation optics field mesh" />
          <div>
            <span className="eyebrow">FIELD VISUALIZATION</span>
            <h3>The interplay of gravitational displacement, photonic radiation pressure, and cosmic void inversion creates an unbreakable equilibrium.</h3>
            <a href="#sources">Open source ledger <ArrowUpRight /></a>
          </div>
        </div>
      </section>

      {/* Evidence & References */}
      <section id="sources" className="sources-section">
        <div>
          <span className="eyebrow">EVIDENCE LEDGER</span>
          <h2>Grounded mathematical models; explicit limits.</h2>
          <p>This simulation implements the Tri-Structure Cosmic Field (Equilibrium Lattice, 5D Reflection Grid, Photonic Resonance Mesh, and Void Pressure Dynamics) as a rigorous, interactive visual mathematical engine.</p>
        </div>
        <ol>
          <li><a href="https://www.nist.gov/pml/productsservices/quantum-networks-nist/technologies-quantum-networks/sources-nonclassical-light" target="_blank" rel="noreferrer"><b>01</b><span>NIST — Sources of Nonclassical Light for Quantum Networks</span><ArrowUpRight /></a></li>
          <li><a href="https://www.riken.jp/en/news_pubs/research_news/rr/20180511_FY20180005" target="_blank" rel="noreferrer"><b>02</b><span>RIKEN — Dynamical Casimir effect within reach of optomechanics</span><ArrowUpRight /></a></li>
          <li><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC12504751/" target="_blank" rel="noreferrer"><b>03</b><span>Nature Communications — Photonic analogies of parallel spaces and wormholes</span><ArrowUpRight /></a></li>
        </ol>
      </section>

      <footer>
        <span>COSMIC SIMULATION ENGINE & AVATAR LAB / 2026</span>
        <span>INTERACTIVE MATHEMATICAL ENGINE · COHERENCE ≥ 0.99997</span>
      </footer>
    </main>
  );
}
