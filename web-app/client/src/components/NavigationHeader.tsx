import React, { useState } from "react";
import { useSimulation } from "@/contexts/SimulationContext";
import {
  Compass,
  Sparkles,
  Bot,
  UserCheck,
  RefreshCw,
  Smartphone,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
  HelpCircle,
} from "lucide-react";
import { NativeAppModal } from "./NativeAppModal";

export const NavigationHeader: React.FC = () => {
  const { activeTab, setActiveTab, triggerRefresh, coherenceRate, lastAppliedPreset } = useSimulation();
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [nativeModalOpen, setNativeModalOpen] = useState<boolean>(false);

  const handleRefreshClick = () => {
    setIsRefreshing(true);
    triggerRefresh();
    setTimeout(() => setIsRefreshing(false), 700);
  };

  const navItems = [
    {
      id: 1,
      name: "Page 1: Theory & Math",
      short: "Theory & Math",
      icon: Compass,
      desc: "Mathematical equations & cosmic foundations",
      badge: "Δx = √[...] ",
    },
    {
      id: 2,
      name: "Page 2: Cosmic Simulation",
      short: "Simulation 3D",
      icon: Sparkles,
      desc: "3D WebGL fluid lattice & 5D reflection grid",
      badge: "7 Layers",
    },
    {
      id: 3,
      name: "Page 3: DeepSeek V4 AI",
      short: "DeepSeek V4",
      icon: Bot,
      desc: "Reasoning AI & simulation synthesizer",
      badge: "Reasoner",
    },
    {
      id: 4,
      name: "Page 4: Digital Twin",
      short: "Digital Twin & Lab",
      icon: UserCheck,
      desc: "Face camera & J09 multi-sensor lab",
      badge: "Live Sensor",
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/90 backdrop-blur-md transition-colors">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6">
          {/* Logo & System Brand */}
          <div className="flex items-center gap-3">
            <div
              onClick={() => setActiveTab(1)}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg p-1.5 transition-opacity hover:opacity-90"
            >
              <div className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-primary/40 bg-primary/10 shadow-[0_0_12px_rgba(20,184,166,0.25)]">
                <Zap className="h-5 w-5 text-primary animate-pulse" />
                <div className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-background" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold tracking-tight text-foreground sm:text-base">
                    SOVEREIGN ORCHESTRATOR
                  </span>
                  <span className="hidden rounded border border-primary/30 bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-primary sm:inline-block">
                    v5.2
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground hidden sm:block">
                  Cosmic Field Simulation & Avatar Laboratory
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 rounded-xl border border-border/70 bg-card/60 p-1 shadow-sm">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-page-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`group relative flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-[0_0_14px_rgba(20,184,166,0.35)]"
                      : "text-muted-foreground hover:bg-accent/70 hover:text-foreground"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary"}`} />
                  <span>{item.short}</span>
                  {item.badge && (
                    <span
                      className={`rounded px-1.5 py-0.2 text-[9px] font-mono ${
                        isActive
                          ? "bg-background/25 text-primary-foreground font-semibold"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Utility Controls & Status */}
          <div className="flex items-center gap-2">
            {/* Global Coherence Indicator */}
            <div className="hidden lg:flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/30 px-2.5 py-1 text-[11px] font-mono text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.15)]">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span className="font-semibold">COHERENCE: {coherenceRate}</span>
            </div>

            {/* Native App Integration Status */}
            <button
              id="native-app-bridge-btn"
              onClick={() => setNativeModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-border/80 bg-card px-2.5 py-1.5 text-xs font-medium text-foreground transition-all hover:border-primary/50 hover:bg-accent"
              title="Native App Integration & Sensor Suite"
            >
              <Smartphone className="h-3.5 w-3.5 text-primary" />
              <span className="hidden sm:inline">Native Bridge</span>
            </button>

            {/* Refresh Transition Action */}
            <button
              id="page-refresh-action-btn"
              onClick={handleRefreshClick}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/80 bg-card text-muted-foreground transition-all hover:border-primary/50 hover:bg-accent hover:text-foreground"
              title="Refresh Simulation & Physics State"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
            </button>
          </div>
        </div>

        {/* Active Preset Sub-Bar */}
        <div className="border-t border-border/40 bg-card/30 px-4 py-1 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>ENGINE: <strong className="text-foreground">{lastAppliedPreset}</strong></span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline">MERKLE: <span className="text-primary">0x534F5652...</span></span>
            <span className="text-xs">
              PAGE: <span className="font-bold text-foreground">{activeTab} / 4</span>
            </span>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Dock */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border/70 bg-background/95 backdrop-blur-lg px-2 py-1.5 shadow-lg">
        <div className="grid grid-cols-4 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-nav-page-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center rounded-lg py-1.5 px-1 text-[10px] font-medium transition-all ${
                  isActive
                    ? "bg-primary/15 text-primary font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className={`h-4 w-4 mb-0.5 ${isActive ? "text-primary scale-110" : "text-muted-foreground"}`} />
                <span className="truncate max-w-[70px]">{item.short.replace("Page ", "")}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Native App Integration Modal */}
      <NativeAppModal isOpen={nativeModalOpen} onClose={() => setNativeModalOpen(false)} />
    </>
  );
};
