import React, { useMemo } from 'react';
import { LatticePoint } from '../../core/types';

interface ReflectionGridProps {
  lattice: LatticePoint[];
  intensity?: number;
  frame?: number;
  resolution?: number;
}

/**
 * ReflectionGrid — 2D canvas-based 5D reflection grid visualization
 * Shows the Yee lattice projected onto a 2D plane with color-coded morph targets
 */
export const ReflectionGrid: React.FC<ReflectionGridProps> = ({
  lattice,
  intensity = 1.0,
  frame = 0,
  resolution = 32,
}) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const morphColors: Record<string, string> = {
    eyes: '#00e5ff',
    nose: '#a78bfa',
    mouth: '#f472b6',
    jaw: '#34d399',
    brows: '#fbbf24',
    cheeks: '#f87171',
  };

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Clear
    ctx.clearRect(0, 0, w, h);

    // Background gradient
    const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    bgGrad.addColorStop(0, 'rgba(15, 23, 42, 1)');
    bgGrad.addColorStop(1, 'rgba(2, 6, 23, 1)');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Draw grid lines
    const cellW = w / resolution;
    const cellH = h / resolution;

    ctx.strokeStyle = `rgba(0, 229, 255, ${0.08 * intensity})`;
    ctx.lineWidth = 1;

    for (let i = 0; i <= resolution; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellW, 0);
      ctx.lineTo(i * cellW, h);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * cellH);
      ctx.lineTo(w, i * cellH);
      ctx.stroke();
    }

    // Draw lattice points
    const time = frame * 0.05;

    for (const point of lattice) {
      const px = ((point.position[0] + 1) / 2) * w;
      const py = ((point.position[1] + 1) / 2) * h;

      // Animated size based on higher dimensions
      const wFactor = (point.position[3] + 1) / 2;
      const vFactor = (point.position[4] + 1) / 2;
      const size = 2 + (wFactor + vFactor) * 3 + point.intensity * 2;

      // Pulsing animation
      const pulse = 0.8 + 0.2 * Math.sin(time + point.position[2] * 5);
      const finalSize = size * pulse * intensity;

      const color = morphColors[point.morphId] || '#a78bfa';
      const alpha = (0.3 + point.weight * 0.5) * intensity;

      // Glow
      const glow = ctx.createRadialGradient(px, py, 0, px, py, finalSize * 3);
      glow.addColorStop(0, color + Math.floor(alpha * 128).toString(16).padStart(2, '0'));
      glow.addColorStop(1, color + '00');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(px, py, finalSize * 3, 0, Math.PI * 2);
      ctx.fill();

      // Core point
      ctx.fillStyle = color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(px, py, finalSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Draw reflection axis lines
    ctx.strokeStyle = `rgba(167, 139, 250, ${0.3 * intensity})`;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    // Horizontal reflection axis
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();

    // Vertical reflection axis
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h);
    ctx.stroke();

    ctx.setLineDash([]);

    // Labels
    ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
    ctx.font = '10px monospace';
    ctx.fillText('5D REFLECTION GRID', 10, 16);
    ctx.fillText(`Points: ${lattice.length}`, 10, h - 10);
    ctx.fillText(`Frame: ${frame}`, w - 80, h - 10);
  }, [lattice, intensity, frame, resolution, morphColors]);

  return (
    <canvas
      ref={canvasRef}
      width={512}
      height={512}
      style={{
        width: '100%',
        height: '100%',
        borderRadius: 8,
        imageRendering: 'pixelated',
      }}
    />
  );
};

export default ReflectionGrid;
