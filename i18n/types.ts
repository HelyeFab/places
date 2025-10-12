import type en_common from './locales/en/common.json';
import type en_auth from './locales/en/auth.json';
import type en_navigation from './locales/en/navigation.json';
import type en_landing from './locales/en/landing.json';
import type en_pages from './locales/en/pages.json';

// Define the structure of all translation messages (namespaced)
export type Messages = {
  common: typeof en_common;
  auth: typeof en_auth;
  navigation: typeof en_navigation;
  landing: typeof en_landing;
  pages: typeof en_pages;
};

declare global {
  // Use type safe message keys with `next-intl`
  interface IntlMessages extends Messages {}
}
