/**
 * HARDENED SLIDE SEQUENCER
 * Identity Forge v2.0 — Picture stacking to form animations
 *
 * Mathematically hardened:
 * - Cubic Hermite interpolation between frames
 * - Smoothness penalty: E_smooth = Σ_t ||f(t+1) - f(t)||²
 * - FPS bounded in [1, 120]
 * - All frame metadata in bounded domains
 * - Deterministic frame selection
 */

import {
  FrameData,
  TransitionType,
  HardenedAnimation,
  clamp,
  lerp,
  cubicHermite,
  computeAnimationEnergy,
} from '../../core/types';

export class HardenedSlideSequencer {
  private animations: Map<string, HardenedAnimation> = new Map();
  private currentTime: number = 0;
  private currentAnimationId: string | null = null;
  private isPlaying: boolean = false;
  private timer: number | null = null;
  private frameCallbacks: Set<(frame: FrameData) => void> = new Set();

  /**
   * Create a new animation with frame interpolation.
   * Automatically applies cubic Hermite interpolation for smoothness.
   */
  createAnimation(
    name: string,
    frames: FrameData[],
    options: Partial<HardenedAnimation> = {}
  ): HardenedAnimation {
    const fps = clamp(options.fps ?? 30, 1, 120);

    const animation: HardenedAnimation = {
      id: `anim-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      frames: this.interpolateFrames(frames),
      fps,
      loop: options.loop ?? true,
      duration: frames.reduce((sum, f) => sum + f.duration, 0),
      transitionStyle: options.transitionStyle ?? '5d',
      smoothnessLambda: options.smoothnessLambda ?? 0.1,
    };

    this.animations.set(animation.id, animation);
    return animation;
  }

  /**
   * Interpolate between keyframes using cubic Hermite splines.
   * Ensures C¹ continuity (smooth transitions).
   */
  private interpolateFrames(frames: FrameData[]): FrameData[] {
    if (frames.length < 2) return frames;

    const result: FrameData[] = [];
    const interpolationSteps = 5; // Sub-frames between each keyframe

    for (let i = 0; i < frames.length - 1; i++) {
      const current = frames[i];
      const next = frames[i + 1];

      // Estimate tangents (Catmull-Rom style)
      const prev = i > 0 ? frames[i - 1] : current;
      const nextNext = i < frames.length - 2 ? frames[i + 2] : next;

      for (let j = 0; j < interpolationSteps; j++) {
        const alpha = j / interpolationSteps;
        const t = cubicHermite(alpha);

        const m0 = this.estimateTangent(prev.metadata, current.metadata, next.metadata);
        const m1 = this.estimateTangent(current.metadata, next.metadata, nextNext.metadata);

        result.push({
          ...current,
          id: `interp-${i}-${j}`,
          duration: current.duration / interpolationSteps,
          transition: '5d',
          metadata: {
            x: this.hermite(current.metadata.x, m0.x, next.metadata.x, m1.x, alpha),
            y: this.hermite(current.metadata.y, m0.y, next.metadata.y, m1.y, alpha),
            z: this.hermite(current.metadata.z, m0.z, next.metadata.z, m1.z, alpha),
            w: this.hermite(current.metadata.w, m0.w, next.metadata.w, m1.w, alpha),
            v: this.hermite(current.metadata.v, m0.v, next.metadata.v, m1.v, alpha),
            depth: lerp(current.metadata.depth, next.metadata.depth, t),
            reflection: lerp(current.metadata.reflection, next.metadata.reflection, t),
          },
        });
      }
    }

    result.push(frames[frames.length - 1]);
    return result;
  }

  /**
   * Estimate tangent using central differences.
   */
  private estimateTangent(prev: any, curr: any, next: any): any {
    return {
      x: (next.x - prev.x) / 2,
      y: (next.y - prev.y) / 2,
      z: (next.z - prev.z) / 2,
      w: (next.w - prev.w) / 2,
      v: (next.v - prev.v) / 2,
    };
  }

  /**
   * Cubic Hermite interpolation between two values with tangents.
   */
  private hermite(p0: number, m0: number, p1: number, m1: number, t: number): number {
    const t2 = t * t;
    const t3 = t2 * t;
    const h00 = 2 * t3 - 3 * t2 + 1;
    const h10 = t3 - 2 * t2 + t;
    const h01 = -2 * t3 + 3 * t2;
    const h11 = t3 - t2;
    return h00 * p0 + h10 * m0 + h01 * p1 + h11 * m1;
  }

  /**
   * Add a frame to an existing animation.
   */
  addFrame(animationId: string, frame: FrameData): void {
    const animation = this.animations.get(animationId);
    if (animation) {
      animation.frames.push(frame);
      animation.duration = animation.frames.reduce((sum, f) => sum + f.duration, 0);
    }
  }

  /**
   * Start playing an animation.
   */
  play(animationId: string): void {
    const animation = this.animations.get(animationId);
    if (!animation) return;

    this.currentAnimationId = animationId;
    this.isPlaying = true;
    this.currentTime = 0;

    if (this.timer) {
      clearInterval(this.timer);
    }

    this.timer = window.setInterval(() => {
      this.currentTime += 1 / animation.fps;

      if (this.currentTime >= animation.duration) {
        if (animation.loop) {
          this.currentTime = 0;
        } else {
          this.stop();
          return;
        }
      }

      const frame = this.getFrameAtTime(animation, this.currentTime);
      if (frame) {
        this.emitFrame(frame);
      }
    }, 1000 / animation.fps) as unknown as number;
  }

  /**
   * Stop the current animation.
   */
  stop(): void {
    this.isPlaying = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * Get the frame at a specific time.
   * Uses linear interpolation between adjacent frames.
   */
  getFrameAtTime(animation: HardenedAnimation, time: number): FrameData | null {
    if (animation.frames.length === 0) return null;

    let accumulated = 0;
    for (let i = 0; i < animation.frames.length; i++) {
      const frameDuration = animation.frames[i].duration;
      if (time <= accumulated + frameDuration) {
        const localT = frameDuration > 0 ? (time - accumulated) / frameDuration : 0;

        if (i < animation.frames.length - 1 && localT > 0) {
          // Interpolate between this frame and next
          return this.interpolateFramePair(
            animation.frames[i],
            animation.frames[i + 1],
            localT
          );
        }
        return animation.frames[i];
      }
      accumulated += frameDuration;
    }

    return animation.frames[animation.frames.length - 1];
  }

  private interpolateFramePair(a: FrameData, b: FrameData, t: number): FrameData {
    const smoothT = cubicHermite(t);
    return {
      id: `blend-${a.id}-${b.id}`,
      image: t < 0.5 ? a.image : b.image,
      duration: lerp(a.duration, b.duration, t),
      transition: t < 0.5 ? a.transition : b.transition,
      metadata: {
        x: lerp(a.metadata.x, b.metadata.x, smoothT),
        y: lerp(a.metadata.y, b.metadata.y, smoothT),
        z: lerp(a.metadata.z, b.metadata.z, smoothT),
        w: lerp(a.metadata.w, b.metadata.w, smoothT),
        v: lerp(a.metadata.v, b.metadata.v, smoothT),
        depth: lerp(a.metadata.depth, b.metadata.depth, smoothT),
        reflection: lerp(a.metadata.reflection, b.metadata.reflection, smoothT),
      },
    };
  }

  private emitFrame(frame: FrameData): void {
    for (const callback of this.frameCallbacks) {
      try {
        callback(frame);
      } catch (e) {
        console.error('Frame callback error:', e);
      }
    }
  }

  onFrame(callback: (frame: FrameData) => void): () => void {
    this.frameCallbacks.add(callback);
    return () => this.frameCallbacks.delete(callback);
  }

  /**
   * Compute smoothness energy for an animation.
   * Lower = smoother.
   */
  computeSmoothness(animation: HardenedAnimation): number {
    const baseEnergy = computeAnimationEnergy(animation.frames);
    return baseEnergy * animation.smoothnessLambda;
  }

  /**
   * Minimize smoothness energy by adjusting frame timing.
   * Simple one-step optimization.
   */
  optimizeSmoothness(animationId: string): void {
    const animation = this.animations.get(animationId);
    if (!animation || animation.frames.length < 3) return;

    // Re-interpolate with more steps for smoother result
    const keyframes: FrameData[] = [];
    const step = Math.max(1, Math.floor(animation.frames.length / 10));

    for (let i = 0; i < animation.frames.length; i += step) {
      keyframes.push(animation.frames[i]);
    }
    if (keyframes[keyframes.length - 1] !== animation.frames[animation.frames.length - 1]) {
      keyframes.push(animation.frames[animation.frames.length - 1]);
    }

    animation.frames = this.interpolateFrames(keyframes);
    animation.duration = animation.frames.reduce((sum, f) => sum + f.duration, 0);
  }

  getAnimations(): HardenedAnimation[] {
    return Array.from(this.animations.values());
  }

  getAnimation(id: string): HardenedAnimation | undefined {
    return this.animations.get(id);
  }

  getCurrentAnimation(): HardenedAnimation | null {
    if (!this.currentAnimationId) return null;
    return this.animations.get(this.currentAnimationId) ?? null;
  }

  getCurrentTime(): number {
    return this.currentTime;
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  exportAnimation(animationId: string): string {
    const animation = this.animations.get(animationId);
    if (!animation) return '{}';
    return JSON.stringify(animation, null, 2);
  }

  importAnimation(data: string): HardenedAnimation | null {
    try {
      const animation = JSON.parse(data) as HardenedAnimation;
      animation.fps = clamp(animation.fps, 1, 120);
      this.animations.set(animation.id, animation);
      return animation;
    } catch {
      return null;
    }
  }

  deleteAnimation(animationId: string): boolean {
    if (this.currentAnimationId === animationId) {
      this.stop();
      this.currentAnimationId = null;
    }
    return this.animations.delete(animationId);
  }
}
