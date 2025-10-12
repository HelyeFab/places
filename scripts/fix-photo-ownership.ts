/**
 * Script to fix photo ownership for migrating from seed userId to real Firebase Auth UID
 *
 * Usage: npx tsx scripts/fix-photo-ownership.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const OLD_USER_ID = 'seed-emmanuelfabiani';
const NEW_USER_ID = 'TEjHVrV6oYdekg0ED0liYRMpvmP2'; // Your real Firebase Auth UID

async function fixPhotoOwnership() {
  console.log(`Fixing photo ownership...`);
  console.log(`Old userId: ${OLD_USER_ID}`);
  console.log(`New userId: ${NEW_USER_ID}`);
  console.log('');

  try {
    // Query all photos with the old userId
    const photosQuery = query(
      collection(db, 'photos'),
      where('userId', '==', OLD_USER_ID)
    );

    const snapshot = await getDocs(photosQuery);
    console.log(`Found ${snapshot.size} photos to update`);

    // Update each photo
    let updated = 0;
    for (const photoDoc of snapshot.docs) {
      try {
        await updateDoc(doc(db, 'photos', photoDoc.id), {
          userId: NEW_USER_ID,
        });
        console.log(`✓ Updated photo: ${photoDoc.id}`);
        updated++;
      } catch (error) {
        console.error(`✗ Failed to update photo ${photoDoc.id}:`, error);
      }
    }

    console.log('');
    console.log(`Successfully updated ${updated} out of ${snapshot.size} photos`);
  } catch (error) {
    console.error('Error fixing photo ownership:', error);
    process.exit(1);
  }
}

fixPhotoOwnership();
