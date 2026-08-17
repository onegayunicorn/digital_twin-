import { describe, it, expect } from 'vitest';
import { DigitalMirrorEngine } from '../../src/engines/mirror/DigitalMirrorEngine';
import { PictureProcessor } from '../../src/engines/mirror/PictureProcessor';
import { ReflectionFilter } from '../../src/engines/mirror/ReflectionFilter';

describe('Digital Mirror Engine', () => {
  it('processes image with reflection', () => {
    const engine = new DigitalMirrorEngine();
    const imageData = new ImageData(10, 10);
    // Set a test pixel
    imageData.data[0] = 255; // R
    imageData.data[1] = 128; // G
    imageData.data[2] = 64;  // B
    imageData.data[3] = 255; // A

    const frame = engine.processImage(imageData);
    expect(frame.id).toBeDefined();
    expect(frame.reflected).toBeDefined();
    expect(frame.reflected.width).toBe(10);
    expect(frame.reflected.height).toBe(10);
  });

  it('applies 5D reflection with depth parameter', () => {
    const engine = new DigitalMirrorEngine();
    const imageData = new ImageData(10, 10);
    const frame = engine.processImage(imageData);
    const reflected5D = engine.apply5DReflection(frame, 0.5);
    expect(reflected5D.metadata.depth).toBe(0.5);
  });

  it('stores frames with limit', () => {
    const engine = new DigitalMirrorEngine();
    engine.setMaxFrames(5);
    for (let i = 0; i < 10; i++) {
      engine.processImage(new ImageData(4, 4));
    }
    expect(engine.getFrameCount()).toBeLessThanOrEqual(5);
  });
});

describe('Picture Processor', () => {
  const processor = new PictureProcessor();

  it('generates depth map with correct length', () => {
    const imageData = new ImageData(8, 8);
    const depthMap = processor.generateDepthMap(imageData, 0.5);
    expect(depthMap.length).toBe(64);
    for (let i = 0; i < depthMap.length; i++) {
      expect(depthMap[i]).toBeGreaterThanOrEqual(0);
      expect(depthMap[i]).toBeLessThanOrEqual(0.5);
    }
  });

  it('generates reflection map with correct length', () => {
    const imageData = new ImageData(8, 8);
    const reflMap = processor.generateReflectionMap(imageData);
    expect(reflMap.length).toBe(64);
  });

  it('adjustBrightnessContrast returns valid ImageData', () => {
    const imageData = new ImageData(4, 4);
    const result = processor.adjustBrightnessContrast(imageData, 10, 1.2);
    expect(result.width).toBe(4);
    expect(result.height).toBe(4);
    // All pixels should be in [0, 255]
    for (let i = 0; i < result.data.length; i += 4) {
      for (let j = 0; j < 3; j++) {
        expect(result.data[i + j]).toBeGreaterThanOrEqual(0);
        expect(result.data[i + j]).toBeLessThanOrEqual(255);
      }
    }
  });
});

describe('Reflection Filter', () => {
  const filter = new ReflectionFilter();

  it('apply returns valid ImageData', () => {
    const imageData = new ImageData(4, 4);
    const result = filter.apply(imageData);
    expect(result.width).toBe(4);
    expect(result.height).toBe(4);
  });

  it('applyBlur returns valid ImageData', () => {
    const imageData = new ImageData(4, 4);
    const result = filter.applyBlur(imageData, 1);
    expect(result.width).toBe(4);
    expect(result.height).toBe(4);
  });

  it('detectEdges returns valid ImageData', () => {
    const imageData = new ImageData(4, 4);
    const result = filter.detectEdges(imageData);
    expect(result.width).toBe(4);
    expect(result.height).toBe(4);
  });

  it('toGrayscale removes color saturation', () => {
    const imageData = new ImageData(4, 4);
    // Set a colored pixel
    imageData.data[0] = 255;
    imageData.data[1] = 0;
    imageData.data[2] = 0;
    imageData.data[3] = 255;

    const result = filter.toGrayscale(imageData);
    // R, G, B should be equal in grayscale
    expect(result.data[0]).toBe(result.data[1]);
    expect(result.data[1]).toBe(result.data[2]);
  });

  it('invert inverts colors', () => {
    const imageData = new ImageData(4, 4);
    imageData.data[0] = 0;
    imageData.data[1] = 128;
    imageData.data[2] = 255;
    imageData.data[3] = 255;

    const result = filter.invert(imageData);
    expect(result.data[0]).toBe(255);
    expect(result.data[1]).toBe(127);
    expect(result.data[2]).toBe(0);
  });

  it('mix blends two images correctly', () => {
    const imgA = new ImageData(4, 4);
    const imgB = new ImageData(4, 4);
    imgA.data[0] = 100;
    imgB.data[0] = 200;

    const result = filter.mix(imgA, imgB, 0.5);
    expect(result.data[0]).toBeCloseTo(150, 0);
  });
});
