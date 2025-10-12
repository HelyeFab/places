import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import { ToastProvider } from '@/components/ui/Toast';
import { ThemeProvider } from '@/lib/theme-context';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    template: '%s | Australia 2026 Places',
    default: 'Australia 2026 Places - Shared Photo Memories',
  },
  description: 'Share and explore photos from our Australia 2026 trip. View photos on interactive map, timeline, and organized albums. Collaborative photo-sharing platform for friends traveling together.',
  keywords: [
    'photo sharing',
    'australia travel',
    'travel photography',
    'photo album',
    'collaborative photos',
    'travel memories',
    'photo map',
    'photo timeline',
    'shared album',
    'australia 2026'
  ],
  authors: [{ name: 'M&F' }],
  creator: 'M&F',
  publisher: 'M&F',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['it_IT'],
    url: '/',
    siteName: 'Australia 2026 Places',
    title: 'Australia 2026 Places - Shared Photo Memories',
    description: 'Share and explore photos from our Australia 2026 trip. View on map, timeline, and albums.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Australia 2026 Places - Shared Photo Album',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Australia 2026 Places - Shared Photo Memories',
    description: 'Share and explore photos from our Australia 2026 trip. View on map, timeline, and albums.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification codes here when available
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = await getMessages();
  const locale = await getLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const savedMode = localStorage.getItem('theme-mode');
                  const savedPalette = localStorage.getItem('theme-palette');
                  const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  const initialMode = savedMode || systemPreference;
                  const initialPalette = savedPalette || 'blue';
                  document.documentElement.setAttribute('data-theme', initialMode);
                  document.documentElement.setAttribute('data-palette', initialPalette);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-theme-bg-primary" suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <ToastProvider>
              <Navigation />

              {/* Main Content */}
              <main className="min-h-[calc(100vh-8rem)]">
                {children}
              </main>

              <Footer />
            </ToastProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
