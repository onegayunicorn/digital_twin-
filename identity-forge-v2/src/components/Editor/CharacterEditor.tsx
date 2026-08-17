import React from 'react';
import { MorphWeights } from '../../core/types';
import { MorphTargets } from '../Viewport/MorphTargets';

interface CharacterEditorProps {
  morphWeights: MorphWeights;
  onMorphChange: (target: string, value: number) => void;
  characterName?: string;
  onNameChange?: (name: string) => void;
  appearance?: {
    hair: string;
    clothing: string;
    skinTone: string;
  };
  onAppearanceChange?: (key: string, value: any) => void;
}

const HAIR_OPTIONS = ['default', 'short', 'long', 'curly', 'spiky', 'bald'];
const CLOTHING_OPTIONS = ['default', 'casual', 'formal', 'armor', 'robe', 'uniform'];
const SKIN_TONES = [
  { name: 'Fair', value: '#f5e6d3' },
  { name: 'Light', value: '#e8d5c0' },
  { name: 'Medium', value: '#c9a882' },
  { name: 'Tan', value: '#a67c52' },
  { name: 'Dark', value: '#6b4423' },
  { name: 'Deep', value: '#3d2817' },
];

/**
 * CharacterEditor — Main character customization interface
 * Combines morph target controls with appearance options
 */
export const CharacterEditor: React.FC<CharacterEditorProps> = ({
  morphWeights,
  onMorphChange,
  characterName = 'Character',
  onNameChange,
  appearance = { hair: 'default', clothing: 'default', skinTone: '#e8d5c0' },
  onAppearanceChange,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          paddingBottom: 12,
          borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${appearance.skinTone}, #a78bfa)`,
            border: '2px solid rgba(167, 139, 250, 0.4)',
          }}
        />
        <div style={{ flex: 1 }}>
          <input
            value={characterName}
            onChange={(e) => onNameChange?.(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#e2e8f0',
              fontSize: 16,
              fontWeight: 600,
              fontFamily: 'inherit',
              width: '100%',
              outline: 'none',
            }}
          />
          <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#64748b' }}>
            CHARACTER EDITOR
          </div>
        </div>
      </div>

      {/* Morph Targets */}
      <div>
        <MorphTargets
          weights={morphWeights}
          onChange={onMorphChange}
          showNormalized={true}
        />
      </div>

      {/* Appearance */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          padding: 12,
          background: 'rgba(15, 23, 42, 0.4)',
          borderRadius: 8,
          border: '1px solid rgba(148, 163, 184, 0.1)',
        }}
      >
        <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#94a3b8', letterSpacing: 1 }}>
          APPEARANCE
        </div>

        {/* Hair */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 11, color: '#cbd5e1' }}>Hair</label>
          <select
            value={appearance.hair}
            onChange={(e) => onAppearanceChange?.('hair', e.target.value)}
            style={selectStyle}
          >
            {HAIR_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Clothing */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 11, color: '#cbd5e1' }}>Clothing</label>
          <select
            value={appearance.clothing}
            onChange={(e) => onAppearanceChange?.('clothing', e.target.value)}
            style={selectStyle}
          >
            {CLOTHING_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Skin Tone */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 11, color: '#cbd5e1' }}>Skin Tone</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {SKIN_TONES.map((tone) => (
              <button
                key={tone.value}
                onClick={() => onAppearanceChange?.('skinTone', tone.value)}
                title={tone.name}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: tone.value,
                  border:
                    appearance.skinTone === tone.value
                      ? '2px solid #00e5ff'
                      : '2px solid rgba(148, 163, 184, 0.3)',
                  cursor: 'pointer',
                  padding: 0,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const selectStyle: React.CSSProperties = {
  padding: '6px 10px',
  fontSize: 12,
  fontFamily: 'monospace',
  background: 'rgba(15, 23, 42, 0.8)',
  border: '1px solid rgba(148, 163, 184, 0.2)',
  borderRadius: 4,
  color: '#e2e8f0',
  cursor: 'pointer',
};

export default CharacterEditor;
