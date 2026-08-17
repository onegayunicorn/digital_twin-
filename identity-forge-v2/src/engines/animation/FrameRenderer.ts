/**
 * FRAME RENDERER
 * Identity Forge v2.0 — Render frames with 5D transitions
 *
 * Renders individual animation frames with:
 * - 5D reflection grid background
 * - Morph target overlays
 * - Transition effects (fade, slide, zoom, flip, morph, 5d)
 * - Depth overlay and mirror reflection
 */

import { FrameRenderConfig, FrameData, TransitionType } from '../../core/types';

export class FrameRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: FrameRenderConfig;

  constructor(canvas: HTMLCanvasElement, config: Partial<FrameRenderConfig> = {}) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D context');
    this.ctx = ctx;
    this.config = {
      width: 1920,
      height: 1080,
      depth: 5,
      reflection: true,
      morph: true,
      quality: 'ultra',
      ...config,
    };
    this.resize(this.config.width, this.config.height);
  }

  resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
    this.config.width = width;
    this.config.height = height;
  }

  /**
   * Render a complete frame with transition effect.
   */
  renderFrame(frame: FrameData, transition: TransitionType, progress: number): void {
    const ctx = this.ctx;
    const { width, height } = this.config;

    ctx.clearRect(0, 0, width, height);

    // 5D reflection grid background
    this.renderReflectionGrid(ctx, width, height, progress);

    // Morph target overlay
    if (this.config.morph) {
      this.renderMorphTargets(ctx, width, height, frame);
    }

    // Frame content with transition
    this.renderContent(ctx, width, height, frame, transition, progress);

    // 5D depth overlay
    this.renderDepthOverlay(ctx, width, height, frame);

    // Mirror reflection
    if (this.config.reflection) {
      this.renderReflection(ctx, width, height, frame);
    }
  }

  /**
   * Render the animated 5D reflection grid background.
   */
  private renderReflectionGrid(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    progress: number
  ): void {
    const gridSize = this.getGridSize();
    const spacing = Math.max(w, h) / gridSize;

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const x = i * spacing;
        const y = j * spacing;

        // Animated depth based on grid position and progress
        const depth = Math.sin(i * 0.5 + j * 0.3 + progress * 2 * Math.PI) * 0.5 + 0.5;
        const alpha = 0.03 + depth * 0.07;

        // Cyan/purple grid cells
        ctx.fillStyle = `rgba(0, 229, 255, ${alpha})`;
        ctx.fillRect(x, y, spacing, spacing);

        ctx.strokeStyle = `rgba(167, 139, 250, ${alpha * 0.5})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, spacing, spacing);
      }
    }
  }

  private getGridSize(): number {
    switch (this.config.quality) {
      case 'low': return 8;
      case 'medium': return 16;
      case 'high': return 32;
      case 'ultra': return 64;
      default: return 16;
    }
  }

  /**
   * Render morph target visualization around the frame.
   */
  private renderMorphTargets(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    frame: FrameData
  ): void {
    const targets = ['eyes', 'nose', 'mouth', 'jaw', 'brows', 'cheeks'];
    const count = targets.length;
    const radius = Math.min(w, h) * 0.3;
    const cx = w / 2;
    const cy = h / 2;
    const time = Date.now() * 0.001;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * 2 * Math.PI + time * 0.2;
      const ox = cx + radius * Math.cos(angle);
      const oy = cy + radius * Math.sin(angle);
      const size = 15 + 8 * Math.sin(angle + time);

      const hue = (i / count) * 360;

      ctx.beginPath();
      ctx.arc(ox, oy, size, 0, 2 * Math.PI);
      ctx.fillStyle = `hsla(${hue}, 80%, 60%, 0.25)`;
      ctx.fill();
      ctx.strokeStyle = `hsla(${hue}, 80%, 60%, 0.6)`;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(targets[i], ox, oy);
    }
  }

  /**
   * Render the main content image with transition effect.
   */
  private renderContent(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    frame: FrameData,
    transition: TransitionType,
    progress: number
  ): void {
    if (!frame.image) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const aspect = img.width / img.height;
      let drawW = w * 0.7;
      let drawH = drawW / aspect;
      if (drawH > h * 0.7) {
        drawH = h * 0.7;
        drawW = drawH * aspect;
      }

      const x = (w - drawW) / 2;
      const y = (h - drawH) / 2;

      ctx.save();

      // Apply transition transform
      switch (transition) {
        case 'fade':
          ctx.globalAlpha = progress;
          break;
        case 'slide':
          ctx.translate(w * (1 - progress), 0);
          break;
        case 'zoom': {
          const scale = 1 + (1 - progress) * 0.3;
          ctx.translate(w / 2, h / 2);
          ctx.scale(scale, scale);
          ctx.translate(-w / 2, -h / 2);
          break;
        }
        case 'flip': {
          const scaleX = Math.cos(progress * Math.PI);
          ctx.translate(w / 2, h / 2);
          ctx.scale(scaleX, 1);
          ctx.translate(-w / 2, -h / 2);
          break;
        }
        case 'morph': {
          ctx.translate(w / 2, h / 2);
          const wobble = Math.sin(progress * 4 * Math.PI) * 5;
          ctx.translate(wobble, wobble * 0.5);
          ctx.translate(-w / 2, -h / 2);
          break;
        }
        case '5d': {
          const dx = Math.sin(progress * 2 * Math.PI) * 8;
          const dy = Math.cos(progress * 2 * Math.PI) * 4;
          ctx.translate(dx, dy);
          break;
        }
      }

      ctx.drawImage(img, x, y, drawW, drawH);
      ctx.restore();
    };

    img.src = frame.image;
  }

  /**
   * Render radial depth overlay.
   */
  private renderDepthOverlay(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    frame: FrameData
  ): void {
    const gradient = ctx.createRadialGradient(
      w / 2, h / 2, 0,
      w / 2, h / 2, Math.max(w, h) / 2
    );
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, `rgba(0, 0, 0, ${0.15 + (frame.metadata.depth || 0) * 0.1})`);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
  }

  /**
   * Render mirror reflection at the bottom.
   */
  private renderReflection(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    frame: FrameData
  ): void {
    if (!frame.image) return;

    ctx.save();
    ctx.translate(w / 2, h);
    ctx.scale(1, -0.3);
    ctx.globalAlpha = 0.12;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const aspect = img.width / img.height;
      let drawW = w * 0.6;
      let drawH = drawW / aspect;
      ctx.drawImage(img, -drawW / 2, -drawH, drawW, drawH);
    };
    img.src = frame.image;

    ctx.restore();
  }

  /**
   * Capture the current canvas as a data URL.
   */
  toDataURL(type: string = 'image/png', quality: number = 0.92): string {
    return this.canvas.toDataURL(type, quality);
  }

  /**
   * Get the raw image data from the canvas.
   */
  getImageData(): ImageData {
    return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  getConfig(): FrameRenderConfig {
    return { ...this.config };
  }

  updateConfig(config: Partial<FrameRenderConfig>): void {
    this.config = { ...this.config, ...config };
  }
}
