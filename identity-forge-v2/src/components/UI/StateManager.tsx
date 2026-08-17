import React from 'react';

interface StateSnapshot {
  timestamp: number;
  label: string;
  data: any;
}

interface StateManagerProps {
  snapshots: StateSnapshot[];
  onSaveSnapshot: (label: string) => void;
  onRestoreSnapshot: (snapshot: StateSnapshot) => void;
  onDeleteSnapshot: (timestamp: number) => void;
  onReset: () => void;
  currentState?: any;
}

/**
 * StateManager — Manage state snapshots for undo/restore
 */
export const StateManager: React.FC<StateManagerProps> = ({
  snapshots,
  onSaveSnapshot,
  onRestoreSnapshot,
  onDeleteSnapshot,
  onReset,
}) => {
  const [label, setLabel] = React.useState('');

  const handleSave = () => {
    const saveLabel = label.trim() || `Snapshot ${snapshots.length + 1}`;
    onSaveSnapshot(saveLabel);
    setLabel('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#94a3b8', letterSpacing: 1 }}>
        STATE MANAGER
      </div>

      {/* Save */}
      <div style={{ display: 'flex', gap: 6 }}>
        <input
          type="text"
          placeholder="Snapshot label..."
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          style={{
            flex: 1,
            padding: '6px 10px',
            fontSize: 11,
            fontFamily: 'monospace',
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: 4,
            color: '#e2e8f0',
            outline: 'none',
          }}
        />
        <button onClick={handleSave} style={saveBtnStyle}>
          💾 Save
        </button>
      </div>

      {/* Snapshots list */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          maxHeight: 160,
          overflowY: 'auto',
        }}
      >
        {snapshots.length === 0 && (
          <div
            style={{
              padding: 16,
              textAlign: 'center',
              fontSize: 11,
              fontFamily: 'monospace',
              color: '#64748b',
              border: '1px dashed rgba(148, 163, 184, 0.2)',
              borderRadius: 4,
            }}
          >
            No snapshots saved
          </div>
        )}

        {snapshots.map((snap) => (
          <div
            key={snap.timestamp}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 10px',
              background: 'rgba(15, 23, 42, 0.4)',
              border: '1px solid rgba(148, 163, 184, 0.1)',
              borderRadius: 4,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {snap.label}
              </div>
              <div style={{ fontSize: 9, fontFamily: 'monospace', color: '#64748b' }}>
                {new Date(snap.timestamp).toLocaleString()}
              </div>
            </div>
            <button
              onClick={() => onRestoreSnapshot(snap)}
              style={iconBtnStyle('#34d399')}
              title="Restore"
            >
              ↺
            </button>
            <button
              onClick={() => onDeleteSnapshot(snap.timestamp)}
              style={iconBtnStyle('#f87171')}
              title="Delete"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Reset */}
      <button
        onClick={onReset}
        style={{
          padding: '6px 12px',
          fontSize: 11,
          fontFamily: 'monospace',
          background: 'rgba(248, 113, 113, 0.1)',
          border: '1px solid rgba(248, 113, 113, 0.3)',
          borderRadius: 4,
          color: '#f87171',
          cursor: 'pointer',
        }}
      >
        🔄 Reset to Default
      </button>
    </div>
  );
};

const saveBtnStyle: React.CSSProperties = {
  padding: '6px 12px',
  fontSize: 11,
  fontFamily: 'monospace',
  background: 'rgba(167, 139, 250, 0.15)',
  border: '1px solid rgba(167, 139, 250, 0.4)',
  borderRadius: 4,
  color: '#a78bfa',
  cursor: 'pointer',
};

const iconBtnStyle = (color: string): React.CSSProperties => ({
  width: 24,
  height: 24,
  fontSize: 12,
  background: 'transparent',
  border: `1px solid ${color}44`,
  borderRadius: 4,
  color,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
});

export default StateManager;
