import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

export type AspectRatioKey = "auto" | "16:9" | "21:9" | "16:10" | "4:3" | "9:16" | "1:1" | "20:9" | "custom";
export type ScalingFitMode = "contain" | "cover" | "device-frame";
export type ResolutionScale = 0.75 | 1.0 | 1.5 | 2.0;
export type DeviceFrameType = "iphone16" | "ipad_pro" | "macbook" | "ultrawide_monitor" | "galaxy_s24" | "j09_ring" | "none";
export type UIDensityMode = "compact" | "standard" | "touch";

export interface AspectPreset {
  key: AspectRatioKey;
  label: string;
  short: string;
  ratio: number | null; // width / height, null for auto
  description: string;
  category: "desktop" | "mobile" | "tablet" | "wearable" | "ultrawide" | "fluid";
  recommendedFrame: DeviceFrameType;
}

export const ASPECT_PRESETS: AspectPreset[] = [
  {
    key: "auto",
    label: "Dynamic Fluid",
    short: "Auto",
    ratio: null,
    description: "Adapts smoothly to container & window resizing",
    category: "fluid",
    recommendedFrame: "none",
  },
  {
    key: "16:9",
    label: "Desktop 16:9 UHD",
    short: "16:9",
    ratio: 16 / 9,
    description: "Standard 1080p / 1440p / 4K monitors & TVs",
    category: "desktop",
    recommendedFrame: "none",
  },
  {
    key: "21:9",
    label: "Ultrawide 21:9 Cinema",
    short: "21:9",
    ratio: 21 / 9,
    description: "Ultrawide curved gaming & panoramic displays",
    category: "ultrawide",
    recommendedFrame: "ultrawide_monitor",
  },
  {
    key: "16:10",
    label: "Laptop 16:10 MacBook",
    short: "16:10",
    ratio: 16 / 10,
    description: "MacBook Pro, Dell XPS, and productivity displays",
    category: "desktop",
    recommendedFrame: "macbook",
  },
  {
    key: "4:3",
    label: "Tablet 4:3 iPad Pro",
    short: "4:3",
    ratio: 4 / 3,
    description: "iPad, Android tablets, and classic portrait displays",
    category: "tablet",
    recommendedFrame: "ipad_pro",
  },
  {
    key: "9:16",
    label: "Mobile 9:16 Portrait",
    short: "9:16",
    ratio: 9 / 16,
    description: "iPhone & Android vertical story & app viewport",
    category: "mobile",
    recommendedFrame: "iphone16",
  },
  {
    key: "20:9",
    label: "Flagship 20:9 OLED",
    short: "20:9",
    ratio: 9 / 20,
    description: "Samsung Galaxy & modern tall mobile displays",
    category: "mobile",
    recommendedFrame: "galaxy_s24",
  },
  {
    key: "1:1",
    label: "Square 1:1 / J09 Ring",
    short: "1:1",
    ratio: 1 / 1,
    description: "Smartwatch, J09 Bio-Ring Hub & square specimens",
    category: "wearable",
    recommendedFrame: "j09_ring",
  },
];

interface AspectScalingContextType {
  aspectRatio: AspectRatioKey;
  setAspectRatio: (key: AspectRatioKey) => void;
  customRatio: number;
  setCustomRatio: (ratio: number) => void;
  fitMode: ScalingFitMode;
  setFitMode: (mode: ScalingFitMode) => void;
  resolutionScale: ResolutionScale;
  setResolutionScale: (scale: ResolutionScale) => void;
  deviceFrame: DeviceFrameType;
  setDeviceFrame: (frame: DeviceFrameType) => void;
  uiDensity: UIDensityMode;
  setUiDensity: (density: UIDensityMode) => void;
  isRotated: boolean;
  toggleRotation: () => void;
  isTheaterMode: boolean;
  setIsTheaterMode: (theater: boolean) => void;

  // Calculated metrics
  activeRatioValue: number; // calculated numerical width / height
  activePreset: AspectPreset;
  calculatedWidth: number;
  calculatedHeight: number;
  effectiveDpr: number;
  updateContainerDimensions: (width: number, height: number) => void;
  resetToDefault: () => void;
}

const AspectScalingContext = createContext<AspectScalingContextType | undefined>(undefined);

const STORAGE_KEY = "sovereign_aspect_scaling_v1";

export const AspectScalingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [aspectRatio, setAspectRatioState] = useState<AspectRatioKey>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.aspectRatio) return parsed.aspectRatio;
      }
    } catch {}
    return "auto";
  });

  const [customRatio, setCustomRatio] = useState<number>(1.778);
  const [fitMode, setFitMode] = useState<ScalingFitMode>("cover");
  const [resolutionScale, setResolutionScale] = useState<ResolutionScale>(1.0);
  const [deviceFrame, setDeviceFrame] = useState<DeviceFrameType>("none");
  const [uiDensity, setUiDensity] = useState<UIDensityMode>("standard");
  const [isRotated, setIsRotated] = useState<boolean>(false);
  const [isTheaterMode, setIsTheaterMode] = useState<boolean>(false);

  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({
    width: typeof window !== "undefined" ? window.innerWidth : 1280,
    height: typeof window !== "undefined" ? window.innerHeight : 720,
  });

  // Save preferences
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          aspectRatio,
          fitMode,
          resolutionScale,
          deviceFrame,
          uiDensity,
        })
      );
    } catch {}
  }, [aspectRatio, fitMode, resolutionScale, deviceFrame, uiDensity]);

  const setAspectRatio = useCallback((key: AspectRatioKey) => {
    setAspectRatioState(key);
    const preset = ASPECT_PRESETS.find((p) => p.key === key);
    if (preset && preset.recommendedFrame !== "none" && preset.key !== "auto") {
      setDeviceFrame(preset.recommendedFrame);
    } else if (key === "auto" || key === "16:9") {
      setDeviceFrame("none");
    }
  }, []);

  const toggleRotation = useCallback(() => {
    setIsRotated((prev) => !prev);
  }, []);

  const activePreset = useMemo(() => {
    return ASPECT_PRESETS.find((p) => p.key === aspectRatio) || ASPECT_PRESETS[0];
  }, [aspectRatio]);

  const activeRatioValue = useMemo(() => {
    let base = 16 / 9;
    if (aspectRatio === "auto") {
      base = containerSize.width > 0 && containerSize.height > 0 ? containerSize.width / containerSize.height : 16 / 9;
    } else if (aspectRatio === "custom") {
      base = customRatio;
    } else if (activePreset.ratio) {
      base = activePreset.ratio;
    }
    return isRotated && base > 0 ? 1 / base : base;
  }, [aspectRatio, customRatio, activePreset, containerSize, isRotated]);

  const updateContainerDimensions = useCallback((width: number, height: number) => {
    if (width > 0 && height > 0) {
      setContainerSize((prev) => {
        if (Math.abs(prev.width - width) > 2 || Math.abs(prev.height - height) > 2) {
          return { width, height };
        }
        return prev;
      });
    }
  }, []);

  const effectiveDpr = useMemo(() => {
    const windowDpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    return Math.min(2.5, Math.max(0.75, windowDpr * resolutionScale));
  }, [resolutionScale]);

  const resetToDefault = useCallback(() => {
    setAspectRatioState("auto");
    setFitMode("cover");
    setResolutionScale(1.0);
    setDeviceFrame("none");
    setUiDensity("standard");
    setIsRotated(false);
    setIsTheaterMode(false);
  }, []);

  return (
    <AspectScalingContext.Provider
      value={{
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
        calculatedWidth: containerSize.width,
        calculatedHeight: containerSize.height,
        effectiveDpr,
        updateContainerDimensions,
        resetToDefault,
      }}
    >
      {children}
    </AspectScalingContext.Provider>
  );
};

export function useAspectScale() {
  const context = useContext(AspectScalingContext);
  if (!context) {
    throw new Error("useAspectScale must be used within an AspectScalingProvider");
  }
  return context;
}
