import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SimulationProvider, useSimulation } from "./contexts/SimulationContext";
import { AspectScalingProvider } from "./contexts/AspectScalingContext";
import { NavigationHeader } from "./components/NavigationHeader";
import { PageTransition } from "./components/PageTransition";
import { TheoryMathPage } from "./pages/TheoryMathPage";
import { SimulationPage } from "./pages/SimulationPage";
import { DeepSeekAIPage } from "./pages/DeepSeekAIPage";
import { DigitalTwinPage } from "./pages/DigitalTwinPage";

function MainAppShell() {
  const { activeTab, setActiveTab, refreshKey } = useSimulation();

  // Sync URL hash or path with activeTab on initial mount and popstate
  useEffect(() => {
    const handleLocation = () => {
      const path = window.location.pathname;
      if (path.includes("theory") || path === "/") setActiveTab(1);
      else if (path.includes("simulation")) setActiveTab(2);
      else if (path.includes("deepseek") || path.includes("chat")) setActiveTab(3);
      else if (path.includes("twin") || path.includes("sensor")) setActiveTab(4);
    };

    window.addEventListener("popstate", handleLocation);
    return () => window.removeEventListener("popstate", handleLocation);
  }, [setActiveTab]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
      <NavigationHeader />

      <main className="flex-1 w-full">
        <PageTransition pageKey={`${activeTab}-${refreshKey}`}>
          {activeTab === 1 && <TheoryMathPage />}
          {activeTab === 2 && <SimulationPage />}
          {activeTab === 3 && <DeepSeekAIPage />}
          {activeTab === 4 && <DigitalTwinPage />}
        </PageTransition>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <SimulationProvider>
            <AspectScalingProvider>
              <Toaster />
              <MainAppShell />
            </AspectScalingProvider>
          </SimulationProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
