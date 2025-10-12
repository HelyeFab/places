# Internationalization (i18n) Guide

## Overview

The Australia 2026 Shared Album application uses **next-intl** for internationalization support. This guide explains how the i18n system works and how to add or modify translations for future development.

## Current Languages

- **English (en)** - Default language
- **Italian (it)** - Secondary language

## Architecture

### Library: next-intl v4.3.12

**Why next-intl?**
- Built specifically for Next.js 15 App Router
- Native TypeScript support with type-safe translation keys
- Excellent performance (31.4 kB gzipped)
- Works seamlessly with React Server Components
- Minimal configuration required
- Strong community adoption (931k+ weekly downloads)

### Directory Structure

```
i18n/
├── config.ts                    # Locale configuration (locales, flags, names)
├── request.ts                   # Server-side i18n configuration
├── types.ts                     # TypeScript type definitions
└── locales/
    ├── en/                      # English translations
    │   ├── common.json          # Common strings (loading, errors)
    │   ├── auth.json            # Authentication strings
    │   ├── navigation.json      # Navigation menu strings
    │   ├── landing.json         # Landing page strings
    │   └── pages.json           # Page-specific strings
    └── it/                      # Italian translations
        ├── common.json
        ├── auth.json
        ├── navigation.json
        ├── landing.json
        └── pages.json
```

## Configuration Files

### i18n/config.ts

Defines available locales, default locale, and locale metadata:

```typescript
export const locales = ['en', 'it'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';
export const localeNames: Record<Locale, string> = {
  en: 'English',
  it: 'Italiano',
};
export const localeFlags: Record<Locale, string> = {
  en: '🇬🇧',
  it: '🇮🇹',
};
```

### i18n/request.ts

Server-side configuration that loads translations based on cookie value:

```typescript
import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import { defaultLocale, locales, type Locale } from './config';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE')?.value;
  const locale = (locales.includes(localeCookie as Locale) ? localeCookie : defaultLocale) as Locale;

  return {
    locale,
    messages: {
      ...(await import(`./locales/${locale}/common.json`)).default,
      ...(await import(`./locales/${locale}/auth.json`)).default,
      ...(await import(`./locales/${locale}/navigation.json`)).default,
      ...(await import(`./locales/${locale}/landing.json`)).default,
      ...(await import(`./locales/${locale}/pages.json`)).default,
    },
  };
});
```

### next.config.ts

Integrates next-intl plugin:

```typescript
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  /* config options here */
};

export default withNextIntl(nextConfig);
```

## Usage in Components

### Server Components

```tsx
import { useTranslations } from 'next-intl';

export default function MyServerComponent() {
  const t = useTranslations('navigation');

  return <h1>{t('gallery')}</h1>;
}
```

### Client Components

```tsx
'use client';

import { useTranslations } from 'next-intl';

export default function MyClientComponent() {
  const t = useTranslations('auth');

  return <button>{t('signInWithGoogle')}</button>;
}
```

### Translation with Parameters

For dynamic values in translations:

```json
// i18n/locales/en/common.json
{
  "error": "Error: {message}"
}
```

```tsx
const t = useTranslations('common');
<div>{t('error', { message: error.message })}</div>
```

## Language Switching

### LanguageSwitcher Component

Located at `components/LanguageSwitcher.tsx`, this component:
- Shows current language with flag emoji
- Allows switching between EN/IT
- Persists choice in cookie (`NEXT_LOCALE`) and localStorage
- Reloads page to apply new locale

```tsx
import LanguageSwitcher from '@/components/LanguageSwitcher';

<LanguageSwitcher />
```

## Translation File Organization

### Translation Key Naming Conventions

1. **Use camelCase** for translation keys
   - ✅ `signInWithGoogle`
   - ❌ `sign-in-with-google`

2. **Use namespaces** for organization
   - ✅ `hero.title`, `features.photos.title`
   - ❌ `heroTitle`, `featuresPhotosTitle`

3. **Be descriptive** but concise
   - ✅ `viewGallery`
   - ❌ `button1`

4. **Group related strings**
   - Navigation items → `navigation.json`
   - Authentication → `auth.json`
   - Page content → `landing.json`

### Example Translation File

```json
// i18n/locales/en/landing.json
{
  "hero": {
    "title": "Australia 2026",
    "subtitle": "Your collaborative photo album",
    "description": "Share memories with friends"
  },
  "cta": {
    "viewGallery": "View Gallery",
    "exploreMap": "Explore Map"
  }
}
```

## Adding New Translations

### Step 1: Add to English file

```json
// i18n/locales/en/common.json
{
  "welcome": "Welcome, {name}!"
}
```

### Step 2: Add to Italian file

```json
// i18n/locales/it/common.json
{
  "welcome": "Benvenuto, {name}!"
}
```

### Step 3: Use in component

```tsx
const t = useTranslations('common');
<h1>{t('welcome', { name: user.name })}</h1>
```

## Adding a New Language

### Step 1: Update config

```typescript
// i18n/config.ts
export const locales = ['en', 'it', 'fr'] as const; // Add 'fr'

export const localeNames: Record<Locale, string> = {
  en: 'English',
  it: 'Italiano',
  fr: 'Français', // Add French
};

export const localeFlags: Record<Locale, string> = {
  en: '🇬🇧',
  it: '🇮🇹',
  fr: '🇫🇷', // Add French flag
};
```

### Step 2: Create translation directory

```bash
mkdir -p i18n/locales/fr
```

### Step 3: Copy and translate files

```bash
cp i18n/locales/en/*.json i18n/locales/fr/
# Then translate all strings in fr/*.json files
```

### Step 4: Update request.ts (if needed)

The current implementation automatically loads all translation files, so no changes needed unless you're adding new translation files.

### Step 5: Test

```bash
npm run dev
# Switch to new language using LanguageSwitcher
```

## TypeScript Type Safety

### i18n/types.ts

Provides type-safe translation keys with autocompletion:

```typescript
import type en_common from './locales/en/common.json';
import type en_auth from './locales/en/auth.json';
// ... other imports

export type Messages = {
  comingSoon: typeof en_common.comingSoon;
  signInWithGoogle: typeof en_auth.signInWithGoogle;
  // ... all translation keys
};

declare global {
  interface IntlMessages extends Messages {}
}
```

### Benefits

- **Autocomplete**: IDE suggests valid translation keys
- **Compile-time errors**: Missing translations caught before runtime
- **Refactoring safety**: Renaming keys shows all usages

## Best Practices

### 1. Never Hardcode Strings

❌ **Bad:**
```tsx
<button>Sign in with Google</button>
```

✅ **Good:**
```tsx
const t = useTranslations('auth');
<button>{t('signInWithGoogle')}</button>
```

### 2. Keep Brand Names Consistent

The app name "Australia 2026" remains the same in all languages.

### 3. Use Semantic Keys

Keys should describe what the string represents, not how it looks:

❌ **Bad:** `"bigBlueButton": "Submit"`

✅ **Good:** `"submitForm": "Submit"`

### 4. Organize by Feature

Group translations by feature/page rather than mixing everything in one file.

### 5. Provide Context in Comments

For ambiguous strings, add comments:

```json
{
  // Button text for uploading photos
  "upload": "Upload",
  // Page title for upload page
  "uploadPageTitle": "Upload Photos"
}
```

## Common Patterns

### Navigation Links

```tsx
import { useTranslations } from 'next-intl';

const t = useTranslations('navigation');

<Link href="/gallery">{t('gallery')}</Link>
<Link href="/map">{t('map')}</Link>
```

### Page Titles and Descriptions

```tsx
const t = useTranslations('pages.gallery');

<h1>{t('title')}</h1>
<p>{t('description')}</p>
```

### Error Messages with Variables

```json
{
  "error": "Error: {message}",
  "userNotFound": "User {email} not found"
}
```

```tsx
t('error', { message: 'Connection failed' })
t('userNotFound', { email: 'user@example.com' })
```

## Testing i18n

### Manual Testing Checklist

- [ ] Switch between EN and IT using LanguageSwitcher
- [ ] Verify language persists after page reload
- [ ] Check all pages for missing translations
- [ ] Test with long translations (e.g., German)
- [ ] Verify mobile responsiveness
- [ ] Check RTL languages if added (Arabic, Hebrew)

### Automated Testing

```typescript
// Example Jest test
import { render } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import messages from '@/i18n/locales/en/common.json';

test('renders translated text', () => {
  const { getByText } = render(
    <NextIntlClientProvider messages={messages} locale="en">
      <MyComponent />
    </NextIntlClientProvider>
  );

  expect(getByText('Sign in with Google')).toBeInTheDocument();
});
```

## Troubleshooting

### Translation Not Showing

1. Check if translation key exists in JSON file
2. Verify namespace is correct (`useTranslations('navigation')`)
3. Ensure file is imported in `i18n/request.ts`
4. Clear browser cache and reload

### TypeScript Errors

1. Run `npx tsc --noEmit` to check for type errors
2. Ensure all translation files have matching keys across languages
3. Verify `i18n/types.ts` imports all translation files

### Language Not Switching

1. Check browser console for cookie errors
2. Verify `NEXT_LOCALE` cookie is being set
3. Ensure page reload happens after language change
4. Check that locale is in `locales` array in config

## Performance Considerations

### Bundle Size

- next-intl: 31.4 kB (gzipped)
- Translation files loaded on-demand per locale
- Only active locale's translations are sent to client

### Optimization Tips

1. **Split large translation files** into smaller namespaces
2. **Use static rendering** where possible
3. **Lazy load** translations for rarely used features
4. **Avoid inline translations** - use JSON files

## Migration from Hardcoded Strings

If you encounter hardcoded strings in old code:

### Before:
```tsx
<button>Sign Out</button>
```

### After:
```tsx
import { useTranslations } from 'next-intl';

const t = useTranslations('auth');
<button>{t('signOut')}</button>
```

## Resources

- [next-intl Documentation](https://next-intl.dev/)
- [Next.js 15 Internationalization](https://nextjs.org/docs/app/guides/internationalization)
- [ICU Message Syntax](https://formatjs.io/docs/core-concepts/icu-syntax/)

## Future Enhancements

### Planned Features

1. **Automatic locale detection** from browser settings
2. **SEO optimization** with `<html lang="">` attribute
3. **Date/time formatting** per locale
4. **Currency formatting** for potential payment features
5. **Pluralization rules** for dynamic content
6. **Translation management system** integration (e.g., Crowdin, Phrase)

### Phase 2+ Considerations

When implementing new features:

1. **Always use i18n from the start** - don't hardcode strings
2. **Add translations before committing** - don't leave TODOs
3. **Test in both languages** - ensure layout works with longer Italian text
4. **Document new translation keys** in this guide
5. **Keep translations in sync** - update both EN and IT simultaneously

## Questions?

For i18n-related questions during development:

1. Check this guide first
2. Consult [next-intl docs](https://next-intl.dev/)
3. Review existing component implementations
4. Ask in team chat/PR comments

---

**Last Updated:** 2025-10-12
**i18n System Version:** next-intl v4.3.12
**Supported Languages:** English (en), Italian (it)
