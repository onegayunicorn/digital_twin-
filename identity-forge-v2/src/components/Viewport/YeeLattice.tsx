import React, { useEffect, useRef } from 'react';
import { HardenedYeeLatticeEngine } from '../../engines/reflection/HardenedYeeLattice';
import { LatticePoint } from '../../core/types';

interface YeeLatticeProps {
  resolution?: number;
  seed?: number;
  depth?: number;
  onLatticeGenerated?: (points: LatticePoint[]) => void;
  showMorphLegend?: boolean;
}

/**
 * YeeLattice — Visualizes the 5D Yee lattice with morph target coloring
 * Interactive component showing lattice generation and reflection
 */
export const YeeLattice: React.FC<YeeLatticeProps> = ({
  resolution = 16,
  seed = 42,
  depth = 0,
  onLatticeGenerated,
  showMorphLegend = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<HardenedYeeLatticeEngine | null>(null);
  const pointsRef = useRef<LatticePoint[]>([]);

  const morphColors: Record<string, string> = {
    eyes: '#00e5ff',
    nose: '#a78bfa',
    mouth: '#f472b6',
    jaw: '#34d399',
    brows: '#fbbf24',
    cheeks: '#f87171',
  };

  useEffect(() => {
    const engine = new HardenedYeeLatticeEngine({ resolution, seed });
    engineRef.current = engine;
    const points = engine.generateLattice();
    pointsRef.current = points;
    onLatticeGenerated?.(points);
    render();
  }, [resolution, seed]);

  useEffect(() => {
    render();
  }, [depth]);

  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const engine = engineRef.current;
    if (!engine) return;

    // Clear
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, w, h);

    const points = pointsRef.current;
    const cx = w / 2;
    const cy = h / 2;
    const scale = Math.min(w, h) * 0.4;

    // Draw connecting lines for nearby points
    ctx.strokeStyle = 'rgba(167, 139, 250, 0.08)';
    ctx.lineWidth = 0.5;

    for (let i = 0; i < Math.min(points.length, 200); i++) {
      for (let j = i + 1; j < Math.min(points.length, 200); j++) {
        const p1 = points[i].position;
        const p2 = points[j].position;
        let dist = 0;
        for (let d = 0; d < 3; d++) {
          dist += (p1[d] - p2[d]) ** 2;
        }
        dist = Math.sqrt(dist);

        if (dist < 0.3) {
          ctx.beginPath();
          ctx.moveTo(cx + p1[0] * scale, cy + p1[1] * scale);
          ctx.lineTo(cx + p2[0] * scale, cy + p2[1] * scale);
          ctx.stroke();
        }
      }
    }

    // Draw points with depth-based reflection
    for (const point of points) {
      const reflected = engine.computeReflection(point, depth);
      const p = reflected.position;

      const px = cx + p[0] * scale;
      const py = cy + p[1] * scale;

      // Size based on z (depth) dimension
      const zFactor = (p[2] + 1) / 2;
      const size = 1.5 + zFactor * 3 + point.intensity * 2;

      const color = morphColors[point.morphId] || '#a78bfa';
      const alpha = 0.4 + point.weight * 0.5;

      // Draw with w dimension as color shift
      const wShift = (p[3] + 1) / 2; // 0..1
      ctx.fillStyle = color;
      ctx.globalAlpha = alpha * (0.7 + wShift * 0.3);

      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;

    // Draw center marker
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.stroke();

    // Info text
    ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
    ctx.font = '11px monospace';
    ctx.fillText(`YEE LATTICE · ${resolution}³ = ${points.length} points`, 10, 16);
    ctx.fillText(`Depth: ${depth.toFixed(2)}`, 10, h - 10);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <canvas
        ref={canvasRef}
        width={512}
        height={512}
        style={{ width: '100%', height: '100%', borderRadius: 8 }}
      />

      {showMorphLegend && (
        <div
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            background: 'rgba(15, 23, 42, 0.85)',
            borderRadius: 6,
            padding: '6px 10px',
            fontSize: 10,
            fontFamily: 'monospace',
          }}
        >
          {Object.entries(morphColors).map(([name, color]) => (
            <div
              key={name}
              style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '2px 0' }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: color,
                  display: 'inline-block',
                }}
              />
              <span style={{ color: '#94a3b8' }}>{name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default YeeLattice;
