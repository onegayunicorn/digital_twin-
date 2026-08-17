import { SimulatedBciDevice } from "../../devices/bci-simulator/src/index.ts";
import { CoherenceNode } from "../../engines/coherence-node/src/index.ts";
import { writeFileSync, mkdirSync } from "node:fs";

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
const avg = (key) => samples.reduce((sum, sample) => sum + sample[key], 0) / samples.length;
const report = {
  status: "SIMULATED",
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
mkdirSync(new URL("./output/", import.meta.url), { recursive: true });
writeFileSync(new URL("./output/coherence-node-report.json", import.meta.url), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report.summary, null, 2));
