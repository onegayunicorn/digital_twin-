/**
 * PICTURE PROCESSOR
 * Identity Forge v2.0 — Convert pictures to 5D reflection grid
 *
 * Processes images into:
 * - Depth maps (brightness-based)
 * - Reflection maps (edge-based)
 * - Picture stacks for slide animations
 *
 * All maps normalized to [0, 1].
 */

import { PictureData, clamp } from '../../core/types';

export class PictureProcessor {
  private pictures: Map<string, PictureData> = new Map();
  private maxPictures: number = 100;

  /**
   * Process an HTML image into depth/reflection maps.
   */
  async processPicture(
    image: HTMLImageElement,
    depth: number = 0.5
  ): Promise<PictureData> {
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth || image.width;
    canvas.height = image.naturalHeight || image.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Generate maps
    const depthMap = this.generateDepthMap(imageData, depth);
    const reflectionMap = this.generateReflectionMap(imageData);

    const picture: PictureData = {
      id: `pic-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      image,
      processed: imageData,
      depthMap,
      reflectionMap,
      metadata: {
        width: canvas.width,
        height: canvas.height,
        depth: clamp(depth, 0, 1),
        reflection: 0.8,
        timestamp: Date.now(),
      },
    };

    this.storePicture(picture);
    return picture;
  }

  /**
   * Generate depth map from image brightness.
   * Brighter pixels = closer (higher depth value).
   *
   * depth(x,y) = (brightness(x,y) / 255) * max_depth
   */
  generateDepthMap(imageData: ImageData, maxDepth: number): Float32Array {
    const { width, height, data } = imageData;
    const depthMap = new Float32Array(width * height);

    for (let i = 0; i < width * height; i++) {
      const idx = i * 4;
      const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
      depthMap[i] = (brightness / 255) * clamp(maxDepth, 0, 1);
    }

    return depthMap;
  }

  /**
   * Generate reflection map based on edge detection.
   * Edges = high reflection potential.
   *
   * Uses Sobel operator approximation.
   */
  generateReflectionMap(imageData: ImageData): Float32Array {
    const { width, height, data } = imageData;
    const reflectionMap = new Float32Array(width * height);

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;

        // Get neighboring pixel brightness
        const getBrightness = (ox: number, oy: number): number => {
          const nidx = ((y + oy) * width + (x + ox)) * 4;
          return (data[nidx] + data[nidx + 1] + data[nidx + 2]) / 3;
        };

        // Sobel-like gradient
        const gx =
          -getBrightness(-1, -1) + getBrightness(1, -1) +
          -2 * getBrightness(-1, 0) + 2 * getBrightness(1, 0) +
          -getBrightness(-1, 1) + getBrightness(1, 1);

        const gy =
          -getBrightness(-1, -1) - 2 * getBrightness(0, -1) - getBrightness(1, -1) +
          getBrightness(-1, 1) + 2 * getBrightness(0, 1) + getBrightness(1, 1);

        const magnitude = Math.sqrt(gx * gx + gy * gy);
        reflectionMap[y * width + x] = Math.min(1, magnitude / 255);
      }
    }

    return reflectionMap;
  }

  /**
   * Apply histogram equalization to improve contrast.
   */
  equalizeHistogram(imageData: ImageData): ImageData {
    const { width, height, data } = imageData;
    const result = new ImageData(
      new Uint8ClampedArray(data),
      width,
      height
    );

    // Compute grayscale histogram
    const histogram = new Array(256).fill(0);
    for (let i = 0; i < width * height; i++) {
      const idx = i * 4;
      const gray = Math.round(
        0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]
      );
      histogram[gray]++;
    }

    // Compute CDF and lookup table
    const cdf = new Array(256).fill(0);
    cdf[0] = histogram[0];
    for (let i = 1; i < 256; i++) {
      cdf[i] = cdf[i - 1] + histogram[i];
    }

    const totalPixels = width * height;
    const lut = new Array(256).fill(0);
    const cdfMin = cdf.find(v => v > 0) || 0;

    for (let i = 0; i < 256; i++) {
      lut[i] = Math.round(
        ((cdf[i] - cdfMin) / (totalPixels - cdfMin)) * 255
      );
    }

    // Apply equalization to each channel
    for (let i = 0; i < width * height; i++) {
      const idx = i * 4;
      result.data[idx] = lut[result.data[idx]];
      result.data[idx + 1] = lut[result.data[idx + 1]];
      result.data[idx + 2] = lut[result.data[idx + 2]];
    }

    return result;
  }

  /**
   * Adjust brightness and contrast.
   * output = (input - 128) * contrast + 128 + brightness
   *
   * Result clamped to [0, 255].
   */
  adjustBrightnessContrast(
    imageData: ImageData,
    brightness: number,
    contrast: number
  ): ImageData {
    const { width, height, data } = imageData;
    const result = new ImageData(
      new Uint8ClampedArray(data),
      width,
      height
    );

    const b = clamp(brightness, -255, 255);
    const c = clamp(contrast, 0.1, 3);

    for (let i = 0; i < width * height; i++) {
      const idx = i * 4;
      for (let ch = 0; ch < 3; ch++) {
        result.data[idx + ch] = clamp(
          (result.data[idx + ch] - 128) * c + 128 + b,
          0,
          255
        );
      }
    }

    return result;
  }

  /**
   * Stack multiple pictures into an ordered sequence.
   * Used for slide animation creation.
   */
  stackPictures(pictureIds: string[]): PictureData[] {
    const result: PictureData[] = [];
    for (const id of pictureIds) {
      const pic = this.pictures.get(id);
      if (pic) result.push(pic);
    }
    return result;
  }

  /**
   * Create a slide transition sequence from picture IDs.
   * Assigns depth/reflection metadata based on position in sequence.
   */
  createSlideTransition(pictureIds: string[], baseDuration: number = 1.0): PictureData[] {
    const result: PictureData[] = [];
    const count = pictureIds.length;

    for (let i = 0; i < count; i++) {
      const pic = this.pictures.get(pictureIds[i]);
      if (pic) {
        // Vary depth and reflection based on position
        pic.metadata.depth = i / Math.max(1, count - 1);
        pic.metadata.reflection = 0.5 + 0.5 * Math.sin(i * 0.5);
        result.push(pic);
      }
    }

    return result;
  }

  private storePicture(picture: PictureData): void {
    this.pictures.set(picture.id, picture);
    if (this.pictures.size > this.maxPictures) {
      const oldest = this.pictures.keys().next().value;
      if (oldest) this.pictures.delete(oldest);
    }
  }

  getPicture(id: string): PictureData | undefined {
    return this.pictures.get(id);
  }

  getAllPictures(): PictureData[] {
    return Array.from(this.pictures.values());
  }

  getPictureCount(): number {
    return this.pictures.size;
  }

  deletePicture(id: string): boolean {
    return this.pictures.delete(id);
  }

  clearPictures(): void {
    this.pictures.clear();
  }

  setMaxPictures(max: number): void {
    this.maxPictures = Math.max(1, max);
  }
}
