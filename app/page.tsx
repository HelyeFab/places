'use client';

import Link from 'next/link';
import AuthButton from '@/components/AuthButton';
import PageHeader from '@/components/PageHeader';
import { useTranslations } from 'next-intl';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';

export default function Home() {
  const t = useTranslations('landing');
  const [user] = useAuthState(auth);

  return (
    <>
      {/* Page Header with M&F Logo */}
      <PageHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="py-6 sm:py-20">
        <div className="text-center">
          <div className="relative w-16 h-16 sm:w-24 sm:h-24 mb-6 mx-auto"><img src="/images/japan.svg" alt="Japan" className="w-full h-full object-contain" /></div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-theme-text-primary mb-6">
            {t('hero.title')}
          </h1>
          <p className="text-xl sm:text-2xl text-theme-text-secondary mb-8 max-w-3xl mx-auto">
            {t('hero.subtitle')}
          </p>
          <p className="text-base sm:text-lg text-theme-text-secondary mb-12 max-w-2xl mx-auto">
            {t('hero.description')}
          </p>

          {/* Auth CTA - Only show if not authenticated */}
          {!user && (
            <div className="flex justify-center mb-16">
              <AuthButton />
            </div>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/gallery"
              className="w-full sm:w-auto px-8 py-4 bg-theme-accent-600 text-white text-lg font-semibold rounded-lg hover:bg-theme-accent-700 transition-colors shadow-lg hover:shadow-xl"
            >
              {t('cta.viewGallery')}
            </Link>
            <Link
              href="/timeline"
              className="w-full sm:w-auto px-8 py-4 bg-theme-bg-primary text-theme-accent-600 text-lg font-semibold rounded-lg border-2 border-theme-accent-600 hover:bg-theme-accent-50 transition-colors"
            >
              {t('cta.timeline')}
            </Link>
            </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Feature 1 */}
          <div className="bg-theme-bg-primary rounded-xl p-8 shadow-md hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">📸</div>
            <h3 className="text-xl font-bold text-theme-text-primary mb-3">
              {t('features.photos.title')}
            </h3>
            <p className="text-theme-text-secondary">
              {t('features.photos.description')}
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-theme-bg-primary rounded-xl p-8 shadow-md hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">⏱️</div>
            <h3 className="text-xl font-bold text-theme-text-primary mb-3">
              {t('features.timeline.title')}
            </h3>
            <p className="text-theme-text-secondary">
              {t('features.timeline.description')}
            </p>
          </div>
        </div>
      </section>

      {/* Getting Started Section */}
      <section className="py-12 sm:py-16 mb-12">
        <div className="bg-gradient-to-r from-theme-accent-600 to-theme-accent-700 rounded-2xl p-8 sm:p-12 text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            {t('gettingStarted.title')}
          </h2>
          <p className="text-lg sm:text-xl mb-8 opacity-90">
            {t('gettingStarted.description')}
          </p>
          {!user && (
            <div className="flex justify-center">
              <AuthButton />
            </div>
          )}
        </div>
      </section>
      </div>
    </>
  );
}
