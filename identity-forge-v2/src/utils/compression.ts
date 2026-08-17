/**
 * compression — Lightweight compression utilities for JSON exports
 * Uses base64 encoding and simple run-length encoding for data reduction.
 */

/**
 * Compress a JSON object to a base64 string.
 */
export function compressJSON(obj: any): string {
  try {
    const json = JSON.stringify(obj);
    // Use UTF-8 safe encoding
    const bytes = new TextEncoder().encode(json);
    let binary = '';
    const chunkSize = 0x8000; // 32KB chunks to avoid stack overflow
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode.apply(null, Array.from(chunk) as any);
    }
    return btoa(binary);
  } catch (e) {
    console.error('Compression failed:', e);
    return '';
  }
}

/**
 * Decompress a base64 string back to a JSON object.
 */
export function decompressJSON<T = any>(compressed: string): T | null {
  try {
    const binary = atob(compressed);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json) as T;
  } catch (e) {
    console.error('Decompression failed:', e);
    return null;
  }
}

/**
 * Simple run-length encoding for float arrays.
 * Groups consecutive equal values.
 */
export function encodeRLE(values: number[], tolerance: number = 1e-6): Array<[number, number]> {
  if (values.length === 0) return [];

  const result: Array<[number, number]> = [];
  let currentValue = values[0];
  let count = 1;

  for (let i = 1; i < values.length; i++) {
    if (Math.abs(values[i] - currentValue) <= tolerance) {
      count++;
    } else {
      result.push([currentValue, count]);
      currentValue = values[i];
      count = 1;
    }
  }
  result.push([currentValue, count]);

  return result;
}

/**
 * Decode run-length encoded data back to float array.
 */
export function decodeRLE(encoded: Array<[number, number]>): number[] {
  const result: number[] = [];
  for (const [value, count] of encoded) {
    for (let i = 0; i < count; i++) {
      result.push(value);
    }
  }
  return result;
}

/**
 * Estimate compression ratio.
 */
export function estimateCompressionRatio(original: string, compressed: string): number {
  if (original.length === 0) return 0;
  return 1 - compressed.length / original.length;
}

/**
 * Serialize a Float32Array to a compact string format.
 */
export function serializeFloat32Array(arr: Float32Array): string {
  return Array.from(arr).map((v) => v.toFixed(4)).join(',');
}

/**
 * Deserialize a compact string back to Float32Array.
 */
export function deserializeFloat32Array(str: string): Float32Array {
  if (!str.trim()) return new Float32Array();
  const values = str.split(',').map((v) => parseFloat(v.trim()));
  return new Float32Array(values);
}

/**
 * Deep clone an object using JSON (safe for simple data).
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Hash a string to a short identifier (non-cryptographic).
 */
export function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
}
