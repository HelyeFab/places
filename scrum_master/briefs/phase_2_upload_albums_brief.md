# Phase 2: Upload & Albums System - Deployment Brief

**Agent Role**: Feature Development Specialist
**Phase**: 2 (Upload & Albums)
**Priority**: HIGH
**Estimated Duration**: 8-10 hours
**Status**: READY TO DEPLOY

---

## Context

Phase 1, 1.5, and 1.6 have been successfully completed:
- ✅ Next.js 15 + Firebase infrastructure
- ✅ Authentication with 4 methods (Google, Email, Magic Link, Phone)
- ✅ i18n system with English and Italian
- ✅ Clean, responsive UI

Now we need to build the **core photo-sharing functionality**: upload photos, create albums, tag system, visibility controls, and public gallery.

---

## Objectives

Build a complete photo management system with:

1. **Photo Upload System**
   - Upload to Firebase Storage
   - Capture metadata (caption, tags, location)
   - Save to Firestore database

2. **Album Management**
   - Create albums
   - Add photos to albums
   - View album details

3. **Tagging System**
   - Free-form tags (comma-separated input)
   - Filter by tags in gallery

4. **Visibility Controls**
   - Public: Anyone can see
   - Friends-only: (for now, treat as public - we'll add friend system in Phase 4)
   - Hidden: Only owner can see

5. **Public Gallery**
   - Display all public photos
   - Responsive grid layout
   - Filter by tags
   - Filter by user

---

## Deliverables

### 1. Firestore Data Models

#### Photo Document (`photos` collection)
```typescript
interface Photo {
  id: string;                    // Auto-generated
  userId: string;                // Owner's Firebase Auth UID
  userName: string;              // User's display name
  userEmail: string;             // User's email
  albumId: string | null;        // Reference to album (optional)
  url: string;                   // Firebase Storage download URL
  storagePath: string;           // Storage path for deletion
  caption?: string;              // Optional photo caption
  tags: string[];                // Free-form tags ["Sydney", "Beach"]
  visibility: "public" | "friends" | "hidden";
  place?: string;                // Location name "Sydney Opera House"
  lat?: number | null;           // Latitude for mapping (optional)
  lng?: number | null;           // Longitude for mapping (optional)
  createdAt: Timestamp;          // Server timestamp
}
```

#### Album Document (`albums` collection)
```typescript
interface Album {
  id: string;                    // Auto-generated
  userId: string;                // Owner's Firebase Auth UID
  userName: string;              // User's display name
  title: string;                 // Album name
  description?: string;          // Optional description
  coverPhotoUrl?: string;        // First photo URL for thumbnail
  photoCount: number;            // Number of photos in album
  createdAt: Timestamp;          // Server timestamp
}
```

### 2. Pages to Create

#### `/app/upload/page.tsx`
- Photo upload form
- File picker (accept image/*)
- Caption input
- Tags input (comma-separated)
- Location input (optional)
- Visibility dropdown (public/friends/hidden)
- Album selector dropdown (optional)
- Upload progress indicator
- Success/error messages
- **MUST use i18n translations for all strings**

#### `/app/albums/new/page.tsx`
- Album creation form
- Title input (required)
- Description textarea (optional)
- Create button
- **MUST use i18n translations for all strings**

#### `/app/gallery/page.tsx`
- Display all public photos in responsive grid
- Filter dropdown by tags
- Filter dropdown by user
- "Upload Photo" button (if authenticated)
- Click photo to open detail modal/page
- **MUST use i18n translations for all strings**

#### `/app/albums/[id]/page.tsx` (Optional - Nice to Have)
- Display single album details
- Show album title, description
- Show all photos in that album
- "Add Photo" button (if owner)

### 3. Components to Create

#### `components/upload/PhotoUploadForm.tsx`
- Complete upload form
- File input with preview
- Metadata fields (caption, tags, location, visibility, album)
- Upload to Firebase Storage
- Save metadata to Firestore
- Handle upload progress
- Error handling

#### `components/gallery/PhotoGrid.tsx`
- Responsive photo grid (Tailwind CSS)
- 1 column on mobile, 2-3 columns on tablet, 4-5 on desktop
- Lazy loading (optional - nice to have)
- Photo cards with hover effects

#### `components/gallery/PhotoCard.tsx`
- Single photo card
- Display thumbnail
- Show caption overlay on hover
- Click to view full photo
- Show visibility icon (public/friends/hidden)

#### `components/gallery/PhotoFilters.tsx`
- Tag filter dropdown
- User filter dropdown
- Clear filters button

#### `components/albums/AlbumCard.tsx`
- Display album with cover photo
- Show title and photo count
- Click to open album

### 4. Firebase Integration

#### Storage Structure
```
photos/
  {userId}/
    {timestamp}_{filename}
```

#### Firestore Collections
- `photos` - All uploaded photos
- `albums` - All albums

#### Security Rules (Basic)
```javascript
// Firestore Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /photos/{photoId} {
      // Anyone can read public photos
      allow read: if resource.data.visibility == "public"
                  || request.auth != null && request.auth.uid == resource.data.userId;

      // Only authenticated users can create photos
      allow create: if request.auth != null
                    && request.resource.data.userId == request.auth.uid;

      // Only owner can update/delete
      allow update, delete: if request.auth != null
                             && request.auth.uid == resource.data.userId;
    }

    match /albums/{albumId} {
      // Anyone can read albums
      allow read: if true;

      // Only authenticated users can create albums
      allow create: if request.auth != null
                    && request.resource.data.userId == request.auth.uid;

      // Only owner can update/delete
      allow update, delete: if request.auth != null
                             && request.auth.uid == resource.data.userId;
    }
  }
}

// Storage Rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /photos/{userId}/{filename} {
      // Anyone can read
      allow read: if true;

      // Only authenticated users can upload their own photos
      allow write: if request.auth != null
                   && request.auth.uid == userId
                   && request.resource.size < 10 * 1024 * 1024  // 10MB limit
                   && request.resource.contentType.matches('image/.*');
    }
  }
}
```

### 5. Translation Keys

Add to `i18n/locales/en/*.json` and `i18n/locales/it/*.json`:

**New file: `i18n/locales/en/upload.json`**
```json
{
  "title": "Upload Photo",
  "selectPhoto": "Select Photo",
  "photoSelected": "Photo selected",
  "changePhoto": "Change Photo",
  "caption": "Caption",
  "captionPlaceholder": "Describe your photo...",
  "tags": "Tags",
  "tagsPlaceholder": "beach, sunset, sydney (comma-separated)",
  "location": "Location",
  "locationPlaceholder": "Sydney Opera House",
  "visibility": "Visibility",
  "visibilityPublic": "Public - Anyone can see",
  "visibilityFriends": "Friends Only",
  "visibilityHidden": "Hidden - Only you can see",
  "album": "Album",
  "albumNone": "No album",
  "uploadButton": "Upload Photo",
  "uploading": "Uploading...",
  "uploadSuccess": "Photo uploaded successfully!",
  "uploadError": "Error uploading photo: {message}",
  "selectPhotoError": "Please select a photo",
  "fileTooLarge": "File is too large. Maximum size: 10MB",
  "invalidFileType": "Invalid file type. Please select an image"
}
```

**New file: `i18n/locales/en/gallery.json`**
```json
{
  "title": "Gallery",
  "emptyGallery": "No photos yet",
  "emptyGalleryMessage": "Be the first to share a photo!",
  "filterByTag": "Filter by tag",
  "filterByUser": "Filter by user",
  "allTags": "All tags",
  "allUsers": "All users",
  "clearFilters": "Clear filters",
  "uploadPhoto": "Upload Photo",
  "loading": "Loading photos...",
  "error": "Error loading photos: {message}",
  "photoBy": "by {name}"
}
```

**New file: `i18n/locales/en/albums.json`**
```json
{
  "title": "Albums",
  "newAlbum": "New Album",
  "createAlbum": "Create Album",
  "albumTitle": "Album Title",
  "albumTitlePlaceholder": "My Australia Trip",
  "albumDescription": "Description",
  "albumDescriptionPlaceholder": "Photos from my trip to Australia...",
  "albumTitleRequired": "Album title is required",
  "creating": "Creating album...",
  "createSuccess": "Album created successfully!",
  "createError": "Error creating album: {message}",
  "photoCount": "{count} {count, plural, one {photo} other {photos}}",
  "emptyAlbum": "This album is empty",
  "addPhotos": "Add Photos"
}
```

### 6. Libraries to Install (if needed)

```bash
# Already have Firebase SDK from Phase 1
# No additional libraries required!
```

---

## Technical Requirements

### File Upload Flow

1. User selects image file
2. Show preview
3. User fills metadata (caption, tags, etc.)
4. On submit:
   - Upload file to Firebase Storage
   - Get download URL
   - Create Firestore document with metadata + URL
   - Show success message
   - Redirect to gallery

### Firebase Storage Upload

```typescript
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

const uploadPhoto = async (file: File, userId: string) => {
  // Create storage reference
  const timestamp = Date.now();
  const storagePath = `photos/${userId}/${timestamp}_${file.name}`;
  const storageRef = ref(storage, storagePath);

  // Upload file
  const uploadTask = uploadBytesResumable(storageRef, file);

  // Monitor progress
  uploadTask.on('state_changed',
    (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      console.log('Upload is ' + progress + '% done');
    },
    (error) => {
      console.error('Upload error:', error);
    },
    async () => {
      // Get download URL
      const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

      // Save to Firestore
      await addDoc(collection(db, 'photos'), {
        userId,
        url: downloadURL,
        storagePath,
        // ... other metadata
        createdAt: serverTimestamp()
      });
    }
  );
};
```

### Firestore Queries

```typescript
// Get all public photos
const publicPhotosQuery = query(
  collection(db, 'photos'),
  where('visibility', '==', 'public'),
  orderBy('createdAt', 'desc')
);

// Get photos by tag
const taggedPhotosQuery = query(
  collection(db, 'photos'),
  where('visibility', '==', 'public'),
  where('tags', 'array-contains', selectedTag),
  orderBy('createdAt', 'desc')
);

// Get user's photos
const userPhotosQuery = query(
  collection(db, 'photos'),
  where('userId', '==', userId),
  orderBy('createdAt', 'desc')
);
```

---

## Acceptance Criteria

### Functional Requirements
- [ ] User can upload a photo with metadata
- [ ] Photo uploads to Firebase Storage
- [ ] Photo metadata saves to Firestore
- [ ] User can create an album
- [ ] User can add photos to albums during upload
- [ ] Gallery displays all public photos
- [ ] Gallery filters by tags
- [ ] Gallery filters by user
- [ ] Visibility controls work (public/friends/hidden)
- [ ] Only owner can see hidden photos
- [ ] Photos display in responsive grid

### Code Quality
- [ ] ALL strings use i18n translations
- [ ] Both EN and IT translations provided
- [ ] TypeScript compiles with zero errors
- [ ] No console errors in browser
- [ ] Components properly extracted
- [ ] Firebase queries optimized
- [ ] Loading states for async operations
- [ ] Error handling for all edge cases

### User Experience
- [ ] Upload form is intuitive
- [ ] File preview shows before upload
- [ ] Upload progress indicator
- [ ] Success/error messages clear
- [ ] Gallery loads fast
- [ ] Photos display in good quality
- [ ] Mobile responsive design
- [ ] Smooth navigation

### Security
- [ ] Authentication required for upload
- [ ] User can only upload to their own userId
- [ ] User can only delete their own photos
- [ ] Visibility rules enforced
- [ ] File size limits enforced (10MB)
- [ ] File type validation (images only)

---

## Step-by-Step Approach

### 1. Setup (30 min)
- Create necessary translation files (upload.json, gallery.json, albums.json)
- Add translations for both EN and IT
- Update `i18n/request.ts` to load new files

### 2. Upload System (3-4 hours)
- Create `/app/upload/page.tsx`
- Build `PhotoUploadForm` component
- Implement file selection with preview
- Implement Firebase Storage upload with progress
- Save metadata to Firestore
- Handle errors and success states
- Test upload flow

### 3. Album Creation (1-2 hours)
- Create `/app/albums/new/page.tsx`
- Build album creation form
- Save to Firestore
- Redirect to gallery or album page

### 4. Gallery Display (2-3 hours)
- Create `/app/gallery/page.tsx`
- Build `PhotoGrid` component
- Build `PhotoCard` component
- Query public photos from Firestore
- Display in responsive grid
- Handle loading and error states

### 5. Filtering (1-2 hours)
- Build `PhotoFilters` component
- Implement tag filtering
- Implement user filtering
- Update queries based on filters
- "Clear filters" functionality

### 6. Polish & Testing (1-2 hours)
- Test all flows end-to-end
- Test both languages (EN/IT)
- Test mobile responsive
- Fix any bugs
- Ensure all strings translated
- Check TypeScript compilation

---

## Testing Checklist

### Upload Flow
- [ ] Navigate to `/upload`
- [ ] Select an image file
- [ ] See image preview
- [ ] Fill in caption
- [ ] Add tags (comma-separated)
- [ ] Select visibility
- [ ] Click upload
- [ ] See progress indicator
- [ ] See success message
- [ ] Redirected to gallery
- [ ] Uploaded photo appears in gallery

### Album Flow
- [ ] Navigate to `/albums/new`
- [ ] Enter album title
- [ ] Enter description
- [ ] Click create
- [ ] Album created successfully
- [ ] Can upload photos to this album

### Gallery Flow
- [ ] Navigate to `/gallery`
- [ ] See all public photos
- [ ] Photos display in responsive grid
- [ ] Filter by tag - photos update
- [ ] Filter by user - photos update
- [ ] Clear filters - shows all again
- [ ] Click photo - see full size/details

### Visibility
- [ ] Upload public photo - appears in gallery
- [ ] Upload hidden photo - does NOT appear in gallery for others
- [ ] Upload friends photo - appears in gallery (for now)
- [ ] Owner can see their hidden photos in their profile

### i18n
- [ ] Switch to Italian (IT)
- [ ] All upload form labels translated
- [ ] All gallery strings translated
- [ ] All error messages translated
- [ ] Switch back to English (EN)

### Mobile
- [ ] Upload page works on mobile
- [ ] Gallery grid stacks to 1-2 columns
- [ ] File picker works on mobile
- [ ] All buttons tap-friendly

---

## Potential Challenges & Solutions

### Challenge 1: File Size Limits
**Issue**: Users might try to upload very large images

**Solution**:
```typescript
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

if (file.size > MAX_FILE_SIZE) {
  setError(t('fileTooLarge'));
  return;
}
```

### Challenge 2: Image Preview
**Issue**: Need to show preview before upload

**Solution**:
```typescript
const [preview, setPreview] = useState<string | null>(null);

const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }
};
```

### Challenge 3: Tag Parsing
**Issue**: Parse comma-separated tags correctly

**Solution**:
```typescript
const parseTags = (tagString: string): string[] => {
  return tagString
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);
};
```

### Challenge 4: Firestore Queries with Multiple Filters
**Issue**: Firestore has limitations on compound queries

**Solution**:
- Filter in frontend after fetching
- Or use separate queries for different filters
```typescript
let photos = await getDocs(query(
  collection(db, 'photos'),
  where('visibility', '==', 'public'),
  orderBy('createdAt', 'desc')
));

// Filter by tag in frontend
if (selectedTag) {
  photos = photos.filter(photo => photo.tags.includes(selectedTag));
}
```

---

## Mandatory Resources

**USE WHEN UNSURE:**

1. **WebSearch**:
   - "Firebase Storage uploadBytesResumable progress"
   - "Firestore array-contains query"
   - "Next.js 15 image upload best practices"

2. **MCP Context7**:
   - Firebase Storage documentation
   - Firestore query documentation

3. **Read Existing Code**:
   - Study `components/auth/*` for patterns
   - Study `I18N_GUIDE.md` for translation patterns
   - Follow existing Tailwind CSS patterns

---

## Success Metrics

1. **Functionality**: All upload, album, gallery features work end-to-end
2. **Code Quality**: Zero TypeScript errors, zero console errors
3. **i18n Coverage**: 100% of strings translated in EN and IT
4. **User Experience**: Smooth, intuitive photo upload and browsing
5. **Security**: Proper authentication checks, visibility controls
6. **Performance**: Gallery loads in < 2 seconds

---

## Deliverable Checklist

- [ ] `/app/upload/page.tsx` created
- [ ] `/app/gallery/page.tsx` created
- [ ] `/app/albums/new/page.tsx` created
- [ ] `PhotoUploadForm` component built
- [ ] `PhotoGrid` component built
- [ ] `PhotoCard` component built
- [ ] `PhotoFilters` component built
- [ ] Translation files created (upload.json, gallery.json, albums.json)
- [ ] All strings translated in EN and IT
- [ ] Firebase Storage upload working
- [ ] Firestore queries working
- [ ] Responsive design verified
- [ ] All acceptance criteria met
- [ ] All tests passed
- [ ] No TypeScript errors
- [ ] No console errors

---

## Evaluation Criteria

Your work will be evaluated on:

1. **Completeness** (30 points)
   - All upload, album, gallery features implemented
   - All queries and filters working
   - Edge cases handled

2. **Code Quality** (25 points)
   - Clean TypeScript code
   - Reusable components
   - Optimized Firebase queries
   - Zero errors

3. **i18n Implementation** (20 points)
   - Zero hardcoded strings
   - Complete EN and IT translations
   - Proper next-intl usage

4. **User Experience** (15 points)
   - Intuitive upload flow
   - Fast gallery loading
   - Responsive design
   - Clear feedback

5. **Security** (10 points)
   - Authentication checks
   - Visibility controls
   - File validation
   - Size limits

**Passing Score**: 20/25 (80%)
**Target Score**: 23+/25 (92%+)

---

## Notes for Agent

1. **Use Resources**: When unsure about Firebase APIs, use WebSearch or MCP Context7
2. **Follow Patterns**: Study existing auth components for code patterns
3. **Test Everything**: Actually test upload flow, gallery, filters
4. **i18n First**: Add translations BEFORE writing components
5. **Mobile Test**: Check mobile responsive throughout

---

**Ready to Deploy**: This brief is complete and ready for Phase 2 Agent deployment.

**Working Directory**: `/home/helye/DevProject/personal/Next-js/places`

**Next Steps After Phase 2**:
- Phase 2 evaluation by Scrum Master
- Phase 3 deployment (Map, Comments, Timeline)
