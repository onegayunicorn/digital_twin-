import React, { useEffect, useState, useRef } from 'react';
import { FrameData, TransitionType } from '../../core/types';

interface SlideTransitionProps {
  frames: FrameData[];
  autoPlay?: boolean;
  fps?: number;
  onFrameChange?: (frame: FrameData, index: number) => void;
  width?: number;
  height?: number;
}

const TRANSITION_LABELS: Record<TransitionType, string> = {
  fade: 'Fade',
  slide: 'Slide',
  zoom: 'Zoom',
  flip: 'Flip',
  morph: 'Morph',
  '5d': '5D Warp',
};

/**
 * SlideTransition — Visualizes picture stacking animations
 * Shows frames with transition effects between them
 */
export const SlideTransition: React.FC<SlideTransitionProps> = ({
  frames,
  autoPlay = false,
  fps = 30,
  onFrameChange,
  width = 480,
  height = 270,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!isPlaying || frames.length < 2) return;

    const animate = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const delta = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      const currentFrame = frames[currentIndex];
      if (currentFrame) {
        const frameProgress = delta / currentFrame.duration;
        setProgress((prev) => {
          const next = prev + frameProgress;
          if (next >= 1) {
            const nextIndex = (currentIndex + 1) % frames.length;
            setCurrentIndex(nextIndex);
            onFrameChange?.(frames[nextIndex], nextIndex);
            return 0;
          }
          return next;
        });
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = 0;
    };
  }, [isPlaying, currentIndex, frames, onFrameChange]);

  if (frames.length === 0) {
    return (
      <div
        style={{
          width,
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(15, 23, 42, 0.5)',
          borderRadius: 8,
          border: '1px dashed rgba(148, 163, 184, 0.3)',
          color: '#64748b',
          fontSize: 13,
        }}
      >
        No frames loaded
      </div>
    );
  }

  const currentFrame = frames[currentIndex];
  const nextIndex = (currentIndex + 1) % frames.length;
  const nextFrame = frames[nextIndex];
  const transition = currentFrame.transition;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Stage */}
      <div
        style={{
          width,
          height,
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 8,
          background: '#020617',
          border: '1px solid rgba(167, 139, 250, 0.2)',
        }}
      >
        {/* Background grid */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(0, 229, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 229, 255, 0.05) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        {/* Frame content with transition */}
        <TransitionStage
          frame={currentFrame}
          nextFrame={nextFrame}
          transition={transition}
          progress={progress}
          width={width}
          height={height}
        />

        {/* HUD */}
        <div
          style={{
            position: 'absolute',
            top: 8,
            left: 8,
            right: 8,
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 10,
            fontFamily: 'monospace',
            color: '#94a3b8',
          }}
        >
          <span>
            Frame {currentIndex + 1}/{frames.length}
          </span>
          <span style={{ color: '#a78bfa' }}>
            {TRANSITION_LABELS[transition]}
          </span>
        </div>

        {/* Progress bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: 3,
            width: `${progress * 100}%`,
            background: 'linear-gradient(90deg, #00e5ff, #a78bfa)',
            transition: 'width 0.05s linear',
          }}
        />
      </div>

      {/* Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          style={{
            padding: '6px 12px',
            fontSize: 12,
            fontFamily: 'monospace',
            background: isPlaying ? 'rgba(248, 113, 113, 0.2)' : 'rgba(0, 229, 255, 0.2)',
            border: `1px solid ${isPlaying ? 'rgba(248, 113, 113, 0.4)' : 'rgba(0, 229, 255, 0.4)'}`,
            borderRadius: 4,
            color: isPlaying ? '#f87171' : '#00e5ff',
            cursor: 'pointer',
          }}
        >
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>

        <button
          onClick={() => {
            const prev = (currentIndex - 1 + frames.length) % frames.length;
            setCurrentIndex(prev);
            setProgress(0);
            onFrameChange?.(frames[prev], prev);
          }}
          style={navButtonStyle}
        >
          ◀ Prev
        </button>

        <button
          onClick={() => {
            const next = (currentIndex + 1) % frames.length;
            setCurrentIndex(next);
            setProgress(0);
            onFrameChange?.(frames[next], next);
          }}
          style={navButtonStyle}
        >
          Next ▶
        </button>

        <div style={{ flex: 1 }} />

        <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#64748b' }}>
          {(progress * 100).toFixed(0)}%
        </span>
      </div>

      {/* Frame thumbnails */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          overflowX: 'auto',
          padding: '4px 0',
        }}
      >
        {frames.map((frame, i) => (
          <div
            key={frame.id}
            onClick={() => {
              setCurrentIndex(i);
              setProgress(0);
              onFrameChange?.(frame, i);
            }}
            style={{
              flexShrink: 0,
              width: 60,
              height: 34,
              borderRadius: 4,
              background:
                i === currentIndex
                  ? 'linear-gradient(135deg, rgba(0, 229, 255, 0.3), rgba(167, 139, 250, 0.3))'
                  : 'rgba(15, 23, 42, 0.8)',
              border: `1px solid ${
                i === currentIndex ? 'rgba(0, 229, 255, 0.6)' : 'rgba(148, 163, 184, 0.15)'
              }`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              fontFamily: 'monospace',
              color: i === currentIndex ? '#00e5ff' : '#64748b',
              cursor: 'pointer',
            }}
          >
            {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Transition Stage ────────────────────────────────────────────────────────

interface TransitionStageProps {
  frame: FrameData;
  nextFrame: FrameData;
  transition: TransitionType;
  progress: number;
  width: number;
  height: number;
}

const TransitionStage: React.FC<TransitionStageProps> = ({
  frame,
  nextFrame,
  transition,
  progress,
  width,
  height,
}) => {
  const getTransform = (): React.CSSProperties => {
    const t = progress;
    switch (transition) {
      case 'fade':
        return { opacity: 1 - t };
      case 'slide':
        return { transform: `translateX(${-t * width * 0.3}px)` };
      case 'zoom': {
        const scale = 1 + t * 0.2;
        return { transform: `scale(${scale})`, opacity: 1 - t * 0.5 };
      }
      case 'flip': {
        const angle = t * 90;
        return { transform: `perspective(600px) rotateY(${angle}deg)`, opacity: 1 - t * 0.5 };
      }
      case 'morph': {
        const wobble = Math.sin(t * Math.PI * 4) * 5 * (1 - Math.abs(t - 0.5) * 2);
        return { transform: `translate(${wobble}px, ${wobble * 0.5}px)` };
      }
      case '5d': {
        const dx = Math.sin(t * Math.PI * 2) * 10;
        const dy = Math.cos(t * Math.PI * 2) * 5;
        const skew = Math.sin(t * Math.PI) * 3;
        return {
          transform: `translate(${dx}px, ${dy}px) skew(${skew}deg, ${-skew}deg)`,
          opacity: 0.85 + 0.15 * Math.cos(t * Math.PI * 2),
        };
      }
      default:
        return {};
    }
  };

  return (
    <>
      {/* Current frame */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...getTransform(),
          transition: 'none',
        }}
      >
        <FrameVisualization frame={frame} width={width * 0.8} height={height * 0.7} />
      </div>

      {/* Next frame overlay */}
      {progress > 0.5 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: (progress - 0.5) * 2,
          }}
        >
          <FrameVisualization frame={nextFrame} width={width * 0.8} height={height * 0.7} />
        </div>
      )}
    </>
  );
};

const FrameVisualization: React.FC<{ frame: FrameData; width: number; height: number }> = ({
  frame,
  width,
  height,
}) => {
  const meta = frame.metadata;
  const hue = ((meta.x + 1) / 2) * 60 + ((meta.y + 1) / 2) * 180 + ((meta.w + 1) / 2) * 120;

  return (
    <div
      style={{
        width,
        height,
        borderRadius: 8,
        background: `linear-gradient(135deg, hsla(${hue}, 70%, 50%, 0.3), hsla(${hue + 60}, 70%, 50%, 0.1))`,
        border: `1px solid hsla(${hue}, 80%, 60%, 0.4)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        color: '#e2e8f0',
        fontFamily: 'monospace',
        fontSize: 11,
      }}
    >
      <div style={{ fontSize: 24, opacity: 0.8 }}>🖼</div>
      <div>{frame.id}</div>
      <div style={{ color: '#94a3b8', fontSize: 10 }}>
        x:{meta.x.toFixed(2)} y:{meta.y.toFixed(2)} z:{meta.z.toFixed(2)}
      </div>
      <div style={{ color: '#94a3b8', fontSize: 10 }}>
        w:{meta.w.toFixed(2)} v:{meta.v.toFixed(2)} depth:{meta.depth.toFixed(2)}
      </div>
    </div>
  );
};

const navButtonStyle: React.CSSProperties = {
  padding: '6px 10px',
  fontSize: 11,
  fontFamily: 'monospace',
  background: 'rgba(148, 163, 184, 0.1)',
  border: '1px solid rgba(148, 163, 184, 0.2)',
  borderRadius: 4,
  color: '#94a3b8',
  cursor: 'pointer',
};

export default SlideTransition;
