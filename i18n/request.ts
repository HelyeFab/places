import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import { defaultLocale, locales, type Locale } from './config';

export default getRequestConfig(async () => {
  // Get locale from cookie or use default
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE')?.value;
  const locale = (locales.includes(localeCookie as Locale) ? localeCookie : defaultLocale) as Locale;

  return {
    locale,
    messages: {
      common: (await import(`./locales/${locale}/common.json`)).default,
      auth: (await import(`./locales/${locale}/auth.json`)).default,
      navigation: (await import(`./locales/${locale}/navigation.json`)).default,
      landing: (await import(`./locales/${locale}/landing.json`)).default,
      pages: (await import(`./locales/${locale}/pages.json`)).default,
      upload: (await import(`./locales/${locale}/upload.json`)).default,
      gallery: (await import(`./locales/${locale}/gallery.json`)).default,
      albums: (await import(`./locales/${locale}/albums.json`)).default,
    },
  };
});
