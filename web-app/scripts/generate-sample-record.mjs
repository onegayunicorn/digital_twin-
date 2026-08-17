/**
 * Generate a small, reproducible sample record for documentation and repository review.
 * The values are normalized software outputs, not physical data.
 */
import { mkdir, writeFile } from "node:fs/promises";

const scenario = { id: "optics", label: "Optical-metric tunnel", short: "Transformation optics", ceiling: 0.86 };
const configuration = { correlation: 0.72, fieldPattern: 0.6, environment: 0.18, particleCount: 72, resemblance: 0.52, tone: 0.44, vectors: { brow: { x: -0.14, y: 0.08 }, eyes: { x: 0.08, y: 0.02 }, nose: { x: -0.04, y: -0.08 }, jaw: { x: 0.18, y: 0.02 } } };
const boundary = "Simulation-only visual model. This record is not a physical measurement, device instruction, spacetime claim, or evidence of portal creation.";
const clamp = (value, minimum = 0.03, maximum = 0.99) => Math.max(minimum, Math.min(maximum, value));
const telemetry = (time) => {
  const progress = time / 100;
  const ramp = Math.sin(Math.min(1, progress * 1.2) * Math.PI / 2);
  const cooldown = progress > 0.82 ? 1 - ((progress - 0.82) / 0.18) * 0.72 : 1;
  const envelope = ramp * cooldown;
  const fidelity = clamp(scenario.ceiling * configuration.correlation * envelope * (1 - configuration.environment * 0.58));
  const coherence = clamp(configuration.fieldPattern * (0.32 + envelope * 0.72) * (1 - configuration.environment * 0.44), 0.02);
  const noise = Math.min(0.99, 0.08 + configuration.environment * 0.71 + progress * 0.07);
  const analogyIndex = clamp(fidelity * 0.58 + coherence * 0.42 - noise * 0.19, 0);
  return { time, stage: Math.min(5, Math.floor((time / 100) * 5) + 1), fidelity, coherence, noise, analogyIndex };
};
const series = Array.from({ length: 81 }, (_, index) => telemetry(Number((index * 1.25).toFixed(2))));
const peak = series.reduce((best, point) => point.analogyIndex > best.analogyIndex ? point : best, series[0]);
const lowerEnvironment = (() => { const original = configuration.environment; configuration.environment = 0.08; const value = telemetry(70).analogyIndex; configuration.environment = original; return value; })();
const higherEnvironment = (() => { const original = configuration.environment; configuration.environment = 0.58; const value = telemetry(70).analogyIndex; configuration.environment = original; return value; })();
const record = { schemaVersion: "1.0.0", recordId: "sample-default-optics", generatedAt: "2026-08-14T00:00:00.000Z", status: "completed", scientificBoundary: boundary, model: scenario, configuration, results: { elapsedModelTime: 100, peak, final: series.at(-1), telemetrySeries: series }, validation: { normalizedOutputs: series.every((point) => [point.fidelity, point.coherence, point.noise, point.analogyIndex].every((value) => value >= 0 && value <= 1)), environmentDirectionCheck: lowerEnvironment > higherEnvironment, statement: "Validation checks apply to this normalized software model only." } };
await mkdir("samples", { recursive: true });
await writeFile("samples/default-optics-run.json", `${JSON.stringify(record, null, 2)}\n`);
console.log(JSON.stringify({ recordId: record.recordId, points: series.length, peakAnalogyIndex: Number(peak.analogyIndex.toFixed(3)), finalAnalogyIndex: Number(record.results.final.analogyIndex.toFixed(3)), finalNoise: Number(record.results.final.noise.toFixed(3)), lowerEnvironment: Number(lowerEnvironment.toFixed(3)), higherEnvironment: Number(higherEnvironment.toFixed(3)) }, null, 2));
