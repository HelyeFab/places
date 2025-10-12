import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

admin.initializeApp();
const db = admin.firestore();

/**
 * Generic trigger for ANY top-level collection's votes:
 * Pattern: /{col}/{doc}/votes/{uid}
 *
 * Works for:
 * - /photos/{photoId}/votes/{uid}
 * - /albums/{albumId}/votes/{uid}
 * - /comments/{commentId}/votes/{uid}
 */

export const onVoteCreate = functions.firestore
  .document("{col}/{doc}/votes/{uid}")
  .onCreate(async (snap, context) => {
    const { col, doc: docId } = context.params;

    try {
      const parentRef = db.collection(col).doc(docId);

      await parentRef.update({
        upvoteCount: admin.firestore.FieldValue.increment(1)
      });

      console.log(`[onVoteCreate] Incremented upvoteCount for ${col}/${docId}`);
    } catch (error) {
      console.error(`[onVoteCreate] Error incrementing count:`, error);
      throw error;
    }
  });

export const onVoteDelete = functions.firestore
  .document("{col}/{doc}/votes/{uid}")
  .onDelete(async (snap, context) => {
    const { col, doc: docId } = context.params;

    try {
      const parentRef = db.collection(col).doc(docId);

      await parentRef.update({
        upvoteCount: admin.firestore.FieldValue.increment(-1)
      });

      console.log(`[onVoteDelete] Decremented upvoteCount for ${col}/${docId}`);
    } catch (error) {
      console.error(`[onVoteDelete] Error decrementing count:`, error);
      throw error;
    }
  });
