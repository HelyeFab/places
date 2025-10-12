'use client';

import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';

// Dynamically import MapView to avoid SSR issues with Leaflet
const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => (
    <div className="h-[70vh] rounded-xl bg-theme-bg-tertiary flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-theme-accent-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-theme-text-secondary">Loading map...</p>
      </div>
    </div>
  ),
});

export default function MapPage() {
  const t = useTranslations('pages.map');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-theme-text-primary mb-2">{t('title')}</h1>
        <p className="text-lg text-theme-text-secondary">{t('description')}</p>
      </div>

      <MapView />
    </div>
  );
}
