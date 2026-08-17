import React, { useState } from 'react';
import { useCharacterStore } from '../store/characterStore';
import { YeeLatticeNoGap } from '../engines/nogap/YeeLatticeNoGap';
import {
  HairLibrary,
  ClothingLibrary,
  FacialDetailLibrary,
} from '../lib/appearanceLibrary';

export const CharacterBuilder: React.FC = () => {
  const store = useCharacterStore();
  const [nogapEngine] = useState(() => new YeeLatticeNoGap(16));
  const [isPreview, setIsPreview] = useState(false);

  const handleLatticeUpdate = () => {
    nogapEngine.updateField();
    const cells = nogapEngine.getCells();
    store.setLattice(cells);
  };

  return (
    <div className="character-builder">
      <h1>🌌 IDENTITY FORGE v2.0</h1>

      {/* ─── Identity Section ─── */}
      <section className="identity-section">
        <h2>Identity</h2>
        <div className="identity-controls">
          <label>
            Name
            <input
              type="text"
              value={store.name}
              onChange={(e) => store.setName(e.target.value)}
            />
          </label>

          <label>
            Gender
            <select
              value={store.gender}
              onChange={(e) => store.setGender(e.target.value as any)}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non-binary">Non-Binary</option>
              <option value="other">Other</option>
            </select>
          </label>

          <label>
            Heritage
            <input
              type="text"
              value={store.heritage}
              onChange={(e) => store.setHeritage(e.target.value)}
              placeholder="Universal"
            />
          </label>
        </div>
      </section>

      {/* ─── Facial Vector ─── */}
      <section className="facial-section">
        <h2>Facial Vector</h2>
        <div className="facial-controls">
          {Object.entries(store.facialVector).map(([key, value]) => (
            <label key={key}>
              {key.charAt(0).toUpperCase() + key.slice(1)}
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={value}
                onChange={(e) =>
                  store.setFacialVector(key as any, parseFloat(e.target.value))
                }
              />
              <span>{value.toFixed(2)}</span>
            </label>
          ))}
        </div>
      </section>

      {/* ─── Appearance ─── */}
      <section className="appearance-section">
        <h2>Appearance</h2>
        <div className="appearance-controls">
          <label>
            Hair Style
            <select
              value={store.appearance.hair}
              onChange={(e) => store.setAppearance('hair', e.target.value)}
            >
              {HairLibrary.map((hair) => (
                <option key={hair.id} value={hair.id}>
                  {hair.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Hair Color
            <input
              type="color"
              value={store.appearance.hairColor}
              onChange={(e) => store.setAppearance('hairColor', e.target.value)}
            />
          </label>

          <label>
            Clothing Style
            <select
              value={store.appearance.clothing}
              onChange={(e) => store.setAppearance('clothing', e.target.value)}
            >
              {ClothingLibrary.map((cloth) => (
                <option key={cloth.id} value={cloth.id}>
                  {cloth.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Clothing Color
            <input
              type="color"
              value={store.appearance.clothingColor}
              onChange={(e) =>
                store.setAppearance('clothingColor', e.target.value)
              }
            />
          </label>

          <label>
            Skin Tone
            <input
              type="color"
              value={store.appearance.skinTone}
              onChange={(e) => store.setAppearance('skinTone', e.target.value)}
            />
          </label>

          <label>
            Eye Color
            <input
              type="color"
              value={store.appearance.eyeColor}
              onChange={(e) => store.setAppearance('eyeColor', e.target.value)}
            />
          </label>
        </div>
      </section>

      {/* ─── 24-Hour Lifestyle ─── */}
      <section className="lifestyle-section">
        <h2>24-Hour Lifestyle</h2>
        <div className="lifestyle-controls">
          <label>
            Wake Time
            <input
              type="time"
              value={store.lifestyle.wakeTime}
              onChange={(e) => store.setLifestyle('wakeTime', e.target.value)}
            />
          </label>

          <label>
            Sleep Time
            <input
              type="time"
              value={store.lifestyle.sleepTime}
              onChange={(e) => store.setLifestyle('sleepTime', e.target.value)}
            />
          </label>

          <label>
            Activity Level
            <select
              value={store.lifestyle.activity}
              onChange={(e) =>
                store.setLifestyle('activity', e.target.value as any)
              }
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>

          <label>
            Occupation
            <input
              type="text"
              value={store.lifestyle.occupation}
              onChange={(e) => store.setLifestyle('occupation', e.target.value)}
              placeholder="Creator"
            />
          </label>

          <label>
            Timezone
            <input
              type="text"
              value={store.lifestyle.timezone}
              placeholder="UTC"
              onChange={(e) => store.setLifestyle('timezone', e.target.value)}
            />
          </label>
        </div>
      </section>

      {/* ─── No Gap Lattice ─── */}
      <section className="lattice-section">
        <h2>🌌 Yee Lattice · No Gap Theory</h2>
        <div className="lattice-status">
          <div className="status-item">
            <span>Cells:</span>
            <span>{store.lattice.cells.length}</span>
          </div>

          <div className="status-item">
            <span>CFL Factor:</span>
            <span>{nogapEngine.getCFLFactor().toFixed(3)}</span>
          </div>

          <div className="status-item">
            <span>Stable:</span>
            <span>{nogapEngine.isStable() ? '✅' : '❌'}</span>
          </div>

          <div className="physical-mappings">
            <h4>Physical Mappings (No Gap Theory)</h4>
            {Object.entries(nogapEngine.getPhysicalMappings()).map(
              ([key, value]) => (
                <div key={key} className="mapping">
                  <span className="key">{key}</span>
                  <span className="arrow">→</span>
                  <span className="value">{value}</span>
                </div>
              )
            )}
          </div>
        </div>

        <button onClick={handleLatticeUpdate}>
          🔄 Update Lattice Field
        </button>
      </section>

      {/* ─── Export/Import ─── */}
      <section className="export-section">
        <h2>💾 Export / Import</h2>
        <div className="export-controls">
          <button
            onClick={() => {
              const data = store.exportCharacter();
              const blob = new Blob([data], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `character-${store.name}-${Date.now()}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Export Character
          </button>

          <label className="import-button">
            Import Character
            <input
              type="file"
              accept=".json"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const data = event.target?.result as string;
                    store.importCharacter(data);
                  };
                  reader.readAsText(file);
                }
              }}
            />
          </label>
        </div>
      </section>

      {/* ─── Live Preview ─── */}
      <section className="preview-section">
        <h2>🎬 Live Preview</h2>
        <div className="preview-container">
          <div className="character-card">
            <div className="card-header">
              <span className="name">{store.name}</span>
              <span className="gender">{store.gender}</span>
            </div>

            <div className="card-body">
              <div className="facial-preview">
                {Object.entries(store.facialVector).map(([key, value]) => (
                  <div key={key} className="facial-bar">
                    <span>
                      {key.slice(0, 1).toUpperCase() + key.slice(1)}
                    </span>
                    <div className="bar">
                      <div
                        className="fill"
                        style={{ width: `${value * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="appearance-preview">
                <div className="preview-item">
                  <span>Hair:</span>
                  <span style={{ color: store.appearance.hairColor }}>
                    {store.appearance.hair}
                  </span>
                </div>
                <div className="preview-item">
                  <span>Clothing:</span>
                  <span style={{ color: store.appearance.clothingColor }}>
                    {store.appearance.clothing}
                  </span>
                </div>
                <div className="preview-item">
                  <span>Skin:</span>
                  <span>{store.appearance.skinTone}</span>
                </div>
                <div className="preview-item">
                  <span>Eyes:</span>
                  <span style={{ color: store.appearance.eyeColor }}>●</span>
                </div>
              </div>
            </div>

            <div className="card-footer">
              <div className="lifestyle-preview">
                <span>☀️ {store.lifestyle.wakeTime}</span>
                <span>🌙 {store.lifestyle.sleepTime}</span>
                <span>⚡ {store.lifestyle.activity}</span>
                <span>💼 {store.lifestyle.occupation}</span>
              </div>
              <div className="nogap-preview">
                <span>🌌 CFL: {nogapEngine.getCFLFactor().toFixed(3)}</span>
                <span>
                  {nogapEngine.isStable() ? '✅ Stable' : '⚠️ Unstable'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .character-builder {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
          color: #e8eefc;
          background: #0a0a1a;
          font-family: 'Inter', sans-serif;
        }

        section {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
        }

        h1 {
          font-size: 2rem;
          background: linear-gradient(135deg, #00e5ff, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        h2 {
          font-size: 1.2rem;
          color: #00e5ff;
          margin-bottom: 16px;
        }

        label {
          display: block;
          margin-bottom: 8px;
          color: rgba(255, 255, 255, 0.7);
        }

        input,
        select {
          width: 100%;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          color: #e8eefc;
          font-size: 14px;
          margin-top: 4px;
        }

        input[type="range"] {
          width: 100%;
          height: 4px;
          -webkit-appearance: none;
          background: linear-gradient(90deg, #00e5ff, #a78bfa);
          border-radius: 2px;
          outline: none;
        }

        input[type="color"] {
          height: 40px;
          padding: 2px;
        }

        .facial-controls label {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .facial-controls span {
          min-width: 40px;
          text-align: right;
          color: rgba(255, 255, 255, 0.5);
        }

        button {
          padding: 10px 20px;
          border: none;
          background: linear-gradient(135deg, #00e5ff, #a78bfa);
          border-radius: 8px;
          color: #0a0a1a;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        button:hover {
          transform: scale(1.02);
          box-shadow: 0 0 30px rgba(0, 229, 255, 0.3);
        }

        .export-controls {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .import-button {
          position: relative;
          overflow: hidden;
          padding: 10px 20px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          cursor: pointer;
        }

        .import-button input {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
        }

        .character-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          padding: 20px;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .name {
          font-size: 1.4rem;
          font-weight: 600;
          color: #f5d58a;
        }

        .gender {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.9rem;
        }

        .facial-preview {
          margin-bottom: 12px;
        }

        .facial-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
          font-size: 0.8rem;
        }

        .facial-bar span {
          min-width: 40px;
          color: rgba(255, 255, 255, 0.5);
        }

        .bar {
          flex: 1;
          height: 4px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 2px;
          overflow: hidden;
        }

        .fill {
          height: 100%;
          background: linear-gradient(90deg, #00e5ff, #a78bfa);
          border-radius: 2px;
          transition: width 0.3s;
        }

        .appearance-preview {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4px;
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .preview-item {
          display: flex;
          gap: 8px;
        }

        .card-footer {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.4);
        }

        .lifestyle-preview {
          display: flex;
          gap: 12px;
        }

        .nogap-preview {
          display: flex;
          gap: 12px;
        }

        .physical-mappings {
          margin-top: 12px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 8px;
        }

        .mapping {
          display: flex;
          gap: 8px;
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .mapping .key {
          color: #00e5ff;
        }

        .mapping .arrow {
          color: rgba(255, 255, 255, 0.2);
        }

        .mapping .value {
          color: #a78bfa;
        }
      `}</style>
    </div>
  );
};

export default CharacterBuilder;
