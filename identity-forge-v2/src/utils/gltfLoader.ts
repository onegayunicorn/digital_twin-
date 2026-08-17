import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export interface GLTFLoadResult {
  scene: THREE.Group;
  animations: THREE.AnimationClip[];
  morphTargetNames: string[];
  meshes: THREE.Mesh[];
}

/**
 * gltfLoader — Utility for loading GLTF/GLB models
 */
export class GLTFLoaderUtil {
  private loader: GLTFLoader;
  private cache: Map<string, GLTFLoadResult> = new Map();

  constructor(manager?: THREE.LoadingManager) {
    this.loader = new GLTFLoader(manager);
  }

  /**
   * Load a GLTF/GLB model from URL.
   * Returns cached result if already loaded.
   */
  async load(url: string, onProgress?: (progress: number) => void): Promise<GLTFLoadResult> {
    if (this.cache.has(url)) {
      return this.cache.get(url)!;
    }

    return new Promise((resolve, reject) => {
      this.loader.load(
        url,
        (gltf) => {
          const morphTargetNames: string[] = [];
          const meshes: THREE.Mesh[] = [];

          gltf.scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              meshes.push(mesh);
              if (mesh.morphTargetDictionary) {
                Object.keys(mesh.morphTargetDictionary).forEach((name) => {
                  if (!morphTargetNames.includes(name)) {
                    morphTargetNames.push(name);
                  }
                });
              }
            }
          });

          const result: GLTFLoadResult = {
            scene: gltf.scene,
            animations: gltf.animations || [],
            morphTargetNames,
            meshes,
          };

          this.cache.set(url, result);
          resolve(result);
        },
        (event) => {
          if (onProgress && event.total > 0) {
            onProgress(event.loaded / event.total);
          }
        },
        (error) => reject(error)
      );
    });
  }

  /**
   * Apply morph target weights to all meshes in the loaded scene.
   */
  applyMorphWeights(result: GLTFLoadResult, weights: Record<string, number>): void {
    for (const mesh of result.meshes) {
      if (!mesh.morphTargetDictionary || !mesh.morphTargetInfluences) continue;

      for (const [name, value] of Object.entries(weights)) {
        const index = mesh.morphTargetDictionary[name];
        if (index !== undefined) {
          mesh.morphTargetInfluences[index] = Math.max(0, Math.min(1, value));
        }
      }
    }
  }

  /**
   * Get morph target names from a loaded result.
   */
  getMorphTargetNames(result: GLTFLoadResult): string[] {
    return [...result.morphTargetNames];
  }

  /**
   * Check if a URL is already cached.
   */
  isCached(url: string): boolean {
    return this.cache.has(url);
  }

  /**
   * Clear the cache.
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cached result or null.
   */
  getCached(url: string): GLTFLoadResult | null {
    return this.cache.get(url) || null;
  }
}

// Singleton instance for convenience
export const defaultGLTFLoader = new GLTFLoaderUtil();
