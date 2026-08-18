import React, { useRef, useEffect, useState } from "react";
import {
  useAspectScale,
  ASPECT_PRESETS,
  type AspectRatioKey,
  type ScalingFitMode,
  type ResolutionScale,
  type DeviceFrameType,
} from "@/contexts/AspectScalingContext";
import {
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Maximize2,
  Minimize2,
  RotateCw,
  Sliders,
  Layers,
  Sparkles,
  Tv,
  Radio,
  Check,
  Ratio,
  Eye,
  Settings2,
} from "lucide-react";

interface MultiPlatformAspectFrameProps {
  children: React.ReactNode;
  title?: string;
  badge?: string;
  className?: string;
  defaultHeight?: number;
  showControls?: boolean;
}

export const MultiPlatformAspectFrame: React.FC<MultiPlatformAspectFrameProps> = ({
  children,
  title = "Cosmic Viewport",
  badge = "Sovereign Render Engine",
  className = "",
  defaultHeight = 540,
  showControls = true,
}) => {
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
    isRotated,
    toggleRotation,
    isTheaterMode,
    setIsTheaterMode,
    activeRatioValue,
    activePreset,
    effectiveDpr,
    updateContainerDimensions,
  } = useAspectScale();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 960,
    height: defaultHeight,
  });
  const [showSettingsDrawer, setShowSettingsDrawer] = useState<boolean>(false);

  // ResizeObserver for reliable, fluid stage measurements
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0) {
          const clampedHeight = height > 50 ? height : defaultHeight;
          setDimensions({ width, height: clampedHeight });
          updateContainerDimensions(width, clampedHeight);
        }
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [defaultHeight, updateContainerDimensions]);

  // Compute staged viewport dimensions based on aspect ratio and fit mode
  const stageStyle = React.useMemo(() => {
    if (aspectRatio === "auto" && fitMode !== "device-frame") {
      return {
        width: "100%",
        height: isTheaterMode ? "100vh" : `${defaultHeight}px`,
        maxWidth: "100%",
      };
    }

    const availableWidth = dimensions.width || 960;
    const maxHeight = isTheaterMode ? window.innerHeight - 80 : defaultHeight;
    const targetRatio = activeRatioValue;

    if (fitMode === "cover") {
      return {
        width: "100%",
        height: `${maxHeight}px`,
        aspectRatio: `${targetRatio}`,
        maxHeight: `${maxHeight}px`,
      };
    }

    // Contain / Device-Frame mode: calculate letterboxed inner width & height
    let targetWidth = availableWidth;
    let targetHeight = availableWidth / targetRatio;

    if (targetHeight > maxHeight) {
      targetHeight = maxHeight;
      targetWidth = targetHeight * targetRatio;
    }

    return {
      width: `${Math.round(targetWidth)}px`,
      height: `${Math.round(targetHeight)}px`,
      maxWidth: "100%",
    };
  }, [aspectRatio, fitMode, isTheaterMode, defaultHeight, dimensions.width, activeRatioValue]);

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col rounded-xl border border-border/80 bg-card/60 shadow-lg backdrop-blur-md transition-all overflow-hidden ${
        isTheaterMode
          ? "fixed inset-0 z-50 rounded-none border-none bg-background/95 p-4"
          : className
      }`}
    >
      {/* Top Header & Multi-Platform Aspect Toolbar */}
      {showControls && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 bg-card/80 px-3 py-2 text-xs font-mono">
          {/* Left Title & Status */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
              <span>{title}</span>
            </div>
            <span className="hidden sm:inline-block rounded border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
              {badge}
            </span>
          </div>

          {/* Aspect Ratio Quick Selector Pills */}
          <div className="flex items-center gap-1 overflow-x-auto py-0.5 scrollbar-none">
            {ASPECT_PRESETS.map((preset) => {
              const isActive = aspectRatio === preset.key;
              return (
                <button
                  key={preset.key}
                  id={`aspect-btn-${preset.key.replace(":", "-")}`}
                  onClick={() => setAspectRatio(preset.key)}
                  className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted/60 text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                  title={`${preset.label}: ${preset.description}`}
                >
                  {preset.category === "mobile" && <Smartphone className="h-3 w-3" />}
                  {preset.category === "tablet" && <Tablet className="h-3 w-3" />}
                  {preset.category === "ultrawide" && <Tv className="h-3 w-3" />}
                  {preset.category === "desktop" && <Monitor className="h-3 w-3" />}
                  {preset.category === "wearable" && <Radio className="h-3 w-3" />}
                  {preset.category === "fluid" && <Ratio className="h-3 w-3" />}
                  <span>{preset.short}</span>
                </button>
              );
            })}
          </div>

          {/* Right Controls: Fit Mode, Rotation, DPI, Settings & Theater */}
          <div className="flex items-center gap-1.5">
            {/* Orientation Rotate */}
            <button
              id="aspect-rotate-btn"
              onClick={toggleRotation}
              className={`flex h-7 w-7 items-center justify-center rounded-md border border-border/80 bg-muted/40 transition-colors hover:bg-accent hover:text-foreground ${
                isRotated ? "text-primary border-primary/50 bg-primary/15" : "text-muted-foreground"
              }`}
              title={`Rotate 90° (${isRotated ? "Portrait" : "Landscape"})`}
            >
              <RotateCw className={`h-3.5 w-3.5 transition-transform ${isRotated ? "rotate-90 text-primary" : ""}`} />
            </button>

            {/* Fit Mode Toggle */}
            <div className="flex items-center rounded-md border border-border/80 bg-muted/40 p-0.5 text-[10px]">
              {(["cover", "contain", "device-frame"] as ScalingFitMode[]).map((mode) => (
                <button
                  key={mode}
                  id={`fit-mode-${mode}`}
                  onClick={() => setFitMode(mode)}
                  className={`rounded px-1.5 py-0.5 capitalize transition-all ${
                    fitMode === mode
                      ? "bg-background text-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {mode === "device-frame" ? "Device" : mode}
                </button>
              ))}
            </div>

            {/* Advanced Settings Drawer Button */}
            <button
              id="aspect-settings-toggle-btn"
              onClick={() => setShowSettingsDrawer((prev) => !prev)}
              className={`flex h-7 items-center gap-1 rounded-md border border-border/80 px-2 text-[11px] font-medium transition-colors ${
                showSettingsDrawer ? "bg-primary text-primary-foreground border-primary" : "bg-muted/40 text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
              title="Advanced Aspect Scaling & Resolution Controls"
            >
              <Settings2 className="h-3 w-3" />
              <span className="hidden md:inline">Scale {resolutionScale}x</span>
            </button>

            {/* Theater / Fullscreen Toggle */}
            <button
              id="aspect-theater-btn"
              onClick={() => setIsTheaterMode(!isTheaterMode)}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-border/80 bg-muted/40 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              title={isTheaterMode ? "Exit Theater View" : "Enter Theater View"}
            >
              {isTheaterMode ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      )}

      {/* Advanced Settings Drawer */}
      {showSettingsDrawer && (
        <div className="border-b border-border/60 bg-muted/30 p-3 text-xs font-mono transition-all animate-in slide-in-from-top duration-200">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Resolution DPR Multiplier */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                <Sliders className="h-3 w-3 text-primary" /> Resolution Scale (DPI)
              </span>
              <div className="grid grid-cols-4 gap-1">
                {([0.75, 1.0, 1.5, 2.0] as ResolutionScale[]).map((scale) => (
                  <button
                    key={scale}
                    onClick={() => setResolutionScale(scale)}
                    className={`rounded border px-2 py-1 text-center text-[10px] font-medium transition-all ${
                      resolutionScale === scale
                        ? "border-primary bg-primary/20 text-primary font-bold"
                        : "border-border/60 bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    {scale}x {scale === 1.0 ? "(1080p)" : scale === 2.0 ? "(4K)" : ""}
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-muted-foreground">Effective DPR: {effectiveDpr.toFixed(2)}x</span>
            </div>

            {/* Device Silhouette Chassis */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                <Smartphone className="h-3 w-3 text-primary" /> Device Silhouettes
              </span>
              <select
                value={deviceFrame}
                onChange={(e) => setDeviceFrame(e.target.value as DeviceFrameType)}
                className="rounded border border-border/70 bg-card px-2 py-1 text-xs text-foreground focus:border-primary focus:outline-none"
              >
                <option value="none">No Device Frame (Border Only)</option>
                <option value="iphone16">Apple iPhone 16 Pro (Dynamic Island)</option>
                <option value="galaxy_s24">Samsung Galaxy S24 Ultra (Infinity-O)</option>
                <option value="ipad_pro">Apple iPad Pro 12.9" Chassis</option>
                <option value="macbook">MacBook Pro 16" (Retina Display)</option>
                <option value="ultrawide_monitor">34" Curved Ultrawide Monitor</option>
                <option value="j09_ring">J09 Sovereign Bio-Ring Display</option>
              </select>
            </div>

            {/* Custom Aspect Ratio Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[11px] font-semibold text-foreground">
                <span>Custom Aspect Ratio</span>
                <span className="text-primary">{customRatio.toFixed(3)}:1</span>
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
                <span>9:20 (Tall)</span>
                <span>1:1 (Square)</span>
                <span>16:9 (Wide)</span>
                <span>21:9 (Cinema)</span>
              </div>
            </div>

            {/* Metrics & Optical Diagnostics */}
            <div className="flex flex-col justify-between rounded border border-border/60 bg-card/50 p-2 text-[10px]">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Preset:</span>
                <span className="font-semibold text-foreground">{activePreset.label}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Calculated Ratio:</span>
                <span className="text-primary font-bold">{activeRatioValue.toFixed(3)}:1</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Viewport Render:</span>
                <span className="text-foreground">{stageStyle.width} × {stageStyle.height}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Viewport Stage Area with Optional Device Silhouette Bezel */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-[#050706] p-2 sm:p-4">
        {/* Device Frame Rendering */}
        <div
          style={stageStyle}
          className={`relative mx-auto flex items-center justify-center transition-all duration-300 ${
            deviceFrame === "iphone16"
              ? "rounded-[40px] border-[10px] border-[#222826] bg-[#000] p-1 shadow-[0_0_35px_rgba(0,0,0,0.8),0_0_15px_rgba(20,184,166,0.15)] ring-1 ring-white/10"
              : deviceFrame === "galaxy_s24"
              ? "rounded-[28px] border-[8px] border-[#181c1b] bg-[#000] p-0.5 shadow-2xl ring-1 ring-white/10"
              : deviceFrame === "ipad_pro"
              ? "rounded-[24px] border-[14px] border-[#1e2321] bg-[#000] p-1 shadow-2xl ring-1 ring-white/10"
              : deviceFrame === "macbook"
              ? "rounded-t-[16px] border-t-[12px] border-x-[12px] border-b-[20px] border-[#272e2c] bg-[#000] shadow-2xl"
              : deviceFrame === "ultrawide_monitor"
              ? "rounded-[12px] border-[6px] border-[#1a211f] bg-[#000] shadow-[0_0_40px_rgba(20,184,166,0.2)]"
              : deviceFrame === "j09_ring"
              ? "rounded-full border-[14px] border-[#131b19] bg-[#000] shadow-[0_0_45px_rgba(121,215,230,0.3)] ring-2 ring-primary/40 aspect-square overflow-hidden"
              : "rounded-lg overflow-hidden border border-border/40"
          }`}
        >
          {/* Dynamic Island for iPhone Frame */}
          {deviceFrame === "iphone16" && (
            <div className="absolute top-2.5 z-30 flex h-4 w-20 items-center justify-between rounded-full bg-black px-2 ring-1 ring-white/10">
              <div className="h-2 w-2 rounded-full bg-[#111] ring-1 ring-white/20" />
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500/80 animate-pulse" />
            </div>
          )}

          {/* Notch for MacBook */}
          {deviceFrame === "macbook" && (
            <div className="absolute top-0 z-30 h-3 w-28 rounded-b-md bg-[#111] flex items-center justify-center">
              <div className="h-1.5 w-1.5 rounded-full bg-[#333]" />
            </div>
          )}

          {/* Punch Hole for Galaxy */}
          {deviceFrame === "galaxy_s24" && (
            <div className="absolute top-2 z-30 h-2.5 w-2.5 rounded-full bg-black ring-1 ring-white/20" />
          )}

          {/* Viewport Content (3D WebGL Canvas or Children) */}
          <div className="relative h-full w-full overflow-hidden">{children}</div>

          {/* Dimensional & Calibration Ruler Overlay for Letterbox Mode */}
          {fitMode === "contain" && (
            <div className="pointer-events-none absolute bottom-1 left-2 z-20 flex items-center gap-2 rounded bg-black/60 px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground backdrop-blur-xs">
              <span className="text-primary">{activeRatioValue.toFixed(3)}:1</span>
              <span>·</span>
              <span>{stageStyle.width} × {stageStyle.height}</span>
              <span>·</span>
              <span>SCALE: {resolutionScale}x</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
