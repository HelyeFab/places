'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  doc,
  getDoc,
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { ArrowLeft, MapPin, Calendar, User as UserIcon } from 'lucide-react';
import { format } from 'date-fns';

type Photo = {
  id: string;
  url: string;
  caption?: string;
  tags: string[];
  visibility: 'public' | 'friends' | 'hidden';
  place?: string;
  lat?: number | null;
  lng?: number | null;
  userId: string;
  userName: string;
  createdAt: any;
};

type Comment = {
  id: string;
  userId: string;
  displayName: string;
  text: string;
  createdAt: any;
};

type Reactions = Record<string, boolean>;

const EMOJIS = ['❤️', '🔥', '😄', '👏', '😍'];

export default function PhotoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [user] = useAuthState(auth);

  const [photo, setPhoto] = useState<Photo | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>({});
  const [myReactions, setMyReactions] = useState<Reactions>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const photoId = params?.id as string;

  useEffect(() => {
    if (!photoId) return;

    const loadPhoto = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch photo data
        const photoDoc = await getDoc(doc(db, 'photos', photoId));

        if (!photoDoc.exists()) {
          setError('Photo not found');
          setLoading(false);
          return;
        }

        const photoData = {
          id: photoDoc.id,
          ...photoDoc.data(),
        } as Photo;

        setPhoto(photoData);
        setLoading(false);
      } catch (err: any) {
        console.error('Error loading photo:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    loadPhoto();

    // Listen to comments (real-time)
    const commentsQuery = query(
      collection(db, 'photos', photoId, 'comments'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribeComments = onSnapshot(commentsQuery, (snapshot) => {
      const commentsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Comment[];
      setComments(commentsData);
    });

    // Listen to reactions (real-time)
    const unsubscribeReactions = onSnapshot(
      collection(db, 'photos', photoId, 'reactions'),
      (snapshot) => {
        const counts: Record<string, number> = {};

        snapshot.forEach((doc) => {
          const data = doc.data() as Reactions;
          EMOJIS.forEach((emoji) => {
            if (data[emoji]) {
              counts[emoji] = (counts[emoji] || 0) + 1;
            }
          });
        });

        setReactionCounts(counts);

        // Get current user's reactions
        if (user) {
          const myReactionDoc = snapshot.docs.find((doc) => doc.id === user.uid);
          setMyReactions((myReactionDoc?.data() as Reactions) || {});
        }
      }
    );

    // Cleanup listeners on unmount
    return () => {
      unsubscribeComments();
      unsubscribeReactions();
    };
  }, [photoId, user]);

  const handleAddComment = async (e: FormEvent) => {
    e.preventDefault();

    if (!user || !commentText.trim() || !photoId) return;

    try {
      await addDoc(collection(db, 'photos', photoId, 'comments'), {
        userId: user.uid,
        displayName: user.displayName || 'Anonymous',
        text: commentText.trim(),
        createdAt: serverTimestamp(),
      });

      setCommentText('');
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const toggleReaction = async (emoji: string) => {
    if (!user || !photoId) return;

    try {
      const reactionRef = doc(db, 'photos', photoId, 'reactions', user.uid);
      const newReactions = {
        ...myReactions,
        [emoji]: !myReactions[emoji],
      };

      await setDoc(reactionRef, newReactions, { merge: true });
    } catch (err) {
      console.error('Error toggling reaction:', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="ml-3 text-gray-600">Loading photo...</p>
        </div>
      </div>
    );
  }

  if (error || !photo) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error || 'Photo not found'}</p>
        </div>
        <Link
          href="/gallery"
          className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Gallery
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back Button */}
      <Link
        href="/gallery"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Gallery
      </Link>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Photo Display */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <img
            src={photo.url}
            alt={photo.caption || 'Photo'}
            className="w-full object-contain max-h-[70vh]"
          />

          {/* Photo Metadata */}
          <div className="p-6 space-y-3">
            {photo.caption && (
              <p className="text-lg text-gray-900 font-medium">{photo.caption}</p>
            )}

            {photo.place && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{photo.place}</span>
              </div>
            )}

            {photo.createdAt && (
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">
                  {format(photo.createdAt.toDate(), 'MMMM d, yyyy')}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 text-gray-600">
              <UserIcon className="w-4 h-4" />
              <span className="text-sm">{photo.userName}</span>
            </div>

            {photo.tags && photo.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {photo.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Interactions Column */}
        <div className="space-y-6">
          {/* Reactions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Reactions</h2>
            <div className="flex flex-wrap gap-3">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => toggleReaction(emoji)}
                  disabled={!user}
                  className={`px-4 py-2 rounded-full border-2 text-2xl transition-all ${
                    myReactions[emoji]
                      ? 'bg-blue-50 border-blue-300 scale-110'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  } ${!user ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}`}
                  title={user ? (myReactions[emoji] ? 'Remove reaction' : 'React') : 'Sign in to react'}
                >
                  <span>{emoji}</span>
                  {reactionCounts[emoji] > 0 && (
                    <span className="ml-2 text-sm text-gray-600 font-medium">
                      {reactionCounts[emoji]}
                    </span>
                  )}
                </button>
              ))}
            </div>
            {!user && (
              <p className="text-sm text-gray-500 mt-3">Sign in to react to photos</p>
            )}
          </div>

          {/* Comments */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Comments ({comments.length})
            </h2>

            {/* Comments List */}
            <div className="space-y-4 max-h-[40vh] overflow-y-auto mb-4">
              {comments.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">
                  No comments yet. Be the first to comment!
                </p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="text-xs text-gray-500 mb-1">
                      {comment.displayName || 'Anonymous'}
                      {comment.createdAt && (
                        <span className="ml-2">
                          • {format(comment.createdAt.toDate(), 'MMM d, h:mm a')}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-900">{comment.text}</p>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment Form */}
            {user ? (
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Send
                </button>
              </form>
            ) : (
              <p className="text-sm text-gray-500 text-center">
                Sign in to leave a comment
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
