'use client';

import { useTheme, type ColorPalette } from '@/lib/theme-context';
import { useTranslations } from 'next-intl';
import { Palette, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const PALETTES: { name: ColorPalette; colors: string[] }[] = [
  { name: 'blue', colors: ['#3B82F6', '#2563EB', '#1D4ED8'] },
  { name: 'green', colors: ['#22C55E', '#16A34A', '#15803D'] },
  { name: 'purple', colors: ['#A855F7', '#9333EA', '#7E22CE'] },
  { name: 'orange', colors: ['#F97316', '#EA580C', '#C2410C'] },
  { name: 'pink', colors: ['#EC4899', '#DB2777', '#BE185D'] },
  { name: 'teal', colors: ['#14B8A6', '#0D9488', '#0F766E'] },
];

export default function PaletteSelector() {
  const { palette, setPalette } = useTheme();
  const t = useTranslations('theme');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent, paletteItem: ColorPalette) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setPalette(paletteItem);
      setIsOpen(false);
    } else if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg bg-theme-bg-secondary hover:bg-theme-bg-tertiary transition-colors duration-200"
        aria-label={t('selectPalette')}
        aria-expanded={isOpen}
        aria-haspopup="true"
        title={t('palette')}
      >
        <Palette className="w-5 h-5 text-theme-text-primary" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-72 backdrop-blur-md border rounded-lg shadow-2xl z-[100] overflow-hidden"
          style={{
            backgroundColor: 'rgb(var(--bg-primary) / 0.95)',
            borderColor: 'rgb(var(--border-color))'
          }}
          role="menu"
          aria-label={t('selectPalette')}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b" style={{ borderColor: 'rgb(var(--border-color))' }}>
            <h3 className="text-sm font-semibold" style={{ color: 'rgb(var(--text-primary))' }}>
              {t('palette')}
            </h3>
            <p className="text-xs mt-1" style={{ color: 'rgb(var(--text-secondary))' }}>
              {t('currentPalette')}: {t(`palettes.${palette}`)}
            </p>
          </div>

          {/* Palette Grid */}
          <div className="p-3 grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto">
            {PALETTES.map((paletteItem) => (
              <button
                key={paletteItem.name}
                onClick={() => {
                  setPalette(paletteItem.name);
                  setIsOpen(false);
                }}
                onKeyDown={(e) => handleKeyDown(e, paletteItem.name)}
                className="relative flex items-center gap-3 p-3 rounded-lg transition-all duration-200 border-2"
                style={{
                  backgroundColor: palette === paletteItem.name
                    ? 'rgb(var(--accent-600))'
                    : 'rgb(var(--bg-secondary))',
                  borderColor: palette === paletteItem.name
                    ? 'rgb(var(--accent-700))'
                    : 'transparent',
                  color: palette === paletteItem.name ? '#fff' : 'rgb(var(--text-primary))'
                }}
                onMouseEnter={(e) => {
                  if (palette !== paletteItem.name) {
                    e.currentTarget.style.backgroundColor = 'rgb(var(--bg-tertiary))';
                  }
                }}
                onMouseLeave={(e) => {
                  if (palette !== paletteItem.name) {
                    e.currentTarget.style.backgroundColor = 'rgb(var(--bg-secondary))';
                  }
                }}
                role="menuitem"
                aria-label={t(`palettes.${paletteItem.name}`)}
                title={t(`paletteDescriptions.${paletteItem.name}`)}
              >
                {/* Color Swatches */}
                <div className="flex gap-1 flex-shrink-0">
                  {paletteItem.colors.map((color, idx) => (
                    <div
                      key={idx}
                      className="w-5 h-5 rounded-full border"
                      style={{
                        backgroundColor: color,
                        borderColor: palette === paletteItem.name ? 'rgba(255,255,255,0.3)' : 'rgb(var(--border-color))'
                      }}
                    />
                  ))}
                </div>

                {/* Palette Name */}
                <div className="flex-1 text-left min-w-0">
                  <span className="text-sm font-medium truncate block">
                    {t(`palettes.${paletteItem.name}`)}
                  </span>
                </div>

                {/* Check Mark */}
                {palette === paletteItem.name && (
                  <Check className="w-5 h-5 flex-shrink-0" style={{ color: '#fff' }} />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
