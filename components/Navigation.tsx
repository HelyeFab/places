'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import UserMenu from '@/components/UserMenu';
import { useEffect, useState } from 'react';
import { Image, FolderOpen, Map, Calendar, Upload } from 'lucide-react';

export default function Navigation() {
  const t = useTranslations('navigation');
  const tAuth = useTranslations('auth');
  const [user, loading] = useAuthState(auth);
  const [currentLocale, setCurrentLocale] = useState('en');

  useEffect(() => {
    // Get locale from cookie or localStorage
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return undefined;
    };

    const locale = getCookie('NEXT_LOCALE') || localStorage.getItem('locale') || 'en';
    setCurrentLocale(locale);
  }, []);

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Brand */}
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
              <span className="text-2xl">🇦🇺</span>
              <span className="hidden sm:inline">{t('brand')}</span>
              <span className="sm:hidden">{t('brandShort')}</span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/gallery"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                {t('gallery')}
              </Link>
              <Link
                href="/albums"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                {t('albums')}
              </Link>
              <Link
                href="/map"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                {t('map')}
              </Link>
              <Link
                href="/timeline"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                {t('timeline')}
              </Link>
              <Link
                href="/upload"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                {t('upload')}
              </Link>
            </div>

            {/* Auth Section */}
            <div className="flex items-center gap-3">
              {loading ? (
                <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
              ) : user ? (
                <UserMenu
                  user={{
                    displayName: user.displayName,
                    email: user.email,
                    photoURL: user.photoURL,
                  }}
                  currentLocale={currentLocale}
                />
              ) : (
                <Link
                  href="/auth"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  {tAuth('login')}
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation - Floating */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 px-2 py-3">
          <div className="flex items-center justify-around">
            <Link
              href="/gallery"
              className="flex flex-col items-center gap-1 px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors rounded-lg hover:bg-gray-50"
            >
              <Image className="w-5 h-5" />
              <span className="text-xs font-medium">{t('gallery')}</span>
            </Link>
            <Link
              href="/albums"
              className="flex flex-col items-center gap-1 px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors rounded-lg hover:bg-gray-50"
            >
              <FolderOpen className="w-5 h-5" />
              <span className="text-xs font-medium">{t('albums')}</span>
            </Link>
            <Link
              href="/map"
              className="flex flex-col items-center gap-1 px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors rounded-lg hover:bg-gray-50"
            >
              <Map className="w-5 h-5" />
              <span className="text-xs font-medium">{t('map')}</span>
            </Link>
            <Link
              href="/timeline"
              className="flex flex-col items-center gap-1 px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors rounded-lg hover:bg-gray-50"
            >
              <Calendar className="w-5 h-5" />
              <span className="text-xs font-medium">{t('timeline')}</span>
            </Link>
            <Link
              href="/upload"
              className="flex flex-col items-center gap-1 px-3 py-2 text-white bg-blue-600 hover:bg-blue-700 transition-colors rounded-lg"
            >
              <Upload className="w-5 h-5" />
              <span className="text-xs font-medium">{t('upload')}</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Spacer for mobile bottom nav */}
      <div className="md:hidden h-20"></div>
    </>
  );
}
