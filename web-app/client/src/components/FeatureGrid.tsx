/**
 * Design: Graphite Specimen Ledger — compact calibration-grid controls for normalized avatar study vectors.
 */
import type { PointerEvent } from "react";
import type { FaceVector } from "./AvatarViewport";

type FeatureGridProps = {
  label: string;
  value: FaceVector;
  onChange: (next: FaceVector) => void;
};

export function FeatureGrid({ label, value, onChange }: FeatureGridProps) {
  const update = (event: PointerEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width) * 2 - 1));
    const y = Math.max(-1, Math.min(1, 1 - ((event.clientY - rect.top) / rect.height) * 2));
    onChange({ x, y });
  };

  return (
    <div className="feature-grid-wrap">
      <div className="feature-grid-label"><span>{label}</span><code>{value.x.toFixed(2)} / {value.y.toFixed(2)}</code></div>
      <button className="feature-grid" onPointerDown={update} onPointerMove={(event) => event.buttons === 1 && update(event)} aria-label={`${label} vector control`}>
        <span className="feature-grid-axis axis-x">X</span>
        <span className="feature-grid-axis axis-y">Y</span>
        <span className="feature-crosshair" style={{ left: `${(value.x + 1) * 50}%`, top: `${(1 - value.y) * 50}%` }} />
      </button>
    </div>
  );
}
