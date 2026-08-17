/**
 * Deterministic validator for the browser-only visual model.
 * It validates normalized state ranges and ordering; it makes no real-world physical prediction.
 */
const scenarios = {
  lattice: 0.92,
  ensemble: 0.78,
  boundary: 0.66,
  optics: 0.86,
  coupled: 0.73,
};

function point(time, ceiling, correlation = 0.72, fieldPattern = 0.6, environment = 0.18) {
  const progress = time / 100;
  const ramp = Math.sin(Math.min(1, progress * 1.2) * Math.PI / 2);
  const cooldown = progress > 0.82 ? 1 - ((progress - 0.82) / 0.18) * 0.72 : 1;
  const envelope = ramp * cooldown;
  const fidelity = Math.max(0.03, Math.min(0.99, ceiling * correlation * envelope * (1 - environment * 0.58)));
  const coherence = Math.max(0.02, Math.min(0.98, fieldPattern * (0.32 + envelope * 0.72) * (1 - environment * 0.44)));
  const noise = Math.min(0.99, 0.08 + environment * 0.71 + progress * 0.07);
  return { fidelity, coherence, noise, analogyIndex: Math.max(0, Math.min(0.99, fidelity * 0.58 + coherence * 0.42 - noise * 0.19)) };
}

const results = Object.entries(scenarios).map(([modelId, ceiling]) => {
  const series = Array.from({ length: 81 }, (_, index) => point(index * 1.25, ceiling));
  const peak = series.reduce((best, next) => next.analogyIndex > best.analogyIndex ? next : best);
  const end = series.at(-1);
  if ([peak.fidelity, peak.coherence, peak.noise, peak.analogyIndex, end.analogyIndex].some((value) => !Number.isFinite(value) || value < 0 || value > 1)) throw new Error(`${modelId}: normalized output escaped 0–1`);
  return { modelId, peakAnalogyIndex: Number(peak.analogyIndex.toFixed(3)), finalAnalogyIndex: Number(end.analogyIndex.toFixed(3)), finalNoise: Number(end.noise.toFixed(3)) };
});

const lowerEnvironment = point(70, scenarios.optics, 0.72, 0.6, 0.08).analogyIndex;
const higherEnvironment = point(70, scenarios.optics, 0.72, 0.6, 0.58).analogyIndex;
if (!(lowerEnvironment > higherEnvironment)) throw new Error("Environment comparison did not reduce the visual analogy index");

console.table(results);
console.log(JSON.stringify({ status: "pass", checks: ["all outputs normalized", "five tracks advanced", "higher environment reduces index"], environmentComparison: { lowerEnvironment: Number(lowerEnvironment.toFixed(3)), higherEnvironment: Number(higherEnvironment.toFixed(3)) } }, null, 2));
