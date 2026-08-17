import React from 'react';

interface AppearanceItem {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  tags: string[];
}

interface AppearanceLibraryProps {
  items?: AppearanceItem[];
  onSelect?: (item: AppearanceItem) => void;
  selectedId?: string;
  categories?: string[];
}

const DEFAULT_CATEGORIES = ['All', 'Hair', 'Face', 'Clothing', 'Accessories', 'Material'];

const DEFAULT_ITEMS: AppearanceItem[] = [
  { id: 'hair-1', name: 'Short Hair', category: 'Hair', thumbnail: '◐', tags: ['casual', 'modern'] },
  { id: 'hair-2', name: 'Long Hair', category: 'Hair', thumbnail: '◑', tags: ['elegant', 'classic'] },
  { id: 'hair-3', name: 'Curly Hair', category: 'Hair', thumbnail: '◒', tags: ['voluminous'] },
  { id: 'face-1', name: 'Soft Eyes', category: 'Face', thumbnail: '◉', tags: ['gentle'] },
  { id: 'face-2', name: 'Sharp Jaw', category: 'Face', thumbnail: '◇', tags: ['strong'] },
  { id: 'cloth-1', name: 'Casual Wear', category: 'Clothing', thumbnail: '▢', tags: ['everyday'] },
  { id: 'cloth-2', name: 'Formal Suit', category: 'Clothing', thumbnail: '▣', tags: ['professional'] },
  { id: 'acc-1', name: 'Glasses', category: 'Accessories', thumbnail: '⊡', tags: ['scholarly'] },
  { id: 'mat-1', name: 'Heritage', category: 'Material', thumbnail: '◈', tags: ['premium'] },
];

/**
 * AppearanceLibrary — Browse and select appearance presets
 */
export const AppearanceLibrary: React.FC<AppearanceLibraryProps> = ({
  items = DEFAULT_ITEMS,
  onSelect,
  selectedId,
  categories = DEFAULT_CATEGORIES,
}) => {
  const [activeCategory, setActiveCategory] = React.useState('All');
  const [search, setSearch] = React.useState('');

  const filteredItems = items.filter((item) => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch =
      search === '' ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#94a3b8', letterSpacing: 1 }}>
        APPEARANCE LIBRARY
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search appearance..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          padding: '8px 12px',
          fontSize: 12,
          fontFamily: 'monospace',
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          borderRadius: 6,
          color: '#e2e8f0',
          outline: 'none',
        }}
      />

      {/* Categories */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '4px 10px',
              fontSize: 10,
              fontFamily: 'monospace',
              background:
                activeCategory === cat ? 'rgba(167, 139, 250, 0.2)' : 'rgba(15, 23, 42, 0.4)',
              border:
                activeCategory === cat
                  ? '1px solid rgba(167, 139, 250, 0.5)'
                  : '1px solid rgba(148, 163, 184, 0.15)',
              borderRadius: 4,
              color: activeCategory === cat ? '#a78bfa' : '#94a3b8',
              cursor: 'pointer',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
          gap: 8,
          maxHeight: 240,
          overflowY: 'auto',
          padding: 4,
        }}
      >
        {filteredItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect?.(item)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              padding: 10,
              background:
                selectedId === item.id ? 'rgba(0, 229, 255, 0.1)' : 'rgba(15, 23, 42, 0.5)',
              border:
                selectedId === item.id
                  ? '1px solid rgba(0, 229, 255, 0.5)'
                  : '1px solid rgba(148, 163, 184, 0.1)',
              borderRadius: 6,
              cursor: 'pointer',
              color: '#e2e8f0',
            }}
          >
            <div style={{ fontSize: 24, opacity: 0.9 }}>{item.thumbnail}</div>
            <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#94a3b8' }}>
              {item.name}
            </div>
          </button>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: 20,
            color: '#64748b',
            fontSize: 12,
            fontFamily: 'monospace',
          }}
        >
          No items found
        </div>
      )}
    </div>
  );
};

export default AppearanceLibrary;
