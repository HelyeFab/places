'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

type LightboxPhoto = {
  id: string;
  name: string;
};

interface LightboxProps {
  photos: LightboxPhoto[];
  index: number;
  onClose: () => void;
  onIndexChange: (i: number) => void;
}

function photoUrl(id: string) {
  return '/api/photos/proxy?id=' + id;
}

export default function Lightbox({ photos, index, onClose, onIndexChange }: LightboxProps) {
  const t = useTranslations('photoDetail');
  const [loading, setLoading] = useState(true);
  const touchStartX = useRef<number | null>(null);

  const total = photos.length;
  const current = photos[index];
  const hasPrev = index > 0;
  const hasNext = index < total - 1;

  const prev = useCallback(() => {
    if (hasPrev) onIndexChange(index - 1);
  }, [hasPrev, index, onIndexChange]);

  const next = useCallback(() => {
    if (hasNext) onIndexChange(index + 1);
  }, [hasNext, index, onIndexChange]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, prev, next]);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  useEffect(() => {
    setLoading(true);
  }, [current?.id]);

  useEffect(() => {
    const urls: string[] = [];
    if (hasPrev) urls.push(photoUrl(photos[index - 1].id));
    if (hasNext) urls.push(photoUrl(photos[index + 1].id));
    urls.forEach((u) => {
      const img = new Image();
      img.src = u;
    });
  }, [index, photos, hasPrev, hasNext]);

  if (!current) return null;

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) > 60) {
      if (delta > 0) prev();
      else next();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={onClose}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-4 py-1.5 bg-white/10 text-white rounded-full backdrop-blur-sm text-sm select-none">
        {index + 1} / {total}
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label={t('close')}
        className="absolute top-4 right-4 z-20 p-3 bg-white/10 text-white rounded-full hover:bg-white/20 backdrop-blur-sm transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      {hasPrev && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            prev();
          }}
          aria-label={t('previous')}
          className="absolute left-4 z-20 p-3 bg-white/10 text-white rounded-full hover:bg-white/20 backdrop-blur-sm transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {hasNext && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            next();
          }}
          aria-label={t('next')}
          className="absolute right-4 z-20 p-3 bg-white/10 text-white rounded-full hover:bg-white/20 backdrop-blur-sm transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {loading && (
        <div className="absolute w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      )}

      <img
        key={current.id}
        src={photoUrl(current.id)}
        alt={current.name}
        onLoad={() => setLoading(false)}
        onError={() => setLoading(false)}
        onClick={(e) => e.stopPropagation()}
        className={
          'max-w-[95vw] max-h-[90vh] object-contain transition-opacity duration-200 ' +
          (loading ? 'opacity-0' : 'opacity-100')
        }
      />
    </div>
  );
}
