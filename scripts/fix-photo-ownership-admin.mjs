/**
 * Script to fix photo ownership using Firebase Admin SDK
 *
 * Usage: node scripts/fix-photo-ownership-admin.mjs
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Initialize Firebase Admin
const serviceAccount = JSON.parse(
  readFileSync('./service_accounts.json', 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'places-fbd86.appspot.com',
});

const db = admin.firestore();

const OLD_USER_ID = 'seed-emmanuelfabiani';
const NEW_USER_ID = 'TEjHVrV6oYdekg0ED0liYRMpvmP2';

async function fixPhotoOwnership() {
  console.log(`Fixing photo ownership...`);
  console.log(`Old userId: ${OLD_USER_ID}`);
  console.log(`New userId: ${NEW_USER_ID}`);
  console.log('');

  try {
    // Query all photos with the old userId
    const photosRef = db.collection('photos');
    const snapshot = await photosRef.where('userId', '==', OLD_USER_ID).get();

    console.log(`Found ${snapshot.size} photos to update`);

    if (snapshot.empty) {
      console.log('No photos found with the old userId');
      return;
    }

    // Update each photo
    let updated = 0;
    const batch = db.batch();

    snapshot.forEach((doc) => {
      batch.update(doc.ref, { userId: NEW_USER_ID });
      console.log(`✓ Queued update for photo: ${doc.id}`);
      updated++;
    });

    // Commit batch
    await batch.commit();
    console.log('');
    console.log(`Successfully updated ${updated} photos`);
  } catch (error) {
    console.error('Error fixing photo ownership:', error);
    process.exit(1);
  }
}

fixPhotoOwnership()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
