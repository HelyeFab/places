'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { collection, query, where, orderBy, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, auth, storage } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useToast } from '@/components/ui/Toast';
import { ConfirmModal } from '@/components/ui/Modal';
import { Trash2, X, CheckSquare, Square } from 'lucide-react';
import Link from 'next/link';
import { Photo } from '@/types';
import UpvoteButton from '@/components/voting/UpvoteButton';

export default function GalleryPage() {
  const t = useTranslations('gallery');
  const tVoting = useTranslations('voting');
  const [user] = useAuthState(auth);
  const { showToast } = useToast();

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [sortBy, setSortBy] = useState<'createdAt' | 'upvoteCount'>('createdAt');

  useEffect(() => {
    loadPhotos();
  }, [user, sortBy]);

  const loadPhotos = async () => {
    setLoading(true);
    try {
      // Gallery only shows standalone photos (no album)
      const publicQuery = query(
        collection(db, 'photos'),
        where('visibility', '==', 'public'),
        where('albumId', '==', null),
        orderBy(sortBy, 'desc')
      );

      const publicSnapshot = await getDocs(publicQuery);
      let allPhotos: Photo[] = publicSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Photo));

      if (user) {
        const userQuery = query(
          collection(db, 'photos'),
          where('userId', '==', user.uid),
          where('albumId', '==', null),
          orderBy(sortBy, 'desc')
        );

        const userSnapshot = await getDocs(userQuery);
        const userPhotos = userSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as Photo));

        const photoMap = new Map<string, Photo>();
        [...allPhotos, ...userPhotos].forEach(photo => {
          photoMap.set(photo.id, photo);
        });
        allPhotos = Array.from(photoMap.values());
      }

      // Sort client-side for consistency
      allPhotos.sort((a, b) => {
        if (sortBy === 'upvoteCount') {
          return (b.upvoteCount || 0) - (a.upvoteCount || 0);
        }
        return b.createdAt.toMillis() - a.createdAt.toMillis();
      });

      setPhotos(allPhotos);
    } catch (error: any) {
      showToast(t('error', { message: error.message }), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!photoToDelete) return;

    try {
      const photo = photos.find(p => p.id === photoToDelete);
      if (!photo) return;

      // Delete from storage
      if (photo.storagePath) {
        const storageRef = ref(storage, photo.storagePath);
        await deleteObject(storageRef);
      }

      // Delete from Firestore
      await deleteDoc(doc(db, 'photos', photoToDelete));

      setPhotos(photos.filter(p => p.id !== photoToDelete));
      showToast('Photo deleted successfully', 'success');
      setSelectedPhoto(null);
    } catch (error: any) {
      showToast(t('deleteError', { message: error.message }), 'error');
    } finally {
      setPhotoToDelete(null);
    }
  };

  const toggleSelectMode = () => {
    setSelectMode(!selectMode);
    setSelectedPhotos(new Set());
  };

  const togglePhotoSelection = (photoId: string) => {
    const newSelected = new Set(selectedPhotos);
    if (newSelected.has(photoId)) {
      newSelected.delete(photoId);
    } else {
      newSelected.add(photoId);
    }
    setSelectedPhotos(newSelected);
  };

  const handleDeleteSelected = async () => {
    if (selectedPhotos.size === 0) return;

    setDeleting(true);
    setShowBulkDeleteModal(false);

    try {
      const deletePromises = Array.from(selectedPhotos).map(async (photoId) => {
        const photo = photos.find(p => p.id === photoId);
        if (!photo) return;

        // Delete from storage
        if (photo.storagePath) {
          const storageRef = ref(storage, photo.storagePath);
          try {
            await deleteObject(storageRef);
          } catch (err) {
            console.error(`Error deleting storage file for ${photoId}:`, err);
          }
        }

        // Delete from Firestore
        await deleteDoc(doc(db, 'photos', photoId));
      });

      await Promise.all(deletePromises);

      // Update UI
      setPhotos(photos.filter(p => !selectedPhotos.has(p.id)));
      showToast(`${selectedPhotos.size} photo${selectedPhotos.size > 1 ? 's' : ''} deleted successfully`, 'success');
      setSelectedPhotos(new Set());
      setSelectMode(false);
    } catch (error: any) {
      showToast(`Error deleting photos: ${error.message}`, 'error');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-theme-accent-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // Filter to only show user's own photos in select mode
  const selectablePhotos = photos.filter(p => p.userId === user?.uid);
  const canSelect = user && selectablePhotos.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      {/* Header - Mobile Stacked, Desktop Horizontal */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-3xl md:text-4xl font-bold">{t('title')}</h1>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'createdAt' | 'upvoteCount')}
              className="flex-1 sm:flex-none px-3 py-2 text-sm border border-theme-border-hover rounded-lg bg-theme-bg-primary text-theme-text-primary hover:border-gray-400 focus:ring-2 focus:ring-theme-accent-500 focus:border-transparent transition-colors"
            >
              <option value="createdAt">{t('sortByDate')}</option>
              <option value="upvoteCount">{tVoting('sortByVotes')}</option>
            </select>

            {canSelect && (
              <>
                {selectMode ? (
                  <>
                    <button
                      onClick={toggleSelectMode}
                      className="px-3 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    {selectedPhotos.size > 0 && (
                      <button
                        onClick={() => setShowBulkDeleteModal(true)}
                        disabled={deleting}
                        className="px-3 py-2 text-sm text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
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
                        {deleting ? 'Deleting...' : `Delete (${selectedPhotos.size})`}
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    onClick={toggleSelectMode}
                    className="px-3 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                  >
                    <CheckSquare className="w-4 h-4" />
                    Select
                  </button>
                )}
              </>
            )}

            {user && (
              <Link
                href="/upload"
                className="flex-1 sm:flex-none px-4 py-2 text-sm text-center bg-theme-accent-600 text-white rounded-lg hover:bg-theme-accent-700 transition-colors font-medium"
              >
                {t('uploadPhoto')}
              </Link>
            )}
          </div>
        </div>
      </div>

      {photos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-theme-text-secondary">{t('emptyGallery')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {photos.map((photo) => {
            const isOwner = photo.userId === user?.uid;
            const isSelected = selectedPhotos.has(photo.id);
            const isSelectable = selectMode && isOwner;

            return (
              <div
                key={photo.id}
                className={`bg-theme-bg-primary rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-all ${
                  isSelected ? 'ring-4 ring-blue-500' : ''
                }`}
                onClick={() => {
                  if (isSelectable) {
                    togglePhotoSelection(photo.id);
                  } else if (!selectMode) {
                    setSelectedPhoto(photo);
                  }
                }}
              >
                <div className="aspect-square bg-theme-bg-tertiary relative">
                  <img
                    src={photo.url}
                    alt={photo.caption || ''}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {isSelectable && (
                    <div className="absolute top-2 right-2">
                      {isSelected ? (
                        <CheckSquare className="w-8 h-8 text-theme-accent-600 bg-theme-bg-primary rounded" />
                      ) : (
                        <Square className="w-8 h-8 text-theme-text-tertiary bg-theme-bg-primary rounded" />
                      )}
                    </div>
                  )}
                </div>
              <div className="p-4">
                {photo.caption && (
                  <p className="font-medium text-theme-text-primary line-clamp-2 mb-2">
                    {photo.caption}
                  </p>
                )}
                {photo.place && (
                  <p className="text-sm text-theme-text-secondary mb-2">📍 {photo.place}</p>
                )}
                {photo.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {photo.tags.slice(0, 3).map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-theme-accent-600 text-white text-xs rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="space-y-3">
                  <p className="text-sm text-theme-text-secondary">{t('photoBy', { name: photo.userName })}</p>
                  <div onClick={(e) => e.stopPropagation()} className="flex justify-center pt-2 border-t border-theme-border">
                    <UpvoteButton col="photos" id={photo.id} size="sm" showLabel />
                  </div>
                </div>
              </div>
            </div>
          );
          })}
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
            {/* Action buttons */}
            <div className="absolute top-4 right-4 z-20 flex gap-2">
              {user?.uid === selectedPhoto.userId && (
                <button
                  onClick={() => setPhotoToDelete(selectedPhoto.id)}
                  className="p-3 rounded-full shadow-lg transition-colors"
                  style={{
                    backgroundColor: 'rgb(var(--danger-600))',
                    color: '#fff'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgb(var(--danger-700))';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgb(var(--danger-600))';
                  }}
                  title="Delete photo"
                >
                  <Trash2 className="w-6 h-6" />
                </button>
              )}
              <button
                onClick={() => setSelectedPhoto(null)}
                className="p-3 bg-theme-bg-primary text-theme-text-primary rounded-full hover:bg-theme-bg-tertiary shadow-lg transition-colors"
                title="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Full-screen image */}
            <div className="flex-1 flex items-center justify-center p-4">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.caption || ''}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            {/* Compact details bar at bottom */}
            <div className="bg-theme-bg-primary bg-opacity-95 backdrop-blur-sm border-t border-theme-border">
              <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold mb-2 truncate">
                      {selectedPhoto.caption || t('noCaption')}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-theme-text-secondary">
                      <span className="font-medium">{selectedPhoto.userName}</span>
                      {selectedPhoto.place && (
                        <>
                          <span className="text-theme-text-tertiary">•</span>
                          <span>📍 {selectedPhoto.place}</span>
                        </>
                      )}
                      <span className="text-theme-text-tertiary">•</span>
                      <span className="text-theme-text-secondary">{t(`visibility${selectedPhoto.visibility.charAt(0).toUpperCase() + selectedPhoto.visibility.slice(1)}`)}</span>
                    </div>
                  </div>

                  {selectedPhoto.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedPhoto.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-theme-accent-600 text-white text-sm rounded-full whitespace-nowrap"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!photoToDelete}
        onClose={() => setPhotoToDelete(null)}
        onConfirm={handleDeletePhoto}
        title={t('deletePhoto')}
        message={t('confirmDelete')}
        confirmText={t('deletePhoto')}
        cancelText={t('close')}
        confirmVariant="danger"
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmModal
        isOpen={showBulkDeleteModal}
        onClose={() => setShowBulkDeleteModal(false)}
        onConfirm={handleDeleteSelected}
        title="Delete Photos"
        message={`Are you sure you want to delete ${selectedPhotos.size} photo${selectedPhotos.size > 1 ? 's' : ''}?`}
        confirmText={`Delete ${selectedPhotos.size} Photo${selectedPhotos.size > 1 ? 's' : ''}`}
        cancelText="Cancel"
        confirmVariant="danger"
      />
    </div>
  );
}
