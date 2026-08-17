import React, { useRef, useState } from 'react';

interface ExportImportProps {
  onExport: () => string;
  onImport: (data: string) => void;
  label?: string;
}

/**
 * ExportImport — JSON export/import controls for character state
 */
export const ExportImport: React.FC<ExportImportProps> = ({
  onExport,
  onImport,
  label = 'Character',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string>('');

  const handleExport = () => {
    try {
      const data = onExport();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${label.toLowerCase()}-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setStatus(`✓ ${label} exported`);
      setTimeout(() => setStatus(''), 2000);
    } catch (e) {
      setStatus(`✗ Export failed`);
      setTimeout(() => setStatus(''), 2000);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result as string;
        onImport(data);
        setStatus(`✓ ${label} imported`);
        setTimeout(() => setStatus(''), 2000);
      } catch (err) {
        setStatus(`✗ Import failed: invalid file`);
        setTimeout(() => setStatus(''), 3000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleCopyToClipboard = async () => {
    try {
      const data = onExport();
      await navigator.clipboard.writeText(data);
      setStatus('✓ Copied to clipboard');
      setTimeout(() => setStatus(''), 2000);
    } catch (e) {
      setStatus('✗ Copy failed');
      setTimeout(() => setStatus(''), 2000);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#94a3b8', letterSpacing: 1 }}>
        EXPORT / IMPORT
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={handleExport} style={primaryBtnStyle}>
          ⬇ Export {label}
        </button>
        <button onClick={handleImportClick} style={secondaryBtnStyle}>
          ⬆ Import {label}
        </button>
        <button onClick={handleCopyToClipboard} style={secondaryBtnStyle}>
          📋 Copy
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {status && (
        <div
          style={{
            fontSize: 11,
            fontFamily: 'monospace',
            color: status.startsWith('✓') ? '#34d399' : '#f87171',
          }}
        >
          {status}
        </div>
      )}
    </div>
  );
};

const primaryBtnStyle: React.CSSProperties = {
  padding: '8px 14px',
  fontSize: 12,
  fontFamily: 'monospace',
  background: 'rgba(0, 229, 255, 0.15)',
  border: '1px solid rgba(0, 229, 255, 0.4)',
  borderRadius: 6,
  color: '#00e5ff',
  cursor: 'pointer',
};

const secondaryBtnStyle: React.CSSProperties = {
  padding: '8px 14px',
  fontSize: 12,
  fontFamily: 'monospace',
  background: 'rgba(148, 163, 184, 0.1)',
  border: '1px solid rgba(148, 163, 184, 0.25)',
  borderRadius: 6,
  color: '#94a3b8',
  cursor: 'pointer',
};

export default ExportImport;
