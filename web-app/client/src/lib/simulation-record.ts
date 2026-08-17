/**
 * Design: Graphite Specimen Ledger — exported records use archival identifiers, normalized values,
 * and an explicit simulation-only boundary so a file cannot be mistaken for physical data.
 */
import { jsPDF } from "jspdf";
import type { FaceVector } from "@/components/AvatarViewport";

export type ScenarioSpec = {
  id: string;
  label: string;
  short: string;
  ceiling: number;
};

export type SimulationInputs = {
  scenario: ScenarioSpec;
  correlation: number;
  fieldPattern: number;
  environment: number;
  particleCount: number;
  resemblance: number;
  tone: number;
  vectors: Record<string, FaceVector>;
};

export type TelemetryPoint = {
  time: number;
  stage: number;
  fidelity: number;
  coherence: number;
  noise: number;
  analogyIndex: number;
};

export type RunRecord = {
  schemaVersion: "1.0.0";
  recordId: string;
  generatedAt: string;
  status: "in-progress" | "completed";
  scientificBoundary: string;
  model: ScenarioSpec;
  configuration: Omit<SimulationInputs, "scenario" | "vectors"> & { vectors: Record<string, FaceVector> };
  results: {
    elapsedModelTime: number;
    peak: TelemetryPoint;
    final: TelemetryPoint;
    telemetrySeries: TelemetryPoint[];
  };
  validation: {
    normalizedOutputs: boolean;
    environmentDirectionCheck: boolean;
    statement: string;
  };
};

export const SCIENTIFIC_BOUNDARY = "Simulation-only visual model. This record is not a physical measurement, device instruction, spacetime claim, or evidence of portal creation.";

export function calculateTelemetry(inputs: SimulationInputs, time: number): Omit<TelemetryPoint, "time" | "stage"> {
  const progress = Math.max(0, Math.min(1, time / 100));
  const ramp = Math.sin(Math.min(1, progress * 1.2) * Math.PI / 2);
  const cooldown = progress > 0.82 ? 1 - ((progress - 0.82) / 0.18) * 0.72 : 1;
  const envelope = ramp * cooldown;
  const fidelity = clamp(inputs.scenario.ceiling * inputs.correlation * envelope * (1 - inputs.environment * 0.58));
  const coherence = clamp(inputs.fieldPattern * (0.32 + envelope * 0.72) * (1 - inputs.environment * 0.44), 0.02);
  const noise = Math.min(0.99, 0.08 + inputs.environment * 0.71 + progress * 0.07);
  const analogyIndex = clamp(fidelity * 0.58 + coherence * 0.42 - noise * 0.19, 0);
  return { fidelity, coherence, noise, analogyIndex };
}

export function buildTelemetrySeries(inputs: SimulationInputs, elapsedModelTime: number): TelemetryPoint[] {
  const end = Math.max(0, Math.min(100, elapsedModelTime));
  const step = 1.25;
  const times = Array.from({ length: Math.floor(end / step) + 1 }, (_, index) => Number((index * step).toFixed(2)));
  if (times.at(-1) !== end) times.push(Number(end.toFixed(2)));
  return times.map((time) => ({ time, stage: Math.min(5, Math.floor((time / 100) * 5) + 1), ...calculateTelemetry(inputs, time) }));
}

export function buildRunRecord(inputs: SimulationInputs, elapsedModelTime: number, runId: string, generatedAt = new Date()): RunRecord {
  const telemetrySeries = buildTelemetrySeries(inputs, elapsedModelTime);
  const peak = telemetrySeries.reduce((best, point) => point.analogyIndex > best.analogyIndex ? point : best, telemetrySeries[0]);
  const final = telemetrySeries.at(-1) ?? telemetrySeries[0];
  const lowerEnvironment = calculateTelemetry({ ...inputs, environment: 0.08 }, 70).analogyIndex;
  const higherEnvironment = calculateTelemetry({ ...inputs, environment: 0.58 }, 70).analogyIndex;
  const allNormalized = telemetrySeries.every((point) => [point.fidelity, point.coherence, point.noise, point.analogyIndex].every((value) => Number.isFinite(value) && value >= 0 && value <= 1));
  return {
    schemaVersion: "1.0.0",
    recordId: runId,
    generatedAt: generatedAt.toISOString(),
    status: elapsedModelTime >= 100 ? "completed" : "in-progress",
    scientificBoundary: SCIENTIFIC_BOUNDARY,
    model: inputs.scenario,
    configuration: {
      correlation: inputs.correlation,
      fieldPattern: inputs.fieldPattern,
      environment: inputs.environment,
      particleCount: inputs.particleCount,
      resemblance: inputs.resemblance,
      tone: inputs.tone,
      vectors: inputs.vectors,
    },
    results: { elapsedModelTime: Number(elapsedModelTime.toFixed(2)), peak, final, telemetrySeries },
    validation: {
      normalizedOutputs: allNormalized,
      environmentDirectionCheck: lowerEnvironment > higherEnvironment,
      statement: "Validation checks apply to this normalized software model only.",
    },
  };
}

export function downloadJson(record: RunRecord): void {
  const payload = JSON.stringify(record, null, 2);
  downloadBlob(payload, `qasl-${record.recordId}.json`, "application/json;charset=utf-8");
}

export function downloadPdf(record: RunRecord): void {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 18;
  let y = 20;
  const teal: [number, number, number] = [39, 114, 123];
  const amber: [number, number, number] = [161, 84, 53];
  const ink: [number, number, number] = [28, 39, 34];
  const muted: [number, number, number] = [85, 97, 88];
  const line = () => { pdf.setDrawColor(196, 196, 185); pdf.line(margin, y, pageWidth - margin, y); y += 7; };
  const text = (value: string, size = 10, color = ink, options: { bold?: boolean } = {}) => {
    pdf.setFont("helvetica", options.bold ? "bold" : "normal"); pdf.setFontSize(size); pdf.setTextColor(...color);
    const wrapped = pdf.splitTextToSize(value, pageWidth - margin * 2); pdf.text(wrapped, margin, y); y += wrapped.length * (size * 0.42) + 4;
  };
  pdf.setFillColor(14, 17, 16); pdf.rect(0, 0, pageWidth, 34, "F");
  pdf.setTextColor(121, 215, 230); pdf.setFont("courier", "bold"); pdf.setFontSize(9); pdf.text("QUANTUM AVATAR SIMULATION LAB", margin, 13);
  pdf.setTextColor(245, 240, 230); pdf.setFont("helvetica", "bold"); pdf.setFontSize(19); pdf.text("Simulation run record", margin, 25);
  y = 46; text("ARCHIVAL RECORD", 8, teal, { bold: true }); text(`${record.model.label} / ${record.model.short}`, 16, ink, { bold: true }); text(`Record ID: ${record.recordId}    Status: ${record.status}    Generated: ${record.generatedAt}`, 8, muted);
  line(); text("Scientific boundary", 9, amber, { bold: true }); text(record.scientificBoundary, 10, ink); line();
  text("Model configuration", 9, teal, { bold: true });
  text(`Correlation ${record.configuration.correlation.toFixed(2)}    Field pattern ${record.configuration.fieldPattern.toFixed(2)}    Environment ${record.configuration.environment.toFixed(2)}    Particle count ${record.configuration.particleCount}`, 9, muted);
  text(`Avatar resemblance ${record.configuration.resemblance.toFixed(2)}    Tone ${record.configuration.tone.toFixed(2)}    Feature vectors ${Object.keys(record.configuration.vectors).length}`, 9, muted);
  line(); text("Run results", 9, teal, { bold: true });
  const resultRows = [
    ["Elapsed model time", `${record.results.elapsedModelTime.toFixed(2)} / 100`],
    ["Peak analogy index", record.results.peak.analogyIndex.toFixed(3)],
    ["Final analogy index", record.results.final.analogyIndex.toFixed(3)],
    ["Final environmental noise", record.results.final.noise.toFixed(3)],
    ["Normalized outputs", record.validation.normalizedOutputs ? "PASS" : "FAIL"],
    ["Environment direction check", record.validation.environmentDirectionCheck ? "PASS" : "FAIL"],
  ];
  pdf.setFontSize(9);
  resultRows.forEach(([label, value]) => { pdf.setTextColor(...muted); pdf.text(label, margin, y); pdf.setTextColor(...ink); pdf.setFont("courier", "bold"); pdf.text(value, pageWidth - margin - 35, y, { align: "right" }); pdf.setFont("helvetica", "normal"); y += 6; });
  y += 2; line(); text("Telemetry sample", 9, teal, { bold: true });
  const samples = [record.results.telemetrySeries[0], record.results.peak, record.results.final].filter(Boolean);
  pdf.setFont("courier", "bold"); pdf.setFontSize(8); pdf.setTextColor(...muted); pdf.text("TIME     FIDELITY   COHERENCE   NOISE   INDEX", margin, y); y += 6;
  samples.forEach((point) => { pdf.setFont("courier", "normal"); pdf.setTextColor(...ink); pdf.text(`${point.time.toFixed(2).padStart(6)}   ${point.fidelity.toFixed(3).padStart(8)}   ${point.coherence.toFixed(3).padStart(9)}   ${point.noise.toFixed(3).padStart(5)}   ${point.analogyIndex.toFixed(3).padStart(6)}`, margin, y); y += 6; });
  y += 6; text("Interpretation", 9, amber, { bold: true }); text("This report records normalized values generated by the browser-only visual model. It must not be treated as a physical measurement, device specification, experimental result, or claim about portal creation.", 10, ink);
  pdf.setFillColor(239, 235, 226); pdf.rect(margin, 270, pageWidth - margin * 2, 12, "F"); pdf.setFont("courier", "normal"); pdf.setFontSize(7); pdf.setTextColor(...muted); pdf.text("Export schema 1.0.0 · simulation-only · no device connected", margin + 4, 277);
  pdf.save(`qasl-${record.recordId}.pdf`);
}

function clamp(value: number, minimum = 0.03, maximum = 0.99): number {
  return Math.max(minimum, Math.min(maximum, value));
}

function downloadBlob(payload: string, filename: string, type: string): void {
  const blob = new Blob([payload], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a"); link.href = url; link.download = filename; link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
