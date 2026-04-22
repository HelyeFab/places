'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Image as ImageIcon } from 'lucide-react';

type DriveAlbum = {
  id: string;
  name: string;
  createdTime: string;
  modifiedTime: string;
  photoCount: number;
  coverPhotoId?: string;
};

function photoUrl(id: string, width?: number) {
  if (width) return "/api/photos/proxy?id=" + id + "&w=" + width + "&q=75";
  return "/api/photos/proxy?id=" + id;
}

export default function AlbumsPage() {
  const t = useTranslations('albums');
  const [albums, setAlbums] = useState<DriveAlbum[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAlbums = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/drive/albums');
        if (!res.ok) throw new Error('Failed to load albums');
        const data = await res.json();
        setAlbums(data);
      } catch (err) {
        console.error('Error loading albums:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAlbums();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-theme-text-primary">{t('title')}</h1>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-theme-accent-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="ml-3 text-theme-text-secondary">{t('loading')}</p>
        </div>
      )}

      {!loading && albums.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-theme-bg-tertiary rounded-full mb-4">
            <ImageIcon className="w-8 h-8 text-theme-text-tertiary" />
          </div>
          <p className="text-theme-text-secondary text-lg mb-4">{t('emptyAlbum')}</p>
        </div>
      )}

      {!loading && albums.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {albums.map((album) => (
            <Link
              key={album.id}
              href={"/albums/" + album.id}
              className="group bg-theme-bg-primary rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden"
            >
              <div className="aspect-video bg-gradient-to-br from-theme-accent-100 to-theme-accent-200 relative overflow-hidden">
                {album.coverPhotoId ? (
                  <img
                    src={photoUrl(album.coverPhotoId, 600)}
                    alt={album.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full">
                    <ImageIcon className="w-12 h-12 text-theme-text-tertiary" />
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-theme-text-primary text-lg mb-1 line-clamp-1 group-hover:text-theme-accent-600 transition-colors">
                  {album.name}
                </h3>
                <div className="text-xs text-theme-text-secondary">
                  <span>{t('photoCount', { count: album.photoCount })}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
