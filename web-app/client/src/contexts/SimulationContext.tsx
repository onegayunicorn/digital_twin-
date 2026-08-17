import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface CosmicLayersState {
  lattice: boolean;
  lightGrid: boolean;
  shadowGrid: boolean;
  resonanceMesh: boolean;
  voidBoundary: boolean;
  asteroids: boolean;
  conduitPipes: boolean;
  forceVectors: boolean;
  labels: boolean;
}

export interface SimulationParams {
  P_sun: number; // Solar irradiance (W/m^2)
  eta_atm: number; // Atmospheric transmission (0 - 1)
  phi_yield: number; // Photosynthetic quantum yield (0 - 1)
  E_growth: number; // Growth energy cost (J/m^3)
  voidPressure: number; // Void pressure index (0 - 1)
  pushPullFreq: number; // Fluid space breathing frequency (Hz)
  meshFreq: number; // Photonic drum-skin wave frequency (Hz)
  meshTension: number; // Drum-skin tension index (0 - 1)
  speed: number; // Simulation speed multiplier
  asteroidCount: number;
}

export interface J09Telemetry {
  heartRate: number; // BPM
  hrv: number; // ms
  spo2: number; // %
  skinTemp: number; // °C
  tempDeviation: number; // °C from 36.5
  bioElectricIndex: number; // 0 - 1
  motionState: "STILL" | "ACTIVE" | "SLEEP";
  dnaResonanceIndex: number; // 0 - 1
  rfCorrelationScore: number; // 0 - 1
  seq: number;
  pqcValid: boolean;
  signature: string;
}

export interface FaceVectorState {
  browElevation: number; // 0 - 1
  eyeScale: number; // 0 - 1
  noseBridge: number; // 0 - 1
  jawWidth: number; // 0 - 1
  resemblanceBlend: number; // 0 - 1
  faceDetected: boolean;
  trackingConfidence: number;
}

interface SimulationContextType {
  // Navigation
  activeTab: number; // 1: Theory, 2: Simulation, 3: DeepSeek, 4: DigitalTwin
  setActiveTab: (tab: number) => void;
  refreshKey: number;
  triggerRefresh: () => void;

  // Simulation Parameters
  params: SimulationParams;
  setParams: React.Dispatch<React.SetStateAction<SimulationParams>>;
  updateParam: (key: keyof SimulationParams, value: number) => void;
  resetParams: () => void;

  // Layer Toggles
  layers: CosmicLayersState;
  setLayers: React.Dispatch<React.SetStateAction<CosmicLayersState>>;
  toggleLayer: (key: keyof CosmicLayersState) => void;

  // Simulation Runtime Controls
  isPaused: boolean;
  setIsPaused: React.Dispatch<React.SetStateAction<boolean>>;
  flareActive: boolean;
  triggerSolarFlare: () => void;
  cameraPreset: "isometric" | "topDown" | "ecliptic" | "solarFocus" | "asteroidPOV";
  setCameraPreset: (preset: "isometric" | "topDown" | "ecliptic" | "solarFocus" | "asteroidPOV") => void;

  // Calculated Mathematical Values
  deltaX: number; // Photosynthetic spacing (AU)
  radiationFlux: number;
  netForceBalance: number;
  coherenceRate: number;

  // J09 Bio-Resonance Telemetry
  j09Data: J09Telemetry;
  setJ09Data: React.Dispatch<React.SetStateAction<J09Telemetry>>;
  isBleConnected: boolean;
  setIsBleConnected: React.Dispatch<React.SetStateAction<boolean>>;

  // Face & Avatar Vectors
  faceVectors: FaceVectorState;
  setFaceVectors: React.Dispatch<React.SetStateAction<FaceVectorState>>;
  updateFaceVector: (key: keyof FaceVectorState, value: number | boolean) => void;

  // Presets & AI Configuration Application
  applySimulationPreset: (name: string) => void;
  applyCustomConfig: (config: any) => void;
  lastAppliedPreset: string;
}

const DEFAULT_PARAMS: SimulationParams = {
  P_sun: 100,
  eta_atm: 0.88,
  phi_yield: 0.72,
  E_growth: 0.45,
  voidPressure: 0.62,
  pushPullFreq: 0.08,
  meshFreq: 0.16,
  meshTension: 0.5,
  speed: 1.0,
  asteroidCount: 48,
};

const DEFAULT_LAYERS: CosmicLayersState = {
  lattice: true,
  lightGrid: true,
  shadowGrid: true,
  resonanceMesh: true,
  voidBoundary: true,
  asteroids: true,
  conduitPipes: true,
  forceVectors: true,
  labels: true,
};

const DEFAULT_J09: J09Telemetry = {
  heartRate: 68,
  hrv: 54.2,
  spo2: 98.4,
  skinTemp: 36.62,
  tempDeviation: 0.12,
  bioElectricIndex: 0.84,
  motionState: "STILL",
  dnaResonanceIndex: 0.892,
  rfCorrelationScore: 0.865,
  seq: 1048577,
  pqcValid: true,
  signature: "0x534F56524549474E_DILITHIUM3_VALID_99997",
};

const DEFAULT_FACE_VECTORS: FaceVectorState = {
  browElevation: 0.52,
  eyeScale: 0.55,
  noseBridge: 0.48,
  jawWidth: 0.5,
  resemblanceBlend: 0.75,
  faceDetected: false,
  trackingConfidence: 0,
};

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<number>(() => {
    // Check initial path
    const path = window.location.pathname;
    if (path.includes("simulation")) return 2;
    if (path.includes("deepseek") || path.includes("chat")) return 3;
    if (path.includes("twin") || path.includes("sensors")) return 4;
    return 1; // Default to Page 1 (Theory & Math)
  });

  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS);
  const [layers, setLayers] = useState<CosmicLayersState>(DEFAULT_LAYERS);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [flareActive, setFlareActive] = useState<boolean>(false);
  const [cameraPreset, setCameraPreset] = useState<"isometric" | "topDown" | "ecliptic" | "solarFocus" | "asteroidPOV">("isometric");
  const [lastAppliedPreset, setLastAppliedPreset] = useState<string>("Default Equilibrium");

  const [j09Data, setJ09Data] = useState<J09Telemetry>(DEFAULT_J09);
  const [isBleConnected, setIsBleConnected] = useState<boolean>(false);
  const [faceVectors, setFaceVectors] = useState<FaceVectorState>(DEFAULT_FACE_VECTORS);

  // Calculate Photosynthetic Growth Spacing Delta x = sqrt((P_sun * eta_atm * phi_yield) / (4 * pi * E_growth))
  const deltaX = Math.sqrt(
    Math.max(0.001, (params.P_sun * params.eta_atm * params.phi_yield) / (4 * Math.PI * Math.max(0.01, params.E_growth)))
  );

  const radiationFlux = (params.P_sun * params.eta_atm) / (4 * Math.PI);
  const netForceBalance = Math.abs(0.002 * Math.sin(Date.now() / 1000));
  const coherenceRate = 0.99997;

  const triggerRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
    if ("vibrate" in navigator) {
      try {
        navigator.vibrate([30, 40, 30]);
      } catch {}
    }
  }, []);

  const updateParam = useCallback((key: keyof SimulationParams, value: number) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetParams = useCallback(() => {
    setParams(DEFAULT_PARAMS);
    setLayers(DEFAULT_LAYERS);
    setLastAppliedPreset("Default Equilibrium");
    triggerRefresh();
  }, [triggerRefresh]);

  const toggleLayer = useCallback((key: keyof CosmicLayersState) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const triggerSolarFlare = useCallback(() => {
    setFlareActive(true);
    if ("vibrate" in navigator) {
      try {
        navigator.vibrate([60, 50, 100]);
      } catch {}
    }
    setTimeout(() => {
      setFlareActive(false);
    }, 4500);
  }, []);

  const updateFaceVector = useCallback((key: keyof FaceVectorState, value: number | boolean) => {
    setFaceVectors((prev) => ({ ...prev, [key]: value }));
  }, []);

  const applySimulationPreset = useCallback((presetName: string) => {
    setLastAppliedPreset(presetName);
    switch (presetName) {
      case "Solar Flare Surge":
        setParams((p) => ({
          ...p,
          P_sun: 260,
          eta_atm: 0.95,
          phi_yield: 0.88,
          E_growth: 0.35,
          voidPressure: 0.72,
          pushPullFreq: 0.14,
          meshFreq: 0.38,
          meshTension: 0.65,
          speed: 1.5,
        }));
        triggerSolarFlare();
        break;

      case "Deep Void Inversion":
        setParams((p) => ({
          ...p,
          P_sun: 75,
          eta_atm: 0.82,
          phi_yield: 0.65,
          E_growth: 0.6,
          voidPressure: 0.94,
          pushPullFreq: 0.05,
          meshFreq: 0.12,
          meshTension: 0.85,
          speed: 0.8,
        }));
        break;

      case "Deterministic Conduit Belt":
        setParams((p) => ({
          ...p,
          P_sun: 110,
          eta_atm: 0.9,
          phi_yield: 0.75,
          E_growth: 0.42,
          voidPressure: 0.68,
          pushPullFreq: 0.08,
          meshFreq: 0.2,
          meshTension: 0.55,
          asteroidCount: 64,
          speed: 1.0,
        }));
        setLayers((l) => ({ ...l, asteroids: true, conduitPipes: true, forceVectors: true }));
        break;

      case "High Harmonic Drum-Skin Resonance":
        setParams((p) => ({
          ...p,
          P_sun: 140,
          eta_atm: 0.92,
          phi_yield: 0.8,
          E_growth: 0.38,
          voidPressure: 0.6,
          pushPullFreq: 0.18,
          meshFreq: 0.45,
          meshTension: 0.7,
          speed: 1.2,
        }));
        setLayers((l) => ({ ...l, resonanceMesh: true, lightGrid: true }));
        break;

      default:
        resetParams();
        break;
    }
  }, [resetParams, triggerSolarFlare]);

  const applyCustomConfig = useCallback((config: any) => {
    if (!config) return;
    setLastAppliedPreset(config.presetName || "DeepSeek V4 Synthesized Simulation");
    setParams((prev) => ({
      ...prev,
      P_sun: typeof config.P_sun === "number" ? config.P_sun : prev.P_sun,
      eta_atm: typeof config.eta_atm === "number" ? config.eta_atm : prev.eta_atm,
      phi_yield: typeof config.phi_yield === "number" ? config.phi_yield : prev.phi_yield,
      E_growth: typeof config.E_growth === "number" ? config.E_growth : prev.E_growth,
      voidPressure: typeof config.voidPressure === "number" ? config.voidPressure : prev.voidPressure,
      pushPullFreq: typeof config.pushPullFreq === "number" ? config.pushPullFreq : prev.pushPullFreq,
      meshFreq: typeof config.meshFreq === "number" ? config.meshFreq : prev.meshFreq,
      meshTension: typeof config.meshTension === "number" ? config.meshTension : prev.meshTension,
      speed: typeof config.speed === "number" ? config.speed : prev.speed,
    }));

    if (config.layers) {
      setLayers((prev) => ({ ...prev, ...config.layers }));
    }

    if (config.triggerFlare) {
      triggerSolarFlare();
    }

    // Switch to Simulation page (Page 2)
    setActiveTab(2);
    triggerRefresh();
  }, [triggerRefresh, triggerSolarFlare]);

  // J09 1Hz Heartbeat Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setJ09Data((prev) => {
        const nextSeq = prev.seq + 1;
        const hrDelta = (Math.random() - 0.48) * 1.5;
        const newHr = Math.min(95, Math.max(55, prev.heartRate + hrDelta));
        const newHrv = Math.min(85, Math.max(35, prev.hrv + (Math.random() - 0.5) * 2));
        const newTemp = 36.5 + (Math.random() - 0.5) * 0.3;
        const tempDev = Math.abs(newTemp - 36.5);
        const spo2 = Math.min(99.8, Math.max(96.0, 98.2 + (Math.random() - 0.5) * 0.4));
        const bioElec = Math.min(1.0, Math.max(0.4, 0.82 + (Math.random() - 0.5) * 0.05));

        // dna_resonance_index = 0.40 * (HRV/100) + 0.25 * (1 - |SpO2-98|/10) + 0.20 * (1 - |Temp-36.5|/2) + 0.15 * BioElectric
        const hrvNorm = Math.min(1, newHrv / 80);
        const spo2Score = Math.max(0, 1 - Math.abs(spo2 - 98) / 10);
        const tempScore = Math.max(0, 1 - tempDev / 2);
        const resonance = Math.min(0.999, Math.max(0.7, 0.4 * hrvNorm + 0.25 * spo2Score + 0.2 * tempScore + 0.15 * bioElec));

        return {
          ...prev,
          heartRate: Number(newHr.toFixed(1)),
          hrv: Number(newHrv.toFixed(1)),
          spo2: Number(spo2.toFixed(1)),
          skinTemp: Number(newTemp.toFixed(2)),
          tempDeviation: Number(tempDev.toFixed(2)),
          bioElectricIndex: Number(bioElec.toFixed(3)),
          dnaResonanceIndex: Number(resonance.toFixed(3)),
          rfCorrelationScore: Number((resonance * 0.96 + (Math.random() - 0.5) * 0.02).toFixed(3)),
          seq: nextSeq,
          signature: `0x534F56524549474E_DILITHIUM3_VALID_${nextSeq}`,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <SimulationContext.Provider
      value={{
        activeTab,
        setActiveTab,
        refreshKey,
        triggerRefresh,
        params,
        setParams,
        updateParam,
        resetParams,
        layers,
        setLayers,
        toggleLayer,
        isPaused,
        setIsPaused,
        flareActive,
        triggerSolarFlare,
        cameraPreset,
        setCameraPreset,
        deltaX,
        radiationFlux,
        netForceBalance,
        coherenceRate,
        j09Data,
        setJ09Data,
        isBleConnected,
        setIsBleConnected,
        faceVectors,
        setFaceVectors,
        updateFaceVector,
        applySimulationPreset,
        applyCustomConfig,
        lastAppliedPreset,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error("useSimulation must be used within a SimulationProvider");
  }
  return context;
};
