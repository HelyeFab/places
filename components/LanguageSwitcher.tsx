'use client';

import { useLocale } from 'next-intl';
import { locales, localeFlags, type Locale } from '@/i18n/config';
import { useTransition } from 'react';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();

  const handleLanguageChange = (newLocale: Locale) => {
    startTransition(() => {
      // Set cookie for locale persistence
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;

      // Also store in localStorage as backup
      localStorage.setItem('preferredLocale', newLocale);

      // Reload to apply new locale
      window.location.reload();
    });
  };

  return (
    <div className="flex items-center gap-1 bg-theme-bg-secondary rounded-lg p-1">
      {locales.map((loc) => (
        <button
          key={loc}
          onClick={() => handleLanguageChange(loc)}
          disabled={isPending}
          className={`
            px-3 py-1.5 rounded-md text-sm font-medium transition-all
            ${locale === loc
              ? 'bg-theme-bg-primary text-theme-accent-600 shadow-sm'
              : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-tertiary'
            }
            ${isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            flex items-center gap-1.5
          `}
          aria-label={`Switch to ${loc.toUpperCase()}`}
        >
          <span className="text-base">{localeFlags[loc]}</span>
          <span className="hidden sm:inline">{loc.toUpperCase()}</span>
        </button>
      ))}
    </div>
  );
}
