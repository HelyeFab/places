# AI Agent Work Assignment: Phase 2 - Upload & Albums System

## Agent Role
**Feature Development Specialist - Photo Management**

You are an expert full-stack developer specializing in Firebase-powered applications. Your role is to implement the core photo upload, album management, and tagging functionality that transforms the application into a functional photo-sharing platform.

---

## Agent Prompt

```
You are tasked with implementing Phase 2 of the Australia 2026 Shared Album MVP.
This phase builds the core photo management features including uploads, albums, tags, and visibility controls.

PROJECT CONTEXT:
- Base infrastructure from Phase 1 is complete and functional
- Firebase services (Auth, Firestore, Storage) are configured
- Users can authenticate via Google OAuth
- You are building on top of existing Next.js 15 + TypeScript + Tailwind setup

YOUR OBJECTIVES:
1. Design Firestore data models for photos and albums
2. Implement album creation and detail pages
3. Build photo upload system with metadata
4. Create public gallery with visibility filtering
5. Implement tagging system with comma-separated input

DELIVERABLES:

1. FIRESTORE DATA MODELS
   Define two collections:

   Collection: "photos"
   {
     id: string (auto-generated),
     userId: string (owner Firebase UID),
     albumId: string | null (optional album reference),
     url: string (Firebase Storage download URL),
     caption: string (optional),
     tags: string[] (free-form tags),
     visibility: "public" | "friends" | "hidden",
     place: string | null (location name),
     lat: number | null (latitude),
     lng: number | null (longitude),
     createdAt: Timestamp (server timestamp)
   }

   Collection: "albums"
   {
     id: string (auto-generated),
     userId: string (owner Firebase UID),
     title: string,
     description: string (optional),
     createdAt: Timestamp
   }

2. ALBUM CREATION PAGE
   - Create file: app/albums/new/page.tsx
   - Implement "use client" component
   - Form fields: title (required), description (optional)
   - Use Firebase addDoc to create album
   - Redirect to /albums/{id} after creation
   - Add authentication guard (must be signed in)
   - Use serverTimestamp() for createdAt

3. ALBUM DETAIL PAGE
   - Create file: app/albums/[id]/page.tsx
   - Fetch album data using getDoc
   - Query photos where albumId matches
   - Apply visibility filtering:
     * public: show to everyone
     * friends: show only to authenticated users
     * hidden: show only to owner
   - Display photo grid (2 cols mobile, 4 cols desktop)
   - Link each photo to /photos/{id}

4. PHOTO UPLOAD PAGE
   - Create file: app/upload/page.tsx
   - Multi-field form with:
     * File input (accept images only)
     * Caption text input
     * Album dropdown (fetch user's albums)
     * Tags input (comma-separated, e.g., "Sydney, Beach")
     * Visibility selector (public/friends/hidden)
     * Place text input
     * Latitude and Longitude number inputs
   - Upload flow:
     1. Upload file to Storage: photos/{userId}/{timestamp}_{filename}
     2. Get download URL
     3. Create Firestore document in "photos" collection
     4. Show success message
     5. Clear form
   - Parse tags: split by comma, trim whitespace, filter empty
   - Authentication guard required

5. PUBLIC GALLERY PAGE
   - Create file: app/gallery/page.tsx
   - Fetch all photos ordered by createdAt descending
   - Apply visibility filtering based on authentication state
   - Display responsive grid (2/3/4 columns)
   - Show caption overlay on photos
   - Link each photo to /photos/{id}
   - Handle empty state gracefully

VISIBILITY FILTERING LOGIC:
function isVisible(photo, currentUser) {
  if (photo.visibility === "public") return true;
  if (photo.visibility === "friends" && currentUser) return true;
  if (photo.userId === currentUser?.uid) return true;
  return false;
}

TECHNICAL REQUIREMENTS:
- Use Firebase Storage uploadBytes and getDownloadURL
- Use Firestore addDoc, getDocs, query, where, orderBy
- Use serverTimestamp() for all timestamp fields
- Implement proper error handling with try/catch
- Show loading states during async operations
- Use useEffect for data fetching
- Use useState for form state management
- Type all data with TypeScript interfaces
- Make all pages responsive

FIREBASE IMPORTS NEEDED:
import { storage, db, auth } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  addDoc,
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

FIRESTORE INDEXES TO CREATE:
Navigate to Firebase Console → Firestore → Indexes and create:
1. Collection: photos
   Fields: userId (Ascending), createdAt (Descending)
2. Collection: photos
   Fields: albumId (Ascending), createdAt (Descending)
3. Collection: photos
   Fields: visibility (Ascending), createdAt (Descending)

TESTING CHECKLIST:
- [ ] User can create a new album
- [ ] Album creation redirects to album detail page
- [ ] Album detail page shows correct photos
- [ ] User can upload photo without selecting album
- [ ] User can upload photo to specific album
- [ ] Tags are saved as array in Firestore
- [ ] Comma-separated tags parse correctly
- [ ] Visibility "public" shows to logged-out users
- [ ] Visibility "friends" shows only to logged-in users
- [ ] Visibility "hidden" shows only to owner
- [ ] Gallery displays all visible photos
- [ ] Lat/lng accept decimal numbers
- [ ] Place field accepts text
- [ ] Upload shows success message
- [ ] Form clears after successful upload

FILE STRUCTURE TO CREATE:
/app
├── albums/
│   ├── new/
│   │   └── page.tsx
│   └── [id]/
│       └── page.tsx
├── upload/
│   └── page.tsx
└── gallery/
    └── page.tsx

ACCEPTANCE CRITERIA:
✅ Albums can be created and viewed
✅ Photos can be uploaded with full metadata
✅ Tags system works with comma separation
✅ Visibility rules enforced correctly
✅ Gallery shows filtered photos
✅ All pages are responsive
✅ No TypeScript errors
✅ Proper error handling implemented
✅ Loading states displayed
✅ Forms validate required fields

REFERENCE DOCUMENTATION:
- Milestone document: docs/milestones/PHASE_2_UPLOAD_ALBUMS.md
- Phase 1 completion report
- MVP Overview: docs/MVP_OVERVIEW.md

COMPLETION REPORT:
When finished, provide:
1. Confirmation of all deliverables created
2. Testing checklist completion status
3. Sample Firestore document structures created
4. Screenshot of working upload and gallery
5. List of Firestore indexes created
6. Any edge cases handled
7. Recommendations for Phase 3
```

---

## Success Metrics

- **Functionality**: All CRUD operations working for photos and albums
- **Data Integrity**: Firestore documents match schema exactly
- **User Experience**: Upload completes in <10 seconds for 5MB image
- **Code Quality**: Zero TypeScript errors, all promises properly handled

## Common Pitfalls to Avoid

1. **Storage Path**: Not using consistent path structure causes orphaned files
2. **Timestamp**: Using `Date.now()` instead of `serverTimestamp()` causes timezone issues
3. **Visibility**: Forgetting to filter photos server-side exposes hidden content
4. **Tags**: Not trimming whitespace creates empty tags
5. **Album Query**: Not checking albumId null causes query errors
6. **File Size**: Not validating file size before upload can exceed quota
7. **Async/Await**: Forgetting await on Firebase calls causes race conditions

## Handoff to Phase 3

Before proceeding to Phase 3, ensure:
- ✅ All Phase 2 acceptance criteria met
- ✅ Upload, gallery, and album pages fully functional
- ✅ Firestore indexes created in Firebase Console
- ✅ Visibility filtering tested with multiple user accounts
- ✅ No console errors or warnings
- ✅ Code committed with descriptive commit messages

**Next Agent**: Advanced Features Specialist (see `AGENT_PHASE_3.md`)

---

**Estimated Duration**: 8-10 hours
**Complexity Level**: Medium
**Dependencies**: Phase 1 complete
