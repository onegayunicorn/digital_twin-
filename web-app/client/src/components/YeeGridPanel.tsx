/**
 * Design: Graphite Specimen Ledger — measured grid card with mineral-paper labels.
 * The Yee-grid model is normalized and visual only; it does not solve physical fields.
 */
import { useMemo, useState } from "react";
import { Activity, Grid3X3, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { YeeGridLite, type GridStepReport } from "../../../engines/telemetry/src/yee-grid-lite";

export function YeeGridPanel() {
  const [runCount, setRunCount] = useState(0);
  const result = useMemo<GridStepReport | null>(() => {
    if (!runCount) return null;
    const grid = new YeeGridLite({ nx: 8, ny: 8, nz: 4, seed: 783, energyCap: 0.88 });
    let report: GridStepReport | null = null;
    for (let step = 0; step < 24; step += 1) report = grid.step(0.08);
    return report;
  }, [runCount]);

  return (
    <article className="yee-grid-panel" aria-labelledby="yee-grid-title">
      <div className="yee-grid-heading">
        <div className="section-kicker"><Grid3X3 /><span>MICRO-CELL LATTICE / PDF UPDATE</span></div>
        <span className="yee-grid-id">GRID-08×08×04</span>
      </div>
      <h3 id="yee-grid-title">Yee-grid-lite field record</h3>
      <p>Flattened normalized channels mirror the supplied micro-cell vocabulary: fidelity, coherence, intensity, decoherence, amplitude, velocity, and phase.</p>
      <div className="yee-grid-bars" aria-label="Normalized field channels">
        {["fidelity", "coherence", "intensity", "decoherence", "amplitude", "velocity", "phase"].map((key, index) => {
          const value = result?.average[key as keyof typeof result.average] ?? (0.18 + index * 0.07);
          return <div key={key}><span>{key}</span><i style={{ width: `${value * 100}%` }} /><small>{value.toFixed(3)}</small></div>;
        })}
      </div>
      <div className="yee-grid-footer">
        <div><Activity /><span>{result ? `STEP ${result.step} · ${result.safety}` : "READY · DETERMINISTIC SEED 783"}</span></div>
        <div><ShieldCheck /><span>SOFTWARE INTERLOCK / CAP 0.88</span></div>
      </div>
      <Button className="yee-grid-run" variant="outline" onClick={() => setRunCount((count) => count + 1)}>{result ? "Rerun normalized grid" : "Run normalized grid"}</Button>
      <small className="yee-grid-boundary">Dimensionless visual model. No Maxwell solve, physical field, molecular, dust, portal, or hardware claim.</small>
    </article>
  );
}
