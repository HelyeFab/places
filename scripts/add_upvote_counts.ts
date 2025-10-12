import { db } from '@/lib/firebase';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';

/**
 * One-time migration script to add upvoteCount: 0 to all existing documents
 * Run with: npx ts-node --project tsconfig.json scripts/add_upvote_counts.ts
 * Or: npm run migrate:upvotes (if added to package.json)
 */

async function addUpvoteCountsToCollection(collectionName: string) {
  console.log(`\nAdding upvoteCount to ${collectionName}...`);

  const snapshot = await getDocs(collection(db, collectionName));

  if (snapshot.empty) {
    console.log(`✓ No documents found in ${collectionName}`);
    return;
  }

  const batch = writeBatch(db);
  let count = 0;

  snapshot.docs.forEach((docSnapshot) => {
    const data = docSnapshot.data();
    if (data.upvoteCount === undefined) {
      batch.update(docSnapshot.ref, { upvoteCount: 0 });
      count++;
    }
  });

  if (count > 0) {
    await batch.commit();
    console.log(`✓ Added upvoteCount to ${count} documents in ${collectionName}`);
  } else {
    console.log(`✓ All documents in ${collectionName} already have upvoteCount`);
  }
}

async function main() {
  console.log('===========================================');
  console.log('Migration: Add upvoteCount to Collections');
  console.log('===========================================');

  try {
    await addUpvoteCountsToCollection('photos');
    await addUpvoteCountsToCollection('albums');

    console.log('\n===========================================');
    console.log('✓ Migration complete successfully!');
    console.log('===========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('\n===========================================');
    console.error('✗ Migration failed:', error);
    console.error('===========================================\n');
    process.exit(1);
  }
}

main();
