'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { collection, query, getDocs, orderBy, where, limit } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Plus, Image as ImageIcon } from 'lucide-react';

type Album = {
  id: string;
  userId: string;
  userName: string;
  title: string;
  description?: string;
  coverPhotoUrl?: string;
  photoCount: number;
  createdAt: any;
};

export default function AlbumsPage() {
  const t = useTranslations('albums');
  const [user] = useAuthState(auth);

  const [allAlbums, setAllAlbums] = useState<Album[]>([]);
  const [myAlbums, setMyAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'all' | 'mine'>('all');

  useEffect(() => {
    const loadAlbums = async () => {
      setLoading(true);

      try {
        // Fetch all albums (cover photo is already stored in album document)
        const allAlbumsQuery = query(
          collection(db, 'albums'),
          orderBy('createdAt', 'desc')
        );
        const allAlbumsSnapshot = await getDocs(allAlbumsQuery);
        const allAlbumsData = allAlbumsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Album[];

        setAllAlbums(allAlbumsData);

        // Filter user's albums if authenticated
        if (user) {
          const userAlbums = allAlbumsData.filter((album) => album.userId === user.uid);
          setMyAlbums(userAlbums);
        }
      } catch (err) {
        console.error('Error loading albums:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAlbums();
  }, [user]);

  const displayedAlbums = view === 'mine' ? myAlbums : allAlbums;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-gray-900">{t('title')}</h1>

        {user && (
          <Link
            href="/albums/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t('newAlbum')}
          </Link>
        )}
      </div>

      {/* View Toggle */}
      {user && myAlbums.length > 0 && (
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setView('all')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              view === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('allAlbums')} ({allAlbums.length})
          </button>
          <button
            onClick={() => setView('mine')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              view === 'mine'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('myAlbums')} ({myAlbums.length})
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="ml-3 text-gray-600">{t('loading')}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && displayedAlbums.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <ImageIcon className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg mb-4">{t('emptyAlbum')}</p>
          {user && (
            <Link
              href="/albums/new"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('createAlbum')}
            </Link>
          )}
        </div>
      )}

      {/* Albums Grid */}
      {!loading && displayedAlbums.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {displayedAlbums.map((album) => (
            <Link
              key={album.id}
              href={`/albums/${album.id}`}
              className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden"
            >
              {/* Cover Photo */}
              <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 relative overflow-hidden">
                {album.coverPhotoUrl ? (
                  <img
                    src={album.coverPhotoUrl}
                    alt={album.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full">
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Album Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                  {album.title}
                </h3>
                {album.description && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{album.description}</p>
                )}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{t('photoCount', { count: album.photoCount })}</span>
                  <span>{album.userName}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
