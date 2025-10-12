'use client';

import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, updateDoc, getDoc, increment } from 'firebase/firestore';
import { storage, db, auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import Image from 'next/image';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface AlbumOption {
  id: string;
  title: string;
}

interface PhotoUploadFormProps {
  onSuccess?: () => void;
  preselectedAlbumId?: string;
}

export default function PhotoUploadForm({ onSuccess, preselectedAlbumId }: PhotoUploadFormProps = {}) {
  const t = useTranslations('upload');
  const router = useRouter();
  const [user] = useAuthState(auth);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState('');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'hidden'>('public');
  const [albumId, setAlbumId] = useState<string>(preselectedAlbumId || '');
  const [albums, setAlbums] = useState<AlbumOption[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [uploadedCount, setUploadedCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load user's albums
  useEffect(() => {
    if (user) {
      loadAlbums();
    }
  }, [user]);

  // Set preselected album if provided
  useEffect(() => {
    if (preselectedAlbumId) {
      setAlbumId(preselectedAlbumId);
    }
  }, [preselectedAlbumId]);

  const loadAlbums = async () => {
    if (!user) return;

    try {
      const albumsQuery = query(
        collection(db, 'albums'),
        where('userId', '==', user.uid)
      );
      const snapshot = await getDocs(albumsQuery);
      const albumsData = snapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title,
      }));
      setAlbums(albumsData);
    } catch (error) {
      console.error('Error loading albums:', error);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate all files
    const validFiles: File[] = [];
    for (const file of files) {
      if (validateFile(file)) {
        validFiles.push(file);
      }
    }

    if (validFiles.length === 0) return;

    setSelectedFiles(validFiles);
    setError(null);

    // Create previews for all files
    const newPreviews: string[] = [];
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === validFiles.length) {
          setPreviews(newPreviews);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const validateFile = (file: File): boolean => {
    if (file.size > MAX_FILE_SIZE) {
      setError(t('fileTooLarge'));
      return false;
    }
    if (!file.type.startsWith('image/')) {
      setError(t('invalidFileType'));
      return false;
    }
    return true;
  };

  const parseTags = (tagString: string): string[] => {
    return tagString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
  };

  const uploadSingleFile = (file: File, index: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      const timestamp = Date.now();
      const storagePath = `photos/${user!.uid}/${timestamp}_${file.name}`;
      const storageRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress((prev) => ({ ...prev, [file.name]: progress }));
        },
        (error) => {
          console.error(`Upload error for ${file.name}:`, error);
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            const lat = latitude ? parseFloat(latitude) : null;
            const lng = longitude ? parseFloat(longitude) : null;

            await addDoc(collection(db, 'photos'), {
              userId: user!.uid,
              userName: user!.displayName || 'Anonymous',
              userEmail: user!.email || '',
              url: downloadURL,
              storagePath,
              caption: caption.trim() || '',
              tags: parseTags(tags),
              visibility,
              place: location.trim() || '',
              lat,
              lng,
              albumId: albumId || null,
              upvoteCount: 0,
              createdAt: serverTimestamp(),
            });

            // If uploading to an album, update album metadata
            if (albumId) {
              const albumRef = doc(db, 'albums', albumId);
              const albumSnap = await getDoc(albumRef);

              if (albumSnap.exists()) {
                const albumData = albumSnap.data();
                const updates: any = {
                  photoCount: increment(1),
                };

                // Set as cover photo if album doesn't have one yet
                if (!albumData.coverPhotoUrl) {
                  updates.coverPhotoUrl = downloadURL;
                }

                await updateDoc(albumRef, updates);
              }
            }

            setUploadedCount((prev) => prev + 1);
            resolve();
          } catch (error: any) {
            console.error(`Error saving ${file.name} to Firestore:`, error);
            reject(error);
          }
        }
      );
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!user) {
      setError(t('authRequired'));
      return;
    }

    if (selectedFiles.length === 0) {
      setError(t('selectPhotoError'));
      return;
    }

    setUploading(true);
    setUploadProgress({});
    setUploadedCount(0);

    try {
      // Upload all files sequentially
      for (let i = 0; i < selectedFiles.length; i++) {
        await uploadSingleFile(selectedFiles[i], i);
      }

      setSuccess(true);
      setUploading(false);

      // Reset form
      setSelectedFiles([]);
      setPreviews([]);
      setCaption('');
      setTags('');
      setLocation('');
      setLatitude('');
      setLongitude('');
      setVisibility('public');
      if (!preselectedAlbumId) {
        setAlbumId('');
      }

      // Call onSuccess callback if provided (modal mode), otherwise redirect
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        setTimeout(() => {
          if (albumId) {
            router.push(`/albums/${albumId}`);
          } else {
            router.push('/gallery');
          }
        }, 2000);
      }
    } catch (error: any) {
      console.error('Error uploading photos:', error);
      setError(t('uploadError', { message: error.message }));
      setUploading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-700">{t('authRequired')}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* File Upload */}
      <div>
        <label className="block text-sm font-medium text-theme-text-primary mb-2">
          {t('selectPhoto')} {selectedFiles.length > 0 && `(${selectedFiles.length} ${t('filesSelected')})`}
        </label>
        <div className="flex items-center gap-4">
          <label
            htmlFor="photo-upload"
            className="px-4 py-2 bg-theme-accent-600 text-white rounded-lg hover:bg-theme-accent-700 cursor-pointer transition-colors"
          >
            {selectedFiles.length > 0 ? t('changePhoto') : t('selectPhoto')}
          </label>
          <input
            type="file"
            id="photo-upload"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
        </div>
      </div>

      {/* Image Previews */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative aspect-square bg-theme-bg-tertiary rounded-lg overflow-hidden">
              <Image
                src={preview}
                alt={`Preview ${index + 1}`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                className="object-cover"
              />
              {selectedFiles[index] && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-2 py-1">
                  <p className="text-white text-xs truncate">{selectedFiles[index].name}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Caption */}
      <div>
        <label htmlFor="caption" className="block text-sm font-medium text-theme-text-primary mb-1">
          {t('caption')}
        </label>
        <textarea
          id="caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder={t('captionPlaceholder')}
          rows={3}
          className="w-full px-4 py-2 border border-theme-border-hover rounded-lg focus:ring-2 focus:ring-theme-accent-500 focus:border-transparent"
          disabled={uploading}
        />
      </div>

      {/* Tags */}
      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-theme-text-primary mb-1">
          {t('tags')}
        </label>
        <input
          type="text"
          id="tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder={t('tagsPlaceholder')}
          className="w-full px-4 py-2 border border-theme-border-hover rounded-lg focus:ring-2 focus:ring-theme-accent-500 focus:border-transparent"
          disabled={uploading}
        />
      </div>

      {/* Location */}
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-theme-text-primary mb-1">
          {t('location')}
        </label>
        <input
          type="text"
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder={t('locationPlaceholder')}
          className="w-full px-4 py-2 border border-theme-border-hover rounded-lg focus:ring-2 focus:ring-theme-accent-500 focus:border-transparent"
          disabled={uploading}
        />
      </div>

      {/* Latitude and Longitude */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="latitude" className="block text-sm font-medium text-theme-text-primary mb-1">
            {t('latitude')}
          </label>
          <input
            type="text"
            id="latitude"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            placeholder={t('latitudePlaceholder')}
            className="w-full px-4 py-2 border border-theme-border-hover rounded-lg focus:ring-2 focus:ring-theme-accent-500 focus:border-transparent"
            disabled={uploading}
          />
        </div>
        <div>
          <label htmlFor="longitude" className="block text-sm font-medium text-theme-text-primary mb-1">
            {t('longitude')}
          </label>
          <input
            type="text"
            id="longitude"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            placeholder={t('longitudePlaceholder')}
            className="w-full px-4 py-2 border border-theme-border-hover rounded-lg focus:ring-2 focus:ring-theme-accent-500 focus:border-transparent"
            disabled={uploading}
          />
        </div>
      </div>

      {/* Visibility */}
      <div>
        <label htmlFor="visibility" className="block text-sm font-medium text-theme-text-primary mb-1">
          {t('visibility')}
        </label>
        <select
          id="visibility"
          value={visibility}
          onChange={(e) => setVisibility(e.target.value as 'public' | 'friends' | 'hidden')}
          className="w-full px-4 py-2 border border-theme-border-hover rounded-lg focus:ring-2 focus:ring-theme-accent-500 focus:border-transparent"
          disabled={uploading}
        >
          <option value="public">{t('visibilityPublic')}</option>
          <option value="friends">{t('visibilityFriends')}</option>
          <option value="hidden">{t('visibilityHidden')}</option>
        </select>
      </div>

      {/* Album Selection */}
      <div>
        <label htmlFor="album" className="block text-sm font-medium text-theme-text-primary mb-1">
          {t('album')}
        </label>
        <select
          id="album"
          value={albumId}
          onChange={(e) => setAlbumId(e.target.value)}
          className="w-full px-4 py-2 border border-theme-border-hover rounded-lg focus:ring-2 focus:ring-theme-accent-500 focus:border-transparent"
          disabled={uploading}
        >
          <option value="">{t('albumNone')}</option>
          {albums.map((album) => (
            <option key={album.id} value={album.id}>
              {album.title}
            </option>
          ))}
        </select>
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-3">
          <div className="text-sm font-medium text-theme-text-primary">
            {t('uploading')} {uploadedCount} / {selectedFiles.length}
          </div>
          {selectedFiles.map((file, index) => {
            const progress = uploadProgress[file.name] || 0;
            const isComplete = uploadedCount > index;
            return (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-xs text-theme-text-secondary">
                  <span className="truncate max-w-[70%]">{file.name}</span>
                  <span>{isComplete ? '✓' : `${Math.round(progress)}%`}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      isComplete ? 'bg-green-600' : 'bg-theme-accent-600'
                    }`}
                    style={{ width: `${isComplete ? 100 : progress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-600">{t('uploadSuccess')}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={uploading || selectedFiles.length === 0}
        className="w-full px-4 py-3 text-sm font-medium text-white bg-theme-accent-600 rounded-lg hover:bg-theme-accent-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            {t('uploading')}
          </div>
        ) : (
          selectedFiles.length > 1
            ? `${t('uploadButton')} ${selectedFiles.length} ${t('photos')}`
            : t('uploadButton')
        )}
      </button>
    </form>
  );
}
