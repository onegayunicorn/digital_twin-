export interface AssetManifestEntry {
  id: string;
  name: string;
  type: 'model' | 'texture' | 'animation' | 'material';
  url: string;
  size: number; // bytes
  hash?: string;
  description?: string;
}

export interface AssetManifest {
  version: string;
  baseUrl: string;
  generatedAt: string;
  assets: AssetManifestEntry[];
}

const DEFAULT_MANIFEST: AssetManifest = {
  version: '2.0.0',
  baseUrl: '',
  generatedAt: new Date().toISOString(),
  assets: [
    {
      id: 'base-character',
      name: 'Base Character Model',
      type: 'model',
      url: '/models/base-character.glb',
      size: 2516582, // ~2.4 MB
      description: 'Base character mesh with armature',
    },
    {
      id: 'morph-targets',
      name: 'Morph Targets Pack',
      type: 'model',
      url: '/models/morph-targets.glb',
      size: 1887437, // ~1.8 MB
      description: 'Facial morph targets: eyes, nose, mouth, jaw, brows, cheeks',
    },
    {
      id: 'heritage-material',
      name: 'Heritage Material Pack',
      type: 'material',
      url: '/models/heritage-material.glb',
      size: 933233, // ~890 KB
      description: 'Premium PBR materials for heritage characters',
    },
  ],
};

/**
 * assetManifest — Utility for loading and managing asset manifests
 */
export class AssetManifestManager {
  private manifest: AssetManifest | null = null;
  private baseUrl: string = '';

  /**
   * Load manifest from URL or use default.
   */
  async load(url?: string): Promise<AssetManifest> {
    if (url) {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        this.manifest = await response.json();
      } catch (e) {
        console.warn('Failed to load manifest, using default:', e);
        this.manifest = { ...DEFAULT_MANIFEST };
      }
    } else {
      this.manifest = { ...DEFAULT_MANIFEST };
    }
    this.baseUrl = this.manifest.baseUrl || '';
    return this.manifest;
  }

  /**
   * Get manifest (must be loaded first).
   */
  getManifest(): AssetManifest | null {
    return this.manifest;
  }

  /**
   * Get all assets.
   */
  getAssets(): AssetManifestEntry[] {
    return this.manifest?.assets || [];
  }

  /**
   * Get asset by ID.
   */
  getAsset(id: string): AssetManifestEntry | undefined {
    return this.manifest?.assets.find((a) => a.id === id);
  }

  /**
   * Get full URL for an asset.
   */
  getAssetUrl(id: string): string | null {
    const asset = this.getAsset(id);
    if (!asset) return null;
    return this.baseUrl + asset.url;
  }

  /**
   * Get assets by type.
   */
  getAssetsByType(type: AssetManifestEntry['type']): AssetManifestEntry[] {
    return this.manifest?.assets.filter((a) => a.type === type) || [];
  }

  /**
   * Get total size of all assets in bytes.
   */
  getTotalSize(): number {
    return this.manifest?.assets.reduce((sum, a) => sum + a.size, 0) || 0;
  }

  /**
   * Get default manifest.
   */
  getDefault(): AssetManifest {
    return { ...DEFAULT_MANIFEST };
  }

  /**
   * Format bytes to human-readable string.
   */
  static formatBytes(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}

export default AssetManifestManager;
