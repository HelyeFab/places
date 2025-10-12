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
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      {locales.map((loc) => (
        <button
          key={loc}
          onClick={() => handleLanguageChange(loc)}
          disabled={isPending}
          className={`
            px-3 py-1.5 rounded-md text-sm font-medium transition-all
            ${locale === loc
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
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
