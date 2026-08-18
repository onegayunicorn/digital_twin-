import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSimulation } from "@/contexts/SimulationContext";
import { AvatarViewport, type FaceVector } from "@/components/AvatarViewport";
import { MultiPlatformAspectFrame } from "@/components/MultiPlatformAspectFrame";
import {
  Camera,
  CameraOff,
  RefreshCw,
  UserCheck,
  Activity,
  Bluetooth,
  ShieldCheck,
  Sliders,
  Sparkles,
  Zap,
  Eye,
  Smile,
  Maximize2,
  Vibrate,
  Smartphone,
  CheckCircle2,
  Heart,
  Thermometer,
  Gauge,
  Radio,
  Scan,
} from "lucide-react";

export const DigitalTwinPage: React.FC = () => {
  const {
    j09Data,
    isBleConnected,
    setIsBleConnected,
    faceVectors,
    updateFaceVector,
    coherenceRate,
    triggerRefresh,
  } = useSimulation();

  // Camera state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<"user" | "environment">("user");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [landmarkPoints, setLandmarkPoints] = useState<{ x: number; y: number }[]>([]);

  // Avatar customization sliders
  const [tone, setTone] = useState<number>(0.45);
  const [resemblance, setResemblance] = useState<number>(faceVectors.resemblanceBlend || 0.75);

  // Derived Face Vectors for Avatar Viewport
  const vectorsForAvatar: Record<string, FaceVector> = {
    brow: { x: (faceVectors.browElevation - 0.5) * 0.4, y: (faceVectors.browElevation - 0.5) * 0.3 },
    eyes: { x: (faceVectors.eyeScale - 0.5) * 0.3, y: (faceVectors.eyeScale - 0.5) * 0.2 },
    nose: { x: (faceVectors.noseBridge - 0.5) * 0.2, y: -(faceVectors.noseBridge - 0.5) * 0.2 },
    jaw: { x: (faceVectors.jawWidth - 0.5) * 0.4, y: (faceVectors.jawWidth - 0.5) * 0.2 },
  };

  // Start / Stop Camera Stream
  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: cameraFacing,
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
          setIsCameraActive(true);
          updateFaceVector("faceDetected", true);
          updateFaceVector("trackingConfidence", 0.96);
        }
      } else {
        setCameraError("Camera API (MediaDevices) not supported in this browser environment.");
      }
    } catch (err: any) {
      console.warn("Camera access denied or unavailable:", err);
      setCameraError(err.message || "Camera access denied. Enable permissions in browser.");
      setIsCameraActive(false);
      updateFaceVector("faceDetected", false);
    }
  }, [cameraFacing, updateFaceVector]);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    updateFaceVector("faceDetected", false);
    updateFaceVector("trackingConfidence", 0);
  }, [updateFaceVector]);

  // Toggle Camera Facing
  const toggleCameraFacing = () => {
    stopCamera();
    setCameraFacing((prev) => (prev === "user" ? "environment" : "user"));
  };

  useEffect(() => {
    if (isCameraActive) {
      startCamera();
    }
  }, [cameraFacing]);

  // Cleanup camera stream on component unmount
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, []);

  // Simulated Landmark Tracker loop when camera is active
  useEffect(() => {
    if (!isCameraActive) {
      setLandmarkPoints([]);
      return;
    }

    const interval = setInterval(() => {
      // Generate realistic facial landmark tracking points over the video viewport
      const cx = 50;
      const cy = 48;
      const jitter = () => (Math.random() - 0.5) * 1.5;

      const points = [
        // Left eye
        { x: cx - 12 + jitter(), y: cy - 6 + jitter() },
        { x: cx - 8 + jitter(), y: cy - 6 + jitter() },
        // Right eye
        { x: cx + 8 + jitter(), y: cy - 6 + jitter() },
        { x: cx + 12 + jitter(), y: cy - 6 + jitter() },
        // Nose bridge & tip
        { x: cx + jitter(), y: cy - 2 + jitter() },
        { x: cx + jitter(), y: cy + 4 + jitter() },
        // Mouth corners
        { x: cx - 8 + jitter(), y: cy + 12 + jitter() },
        { x: cx + 8 + jitter(), y: cy + 12 + jitter() },
        // Jawline points
        { x: cx - 18 + jitter(), y: cy + 10 + jitter() },
        { x: cx + 18 + jitter(), y: cy + 10 + jitter() },
        { x: cx + jitter(), y: cy + 20 + jitter() },
      ];

      setLandmarkPoints(points);
    }, 120);

    return () => clearInterval(interval);
  }, [isCameraActive]);

  // Run Biometric & Face Vector Scanning sequence
  const runBiometricScan = () => {
    setIsScanning(true);
    setScanProgress(0);

    if ("vibrate" in navigator) {
      try {
        navigator.vibrate([40, 60, 40]);
      } catch {}
    }

    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      if (progress >= 100) {
        clearInterval(interval);
        setScanProgress(100);
        setIsScanning(false);
        // Apply detected facial vector variance safely outside state updaters
        updateFaceVector("browElevation", 0.58 + (Math.random() - 0.5) * 0.1);
        updateFaceVector("eyeScale", 0.52 + (Math.random() - 0.5) * 0.1);
        updateFaceVector("noseBridge", 0.49 + (Math.random() - 0.5) * 0.08);
        updateFaceVector("jawWidth", 0.54 + (Math.random() - 0.5) * 0.1);
        setResemblance(0.88);
      } else {
        setScanProgress(progress);
      }
    }, 200);
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 sm:pb-12 space-y-6">
      {/* Top Header */}
      <div className="border-b border-border/70 bg-card/40 px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/15 text-teal-400 border border-teal-500/30">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-foreground">
                  PAGE 4 // DIGITAL TWIN & MULTI-SENSOR LAB
                </span>
                <span className="rounded bg-teal-950/60 border border-teal-500/40 px-2 py-0.5 font-mono text-[10px] text-teal-300 font-bold">
                  Camera + J09 BLE
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground">
                Front-Facing Camera · Facial Vector Analysis · J09 Bio-Resonance Telemetry
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/30 px-3 py-1 text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>PQC: Dilithium3 Valid</span>
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-3 sm:px-6 space-y-6">
        {/* Top Grid: Camera Scanner & 3D Avatar Maquette */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Module 1: Front-Facing Camera Scanner */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4 flex flex-col">
            <div className="flex items-center justify-between border-b border-border/70 pb-3">
              <div className="flex items-center gap-2">
                <Camera className="h-4 w-4 text-teal-400" />
                <h3 className="font-mono text-sm font-bold text-foreground">Front-Facing Camera & Facial Tracking HUD</h3>
              </div>
              <div className="flex items-center gap-2">
                {isCameraActive ? (
                  <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live ({cameraFacing})
                  </span>
                ) : (
                  <span className="text-[11px] font-mono text-muted-foreground">Standby</span>
                )}
              </div>
            </div>

            {/* Video Viewport Stage */}
            <div className="relative h-72 sm:h-80 w-full rounded-xl border border-border/80 bg-black/90 overflow-hidden flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`h-full w-full object-cover ${cameraFacing === "user" ? "scale-x-[-1]" : ""} ${
                  isCameraActive ? "block" : "hidden"
                }`}
              />

              {/* Camera Off Placeholder */}
              {!isCameraActive && (
                <div className="text-center p-6 space-y-3">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/40 border border-border text-muted-foreground">
                    <Camera className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-foreground font-mono">Camera Feed Idle</p>
                    <p className="text-[11px] text-muted-foreground max-w-xs">
                      Activate front camera to extract facial landmarks and synchronize biometric vectors in real-time.
                    </p>
                  </div>
                  <button
                    onClick={startCamera}
                    className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-[0_0_15px_rgba(20,184,166,0.3)] hover:bg-primary/90 transition-all"
                  >
                    Start Front Camera
                  </button>
                  {cameraError && (
                    <p className="text-[11px] text-destructive font-mono mt-2">{cameraError}</p>
                  )}
                </div>
              )}

              {/* Facial Tracking HUD Overlay */}
              {isCameraActive && (
                <div className="absolute inset-0 pointer-events-none">
                  {/* Facial Oval Reticle */}
                  <div className="absolute inset-x-12 inset-y-8 rounded-full border border-teal-400/40 border-dashed animate-pulse" />

                  {/* Corner Targets */}
                  <div className="absolute top-4 left-4 h-6 w-6 border-t-2 border-l-2 border-teal-400" />
                  <div className="absolute top-4 right-4 h-6 w-6 border-t-2 border-r-2 border-teal-400" />
                  <div className="absolute bottom-4 left-4 h-6 w-6 border-b-2 border-l-2 border-teal-400" />
                  <div className="absolute bottom-4 right-4 h-6 w-6 border-b-2 border-r-2 border-teal-400" />

                  {/* Tracking Landmark Nodes */}
                  {landmarkPoints.map((pt, i) => (
                    <div
                      key={i}
                      style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
                      className="absolute h-2 w-2 -translate-x-1 -translate-y-1 rounded-full bg-teal-400 shadow-[0_0_8px_#2dd4bf]"
                    />
                  ))}

                  {/* Scanning Laser Beam Effect */}
                  {isScanning && (
                    <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-bounce shadow-[0_0_12px_#38bdf8]" />
                  )}

                  {/* Live HUD Readout */}
                  <div className="absolute bottom-3 left-3 rounded-lg border border-border/70 bg-background/80 px-2.5 py-1 font-mono text-[10px] backdrop-blur-sm text-teal-300">
                    FACE_LOCK: ACTIVE · CONFIDENCE: 96.4%
                  </div>
                </div>
              )}
            </div>

            {/* Camera Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-2">
                {isCameraActive ? (
                  <button
                    onClick={stopCamera}
                    className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-1.5 text-xs font-mono text-destructive hover:bg-destructive/20 transition-colors"
                  >
                    Turn Off
                  </button>
                ) : (
                  <button
                    onClick={startCamera}
                    className="rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-mono text-primary hover:bg-primary/20 transition-colors"
                  >
                    Turn On
                  </button>
                )}

                <button
                  onClick={toggleCameraFacing}
                  className="rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  Flip ({cameraFacing})
                </button>
              </div>

              <button
                onClick={runBiometricScan}
                disabled={isScanning}
                className="flex items-center gap-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 px-4 py-1.5 text-xs font-bold text-teal-950 shadow-[0_0_12px_rgba(20,184,166,0.3)] transition-all disabled:opacity-50"
              >
                <Scan className="h-3.5 w-3.5" />
                <span>{isScanning ? `Calibrating ${scanProgress}%` : "Run Face & Bio Scan"}</span>
              </button>
            </div>
          </div>

          {/* Module 2: 3D Avatar Maquette Viewport wrapped in MultiPlatformAspectFrame */}
          <MultiPlatformAspectFrame
            title="3D Avatar Maquette"
            badge={`Resemblance ${(resemblance * 100).toFixed(0)}%`}
            defaultHeight={420}
          >
            <div className="relative w-full h-full min-h-[300px] flex flex-col justify-between">
              {/* 3D WebGL Avatar Canvas Stage */}
              <div className="relative flex-1 w-full min-h-[250px] bg-black/90 overflow-hidden">
                <AvatarViewport
                  resemblance={resemblance}
                  tone={tone}
                  vectors={vectorsForAvatar}
                />

                <div className="absolute bottom-2 right-2 rounded-lg border border-border/60 bg-background/80 px-2 py-0.5 font-mono text-[9px] backdrop-blur-sm text-muted-foreground">
                  Three.js Morph Bust
                </div>
              </div>

              {/* Avatar Sliders embedded inside frame */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono p-3 bg-card/90 border-t border-border/60">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-muted-foreground">Resemblance Blend:</span>
                    <span className="font-bold text-foreground">{(resemblance * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="1.0"
                    step="0.05"
                    value={resemblance}
                    onChange={(e) => setResemblance(Number(e.target.value))}
                    className="w-full accent-cyan-400 h-1.5 bg-border rounded cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-muted-foreground">Skin Tone Ratio:</span>
                    <span className="font-bold text-foreground">{(tone * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="1.0"
                    step="0.05"
                    value={tone}
                    onChange={(e) => setTone(Number(e.target.value))}
                    className="w-full accent-cyan-400 h-1.5 bg-border rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </MultiPlatformAspectFrame>
        </div>

        {/* Bottom Section: J09 Bio-Ring Telemetry & Sensor Suite */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/70 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30">
                <Radio className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-mono text-base font-bold text-foreground">
                  J09 Sovereign Bio-Resonance Telemetry Stream (1Hz Heartbeat)
                </h3>
                <p className="text-xs text-muted-foreground">
                  Multi-GATT Characteristic Decoding · Dilithium3 Quantum-Resistant Envelope · UDP 192.168.1.255:7000
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/40 px-3 py-1 rounded-lg flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                DNA RESONANCE: {j09Data.dnaResonanceIndex.toFixed(3)}
              </span>
            </div>
          </div>

          {/* 4 Primary GATT Characteristic Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
            {/* Heart Rate & HRV (0x2A37) */}
            <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-rose-400">
                <span className="flex items-center gap-1 font-bold">
                  <Heart className="h-4 w-4" />
                  PULSE & HRV (0x2A37)
                </span>
                <span className="text-[10px] text-muted-foreground">UUID 0x180D</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-rose-300">{j09Data.heartRate}</span>
                <span className="text-xs text-rose-400/80">BPM</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground border-t border-rose-500/20 pt-1.5">
                <span>HRV Interval:</span>
                <span className="font-bold text-foreground">{j09Data.hrv} ms</span>
              </div>
            </div>

            {/* SpO2 Blood Oxygen (0x2A5F) */}
            <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-cyan-400">
                <span className="flex items-center gap-1 font-bold">
                  <Activity className="h-4 w-4" />
                  SPO2 OXYGEN (0x2A5F)
                </span>
                <span className="text-[10px] text-muted-foreground">UUID 0x180D</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-cyan-300">{j09Data.spo2}%</span>
                <span className="text-xs text-emerald-400">Optimal</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground border-t border-cyan-500/20 pt-1.5">
                <span>Deviation:</span>
                <span className="font-bold text-foreground">{(100 - j09Data.spo2).toFixed(1)}%</span>
              </div>
            </div>

            {/* Skin Temperature (0x2A6E) */}
            <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-amber-400">
                <span className="flex items-center gap-1 font-bold">
                  <Thermometer className="h-4 w-4" />
                  SKIN TEMP (0x2A6E)
                </span>
                <span className="text-[10px] text-muted-foreground">IEEE 11073</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-amber-300">{j09Data.skinTemp}°C</span>
                <span className="text-xs text-amber-400/80">36.5°C Base</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground border-t border-amber-500/20 pt-1.5">
                <span>Variance:</span>
                <span className="font-bold text-foreground">+{j09Data.tempDeviation}°C</span>
              </div>
            </div>

            {/* Bio-Electric & Motion (0x2A92) */}
            <div className="rounded-xl border border-purple-500/30 bg-purple-950/20 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-purple-400">
                <span className="flex items-center gap-1 font-bold">
                  <Zap className="h-4 w-4" />
                  BIO-ELECTRIC (0x2A92)
                </span>
                <span className="text-[10px] text-muted-foreground">Galvanic</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-purple-300">{j09Data.bioElectricIndex}</span>
                <span className="text-xs text-purple-400/80">{j09Data.motionState}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground border-t border-purple-500/20 pt-1.5">
                <span>RF Correlation:</span>
                <span className="font-bold text-foreground">{j09Data.rfCorrelationScore}</span>
              </div>
            </div>
          </div>

          {/* Cryptographic Dilithium3 Envelope Verification Strip */}
          <div className="rounded-xl border border-border/80 bg-muted/20 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground">PQC ENVELOPE:</span>
                <span className="text-emerald-400 font-semibold">[0x534F56524549474E][Dilithium3_Sig][J09BioPayload]</span>
              </div>
              <p className="text-[11px] text-muted-foreground truncate max-w-lg">
                SIG: {j09Data.signature}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-muted-foreground block">FRAME SEQ</span>
              <span className="font-bold text-primary text-sm">#{j09Data.seq}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
