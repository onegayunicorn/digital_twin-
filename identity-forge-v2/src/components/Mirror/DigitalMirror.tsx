import React, { useRef, useEffect, useState, useCallback } from 'react';
import { DigitalMirrorEngine } from '../../engines/mirror/DigitalMirrorEngine';
import { MirrorFrame } from '../../core/types';

interface DigitalMirrorProps {
  width?: number;
  height?: number;
  onFrameProcessed?: (frame: MirrorFrame) => void;
}

/**
 * DigitalMirror — Real-time mirror reflection processing component
 * Captures canvas input and applies mirror + 5D reflection transforms
 */
export const DigitalMirror: React.FC<DigitalMirrorProps> = ({
  width = 400,
  height = 300,
  onFrameProcessed,
}) => {
  const sourceCanvasRef = useRef<HTMLCanvasElement>(null);
  const reflectedCanvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<DigitalMirrorEngine | null>(null);
  const [depth, setDepth] = useState(0);
  const [scale, setScale] = useState(1);
  const [isActive, setIsActive] = useState(false);
  const [frameCount, setFrameCount] = useState(0);

  useEffect(() => {
    engineRef.current = new DigitalMirrorEngine();
    drawSourcePattern();
  }, []);

  const drawSourcePattern = useCallback(() => {
    const canvas = sourceCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw a test pattern
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Gradient background
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, 'rgba(0, 229, 255, 0.2)');
    grad.addColorStop(0.5, 'rgba(167, 139, 250, 0.1)');
    grad.addColorStop(1, 'rgba(244, 114, 182, 0.2)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Draw some shapes
    ctx.fillStyle = '#00e5ff';
    ctx.fillRect(20, 20, 80, 60);

    ctx.fillStyle = '#a78bfa';
    ctx.beginPath();
    ctx.arc(width - 60, 50, 35, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.moveTo(50, height - 30);
    ctx.lineTo(100, height - 80);
    ctx.lineTo(150, height - 30);
    ctx.closePath();
    ctx.fill();

    // Text labels
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('SOURCE', 10, height - 10);
    ctx.fillStyle = '#64748b';
    ctx.font = '10px monospace';
    ctx.fillText('L → R', width - 50, height - 10);
  }, [width, height]);

  const processMirror = useCallback(() => {
    const sourceCanvas = sourceCanvasRef.current;
    const reflectedCanvas = reflectedCanvasRef.current;
    const engine = engineRef.current;
    if (!sourceCanvas || !reflectedCanvas || !engine) return;

    const sourceCtx = sourceCanvas.getContext('2d');
    if (!sourceCtx) return;

    const imageData = sourceCtx.getImageData(0, 0, width, height);
    let frame = engine.processImage(imageData, { scale });

    // Apply 5D reflection if depth > 0
    if (depth > 0) {
      frame = engine.apply5DReflection(frame, depth);
    }

    // Draw result
    const outCtx = reflectedCanvas.getContext('2d');
    if (outCtx) {
      outCtx.putImageData(frame.reflected, 0, 0);

      // Overlay info
      outCtx.fillStyle = 'rgba(15, 23, 42, 0.7)';
      outCtx.fillRect(0, 0, width, 22);
      outCtx.fillStyle = '#e2e8f0';
      outCtx.font = 'bold 11px monospace';
      outCtx.fillText('REFLECTED', 8, 15);
      outCtx.fillStyle = '#a78bfa';
      outCtx.fillText(`depth:${depth.toFixed(2)} scale:${scale.toFixed(2)}`, width - 160, 15);
    }

    setFrameCount(engine.getFrameCount());
    onFrameProcessed?.(frame);
  }, [width, height, depth, scale, onFrameProcessed]);

  useEffect(() => {
    if (isActive) {
      processMirror();
      const interval = setInterval(processMirror, 100);
      return () => clearInterval(interval);
    }
  }, [isActive, processMirror]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {/* Source */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#94a3b8' }}>
            SOURCE IMAGE
          </span>
          <canvas
            ref={sourceCanvasRef}
            width={width}
            height={height}
            style={{ borderRadius: 8, border: '1px solid rgba(148, 163, 184, 0.2)' }}
          />
        </div>

        {/* Arrow */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            color: '#a78bfa',
            fontSize: 20,
          }}
        >
          →
        </div>

        {/* Reflected */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#a78bfa' }}>
            MIRROR OUTPUT
          </span>
          <canvas
            ref={reflectedCanvasRef}
            width={width}
            height={height}
            style={{
              borderRadius: 8,
              border: '1px solid rgba(167, 139, 250, 0.3)',
              boxShadow: '0 0 20px rgba(167, 139, 250, 0.1)',
            }}
          />
        </div>
      </div>

      {/* Controls */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          padding: 12,
          background: 'rgba(15, 23, 42, 0.5)',
          borderRadius: 8,
          border: '1px solid rgba(148, 163, 184, 0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => setIsActive(!isActive)}
            style={{
              padding: '8px 16px',
              fontSize: 12,
              fontFamily: 'monospace',
              background: isActive ? 'rgba(248, 113, 113, 0.2)' : 'rgba(0, 229, 255, 0.2)',
              border: `1px solid ${isActive ? 'rgba(248, 113, 113, 0.4)' : 'rgba(0, 229, 255, 0.4)'}`,
              borderRadius: 4,
              color: isActive ? '#f87171' : '#00e5ff',
              cursor: 'pointer',
            }}
          >
            {isActive ? '⏸ Stop Mirror' : '▶ Start Mirror'}
          </button>

          <button
            onClick={processMirror}
            style={{
              padding: '8px 16px',
              fontSize: 12,
              fontFamily: 'monospace',
              background: 'rgba(148, 163, 184, 0.1)',
              border: '1px solid rgba(148, 163, 184, 0.3)',
              borderRadius: 4,
              color: '#94a3b8',
              cursor: 'pointer',
            }}
          >
            ⟳ Process Once
          </button>

          <div style={{ flex: 1 }} />

          <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#64748b' }}>
            Frames: {frameCount}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <SliderControl
            label="5D Depth"
            value={depth}
            min={0}
            max={1}
            step={0.01}
            onChange={setDepth}
            color="#a78bfa"
          />
          <SliderControl
            label="Scale"
            value={scale}
            min={0.5}
            max={2}
            step={0.01}
            onChange={setScale}
            color="#00e5ff"
          />
        </div>
      </div>
    </div>
  );
};

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  color: string;
}

const SliderControl: React.FC<SliderControlProps> = ({
  label,
  value,
  min,
  max,
  step,
  onChange,
  color,
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: 11,
        fontFamily: 'monospace',
      }}
    >
      <span style={{ color: '#94a3b8' }}>{label}</span>
      <span style={{ color }}>{value.toFixed(2)}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      style={{ width: '100%' }}
    />
  </div>
);

export default DigitalMirror;
