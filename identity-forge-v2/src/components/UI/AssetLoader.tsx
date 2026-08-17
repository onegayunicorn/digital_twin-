import React, { useState } from 'react';

export interface AssetItem {
  id: string;
  name: string;
  type: 'model' | 'texture' | 'animation' | 'material';
  url: string;
  size: string;
  loaded: boolean;
  progress: number;
}

interface AssetLoaderProps {
  assets?: AssetItem[];
  onLoadAsset?: (asset: AssetItem) => Promise<void>;
  onLoadAll?: () => Promise<void>;
  baseUrl?: string;
}

const DEFAULT_ASSETS: AssetItem[] = [
  { id: 'base-char', name: 'Base Character', type: 'model', url: '/models/base-character.glb', size: '2.4 MB', loaded: false, progress: 0 },
  { id: 'morph-targets', name: 'Morph Targets', type: 'model', url: '/models/morph-targets.glb', size: '1.8 MB', loaded: false, progress: 0 },
  { id: 'heritage-mat', name: 'Heritage Material', type: 'material', url: '/models/heritage-material.glb', size: '890 KB', loaded: false, progress: 0 },
];

/**
 * AssetLoader — Load and manage external assets (models, textures, etc.)
 */
export const AssetLoader: React.FC<AssetLoaderProps> = ({
  assets = DEFAULT_ASSETS,
  onLoadAsset,
  onLoadAll,
  baseUrl = '',
}) => {
  const [assetList, setAssetList] = useState<AssetItem[]>(assets);
  const [isLoading, setIsLoading] = useState(false);

  const loadAsset = async (asset: AssetItem) => {
    setIsLoading(true);
    setAssetList((prev) =>
      prev.map((a) => (a.id === asset.id ? { ...a, progress: 0 } : a))
    );

    // Simulate loading with progress
    for (let p = 10; p <= 100; p += 20) {
      await new Promise((r) => setTimeout(r, 100));
      setAssetList((prev) =>
        prev.map((a) => (a.id === asset.id ? { ...a, progress: p } : a))
      );
    }

    if (onLoadAsset) {
      try {
        await onLoadAsset({ ...asset, url: baseUrl + asset.url });
      } catch (e) {
        console.warn(`Failed to load asset ${asset.id}:`, e);
      }
    }

    setAssetList((prev) =>
      prev.map((a) => (a.id === asset.id ? { ...a, loaded: true, progress: 100 } : a))
    );
    setIsLoading(false);
  };

  const loadAll = async () => {
    if (onLoadAll) {
      await onLoadAll();
    }
    for (const asset of assetList) {
      if (!asset.loaded) {
        await loadAsset(asset);
      }
    }
  };

  const totalLoaded = assetList.filter((a) => a.loaded).length;
  const totalProgress =
    assetList.reduce((sum, a) => sum + a.progress, 0) / assetList.length;

  const typeColors: Record<string, string> = {
    model: '#00e5ff',
    texture: '#34d399',
    animation: '#a78bfa',
    material: '#fbbf24',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#94a3b8', letterSpacing: 1 }}>
          ASSET LOADER
        </div>
        <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#64748b' }}>
          {totalLoaded}/{assetList.length} loaded
        </div>
      </div>

      {/* Overall progress */}
      <div
        style={{
          height: 4,
          background: 'rgba(148, 163, 184, 0.1)',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${totalProgress}%`,
            background: 'linear-gradient(90deg, #00e5ff, #a78bfa)',
            transition: 'width 0.2s ease',
          }}
        />
      </div>

      {/* Asset list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {assetList.map((asset) => (
          <div
            key={asset.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 10px',
              background: 'rgba(15, 23, 42, 0.4)',
              border: `1px solid ${
                asset.loaded ? 'rgba(52, 211, 153, 0.3)' : 'rgba(148, 163, 184, 0.1)'
              }`,
              borderRadius: 6,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: `${typeColors[asset.type]}22`,
                border: `1px solid ${typeColors[asset.type]}44`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                flexShrink: 0,
              }}
            >
              {asset.type === 'model' && '🧊'}
              {asset.type === 'texture' && '🎨'}
              {asset.type === 'animation' && '🎬'}
              {asset.type === 'material' && '✨'}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 12,
                  color: '#e2e8f0',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {asset.name}
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span
                  style={{
                    fontSize: 9,
                    fontFamily: 'monospace',
                    color: typeColors[asset.type],
                    textTransform: 'uppercase',
                  }}
                >
                  {asset.type}
                </span>
                <span style={{ fontSize: 9, fontFamily: 'monospace', color: '#64748b' }}>
                  {asset.size}
                </span>
              </div>

              {/* Progress bar */}
              {!asset.loaded && asset.progress > 0 && (
                <div
                  style={{
                    height: 2,
                    background: 'rgba(148, 163, 184, 0.1)',
                    borderRadius: 1,
                    marginTop: 4,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${asset.progress}%`,
                      background: typeColors[asset.type],
                      transition: 'width 0.1s ease',
                    }}
                  />
                </div>
              )}
            </div>

            {asset.loaded ? (
              <span style={{ fontSize: 12, color: '#34d399' }}>✓</span>
            ) : (
              <button
                onClick={() => loadAsset(asset)}
                disabled={isLoading}
                style={{
                  padding: '4px 10px',
                  fontSize: 10,
                  fontFamily: 'monospace',
                  background: 'rgba(0, 229, 255, 0.15)',
                  border: '1px solid rgba(0, 229, 255, 0.4)',
                  borderRadius: 4,
                  color: '#00e5ff',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.5 : 1,
                }}
              >
                Load
              </button>
            )}
          </div>
        ))}
      </div>

      {totalLoaded < assetList.length && (
        <button
          onClick={loadAll}
          disabled={isLoading}
          style={{
            padding: '8px 14px',
            fontSize: 12,
            fontFamily: 'monospace',
            background: 'rgba(167, 139, 250, 0.15)',
            border: '1px solid rgba(167, 139, 250, 0.4)',
            borderRadius: 6,
            color: '#a78bfa',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.5 : 1,
          }}
        >
          {isLoading ? 'Loading...' : '⬇ Load All Assets'}
        </button>
      )}
    </div>
  );
};

export default AssetLoader;
