import { Timestamp } from 'firebase/firestore';

/**
 * Photo interface
 * Represents a photo document in the 'photos' collection
 */
export interface Photo {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  albumId: string | null;
  url: string;
  storagePath: string;
  caption?: string;
  tags: string[];
  visibility: 'public' | 'friends' | 'hidden';
  place?: string;
  lat?: number | null;
  lng?: number | null;
  createdAt: Timestamp;
  upvoteCount: number;
}

/**
 * Album interface
 * Represents an album document in the 'albums' collection
 */
export interface Album {
  id: string;
  userId: string;
  userName: string;
  title: string;
  description?: string;
  coverPhotoUrl?: string;
  photoCount: number;
  createdAt: Timestamp;
  upvoteCount: number;
}

/**
 * Vote interface
 * Represents a vote document in the 'votes' subcollection
 * Path: /{collection}/{docId}/votes/{userId}
 */
export interface Vote {
  userId: string;
  createdAt: Timestamp;
}

/**
 * Comment interface (from Phase 3)
 * Represents a comment document in the 'comments' subcollection
 */
export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: Timestamp;
}

/**
 * Reaction interface (from Phase 3)
 * Represents a reaction document in the 'reactions' subcollection
 */
export interface Reaction {
  userId: string;
  userName: string;
  emoji: string;
  createdAt: Timestamp;
}
