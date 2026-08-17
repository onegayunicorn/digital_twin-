import { mkdirSync, writeFileSync } from "node:fs";
import { YeeGridLite } from "../../engines/telemetry/src/yee-grid-lite";

const grid = new YeeGridLite({ nx: 8, ny: 8, nz: 4, seed: 783, energyCap: 0.88 });
const steps = Array.from({ length: 24 }, () => grid.step(0.08));
const report = {
  status: "SIMULATED",
  grid: { nx: 8, ny: 8, nz: 4, totalCells: grid.totalCells, seed: 783, energyCap: 0.88 },
  summary: {
    stepCount: steps.length,
    final: steps.at(-1),
    peakNormalizedEnergy: Math.max(...steps.map((step) => step.normalizedEnergy)),
    resets: steps.filter((step) => step.safety === "reset-after-cap").length,
  },
  steps,
  boundary: "Dimensionless normalized micro-cell visualization. No Maxwell solve, physical field, molecular, dust, portal, or hardware claim.",
};
mkdirSync("simulations/coherence-node/output", { recursive: true });
writeFileSync("simulations/coherence-node/output/yee-grid-lite-report.json", JSON.stringify(report, null, 2));
console.log(JSON.stringify(report.summary, null, 2));
