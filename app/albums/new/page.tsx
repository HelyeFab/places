'use client';

import { useState, FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

export default function NewAlbumPage() {
  const t = useTranslations('albums');
  const router = useRouter();
  const [user] = useAuthState(auth);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Check authentication
    if (!user) {
      setError(t('authRequired'));
      return;
    }

    // Validate title
    if (!title.trim()) {
      setError(t('albumTitleRequired'));
      return;
    }

    setCreating(true);

    try {
      // Create album in Firestore
      const docRef = await addDoc(collection(db, 'albums'), {
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        title: title.trim(),
        description: description.trim() || '',
        coverPhotoUrl: '',
        photoCount: 0,
        createdAt: serverTimestamp(),
      });

      // Redirect to the newly created album
      router.push(`/albums/${docRef.id}`);
    } catch (error: any) {
      console.error('Error creating album:', error);
      setError(t('createError', { message: error.message }));
      setCreating(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-700">{t('authRequired')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">{t('newAlbum')}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Album Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            {t('albumTitle')} *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('albumTitlePlaceholder')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={creating}
            required
          />
        </div>

        {/* Album Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            {t('albumDescription')}
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('albumDescriptionPlaceholder')}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={creating}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={creating}
          className="w-full px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {creating ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              {t('creating')}
            </div>
          ) : (
            t('createAlbum')
          )}
        </button>
      </form>
    </div>
  );
}
