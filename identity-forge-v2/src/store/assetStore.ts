import { create } from 'zustand';

export interface AssetInfo {
  id: string;
  name: string;
  type: 'model' | 'texture' | 'animation' | 'material';
  url: string;
  size: number; // bytes
  loaded: boolean;
  loading: boolean;
  progress: number;
  error: string | null;
}

export interface AssetManifest {
  version: string;
  baseUrl: string;
  assets: AssetInfo[];
}

interface AssetStoreState {
  manifest: AssetManifest | null;
  assets: Map<string, AssetInfo>;
  baseUrl: string;
  isLoadingManifest: boolean;
  manifestError: string | null;
}

interface AssetStoreActions {
  loadManifest: (url?: string) => Promise<void>;
  loadAsset: (id: string) => Promise<void>;
  loadAllAssets: () => Promise<void>;
  unloadAsset: (id: string) => void;
  getAssetUrl: (id: string) => string | null;
  isLoaded: (id: string) => boolean;
  getLoadedCount: () => number;
  getTotalCount: () => number;
  getOverallProgress: () => number;
  reset: () => void;
}

export type AssetStore = AssetStoreState & AssetStoreActions;

const DEFAULT_MANIFEST_URL = '/assets/manifests/asset-manifest.json';

export const useAssetStore = create<AssetStore>((set, get) => ({
  manifest: null,
  assets: new Map(),
  baseUrl: '',
  isLoadingManifest: false,
  manifestError: null,

  loadManifest: async (url: string = DEFAULT_MANIFEST_URL) => {
    set({ isLoadingManifest: true, manifestError: null });
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const manifest: AssetManifest = await response.json();

      const assetMap = new Map<string, AssetInfo>();
      for (const asset of manifest.assets) {
        assetMap.set(asset.id, { ...asset, loaded: false, loading: false, progress: 0, error: null });
      }

      set({
        manifest,
        assets: assetMap,
        baseUrl: manifest.baseUrl || '',
        isLoadingManifest: false,
      });
    } catch (e: any) {
      set({ isLoadingManifest: false, manifestError: e.message || 'Failed to load manifest' });
      throw e;
    }
  },

  loadAsset: async (id: string) => {
    const asset = get().assets.get(id);
    if (!asset || asset.loaded || asset.loading) return;

    set((state) => {
      const newAssets = new Map(state.assets);
      newAssets.set(id, { ...asset, loading: true, progress: 0, error: null });
      return { assets: newAssets };
    });

    try {
      // Simulate loading progress
      for (let p = 20; p <= 100; p += 20) {
        await new Promise((r) => setTimeout(r, 80));
        set((state) => {
          const a = state.assets.get(id);
          if (!a) return state;
          const newAssets = new Map(state.assets);
          newAssets.set(id, { ...a, progress: p });
          return { assets: newAssets };
        });
      }

      set((state) => {
        const a = state.assets.get(id);
        if (!a) return state;
        const newAssets = new Map(state.assets);
        newAssets.set(id, { ...a, loaded: true, loading: false, progress: 100 });
        return { assets: newAssets };
      });
    } catch (e: any) {
      set((state) => {
        const a = state.assets.get(id);
        if (!a) return state;
        const newAssets = new Map(state.assets);
        newAssets.set(id, { ...a, loading: false, error: e.message || 'Failed to load' });
        return { assets: newAssets };
      });
    }
  },

  loadAllAssets: async () => {
    const assets = Array.from(get().assets.keys());
    for (const id of assets) {
      await get().loadAsset(id);
    }
  },

  unloadAsset: (id: string) => {
    set((state) => {
      const asset = state.assets.get(id);
      if (!asset) return state;
      const newAssets = new Map(state.assets);
      newAssets.set(id, { ...asset, loaded: false, progress: 0 });
      return { assets: newAssets };
    });
  },

  getAssetUrl: (id: string) => {
    const asset = get().assets.get(id);
    if (!asset) return null;
    return get().baseUrl + asset.url;
  },

  isLoaded: (id: string) => {
    return get().assets.get(id)?.loaded ?? false;
  },

  getLoadedCount: () => {
    let count = 0;
    for (const asset of get().assets.values()) {
      if (asset.loaded) count++;
    }
    return count;
  },

  getTotalCount: () => get().assets.size,

  getOverallProgress: () => {
    const assets = Array.from(get().assets.values());
    if (assets.length === 0) return 0;
    const total = assets.reduce((sum, a) => sum + a.progress, 0);
    return total / assets.length;
  },

  reset: () => {
    set({
      manifest: null,
      assets: new Map(),
      baseUrl: '',
      isLoadingManifest: false,
      manifestError: null,
    });
  },
}));
