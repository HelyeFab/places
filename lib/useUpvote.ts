"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  collection,
  deleteDoc,
  doc,
  DocumentReference,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc
} from "firebase/firestore";

export type VotableCollection = "photos" | "albums" | "comments";

/**
 * Helper to construct the vote document reference
 */
function voteDocRef(col: VotableCollection, id: string, uid: string): DocumentReference {
  return doc(db, col, id, "votes", uid);
}

/**
 * Reusable hook for upvoting any entity type
 *
 * @param col - Collection name ('photos', 'albums', 'comments')
 * @param id - Document ID of the entity to vote on
 * @returns { count, hasVoted, canVote, toggle, isLoading }
 *
 * @example
 * const { count, hasVoted, toggle } = useUpvote('photos', photoId);
 */
export function useUpvote(col: VotableCollection, id: string) {
  const [user] = useAuthState(auth);
  const [count, setCount] = useState<number>(0);
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const uid = user?.uid || null;

  // Live listener for parent document upvoteCount
  useEffect(() => {
    const unsubParent = onSnapshot(
      doc(db, col, id),
      (d) => {
        const data = d.data();
        setCount((data?.upvoteCount as number) || 0);
      },
      (error) => {
        console.error(`[useUpvote] Error listening to ${col}/${id}:`, error);
      }
    );

    return () => unsubParent();
  }, [col, id]);

  // Live listener for user's vote document
  useEffect(() => {
    if (!uid) {
      setHasVoted(false);
      return;
    }

    const unsubVote = onSnapshot(
      doc(db, col, id, "votes", uid),
      (d) => {
        setHasVoted(d.exists());
      },
      (error) => {
        console.error(`[useUpvote] Error listening to vote:`, error);
      }
    );

    return () => unsubVote();
  }, [col, id, uid]);

  const canVote = !!uid;

  /**
   * Upvote the entity (optimistic UI)
   */
  const upvote = async () => {
    if (!uid) throw new Error("Authentication required");

    const ref = voteDocRef(col, id, uid);

    // Optimistic update
    setHasVoted(true);
    setCount((c) => c + 1);
    setIsLoading(true);

    try {
      const snapshot = await getDoc(ref);

      if (!snapshot.exists()) {
        await setDoc(ref, {
          userId: uid,
          createdAt: serverTimestamp()
        });
      }
    } catch (error) {
      // Rollback on error
      console.error('[useUpvote] Error creating vote:', error);
      setHasVoted(false);
      setCount((c) => Math.max(0, c - 1));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Remove upvote (optimistic UI)
   */
  const unvote = async () => {
    if (!uid) throw new Error("Authentication required");

    const ref = voteDocRef(col, id, uid);

    // Optimistic update
    setHasVoted(false);
    setCount((c) => Math.max(0, c - 1));
    setIsLoading(true);

    try {
      await deleteDoc(ref);
    } catch (error) {
      // Rollback on error
      console.error('[useUpvote] Error deleting vote:', error);
      setHasVoted(true);
      setCount((c) => c + 1);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Toggle vote state
   */
  const toggle = async () => {
    if (isLoading) return; // Prevent double-clicks
    return hasVoted ? unvote() : upvote();
  };

  return {
    count,
    hasVoted,
    canVote,
    toggle,
    isLoading
  };
}
