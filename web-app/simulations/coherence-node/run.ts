import { mkdirSync, writeFileSync } from "node:fs";
import { SimulatedBciDevice } from "../../devices/bci-simulator/src/index";
import { CoherenceNode } from "../../engines/coherence-node/src/index";

const device = new SimulatedBciDevice("mock-halo-01");
device.grantSimulationConsent();
device.connect();
const node = new CoherenceNode();
node.setConsent(true);
node.start();
const samples = [];
for (let index = 0; index < 64; index += 1) {
  const sample = device.readSample();
  const state = node.ingest(sample);
  samples.push({ ...sample, nodeCoherence: state.coherence, focus: state.focus, ledPreview: state.outputs.ledPreview });
}
const avg = (key: "coherence" | "entropy" | "focus") => samples.reduce((sum, sample) => sum + sample[key], 0) / samples.length;
const report = {
  status: "SIMULATED" as const,
  seed: 783,
  device: device.status(),
  node: node.snapshot(),
  summary: {
    sampleCount: samples.length,
    averageCoherence: Number(avg("coherence").toFixed(4)),
    peakCoherence: Number(Math.max(...samples.map((sample) => sample.coherence)).toFixed(4)),
    averageEntropy: Number(avg("entropy").toFixed(4)),
    averageFocus: Number(avg("focus").toFixed(4)),
  },
  samples,
  boundary: "Synthetic read-only visualization. No stimulation, diagnosis, treatment, or hardware actuation.",
};
mkdirSync("simulations/coherence-node/output", { recursive: true });
writeFileSync("simulations/coherence-node/output/coherence-node-report.json", JSON.stringify(report, null, 2));
console.log(JSON.stringify(report.summary, null, 2));
