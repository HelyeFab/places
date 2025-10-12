'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';

type Photo = {
  id: string;
  url: string;
  caption?: string;
  tags: string[];
  visibility: 'public' | 'friends' | 'hidden';
  place?: string;
  userId: string;
  createdAt: any;
};

function getDayKey(timestamp?: any): string {
  if (!timestamp?.toDate) return 'Unknown Date';
  try {
    return format(timestamp.toDate(), 'yyyy-MM-dd');
  } catch (err) {
    return 'Unknown Date';
  }
}

function getDisplayDate(dayKey: string): string {
  if (dayKey === 'Unknown Date') return dayKey;
  try {
    const date = new Date(dayKey);
    return format(date, 'EEEE, MMMM d, yyyy');
  } catch (err) {
    return dayKey;
  }
}

export default function TimelinePage() {
  const t = useTranslations('pages.timeline');
  const [user] = useAuthState(auth);

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPhotos = async () => {
      setLoading(true);

      try {
        // First, get all public photos
        const publicQuery = query(
          collection(db, 'photos'),
          where('visibility', '==', 'public'),
          orderBy('createdAt', 'desc')
        );

        const publicSnapshot = await getDocs(publicQuery);
        let allPhotos = publicSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Photo[];

        // If user is authenticated, also get their own photos
        if (user) {
          const userQuery = query(
            collection(db, 'photos'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc')
          );

          const userSnapshot = await getDocs(userQuery);
          const userPhotos = userSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Photo[];

          // Merge and deduplicate
          const photoMap = new Map<string, Photo>();
          [...allPhotos, ...userPhotos].forEach((photo) => {
            photoMap.set(photo.id, photo);
          });
          allPhotos = Array.from(photoMap.values()).sort((a, b) => {
            if (!a.createdAt || !b.createdAt) return 0;
            return b.createdAt.seconds - a.createdAt.seconds;
          });
        }

        setPhotos(allPhotos);
      } catch (err) {
        console.error('Error loading photos:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPhotos();
  }, [user]);

  // Group photos by date
  const groupedPhotos = useMemo(() => {
    const groups = new Map<string, Photo[]>();

    photos.forEach((photo) => {
      const dayKey = getDayKey(photo.createdAt);
      const existing = groups.get(dayKey) || [];
      groups.set(dayKey, [...existing, photo]);
    });

    // Convert to array and sort by date (most recent first)
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
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="ml-3 text-gray-600">Loading timeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('title')}</h1>
        <p className="text-lg text-gray-600">{t('description')}</p>
      </div>

      {/* Timeline */}
      {groupedPhotos.length === 0 ? (
        <div className="text-center py-16">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-500">No photos yet</p>
          <p className="text-sm text-gray-400 mt-2">Upload photos to see your timeline</p>
        </div>
      ) : (
        <div className="space-y-12">
          {groupedPhotos.map(([dayKey, dayPhotos]) => (
            <section key={dayKey}>
              {/* Date Header */}
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h2 className="text-2xl font-semibold text-gray-900">
                  {getDisplayDate(dayKey)}
                </h2>
                <span className="text-sm text-gray-500">
                  ({dayPhotos.length} {dayPhotos.length === 1 ? 'photo' : 'photos'})
                </span>
              </div>

              {/* Photos Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {dayPhotos.map((photo) => (
                  <Link
                    key={photo.id}
                    href={`/photos/${photo.id}`}
                    className="group relative aspect-square bg-gray-100 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow"
                  >
                    <img
                      src={photo.url}
                      alt={photo.caption || 'Photo'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Caption Overlay */}
                    {photo.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                        <p className="text-white text-sm line-clamp-2">{photo.caption}</p>
                      </div>
                    )}

                    {/* Place Badge */}
                    {photo.place && (
                      <div className="absolute top-2 left-2">
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-white/90 backdrop-blur-sm rounded-full">
                          📍 {photo.place}
                        </span>
                      </div>
                    )}

                    {/* Visibility Badge */}
                    {photo.visibility !== 'public' && (
                      <div className="absolute top-2 right-2">
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-white/90 backdrop-blur-sm rounded-full">
                          {photo.visibility === 'friends' ? '👥' : '🔒'}
                        </span>
                      </div>
                    )}
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
