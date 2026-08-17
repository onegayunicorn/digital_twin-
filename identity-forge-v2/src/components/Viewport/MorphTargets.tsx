import React from 'react';
import { MorphWeights, clamp } from '../../core/types';

interface MorphTargetsProps {
  weights: MorphWeights;
  onChange: (target: string, value: number) => void;
  availableTargets?: string[];
  showNormalized?: boolean;
}

const DEFAULT_TARGETS = ['eyes', 'nose', 'mouth', 'jaw', 'brows', 'cheeks'];

const TARGET_META: Record<string, { label: string; color: string; icon: string }> = {
  eyes: { label: 'Eyes', color: '#00e5ff', icon: '◉' },
  nose: { label: 'Nose', color: '#a78bfa', icon: '△' },
  mouth: { label: 'Mouth', color: '#f472b6', icon: '◡' },
  jaw: { label: 'Jaw', color: '#34d399', icon: '◇' },
  brows: { label: 'Brows', color: '#fbbf24', icon: '⌒' },
  cheeks: { label: 'Cheeks', color: '#f87171', icon: '○' },
};

/**
 * MorphTargets — UI controls for morph target weight adjustment
 * Provides sliders for each morph target with real-time preview
 */
export const MorphTargets: React.FC<MorphTargetsProps> = ({
  weights,
  onChange,
  availableTargets = DEFAULT_TARGETS,
  showNormalized = false,
}) => {
  const normalized = React.useMemo(() => {
    if (!showNormalized) return null;
    let total = 0;
    for (const t of availableTargets) {
      total += Math.max(0, weights[t] ?? 0);
    }
    const result: MorphWeights = {};
    if (total > 1e-10) {
      for (const t of availableTargets) {
        result[t] = Math.max(0, weights[t] ?? 0) / total;
      }
    }
    return result;
  }, [weights, availableTargets, showNormalized]);

  const totalWeight = React.useMemo(() => {
    return availableTargets.reduce((sum, t) => sum + (weights[t] ?? 0), 0);
  }, [weights, availableTargets]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 11,
          color: '#94a3b8',
          fontFamily: 'monospace',
        }}
      >
        <span>MORPH TARGETS</span>
        <span>
          Σ = {totalWeight.toFixed(2)}
          {totalWeight > 1.01 && <span style={{ color: '#f87171' }}> ⚠</span>}
        </span>
      </div>

      {availableTargets.map((target) => {
        const meta = TARGET_META[target] || {
          label: target,
          color: '#a78bfa',
          icon: '●',
        };
        const value = weights[target] ?? 0.5;
        const normValue = normalized?.[target];

        return (
          <div key={target} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 12,
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: meta.color, fontSize: 14 }}>{meta.icon}</span>
                <span style={{ color: '#e2e8f0' }}>{meta.label}</span>
              </span>
              <span
                style={{
                  fontFamily: 'monospace',
                  fontSize: 11,
                  color: meta.color,
                }}
              >
                {value.toFixed(2)}
                {normValue !== undefined && (
                  <span style={{ color: '#64748b', marginLeft: 4 }}>
                    → {normValue.toFixed(2)}
                  </span>
                )}
              </span>
            </div>

            <div style={{ position: 'relative', height: 20 }}>
              {/* Track */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: 0,
                  right: 0,
                  height: 4,
                  transform: 'translateY(-50%)',
                  background: 'rgba(148, 163, 184, 0.15)',
                  borderRadius: 2,
                }}
              />
              {/* Center marker */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: 1,
                  height: 12,
                  transform: 'translate(-50%, -50%)',
                  background: 'rgba(148, 163, 184, 0.3)',
                }}
              />
              {/* Fill */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  height: 4,
                  transform: `translateY(-50%) ${
                    value >= 0.5 ? '' : 'scaleX(-1) translateX(-100%)'
                  }`,
                  width: `${Math.abs(value - 0.5) * 200}%`,
                  background: `linear-gradient(90deg, ${meta.color}88, ${meta.color})`,
                  borderRadius: 2,
                  transformOrigin: 'left center',
                }}
              />
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={clamp(value, 0, 1)}
                onChange={(e) => onChange(target, parseFloat(e.target.value))}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer',
                  margin: 0,
                }}
              />
              {/* Thumb */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: `${value * 100}%`,
                  width: 14,
                  height: 14,
                  transform: 'translate(-50%, -50%)',
                  borderRadius: '50%',
                  background: meta.color,
                  border: '2px solid #0f172a',
                  boxShadow: `0 0 8px ${meta.color}66`,
                  pointerEvents: 'none',
                }}
              />
            </div>
          </div>
        );
      })}

      <div
        style={{
          display: 'flex',
          gap: 8,
          marginTop: 4,
        }}
      >
        <button
          onClick={() => availableTargets.forEach((t) => onChange(t, 0.5))}
          style={buttonStyle}
        >
          Reset
        </button>
        <button
          onClick={() => availableTargets.forEach((t) => onChange(t, 0))}
          style={buttonStyle}
        >
          Min All
        </button>
        <button
          onClick={() => availableTargets.forEach((t) => onChange(t, 1))}
          style={buttonStyle}
        >
          Max All
        </button>
      </div>
    </div>
  );
};

const buttonStyle: React.CSSProperties = {
  flex: 1,
  padding: '6px 8px',
  fontSize: 11,
  fontFamily: 'monospace',
  background: 'rgba(148, 163, 184, 0.1)',
  border: '1px solid rgba(148, 163, 184, 0.2)',
  borderRadius: 4,
  color: '#94a3b8',
  cursor: 'pointer',
};

export default MorphTargets;
