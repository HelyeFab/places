# Phase 5: Upvote/Voting System - Deployment Brief

**Phase**: 5 (New Feature - Voting System)
**Agent Roles**: Backend Specialist + Frontend Specialist (2 agents)
**Priority**: HIGH - User-Requested Feature
**Estimated Duration**: 6-8 hours total (3-4 hours backend + 3-4 hours frontend)
**Status**: READY TO DEPLOY (After Phase 3 fixes)
**Dependencies**: Phase 3 must be fixed and approved first

---

## Context

The user has requested a comprehensive upvote/voting system that is:
- **Reusable** across entity types (photos, albums, comments, etc.)
- **Tamper-resistant** with server-maintained counts
- **Fast UI** with optimistic updates
- **Secure** with proper authentication and Firestore rules

This is a production-quality feature specification that requires:
1. Cloud Functions for authoritative vote counting
2. Firestore security rules updates
3. Reusable React hooks
4. UI components
5. Complete i18n implementation

---

## Mission Statement

Implement a production-ready, reusable upvote system that allows authenticated users to vote on photos, albums, and comments. Votes are tamper-resistant (server-maintained), fast (optimistic UI), and properly internationalized for English and Italian.

---

## Critical Success Factors

1. **Reusability**: Single implementation works for photos, albums, comments
2. **Security**: Server-maintained counts, client cannot tamper
3. **Performance**: Optimistic UI updates, atomic Cloud Function increments
4. **i18n Compliance**: 100% - ALL strings must be translated (EN + IT)
5. **User Experience**: One-click toggle, clear feedback
6. **TypeScript**: Strict mode, zero errors
7. **Testing**: Comprehensive acceptance criteria met

---

## Architecture Overview

### Data Model Pattern

```
/{collection}/{docId}
  upvoteCount: number   // Server-maintained by Cloud Functions
  ...
  /votes/{uid}          // Subcollection: presence = user upvoted
    userId: string
    createdAt: Timestamp
```

**Collections that will be votable**:
- `/photos/{photoId}/votes/{uid}`
- `/albums/{albumId}/votes/{uid}`
- `/comments/{commentId}/votes/{uid}` (within photo detail context)

### Component Layers

```
┌─────────────────────────────────┐
│   UI: UpvoteButton Component    │ ← User clicks
├─────────────────────────────────┤
│   Hook: useUpvote               │ ← Optimistic update
├─────────────────────────────────┤
│   Firestore: votes/{uid}        │ ← Create/delete doc
├─────────────────────────────────┤
│   Cloud Function: onVoteCreate  │ ← Increment count
│   Cloud Function: onVoteDelete  │ ← Decrement count
├─────────────────────────────────┤
│   Firestore: upvoteCount        │ ← Authoritative count
└─────────────────────────────────┘
```

---

## Phase 5 Deliverables

This phase is split into **2 sub-phases** for parallel agent deployment:

### Phase 5A: Backend Infrastructure (Backend Specialist)

**Duration**: 3-4 hours

#### 1. Cloud Functions Setup

**File**: `/functions/package.json`
```json
{
  "name": "functions",
  "scripts": {
    "build": "tsc",
    "serve": "npm run build && firebase emulators:start --only functions",
    "shell": "npm run build && firebase functions:shell",
    "start": "npm run shell",
    "deploy": "firebase deploy --only functions",
    "logs": "firebase functions:log"
  },
  "engines": {
    "node": "18"
  },
  "main": "lib/index.js",
  "dependencies": {
    "firebase-admin": "^12.0.0",
    "firebase-functions": "^5.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0"
  }
}
```

**File**: `/functions/tsconfig.json`
```json
{
  "compilerOptions": {
    "module": "commonjs",
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "outDir": "lib",
    "sourceMap": true,
    "strict": true,
    "target": "es2017"
  },
  "compileOnSave": true,
  "include": [
    "src"
  ]
}
```

**File**: `/functions/src/index.ts`
```typescript
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
```

#### 2. Firestore Security Rules Update

**File**: `firestore.rules` (ADD to existing rules)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function (already exists, keep it)
    function userRole() {
      return request.auth != null
        ? get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role
        : null;
    }

    // ---- NEW: Generic votes subcollection ----
    // Path: /{col}/{doc}/votes/{uid}
    // Works for photos, albums, comments, etc.
    match /{col}/{doc}/votes/{uid} {
      // Anyone can read vote counts
      allow read: if true;

      // Create = upvote (only if authenticated and voting for yourself)
      allow create: if request.auth != null
                    && request.auth.uid == uid
                    && request.resource.data.userId == request.auth.uid
                    // Ensure vote doc doesn't already exist
                    && !exists(/databases/$(database)/documents/$(col)/$(doc)/votes/$(uid));

      // Delete = unvote (only yourself)
      allow delete: if request.auth != null
                    && request.auth.uid == uid;

      // No updates allowed (no downvote concept, no field tampering)
      allow update: if false;
    }

    // Existing rules for photos, albums, comments remain unchanged
    // upvoteCount is updated by Cloud Functions, not by clients
  }
}
```

#### 3. Initialize upvoteCount Field

**Migration Script**: `/scripts/add_upvote_counts.ts`
```typescript
import { db } from '@/lib/firebase';
import { collection, getDocs, writeBatch } from 'firebase/firestore';

/**
 * One-time migration script to add upvoteCount: 0 to all existing documents
 * Run with: npx ts-node scripts/add_upvote_counts.ts
 */

async function addUpvoteCountsToCollection(collectionName: string) {
  console.log(`Adding upvoteCount to ${collectionName}...`);

  const snapshot = await getDocs(collection(db, collectionName));
  const batch = writeBatch(db);
  let count = 0;

  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    if (data.upvoteCount === undefined) {
      batch.update(doc.ref, { upvoteCount: 0 });
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
  try {
    await addUpvoteCountsToCollection('photos');
    await addUpvoteCountsToCollection('albums');
    console.log('✓ Migration complete');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main();
```

#### 4. Update TypeScript Interfaces

**File**: Update existing type definitions (e.g., `types/photo.ts`)

```typescript
// Add upvoteCount to Photo interface
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
  visibility: "public" | "friends" | "hidden";
  place?: string;
  lat?: number | null;
  lng?: number | null;
  createdAt: Timestamp;
  upvoteCount: number;  // ADD THIS
}

// Add Album interface if not exists
export interface Album {
  id: string;
  userId: string;
  userName: string;
  title: string;
  description?: string;
  coverPhotoUrl?: string;
  photoCount: number;
  createdAt: Timestamp;
  upvoteCount: number;  // ADD THIS
}

// Add Vote interface
export interface Vote {
  userId: string;
  createdAt: Timestamp;
}
```

**Backend Specialist Acceptance Criteria**:
- [ ] `/functions` directory created with package.json, tsconfig.json, src/index.ts
- [ ] Cloud Functions implemented (onVoteCreate, onVoteDelete)
- [ ] Functions build without errors (`npm run build` in /functions)
- [ ] Firestore rules updated with votes subcollection rules
- [ ] Migration script created for upvoteCount field
- [ ] TypeScript interfaces updated
- [ ] Documentation provided for deploying functions

---

### Phase 5B: Frontend Implementation (Frontend Specialist)

**Duration**: 3-4 hours

**Dependencies**: Phase 5A backend completed

#### 1. Reusable Hook: `useUpvote`

**File**: `/lib/useUpvote.ts`

```typescript
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
 * @returns { count, hasVoted, canVote, toggle }
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
```

#### 2. UI Component: `UpvoteButton`

**File**: `/components/voting/UpvoteButton.tsx`

```typescript
"use client";

import { useUpvote, VotableCollection } from "@/lib/useUpvote";
import { useTranslations } from "next-intl";
import { ThumbsUp } from "lucide-react";

interface UpvoteButtonProps {
  col: VotableCollection;
  id: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

/**
 * Reusable upvote button component
 *
 * @example
 * <UpvoteButton col="photos" id={photo.id} />
 * <UpvoteButton col="albums" id={album.id} size="lg" showLabel />
 */
export default function UpvoteButton({
  col,
  id,
  size = "md",
  showLabel = false
}: UpvoteButtonProps) {
  const t = useTranslations('voting');
  const { count, hasVoted, canVote, toggle, isLoading } = useUpvote(col, id);

  // Size classes
  const sizeClasses = {
    sm: "px-2 py-1 text-xs gap-1",
    md: "px-3 py-1.5 text-sm gap-1.5",
    lg: "px-4 py-2 text-base gap-2"
  };

  const iconSizes = {
    sm: 12,
    md: 16,
    lg: 20
  };

  // Tooltip text
  const getTitle = () => {
    if (!canVote) return t('signInToVote');
    return hasVoted ? t('removeVote') : t('giveVote');
  };

  // Button styling
  const buttonClass = `
    ${sizeClasses[size]}
    rounded-full border flex items-center
    transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
    ${hasVoted
      ? 'bg-blue-50 border-blue-400 text-blue-700 hover:bg-blue-100'
      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
    }
    ${isLoading ? 'opacity-70 cursor-wait' : ''}
  `.trim().replace(/\s+/g, ' ');

  return (
    <button
      onClick={toggle}
      disabled={!canVote || isLoading}
      title={getTitle()}
      className={buttonClass}
      aria-label={getTitle()}
    >
      <ThumbsUp
        size={iconSizes[size]}
        fill={hasVoted ? "currentColor" : "none"}
        strokeWidth={hasVoted ? 0 : 2}
      />
      <span className="font-medium tabular-nums">{count}</span>
      {showLabel && (
        <span className="ml-1">{t('votes', { count })}</span>
      )}
    </button>
  );
}
```

#### 3. Translation Files

**File**: `/i18n/locales/en/voting.json`

```json
{
  "giveVote": "Give an upvote",
  "removeVote": "Remove vote",
  "signInToVote": "Sign in to vote",
  "votes": "{count} {count, plural, one {vote} other {votes}}",
  "upvote": "Upvote",
  "upvoted": "Upvoted",
  "topRated": "Top Rated",
  "mostVoted": "Most Voted",
  "sortByVotes": "Sort by votes"
}
```

**File**: `/i18n/locales/it/voting.json`

```json
{
  "giveVote": "Metti un voto positivo",
  "removeVote": "Rimuovi voto",
  "signInToVote": "Accedi per votare",
  "votes": "{count} {count, plural, one {voto} other {voti}}",
  "upvote": "Vota",
  "upvoted": "Votato",
  "topRated": "Più Votati",
  "mostVoted": "Più Votati",
  "sortByVotes": "Ordina per voti"
}
```

#### 4. Update i18n Configuration

**File**: `/i18n/request.ts` (ADD voting namespace)

```typescript
import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en';

  return {
    locale,
    messages: {
      ...(await import(`./locales/${locale}/common.json`)).default,
      ...(await import(`./locales/${locale}/auth.json`)).default,
      ...(await import(`./locales/${locale}/navigation.json`)).default,
      ...(await import(`./locales/${locale}/landing.json`)).default,
      ...(await import(`./locales/${locale}/pages.json`)).default,
      ...(await import(`./locales/${locale}/upload.json`)).default,
      ...(await import(`./locales/${locale}/gallery.json`)).default,
      ...(await import(`./locales/${locale}/albums.json`)).default,
      ...(await import(`./locales/${locale}/photoDetail.json`)).default,
      ...(await import(`./locales/${locale}/voting.json`)).default,  // ADD THIS
    },
  };
});
```

#### 5. Integrate UpvoteButton into Existing Pages

**Locations to add voting**:

1. **Photo Cards** (`/components/gallery/PhotoCard.tsx`):
```typescript
import UpvoteButton from '@/components/voting/UpvoteButton';

// In the card component, add:
<div className="flex items-center gap-2">
  <UpvoteButton col="photos" id={photo.id} size="sm" />
  {/* Other actions */}
</div>
```

2. **Photo Detail Page** (`/app/photos/[id]/page.tsx`):
```typescript
// Near the top, below the photo:
<div className="flex items-center gap-4">
  <UpvoteButton col="photos" id={photoId} size="lg" showLabel />
  {/* Reactions section */}
</div>
```

3. **Album Cards** (if album list exists):
```typescript
<UpvoteButton col="albums" id={album.id} size="md" />
```

4. **Gallery Page with Sort by Votes** (`/app/gallery/page.tsx`):
```typescript
// Add sort dropdown:
<select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
  <option value="createdAt">{t('gallery.sortByDate')}</option>
  <option value="upvoteCount">{t('voting.sortByVotes')}</option>
</select>

// Update query:
const q = sortBy === 'upvoteCount'
  ? query(collection(db, 'photos'),
      where('visibility', '==', 'public'),
      orderBy('upvoteCount', 'desc'),
      limit(50))
  : query(/* existing query */);
```

**Frontend Specialist Acceptance Criteria**:
- [ ] `/lib/useUpvote.ts` created with complete hook implementation
- [ ] `/components/voting/UpvoteButton.tsx` created
- [ ] Translation files created (voting.json EN + IT)
- [ ] i18n/request.ts updated with voting namespace
- [ ] UpvoteButton integrated into PhotoCard
- [ ] UpvoteButton integrated into Photo Detail page
- [ ] Optional: Sort by votes in gallery
- [ ] TypeScript compiles with zero errors
- [ ] All strings use i18n translations
- [ ] Both EN and IT translations tested

---

## Combined Acceptance Criteria (Both Agents)

### Functional Requirements (15/15)

- [ ] Cloud Functions deployed and working
- [ ] Authenticated users can upvote photos
- [ ] Authenticated users can upvote albums
- [ ] Upvotes toggle (on → off → on)
- [ ] Vote counts display correctly
- [ ] Vote counts update in real-time
- [ ] Optimistic UI updates (instant feedback)
- [ ] Rollback on error (if network fails)
- [ ] Unauthenticated users cannot vote
- [ ] Users can only vote once per item
- [ ] Votes persist across sessions
- [ ] Gallery can sort by vote count
- [ ] Firestore security rules enforce vote restrictions
- [ ] Cloud Functions maintain accurate counts
- [ ] No race conditions under concurrent voting

### Code Quality (10/10)

- [ ] TypeScript compiles with zero errors
- [ ] Zero ESLint warnings
- [ ] Reusable hook works for photos, albums, comments
- [ ] UpvoteButton component properly typed
- [ ] Cloud Functions build without errors
- [ ] Firestore rules deployed successfully
- [ ] Clean code structure
- [ ] Proper error handling
- [ ] Console logging appropriate (not excessive)
- [ ] Migration script provided for existing data

### i18n Compliance (5/5) ⚠️ CRITICAL

- [ ] **ALL UI strings use `useTranslations('voting')`**
- [ ] English translations complete (voting.json)
- [ ] Italian translations complete (voting.json)
- [ ] Both languages tested
- [ ] No hardcoded user-facing text

### Security (5/5)

- [ ] Only authenticated users can vote
- [ ] Users can only vote for themselves (uid check)
- [ ] Users cannot update vote documents (only create/delete)
- [ ] upvoteCount only updated by Cloud Functions
- [ ] Firestore rules prevent tampering
- [ ] No security rule bypasses

### Performance & UX (5/5)

- [ ] Optimistic UI feels instant
- [ ] Real-time count updates smooth
- [ ] No flickering or layout shifts
- [ ] Button disabled during loading
- [ ] Clear visual feedback (filled/unfilled thumb icon)

**Total**: 40/40 acceptance criteria

**Minimum to Pass**: 32/40 (80%)
**Target**: 38+/40 (95%+)

---

## Testing Checklist

### Unit Tests (Document for user)
- [ ] useUpvote hook returns correct state
- [ ] toggle() function works
- [ ] Optimistic updates and rollbacks work
- [ ] UpvoteButton renders correctly

### Integration Tests (Document for user)
- [ ] Vote document created in Firestore
- [ ] Cloud Function increments count
- [ ] Vote document deleted on unvote
- [ ] Cloud Function decrements count
- [ ] Real-time listeners update UI

### User Acceptance Tests (Document for user)

**Test 1: Upvote a photo**
1. Navigate to gallery
2. Find a photo card
3. Click upvote button
4. See count increase
5. Button turns blue (filled)
6. Refresh page
7. Vote persists

**Test 2: Remove upvote**
1. Click upvote button again
2. See count decrease
3. Button turns gray (unfilled)
4. Refresh page
5. Unvote persists

**Test 3: Unauthenticated user**
1. Sign out
2. Try to click upvote
3. Button disabled
4. Tooltip says "Sign in to vote"

**Test 4: Sort by votes**
1. Upload several photos
2. Upvote some photos multiple times (from different accounts)
3. Go to gallery
4. Select "Sort by votes"
5. Most-voted photos appear first

**Test 5: i18n compliance**
1. Switch to Italian (IT)
2. All voting UI in Italian
3. Switch back to English (EN)
4. All voting UI in English

---

## Firestore Composite Indexes Required

When sorting by upvoteCount, Firestore may require composite indexes:

**Index 1**: `photos` collection
- Collection ID: `photos`
- Fields indexed:
  - `visibility` Ascending
  - `upvoteCount` Descending
  - `createdAt` Descending

**Index 2**: `albums` collection
- Collection ID: `albums`
- Fields indexed:
  - `upvoteCount` Descending
  - `createdAt` Descending

**How to create**:
1. Deploy the code
2. Try to sort by votes
3. Firestore error will include a link to create the index
4. Click the link → index created automatically

---

## Deployment Steps

### Backend Specialist

1. **Create Cloud Functions**
   ```bash
   mkdir -p functions/src
   # Create files as specified above
   cd functions
   npm install
   npm run build  # Verify builds
   ```

2. **Deploy Functions**
   ```bash
   firebase deploy --only functions
   # Wait for deployment to complete
   # Test in Firebase Console
   ```

3. **Update Firestore Rules**
   ```bash
   # Edit firestore.rules with votes subcollection rules
   firebase deploy --only firestore:rules
   ```

4. **Run Migration Script**
   ```bash
   npx ts-node scripts/add_upvote_counts.ts
   # Verify all photos and albums have upvoteCount: 0
   ```

### Frontend Specialist

1. **Create Hook and Component**
   ```bash
   # Create lib/useUpvote.ts
   # Create components/voting/UpvoteButton.tsx
   ```

2. **Add Translations**
   ```bash
   # Create i18n/locales/en/voting.json
   # Create i18n/locales/it/voting.json
   # Update i18n/request.ts
   ```

3. **Integrate into Pages**
   ```bash
   # Update components/gallery/PhotoCard.tsx
   # Update app/photos/[id]/page.tsx
   # Update app/gallery/page.tsx (sort)
   ```

4. **Test**
   ```bash
   npm run build
   npx tsc --noEmit
   npm run dev
   # Test all acceptance criteria
   ```

---

## Known Limitations & Future Enhancements

### MVP Scope (Included)
- Upvote only (no downvote)
- One vote per user per item
- Works for photos, albums
- Real-time updates
- Optimistic UI

### Future Enhancements (Not in Phase 5)
- Downvote support
- Vote activity feed
- Top voters leaderboard
- Vote notifications
- Vote analytics
- Comment voting (extend pattern)
- Batch vote operations
- Vote history for users

---

## Anti-Abuse Measures

### Included in MVP
1. **Authentication Required**: Must be signed in
2. **Firestore Rules**: Prevent vote tampering
3. **Single Vote**: Rules enforce !exists() check
4. **Server Counts**: Cloud Functions maintain truth

### Future Hardening (Post-MVP)
1. **Firebase App Check**: Add reCAPTCHA v3 or DeviceCheck
2. **Rate Limiting**: Cooldown period between votes
3. **Audit Logs**: Track vote activity for abuse detection
4. **IP Throttling**: Prevent scripted voting

---

## Success Metrics

Phase 5 will be evaluated on:
- **Completeness**: 30% - All voting features working
- **Code Quality**: 25% - Clean, reusable code
- **i18n Compliance**: 20% - 100% translated
- **Security**: 15% - Tamper-resistant, rules enforced
- **Performance**: 10% - Fast UI, atomic updates

**Minimum Passing Score**: 80%
**Target Score**: 95%

---

## Orchestration Strategy

**2 Agents in Parallel**:

1. **Backend Specialist** (Phase 5A):
   - Sets up Cloud Functions
   - Updates Firestore rules
   - Creates migration script
   - Updates TypeScript types
   - **Estimated**: 3-4 hours

2. **Frontend Specialist** (Phase 5B):
   - Creates useUpvote hook
   - Builds UpvoteButton component
   - Adds translations (EN + IT)
   - Integrates into pages
   - **Estimated**: 3-4 hours

**Dependencies**:
- Frontend can start hook development in parallel
- Frontend needs backend deployed before full testing
- Both agents must coordinate on TypeScript interfaces

**Coordination Point**: After 3 hours, sync on:
- TypeScript interfaces aligned
- Vote document structure confirmed
- Test backend + frontend integration

---

## Completion Reports Required

### Backend Specialist Report

```markdown
# Phase 5A (Backend) Completion Report

## Cloud Functions Deployed
- onVoteCreate: ✅/❌
- onVoteDelete: ✅/❌

## Firestore Rules Updated
- Votes subcollection rules: ✅/❌
- Rules deployed: ✅/❌

## Migration Script
- Script created: ✅/❌
- Script executed: ✅/❌
- Photos upvoteCount: X documents updated
- Albums upvoteCount: X documents updated

## Testing
- Functions build: ✅/❌
- Functions deploy: ✅/❌
- Vote creation triggers function: ✅/❌
- Vote deletion triggers function: ✅/❌
- Count increments correctly: ✅/❌
- Count decrements correctly: ✅/❌

## Issues Encountered
[Document any issues and resolutions]
```

### Frontend Specialist Report

```markdown
# Phase 5B (Frontend) Completion Report

## Files Created
1. lib/useUpvote.ts - Reusable voting hook
2. components/voting/UpvoteButton.tsx - UI component
3. i18n/locales/en/voting.json - English translations (X keys)
4. i18n/locales/it/voting.json - Italian translations (X keys)

## Files Modified
1. i18n/request.ts - Added voting namespace
2. components/gallery/PhotoCard.tsx - Integrated UpvoteButton
3. app/photos/[id]/page.tsx - Integrated UpvoteButton
4. app/gallery/page.tsx - Added sort by votes

## Testing Results
- Build Status: ✅/❌ `npm run build`
- TypeScript: ✅/❌ `npx tsc --noEmit`
- English Translations: ✅/❌
- Italian Translations: ✅/❌
- Optimistic UI: ✅/❌
- Real-time Updates: ✅/❌
- Error Rollback: ✅/❌

## i18n Compliance
- Zero hardcoded strings: ✅/❌
- All strings translated EN: ✅/❌
- All strings translated IT: ✅/❌

## Issues Encountered
[Document any issues and resolutions]
```

---

## Timeline

**Backend Specialist (Phase 5A)**: 3-4 hours
**Frontend Specialist (Phase 5B)**: 3-4 hours
**Total Parallel Execution**: 3-4 hours
**Integration Testing**: 1 hour
**Total Phase 5**: 6-8 hours

---

## Deployment

**Deployed By**: Scrum Master (New Assignment)
**Deployment Time**: After Phase 3 fixes approved
**Priority**: HIGH - User-requested feature
**Expected Completion**: 6-8 hours from deployment

---

**This is a production-quality feature. Maintain the same quality standards as Phases 1-2! 🎯👍**
