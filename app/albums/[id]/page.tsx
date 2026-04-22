'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowLeft, Upload } from 'lucide-react';

type DrivePhoto = {
  id: string;
  name: string;
  mimeType: string;
  createdTime: string;
};

type DriveAlbum = {
  id: string;
  name: string;
  photoCount: number;
};

function photoUrl(id: string, width?: number) {
  if (width) return "/api/photos/proxy?id=" + id + "&w=" + width + "&q=75";
  return "/api/photos/proxy?id=" + id;
}

export default function AlbumDetailPage() {
  const params = useParams();
  const t = useTranslations('albums');

  const [album, setAlbum] = useState<DriveAlbum | null>(null);
  const [photos, setPhotos] = useState<DrivePhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const albumId = params?.id as string;

  useEffect(() => {
    if (!albumId) return;

    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Load album info and photos in parallel
        const [albumsRes, photosRes] = await Promise.all([
          fetch('/api/drive/albums'),
          fetch("/api/drive/albums/" + albumId + "/photos"),
        ]);

        if (!albumsRes.ok || !photosRes.ok) throw new Error('Failed to load album');

        const allAlbums = await albumsRes.json();
        const albumData = allAlbums.find((a: DriveAlbum) => a.id === albumId);
        if (!albumData) {
          setError(t('albumNotFound'));
          setLoading(false);
          return;
        }

        setAlbum(albumData);
        setPhotos(await photosRes.json());
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [albumId, t]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-theme-accent-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="ml-3 text-theme-text-secondary">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !album) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error || t('albumNotFound')}</p>
        </div>
        <Link
          href="/albums"
          className="inline-flex items-center gap-2 mt-4 text-theme-accent-600 hover:text-theme-accent-700"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('backToAlbums')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Link
          href="/albums"
          className="inline-flex items-center gap-2 text-theme-accent-600 hover:text-theme-accent-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('backToAlbums')}
        </Link>

        <h1 className="text-4xl font-bold text-theme-text-primary mb-2">{album.name}</h1>
        <p className="text-sm text-theme-text-secondary">
          {t('photoCount', { count: photos.length })}
        </p>
      </div>

      {photos.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-theme-bg-tertiary rounded-full mb-4">
            <Upload className="w-8 h-8 text-theme-text-tertiary" />
          </div>
          <p className="text-theme-text-secondary text-lg mb-4">{t('noPhotos')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
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
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
