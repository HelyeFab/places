'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { X } from 'lucide-react';
import Link from 'next/link';

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

export default function GalleryPage() {
  const t = useTranslations('gallery');
  const [user] = useAuthState(auth);

  const [photos, setPhotos] = useState<DrivePhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<DrivePhoto | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPhotos = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/drive/photos');
        if (!res.ok) throw new Error('Failed to load photos');
        const data = await res.json();
        setPhotos(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadPhotos();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-theme-accent-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">{t('title')}</h1>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {photos.length === 0 && !error ? (
        <div className="text-center py-12">
          <p className="text-theme-text-secondary">{t('emptyGallery')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="bg-theme-bg-primary rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-all"
              onClick={() => setSelectedPhoto(photo)}
            >
              <div className="aspect-square bg-theme-bg-tertiary relative">
                <img
                  src={photoUrl(photo.id, 600)}
                  alt={photo.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-4">
                <p className="font-medium text-theme-text-primary line-clamp-1 mb-1">
                  {photo.name.replace(/\.[^.]+$/, '')}
                </p>
                <p className="text-sm text-theme-text-secondary">
                  {photo.albumName}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Photo Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative w-full h-full flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-4 right-4 z-20">
              <button
                onClick={() => setSelectedPhoto(null)}
                className="p-3 bg-theme-bg-primary text-theme-text-primary rounded-full hover:bg-theme-bg-tertiary shadow-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 flex items-center justify-center p-4">
              <img
                src={photoUrl(selectedPhoto.id)}
                alt={selectedPhoto.name}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            <div className="bg-theme-bg-primary bg-opacity-95 backdrop-blur-sm border-t border-theme-border">
              <div className="max-w-7xl mx-auto px-6 py-4">
                <h2 className="text-xl font-bold truncate">
                  {selectedPhoto.name.replace(/\.[^.]+$/, '')}
                </h2>
                <p className="text-sm text-theme-text-secondary mt-1">
                  {selectedPhoto.albumName} • {new Date(selectedPhoto.createdTime).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
