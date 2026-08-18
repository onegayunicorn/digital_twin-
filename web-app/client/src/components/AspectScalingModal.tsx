import React from "react";
import {
  useAspectScale,
  ASPECT_PRESETS,
  type AspectRatioKey,
  type ScalingFitMode,
  type ResolutionScale,
  type DeviceFrameType,
  type UIDensityMode,
} from "@/contexts/AspectScalingContext";
import {
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Tv,
  Radio,
  Sliders,
  RotateCw,
  Maximize2,
  Minimize2,
  Check,
  Ratio,
  Layers,
  Sparkles,
  Zap,
  Info,
  X,
  Gauge,
  Scan,
} from "lucide-react";

interface AspectScalingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AspectScalingModal: React.FC<AspectScalingModalProps> = ({ isOpen, onClose }) => {
  const {
    aspectRatio,
    setAspectRatio,
    customRatio,
    setCustomRatio,
    fitMode,
    setFitMode,
    resolutionScale,
    setResolutionScale,
    deviceFrame,
    setDeviceFrame,
    uiDensity,
    setUiDensity,
    isRotated,
    toggleRotation,
    isTheaterMode,
    setIsTheaterMode,
    activeRatioValue,
    activePreset,
    effectiveDpr,
    calculatedWidth,
    calculatedHeight,
    resetToDefault,
  } = useAspectScale();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-border/80 bg-card p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-border/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/40 bg-primary/10 shadow-[0_0_12px_rgba(20,184,166,0.3)]">
              <Ratio className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                Multi-Platform Aspect & Scaling Engine
              </h2>
              <p className="text-xs text-muted-foreground">
                Calibrate 3D viewports, device silhouetting, pixel densities, and responsive ratios
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="space-y-6 pt-4 text-xs font-mono">
          {/* Section 1: Standard Aspect Presets */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-foreground flex items-center gap-1.5">
                <Monitor className="h-4 w-4 text-primary" /> Aspect Ratio Presets
              </label>
              <span className="text-[11px] text-primary">
                Active: <strong>{activePreset.label} ({activeRatioValue.toFixed(3)}:1)</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ASPECT_PRESETS.map((preset) => {
                const isActive = aspectRatio === preset.key;
                return (
                  <button
                    key={preset.key}
                    onClick={() => setAspectRatio(preset.key)}
                    className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all ${
                      isActive
                        ? "border-primary bg-primary/15 text-foreground shadow-[0_0_12px_rgba(20,184,166,0.2)]"
                        : "border-border/70 bg-card/60 text-muted-foreground hover:border-primary/40 hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-bold text-xs text-foreground">{preset.short}</span>
                      {isActive && <Check className="h-3.5 w-3.5 text-primary" />}
                    </div>
                    <span className="text-[10px] text-muted-foreground line-clamp-1">{preset.label}</span>
                    <span className="text-[9px] text-primary/80 mt-1">{preset.category.toUpperCase()}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Custom Ratio Slider & Rotation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border border-border/60 bg-muted/20 p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">Custom Aspect Ratio</span>
                <span className="text-primary font-bold">{customRatio.toFixed(3)} : 1</span>
              </div>
              <input
                type="range"
                min={0.4}
                max={3.2}
                step={0.01}
                value={customRatio}
                onChange={(e) => {
                  setCustomRatio(parseFloat(e.target.value));
                  if (aspectRatio !== "custom") setAspectRatio("custom");
                }}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-primary"
              />
              <div className="flex justify-between text-[9px] text-muted-foreground">
                <span>9:20 (Tall Phone)</span>
                <span>1:1 (Square)</span>
                <span>16:9 (UHD)</span>
                <span>21:9 (Ultrawide)</span>
              </div>
            </div>

            {/* Rotation & Orientation */}
            <div className="flex flex-col justify-between space-y-2">
              <span className="font-bold text-foreground">Orientation Alignment</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleRotation}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-xs font-semibold transition-all ${
                    isRotated
                      ? "border-primary bg-primary/20 text-primary"
                      : "border-border/70 bg-card text-foreground hover:bg-accent"
                  }`}
                >
                  <RotateCw className={`h-4 w-4 ${isRotated ? "rotate-90 text-primary" : ""}`} />
                  <span>{isRotated ? "Portrait (Flipped 90°)" : "Landscape (Standard)"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Fit Mode & Device Silhouettes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Scaling Fit Mode */}
            <div className="space-y-2">
              <label className="font-bold text-foreground flex items-center gap-1.5">
                <Scan className="h-4 w-4 text-primary" /> Viewport Fit Mode
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(
                  [
                    { key: "cover", label: "Cover (Fill)", desc: "Expands to edges" },
                    { key: "contain", label: "Contain (Fit)", desc: "Letterboxed grid" },
                    { key: "device-frame", label: "Device Frame", desc: "Silhouettes" },
                  ] as { key: ScalingFitMode; label: string; desc: string }[]
                ).map((mode) => (
                  <button
                    key={mode.key}
                    onClick={() => setFitMode(mode.key)}
                    className={`flex flex-col items-center py-2 px-1 rounded-lg border text-center transition-all ${
                      fitMode === mode.key
                        ? "border-primary bg-primary/20 text-primary font-bold shadow-xs"
                        : "border-border/60 bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    <span className="text-[11px]">{mode.label}</span>
                    <span className="text-[9px] opacity-75">{mode.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Device Silhouette Chassis */}
            <div className="space-y-2">
              <label className="font-bold text-foreground flex items-center gap-1.5">
                <Smartphone className="h-4 w-4 text-primary" /> Device Silhouettes
              </label>
              <select
                value={deviceFrame}
                onChange={(e) => setDeviceFrame(e.target.value as DeviceFrameType)}
                className="w-full rounded-lg border border-border/80 bg-card p-2 text-xs text-foreground focus:border-primary focus:outline-none"
              >
                <option value="none">No Bezel (Clean Stage Edge)</option>
                <option value="iphone16">Apple iPhone 16 Pro (Dynamic Island)</option>
                <option value="galaxy_s24">Samsung Galaxy S24 Ultra (Punch-Hole)</option>
                <option value="ipad_pro">Apple iPad Pro 12.9" Chassis</option>
                <option value="macbook">MacBook Pro 16" (Retina Display)</option>
                <option value="ultrawide_monitor">34" Curved Ultrawide Display</option>
                <option value="j09_ring">J09 Sovereign Bio-Ring Display</option>
              </select>
            </div>
          </div>

          {/* Section 4: Resolution DPI Multiplier & UI Density */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Resolution DPR */}
            <div className="space-y-2">
              <label className="font-bold text-foreground flex items-center gap-1.5">
                <Gauge className="h-4 w-4 text-primary" /> Render DPI / Resolution Scaling
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(
                  [
                    { scale: 0.75, name: "0.75x", note: "Eco" },
                    { scale: 1.0, name: "1.0x", note: "1080p" },
                    { scale: 1.5, name: "1.5x", note: "Retina" },
                    { scale: 2.0, name: "2.0x", note: "4K" },
                  ] as { scale: ResolutionScale; name: string; note: string }[]
                ).map((item) => (
                  <button
                    key={item.scale}
                    onClick={() => setResolutionScale(item.scale)}
                    className={`flex flex-col items-center py-2 rounded-lg border text-center transition-all ${
                      resolutionScale === item.scale
                        ? "border-primary bg-primary/20 text-primary font-bold"
                        : "border-border/60 bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    <span className="text-[11px]">{item.name}</span>
                    <span className="text-[9px] text-muted-foreground">{item.note}</span>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground">Effective Hardware DPR: {effectiveDpr.toFixed(2)}x</p>
            </div>

            {/* UI Density */}
            <div className="space-y-2">
              <label className="font-bold text-foreground flex items-center gap-1.5">
                <Sliders className="h-4 w-4 text-primary" /> Touch & Interface Density
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(
                  [
                    { key: "compact", label: "Compact", note: "Dense" },
                    { key: "standard", label: "Standard", note: "Balanced" },
                    { key: "touch", label: "Touch Mode", note: "Large Targets" },
                  ] as { key: UIDensityMode; label: string; note: string }[]
                ).map((density) => (
                  <button
                    key={density.key}
                    onClick={() => setUiDensity(density.key)}
                    className={`flex flex-col items-center py-2 rounded-lg border text-center transition-all ${
                      uiDensity === density.key
                        ? "border-primary bg-primary/20 text-primary font-bold"
                        : "border-border/60 bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    <span className="text-[11px]">{density.label}</span>
                    <span className="text-[9px] opacity-75">{density.note}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 5: Real-time Optical Telemetry Summary */}
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 text-[11px] text-foreground space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Active Calibration Matrix:</span>
              <strong className="text-primary font-mono">{activePreset.label} · {activeRatioValue.toFixed(3)}:1</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Container Metrics:</span>
              <span>{calculatedWidth}px width × {calculatedHeight}px height</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Effective DPR & Shading Precision:</span>
              <span className="text-emerald-400 font-semibold">{effectiveDpr.toFixed(2)}x Anti-Aliased WebGL</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-4">
          <button
            onClick={resetToDefault}
            className="text-xs text-muted-foreground hover:text-foreground underline transition-colors"
          >
            Reset to Defaults
          </button>
          <button
            onClick={onClose}
            className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-md hover:bg-primary/90 transition-all"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
