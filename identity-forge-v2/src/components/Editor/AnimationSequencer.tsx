import React, { useState, useRef, useEffect } from 'react';
import { FrameData, TransitionType } from '../../core/types';

interface AnimationSequencerProps {
  frames: FrameData[];
  onFramesChange?: (frames: FrameData[]) => void;
  onPlay?: () => void;
  onStop?: () => void;
  onFrameSelect?: (frame: FrameData, index: number) => void;
  isPlaying?: boolean;
  currentFrame?: number;
}

const TRANSITIONS: TransitionType[] = ['fade', 'slide', 'zoom', 'flip', 'morph', '5d'];

/**
 * AnimationSequencer — Timeline-based animation editor
 * Create and manage frame sequences with transition effects
 */
export const AnimationSequencer: React.FC<AnimationSequencerProps> = ({
  frames,
  onFramesChange,
  onPlay,
  onStop,
  onFrameSelect,
  isPlaying = false,
  currentFrame = 0,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [fps, setFps] = useState(30);
  const [defaultTransition, setDefaultTransition] = useState<TransitionType>('5d');

  const addFrame = () => {
    const newFrame: FrameData = {
      id: `frame-${Date.now()}`,
      image: '',
      duration: 1.0,
      transition: defaultTransition,
      metadata: {
        x: 0, y: 0, z: 0, w: 0, v: 0,
        depth: frames.length * 0.1,
        reflection: 0.8,
      },
    };
    onFramesChange?.([...frames, newFrame]);
  };

  const removeFrame = (index: number) => {
    const updated = frames.filter((_, i) => i !== index);
    onFramesChange?.(updated);
    if (selectedIndex === index) setSelectedIndex(null);
  };

  const updateFrame = (index: number, updates: Partial<FrameData>) => {
    const updated = frames.map((f, i) => (i === index ? { ...f, ...updates } : f));
    onFramesChange?.(updated);
  };

  const moveFrame = (from: number, to: number) => {
    if (to < 0 || to >= frames.length) return;
    const updated = [...frames];
    const [item] = updated.splice(from, 1);
    updated.splice(to, 0, item);
    onFramesChange?.(updated);
  };

  const totalDuration = frames.reduce((sum, f) => sum + f.duration, 0);

  const selectedFrame = selectedIndex !== null ? frames[selectedIndex] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#94a3b8', letterSpacing: 1 }}>
          ANIMATION SEQUENCER
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#64748b' }}>
            {frames.length} frames · {totalDuration.toFixed(1)}s
          </span>
        </div>
      </div>

      {/* Controls */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={isPlaying ? onStop : onPlay}
          style={{
            padding: '6px 12px',
            fontSize: 11,
            fontFamily: 'monospace',
            background: isPlaying ? 'rgba(248, 113, 113, 0.2)' : 'rgba(0, 229, 255, 0.2)',
            border: `1px solid ${isPlaying ? 'rgba(248, 113, 113, 0.4)' : 'rgba(0, 229, 255, 0.4)'}`,
            borderRadius: 4,
            color: isPlaying ? '#f87171' : '#00e5ff',
            cursor: 'pointer',
          }}
        >
          {isPlaying ? '⏸ Stop' : '▶ Play'}
        </button>

        <button
          onClick={addFrame}
          style={{
            padding: '6px 12px',
            fontSize: 11,
            fontFamily: 'monospace',
            background: 'rgba(167, 139, 250, 0.2)',
            border: '1px solid rgba(167, 139, 250, 0.4)',
            borderRadius: 4,
            color: '#a78bfa',
            cursor: 'pointer',
          }}
        >
          + Add Frame
        </button>

        <div style={{ flex: 1 }} />

        <label style={{ fontSize: 10, fontFamily: 'monospace', color: '#94a3b8' }}>
          FPS:
          <input
            type="number"
            min={1}
            max={120}
            value={fps}
            onChange={(e) => setFps(Math.max(1, Math.min(120, parseInt(e.target.value) || 30)))}
            style={{
              width: 50,
              marginLeft: 6,
              padding: '4px 6px',
              fontSize: 11,
              fontFamily: 'monospace',
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: 4,
              color: '#e2e8f0',
            }}
          />
        </label>

        <label style={{ fontSize: 10, fontFamily: 'monospace', color: '#94a3b8' }}>
          Default:
          <select
            value={defaultTransition}
            onChange={(e) => setDefaultTransition(e.target.value as TransitionType)}
            style={{
              marginLeft: 6,
              padding: '4px 6px',
              fontSize: 11,
              fontFamily: 'monospace',
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: 4,
              color: '#e2e8f0',
            }}
          >
            {TRANSITIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Timeline */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          overflowX: 'auto',
          padding: '8px 4px',
          background: 'rgba(15, 23, 42, 0.3)',
          borderRadius: 6,
          border: '1px solid rgba(148, 163, 184, 0.1)',
          minHeight: 70,
        }}
      >
        {frames.length === 0 && (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
              fontSize: 11,
              fontFamily: 'monospace',
            }}
          >
            No frames. Click "+ Add Frame" to begin.
          </div>
        )}

        {frames.map((frame, i) => (
          <div
            key={frame.id}
            onClick={() => {
              setSelectedIndex(i);
              onFrameSelect?.(frame, i);
            }}
            style={{
              flexShrink: 0,
              width: Math.max(60, frame.duration * 40),
              height: 50,
              background:
                i === currentFrame
                  ? 'linear-gradient(135deg, rgba(0, 229, 255, 0.3), rgba(167, 139, 250, 0.3))'
                  : selectedIndex === i
                  ? 'rgba(167, 139, 250, 0.15)'
                  : 'rgba(15, 23, 42, 0.6)',
              border: `1px solid ${
                i === currentFrame
                  ? 'rgba(0, 229, 255, 0.6)'
                  : selectedIndex === i
                  ? 'rgba(167, 139, 250, 0.4)'
                  : 'rgba(148, 163, 184, 0.15)'
              }`,
              borderRadius: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
              fontSize: 10,
              fontFamily: 'monospace',
              color: '#94a3b8',
            }}
          >
            <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{i + 1}</span>
            <span style={{ fontSize: 9 }}>{frame.transition}</span>
            <span style={{ fontSize: 9, opacity: 0.7 }}>{frame.duration.toFixed(1)}s</span>

            {/* Reorder buttons */}
            {selectedIndex === i && (
              <div
                style={{
                  position: 'absolute',
                  top: -20,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  gap: 2,
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    moveFrame(i, i - 1);
                  }}
                  style={miniBtnStyle}
                >
                  ←
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    moveFrame(i, i + 1);
                  }}
                  style={miniBtnStyle}
                >
                  →
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFrame(i);
                  }}
                  style={{ ...miniBtnStyle, color: '#f87171' }}
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Selected Frame Editor */}
      {selectedFrame && selectedIndex !== null && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: 8,
            padding: 12,
            background: 'rgba(15, 23, 42, 0.4)',
            borderRadius: 6,
            border: '1px solid rgba(167, 139, 250, 0.2)',
          }}
        >
          <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#a78bfa', gridColumn: '1 / -1' }}>
            EDITING FRAME {selectedIndex + 1}
          </div>

          <Field label="Duration (s)">
            <input
              type="number"
              step={0.1}
              min={0.1}
              value={selectedFrame.duration}
              onChange={(e) =>
                updateFrame(selectedIndex, { duration: Math.max(0.1, parseFloat(e.target.value) || 1) })
              }
              style={inputStyle}
            />
          </Field>

          <Field label="Transition">
            <select
              value={selectedFrame.transition}
              onChange={(e) =>
                updateFrame(selectedIndex, { transition: e.target.value as TransitionType })
              }
              style={inputStyle}
            >
              {TRANSITIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Depth">
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={selectedFrame.metadata.depth}
              onChange={(e) =>
                updateFrame(selectedIndex, {
                  metadata: { ...selectedFrame.metadata, depth: parseFloat(e.target.value) },
                })
              }
              style={{ width: '100%' }}
            />
          </Field>

          <Field label="Reflection">
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={selectedFrame.metadata.reflection}
              onChange={(e) =>
                updateFrame(selectedIndex, {
                  metadata: { ...selectedFrame.metadata, reflection: parseFloat(e.target.value) },
                })
              }
              style={{ width: '100%' }}
            />
          </Field>
        </div>
      )}
    </div>
  );
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
    <label style={{ fontSize: 10, fontFamily: 'monospace', color: '#94a3b8' }}>{label}</label>
    {children}
  </div>
);

const inputStyle: React.CSSProperties = {
  padding: '4px 8px',
  fontSize: 11,
  fontFamily: 'monospace',
  background: 'rgba(15, 23, 42, 0.8)',
  border: '1px solid rgba(148, 163, 184, 0.2)',
  borderRadius: 4,
  color: '#e2e8f0',
};

const miniBtnStyle: React.CSSProperties = {
  padding: '2px 6px',
  fontSize: 10,
  background: 'rgba(15, 23, 42, 0.9)',
  border: '1px solid rgba(148, 163, 184, 0.3)',
  borderRadius: 3,
  color: '#94a3b8',
  cursor: 'pointer',
};

export default AnimationSequencer;
