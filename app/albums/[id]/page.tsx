'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { doc, getDoc, collection, query, where, getDocs, orderBy, deleteDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { ArrowLeft, Upload, Trash2 } from 'lucide-react';
import { ConfirmModal } from '@/components/ui/Modal';

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

type Photo = {
  id: string;
  url: string;
  caption?: string;
  tags: string[];
  visibility: 'public' | 'friends' | 'hidden';
  place?: string;
  userId: string;
  albumId?: string | null;
  createdAt: any;
};

export default function AlbumDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('albums');
  const [user] = useAuthState(auth);

  const [album, setAlbum] = useState<Album | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const albumId = params?.id as string;

  const handleDeleteAlbum = async () => {
    if (!album || !user || album.userId !== user.uid) return;

    setDeleting(true);
    setShowDeleteModal(false);

    try {
      // Unlink all photos from this album
      for (const photo of photos) {
        await updateDoc(doc(db, 'photos', photo.id), {
          albumId: null,
        });
      }

      // Delete the album
      await deleteDoc(doc(db, 'albums', albumId));

      // Redirect to albums page
      router.push('/albums');
    } catch (err: any) {
      console.error('Error deleting album:', err);
      setError(`Error deleting album: ${err.message}`);
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (!albumId) return;

    const loadAlbumAndPhotos = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch album data
        const albumDoc = await getDoc(doc(db, 'albums', albumId));

        if (!albumDoc.exists()) {
          setError(t('albumNotFound'));
          setLoading(false);
          return;
        }

        const albumData = {
          id: albumDoc.id,
          ...albumDoc.data(),
        } as Album;

        setAlbum(albumData);

        // Fetch photos in this album
        const photosQuery = query(
          collection(db, 'photos'),
          where('albumId', '==', albumId),
          orderBy('createdAt', 'desc')
        );

        const photosSnapshot = await getDocs(photosQuery);
        const allPhotos = photosSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Photo[];

        // Apply visibility filtering
        const visiblePhotos = allPhotos.filter((photo) => {
          if (photo.visibility === 'public') return true;
          if (photo.visibility === 'friends' && user) return true;
          if (photo.userId === user?.uid) return true;
          return false;
        });

        setPhotos(visiblePhotos);
      } catch (err: any) {
        console.error('Error loading album:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadAlbumAndPhotos();
  }, [albumId, user, t]);

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
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/albums"
          className="inline-flex items-center gap-2 text-theme-accent-600 hover:text-theme-accent-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('backToAlbums')}
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-theme-text-primary mb-2">{album.title}</h1>
            {album.description && (
              <p className="text-lg text-theme-text-secondary mb-3">{album.description}</p>
            )}
            <p className="text-sm text-theme-text-secondary">
              {t('photoCount', { count: photos.length })} • {album.userName}
            </p>
          </div>

          {user && (
            <div className="flex items-center gap-2">
              <Link
                href={`/upload?albumId=${albumId}`}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-theme-accent-600 rounded-lg hover:bg-theme-accent-700 transition-colors"
              >
                <Upload className="w-4 h-4" />
                {t('uploadToAlbum')}
              </Link>

              {album.userId === user.uid && (
                <button
                  onClick={() => setShowDeleteModal(true)}
                  disabled={deleting}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: deleting ? 'rgb(var(--danger-800))' : 'rgb(var(--danger-600))'
                  }}
                  onMouseEnter={(e) => {
                    if (!deleting) e.currentTarget.style.backgroundColor = 'rgb(var(--danger-700))';
                  }}
                  onMouseLeave={(e) => {
                    if (!deleting) e.currentTarget.style.backgroundColor = 'rgb(var(--danger-600))';
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                  {deleting ? 'Deleting...' : 'Delete Album'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Photos Grid */}
      {photos.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-theme-bg-tertiary rounded-full mb-4">
            <Upload className="w-8 h-8 text-theme-text-tertiary" />
          </div>
          <p className="text-theme-text-secondary text-lg mb-4">{t('noPhotos')}</p>
          {user && (
            <Link
              href={`/upload?albumId=${albumId}`}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-theme-accent-600 rounded-lg hover:bg-theme-accent-700 transition-colors"
            >
              <Upload className="w-4 h-4" />
              {t('addPhotos')}
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <Link
              key={photo.id}
              href={`/photos/${photo.id}`}
              className="group relative aspect-square bg-theme-bg-tertiary rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow"
            >
              <img
                src={photo.url}
                alt={photo.caption || 'Photo'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* Overlay with caption */}
              {photo.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                  <p className="text-white text-sm line-clamp-2">{photo.caption}</p>
                </div>
              )}

              {/* Visibility badge */}
              {photo.visibility !== 'public' && (
                <div className="absolute top-2 right-2">
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-theme-bg-primary/90 backdrop-blur-sm rounded-full">
                    {photo.visibility === 'friends' ? '👥' : '🔒'}
                  </span>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAlbum}
        title="Delete Album"
        message={`Are you sure you want to delete "${album?.title}"? Photos in this album will not be deleted, but will be unlinked from the album.`}
        confirmText="Delete Album"
        cancelText="Cancel"
        confirmVariant="danger"
      />
    </div>
  );
}
