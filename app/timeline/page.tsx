'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';

type DrivePhoto = {
  id: string;
  name: string;
  mimeType: string;
  createdTime: string;
  albumId: string;
  albumName: string;
};

function photoUrl(id: string, width?: number) {
  if (width) return "/api/photos/proxy?id=" + id + "&w=" + width + "&q=75";
  return "/api/photos/proxy?id=" + id;
}

function getDayKey(createdTime: string): string {
  try {
    return format(new Date(createdTime), 'yyyy-MM-dd');
  } catch {
    return 'Unknown Date';
  }
}

function getDisplayDate(dayKey: string): string {
  if (dayKey === 'Unknown Date') return dayKey;
  try {
    return format(new Date(dayKey), 'EEEE, MMMM d, yyyy');
  } catch {
    return dayKey;
  }
}

export default function TimelinePage() {
  const t = useTranslations('pages.timeline');
  const [photos, setPhotos] = useState<DrivePhoto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPhotos = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/drive/photos');
        if (!res.ok) throw new Error('Failed to load photos');
        setPhotos(await res.json());
      } catch (err) {
        console.error('Error loading photos:', err);
      } finally {
        setLoading(false);
      }
    };
    loadPhotos();
  }, []);

  const groupedPhotos = useMemo(() => {
    const groups = new Map<string, DrivePhoto[]>();

    photos.forEach((photo) => {
      const dayKey = getDayKey(photo.createdTime);
      const existing = groups.get(dayKey) || [];
      groups.set(dayKey, [...existing, photo]);
    });

    return Array.from(groups.entries()).sort((a, b) => {
      if (a[0] === 'Unknown Date') return 1;
      if (b[0] === 'Unknown Date') return -1;
      return b[0].localeCompare(a[0]);
    });
  }, [photos]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-theme-accent-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="ml-3 text-theme-text-secondary">Loading timeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-theme-text-primary mb-2">{t('title')}</h1>
        <p className="text-lg text-theme-text-secondary">{t('description')}</p>
      </div>

      {groupedPhotos.length === 0 ? (
        <div className="text-center py-16">
          <Calendar className="w-16 h-16 text-theme-text-tertiary mx-auto mb-4" />
          <p className="text-xl text-theme-text-secondary">No photos yet</p>
          <p className="text-sm text-theme-text-tertiary mt-2">Add photos to your Google Drive folder to see them here</p>
        </div>
      ) : (
        <div className="space-y-12">
          {groupedPhotos.map(([dayKey, dayPhotos]) => (
            <section key={dayKey}>
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-5 h-5 text-theme-accent-600" />
                <h2 className="text-2xl font-semibold text-theme-text-primary">
                  {getDisplayDate(dayKey)}
                </h2>
                <span className="text-sm text-theme-text-secondary">
                  ({dayPhotos.length} {dayPhotos.length === 1 ? 'photo' : 'photos'})
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {dayPhotos.map((photo) => (
                  <Link
                    key={photo.id}
                    href={"/photos/" + photo.id}
                    className="group relative aspect-square bg-theme-bg-tertiary rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow"
                  >
                    <img
                      src={photoUrl(photo.id, 600)}
                      alt={photo.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                      <p className="text-white text-sm line-clamp-1">{photo.name.replace(/\.[^.]+$/, '')}</p>
                      <p className="text-white/70 text-xs">{photo.albumName}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
