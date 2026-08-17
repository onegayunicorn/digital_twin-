import { mkdirSync, writeFileSync } from "node:fs";
import { CosmicEngine } from "../../engines/cosmic/src";

const engine = new CosmicEngine({ seed: 441, nodeCount: 12 });
const snapshots = Array.from({ length: 32 }, () => engine.step());
const report = {
  status: "SIMULATED",
  config: { seed: 441, nodeCount: 12, stepCount: snapshots.length },
  summary: {
    final: snapshots.at(-1),
    maxPropagation: Math.max(...snapshots.map((snapshot) => snapshot.resonanceMesh.propagationSpeed)),
    maxPhotonDensity: Math.max(...snapshots.map((snapshot) => snapshot.lightGrid.photonDensity)),
    safetyResets: snapshots.filter((snapshot) => snapshot.safety === "reset-after-cap").length,
  },
  snapshots,
  boundary: "Dimensionless visual systems only; no physical field, gravity, photon, quantum, portal, financial, or hardware claim.",
};
mkdirSync("simulations/cosmic/output", { recursive: true });
writeFileSync("simulations/cosmic/output/cosmic-engine-report.json", JSON.stringify(report, null, 2));
console.log(JSON.stringify(report.summary, null, 2));
