/**
 * SLIDE SEQUENCER — Original Implementation
 * Identity Forge v2.0 — Picture stacking to form animations
 *
 * Backward-compatible interface.
 * For hardened version see HardenedSlideSequencer.
 */

import { SlideFrame, SlideAnimation, TransitionType } from '../../core/types';

export class SlideSequencer {
  private animations: Map<string, SlideAnimation> = new Map();
  private currentFrame = 0;
  isPlaying = false;
  private timer: number | null = null;
  private currentAnimationId: string | null = null;

  createAnimation(
    name: string,
    frames: SlideFrame[],
    options: Partial<SlideAnimation> = {}
  ): SlideAnimation {
    const animation: SlideAnimation = {
      id: `anim-${Date.now()}`,
      name,
      frames,
      fps: 30,
      loop: true,
      duration: frames.reduce((sum, f) => sum + f.duration, 0),
      transitionStyle: '5d',
      smoothnessLambda: 0.1,
      ...options,
    };

    this.animations.set(animation.id, animation);
    return animation;
  }

  addFrame(animationId: string, frame: SlideFrame): void {
    const animation = this.animations.get(animationId);
    if (animation) {
      animation.frames.push(frame);
      animation.duration = animation.frames.reduce((sum, f) => sum + f.duration, 0);
    }
  }

  play(animationId: string): void {
    const animation = this.animations.get(animationId);
    if (!animation) return;

    this.currentAnimationId = animationId;
    this.isPlaying = true;
    this.currentFrame = 0;

    if (this.timer) {
      clearInterval(this.timer);
    }

    this.timer = window.setInterval(() => {
      this.currentFrame = (this.currentFrame + 1) % animation.frames.length;
      this.emitFrame(animation.frames[this.currentFrame]);
    }, 1000 / animation.fps) as unknown as number;
  }

  stop(): void {
    this.isPlaying = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  getCurrentFrame(): SlideFrame | null {
    const animation = this.getCurrentAnimation();
    if (!animation) return null;
    return animation.frames[this.currentFrame] || null;
  }

  getCurrentAnimation(): SlideAnimation | null {
    if (!this.currentAnimationId) return null;
    return this.animations.get(this.currentAnimationId) ?? null;
  }

  private emitFrame(frame: SlideFrame): void {
    console.log(`📺 Frame: ${frame.id} | Duration: ${frame.duration}s`);
  }

  getAnimations(): SlideAnimation[] {
    return Array.from(this.animations.values());
  }

  exportAnimation(animationId: string): string {
    const animation = this.animations.get(animationId);
    if (!animation) return '{}';
    return JSON.stringify(animation, null, 2);
  }

  importAnimation(data: string): SlideAnimation | null {
    try {
      const animation = JSON.parse(data) as SlideAnimation;
      this.animations.set(animation.id, animation);
      return animation;
    } catch {
      return null;
    }
  }
}
