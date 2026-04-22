'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { MapPin } from 'lucide-react';
import { PLACES, matchAlbumToPlace, type Place } from '@/lib/places-match';

interface DriveAlbum {
  id: string;
  name: string;
  createdTime: string;
}

const JapanMap = dynamic(() => import('@/components/map/JapanMap'), {
  ssr: false,
  loading: () => (
    <div
      className="rounded-xl bg-theme-bg-secondary animate-pulse"
      style={{ height: '70vh' }}
    />
  ),
});

export default function MapPage() {
  const t = useTranslations('navigation');
  const [albums, setAlbums] = useState<DriveAlbum[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/drive/albums')
      .then((r) => (r.ok ? r.json() : []))
      .then((data: DriveAlbum[]) => {
        if (!cancelled) setAlbums(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setAlbums([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const matchedAlbums = albums
    .map((a) => ({ album: a, place: matchAlbumToPlace(a.name) }))
    .filter((pair): pair is { album: DriveAlbum; place: Place } => pair.place !== null)
    .sort((a, b) => a.album.createdTime.localeCompare(b.album.createdTime));

  const polyline: [number, number][] = matchedAlbums.map(({ place }) => [
    place.lat,
    place.lng,
  ]);

  const pathLabel = matchedAlbums.map(({ place }) => place.name).join(' → ');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-6 flex items-center gap-3">
        <MapPin className="w-8 h-8 text-theme-accent-600" />
        <h1 className="text-3xl md:text-4xl font-bold">{t('map')}</h1>
      </div>

      <JapanMap places={PLACES} polyline={polyline} />

      <div className="mt-6 text-sm text-theme-text-secondary">
        {loading ? (
          <span>Loading albums…</span>
        ) : matchedAlbums.length > 0 ? (
          <>
            <span className="font-medium">Trip path: </span>
            <span>{pathLabel}</span>
          </>
        ) : albums.length > 0 ? (
          <span>
            {albums.length} album{albums.length === 1 ? '' : 's'} loaded — none matched a
            known place yet.
          </span>
        ) : (
          <span>No albums loaded.</span>
        )}
      </div>
    </div>
  );
}
