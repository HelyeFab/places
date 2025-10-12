'use client';

import { useTheme } from '@/lib/theme-context';
import { useTranslations } from 'next-intl';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { mode, toggleMode } = useTheme();
  const t = useTranslations('theme');

  return (
    <button
      onClick={toggleMode}
      className="relative p-2 rounded-lg bg-theme-bg-secondary hover:bg-theme-bg-tertiary transition-colors duration-200"
      aria-label={mode === 'light' ? t('switchToDark') : t('switchToLight')}
      title={t('toggleMode')}
    >
      <div className="relative w-5 h-5">
        {/* Sun icon for light mode */}
        <Sun
          className={`absolute inset-0 text-theme-text-primary transition-all duration-300 ${
            mode === 'light'
              ? 'opacity-100 rotate-0 scale-100'
              : 'opacity-0 rotate-90 scale-0'
          }`}
          size={20}
        />

        {/* Moon icon for dark mode */}
        <Moon
          className={`absolute inset-0 text-theme-text-primary transition-all duration-300 ${
            mode === 'dark'
              ? 'opacity-100 rotate-0 scale-100'
              : 'opacity-0 -rotate-90 scale-0'
          }`}
          size={20}
        />
      </div>
    </button>
  );
}
