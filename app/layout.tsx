import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import { ToastProvider } from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: 'Australia 2026 - Shared Photo Album',
  description: 'Collaborative photo-sharing platform for friends traveling to Australia in 2026',
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
      <body className="min-h-screen bg-gradient-to-b from-blue-50 to-white" suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <ToastProvider>
            <Navigation />

            {/* Main Content */}
            <main className="min-h-[calc(100vh-8rem)]">
              {children}
            </main>

            <Footer />
          </ToastProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
