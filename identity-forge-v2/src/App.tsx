import React, { useState, useEffect } from 'react';
import { Scene3D } from './components/Viewport/Scene3D';
import { CharacterEditor } from './components/Editor/CharacterEditor';
import { DigitalMirror } from './components/Mirror/DigitalMirror';
import { AnimationSequencer } from './components/Editor/AnimationSequencer';
import { ExportImport } from './components/UI/ExportImport';
import { StateManager } from './components/UI/StateManager';
import { AssetLoader } from './components/UI/AssetLoader';
import { useCharacterStore } from './store/characterStore';
import { YeeLatticeEngine } from './engines/reflection/YeeLatticeEngine';
import { SlideSequencer } from './engines/animation/SlideSequencer';
import { FrameData } from './core/types';
import './styles/global.css';

type ActiveTab = 'editor' | 'mirror' | 'animation' | 'assets' | 'state';

const App: React.FC = () => {
  const { state, setMorphWeight, setAppearance, setYeeLattice, setSlideFrames, setName, exportCharacter, importCharacter, reset } = useCharacterStore();
  const [lattice, setLattice] = useState<any[]>([]);
  const [slides, setSlides] = useState<FrameData[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('editor');
  const [snapshots, setSnapshots] = useState<{ timestamp: number; label: string; data: any }[]>([]);

  // Initialize Yee Lattice and Slide Sequencer
  useEffect(() => {
    const engine = new YeeLatticeEngine();
    const points = engine.generateLattice();
    setLattice(points);
    setYeeLattice(points.map((p) => ({
      position: [p.x, p.y, p.z, p.w, p.v] as const,
      morphId: p.morphId,
      intensity: p.intensity,
      weight: p.weight,
    })));

    const sequencer = new SlideSequencer();
    const defaultFrames: FrameData[] = [
      { id: 'frame-1', image: '', duration: 1.0, transition: '5d', metadata: { x: 0, y: 0, z: 0, w: 0, v: 0, depth: 0, reflection: 0.8 } },
      { id: 'frame-2', image: '', duration: 1.0, transition: '5d', metadata: { x: 0.5, y: 0.3, z: 0.2, w: 0.1, v: 0.4, depth: 0.3, reflection: 0.6 } },
      { id: 'frame-3', image: '', duration: 1.0, transition: '5d', metadata: { x: -0.3, y: 0.5, z: -0.2, w: 0.4, v: -0.1, depth: 0.6, reflection: 0.9 } },
    ];
    const animation = sequencer.createAnimation('default', defaultFrames, { fps: 30, loop: true, transitionStyle: '5d' });
    setSlides(animation.frames);
    setSlideFrames(animation.frames);
  }, [setYeeLattice, setSlideFrames]);

  const handleMorphChange = (key: string, value: number) => {
    setMorphWeight(key, value);
  };

  const handleAppearanceChange = (key: string, value: any) => {
    setAppearance(key, value);
  };

  const handleSaveSnapshot = (label: string) => {
    setSnapshots((prev) => [
      ...prev,
      { timestamp: Date.now(), label, data: JSON.parse(exportCharacter()) },
    ]);
  };

  const handleRestoreSnapshot = (snap: { timestamp: number; label: string; data: any }) => {
    importCharacter(JSON.stringify(snap.data));
  };

  const handleDeleteSnapshot = (timestamp: number) => {
    setSnapshots((prev) => prev.filter((s) => s.timestamp !== timestamp));
  };

  const handleFramesChange = (frames: FrameData[]) => {
    setSlides(frames);
    setSlideFrames(frames);
  };

  const tabs: { id: ActiveTab; label: string }[] = [
    { id: 'editor', label: 'Editor' },
    { id: 'mirror', label: 'Mirror' },
    { id: 'animation', label: 'Animation' },
    { id: 'assets', label: 'Assets' },
    { id: 'state', label: 'State' },
  ];

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>IDENTITY FORGE v2.0</h1>
        <div className="header-controls">
          <button onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>
          <button onClick={reset}>🔄 Reset</button>
        </div>
      </header>

      <div className="main-layout">
        {/* Viewport */}
        <div className="viewport-container">
          <Scene3D
            morphWeights={state.morphWeights}
            reflectionIntensity={state.reflection.intensity}
            animationFrame={state.animation.currentFrame}
            yeeLattice={state.yeeLattice}
            slideFrames={slides}
          />

          {/* HUD Overlay */}
          <div className="hud-overlay">
            <div className="hud-item">
              LATTICE<span className="value">{lattice.length.toLocaleString()} pts</span>
            </div>
            <div className="hud-item">
              MORPHS<span className="value">{Object.keys(state.morphWeights).length}</span>
            </div>
            <div className="hud-item">
              FRAMES<span className="value">{slides.length}</span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="sidebar">
          {/* Tab Navigation */}
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '6px 12px',
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                  background:
                    activeTab === tab.id
                      ? 'rgba(167, 139, 250, 0.2)'
                      : 'rgba(15, 23, 42, 0.5)',
                  border:
                    activeTab === tab.id
                      ? '1px solid rgba(167, 139, 250, 0.5)'
                      : '1px solid rgba(148, 163, 184, 0.15)',
                  borderRadius: 6,
                  color: activeTab === tab.id ? '#a78bfa' : '#94a3b8',
                  cursor: 'pointer',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'editor' && (
            <CharacterEditor
              morphWeights={state.morphWeights}
              onMorphChange={handleMorphChange}
              characterName={state.name}
              onNameChange={setName}
              appearance={state.appearance}
              onAppearanceChange={handleAppearanceChange}
            />
          )}

          {activeTab === 'mirror' && <DigitalMirror width={340} height={220} />}

          {activeTab === 'animation' && (
            <AnimationSequencer
              frames={slides}
              onFramesChange={handleFramesChange}
              isPlaying={isPlaying}
              onPlay={() => setIsPlaying(true)}
              onStop={() => setIsPlaying(false)}
            />
          )}

          {activeTab === 'assets' && <AssetLoader />}

          {activeTab === 'state' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <ExportImport onExport={exportCharacter} onImport={importCharacter} label="Character" />
              <StateManager
                snapshots={snapshots}
                onSaveSnapshot={handleSaveSnapshot}
                onRestoreSnapshot={handleRestoreSnapshot}
                onDeleteSnapshot={handleDeleteSnapshot}
                onReset={reset}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
