# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a collaborative photo-sharing platform for friends traveling to Australia in 2026. Built with Next.js 15 (App Router), TypeScript, Firebase, and Tailwind CSS v4.

**Key Distinction**: The app separates **Gallery** (standalone photos without albums) from **Albums** (collections of photos). Both use the same `photos` collection in Firestore but are distinguished by the `albumId` field.

## Essential Commands

### Development
```bash
npm run dev              # Start development server (localhost:3000)
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npx tsc --noEmit        # Type checking
```

### Firebase Operations
```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage:rules

# Seed photos (for testing)
npm run seed:photos
```

## Architecture

### Data Models

**Firestore Collections:**

1. **`photos`** - Primary photo collection
   - Used by BOTH Gallery (standalone) and Albums (collections)
   - Key fields:
     - `albumId`: `null` for Gallery photos, album ID for album photos
     - `visibility`: `'public' | 'friends' | 'hidden'`
     - `userId`, `userName`: Owner info
     - `url`, `storagePath`: Image location
     - `caption`, `tags`, `place`, `lat`, `lng`: Metadata
     - `createdAt`: Timestamp
   - Subcollections: `comments/`, `reactions/`

2. **`albums`** - Album metadata
   - Fields: `userId`, `userName`, `title`, `description`, `coverPhotoUrl`, `photoCount`, `createdAt`

**Storage Structure:**
- Path: `/photos/{userId}/{filename}`
- Max size: 10MB per image
- Only authenticated users can upload to their own folder

### Key Features

**Gallery (app/gallery/page.tsx:44-88)**
- Shows standalone photos (`albumId == null`)
- Fetches public photos + user's own photos
- Supports bulk deletion with select mode
- Real-time updates using Firestore queries

**Albums (app/albums/page.tsx)**
- Shows collections of photos
- Album cover photos stored directly in album document
- Filter by "All Albums" vs "My Albums"

**Photo Upload (app/upload/page.tsx, components/upload/)**
- Multi-file upload with progress tracking
- Can upload to Gallery or Album
- Extracts EXIF data (location, date)
- Validates file size and type

**Photo Detail (app/photos/[id]/page.tsx)**
- Full-screen photo view
- Real-time reactions (❤️ 🔥 😄 👏 😍) using subcollections
- Real-time comments
- Metadata display (place, date, tags, author)

**Map View (app/map/page.tsx)**
- Uses Leaflet + react-leaflet
- Shows photos with lat/lng coordinates
- Markers clustered by location

**Timeline (app/timeline/page.tsx)**
- Groups photos by date using date-fns
- Chronological display

### Authentication

**Firebase Auth with Google OAuth**
- Configuration: lib/firebase.ts:1-24
- State management: react-firebase-hooks
- Components: components/AuthButton.tsx, components/UserMenu.tsx

### Internationalization

**next-intl setup:**
- Supported locales: `en` (English), `it` (Italiano)
- Config: i18n/config.ts:1-14
- Request handler: i18n/request.ts:1-24
- Locale stored in cookie: `NEXT_LOCALE`
- Translation files: `i18n/locales/{locale}/{namespace}.json`
- Namespaces: common, auth, navigation, landing, pages, upload, gallery, albums

**Adding translations:**
1. Add keys to both `i18n/locales/en/{namespace}.json` and `i18n/locales/it/{namespace}.json`
2. Import namespace in i18n/request.ts:13-22
3. Use in components: `const t = useTranslations('namespace')`

### Security Rules

**Firestore (firestore.rules:1-62)**
- Photos: Read if public/friends/owner, write only by owner
- Albums: Read all, write only by owner
- Comments: Read all, create if authenticated, delete own only
- Reactions: Read all, write own only

**Storage (storage.rules:1-20)**
- Read: Anyone
- Upload: Authenticated users to their own folder only, 10MB max, images only
- Delete: Owner only

### UI Components

**Reusable components:**
- `components/ui/Modal.tsx` - Modal and ConfirmModal
- `components/ui/Toast.tsx` - Toast notifications with provider
- `components/ui/Dropdown.tsx` - Dropdown menus
- `components/Navigation.tsx` - Floating mobile nav + desktop header
- `components/PageHeader.tsx` - M&F branded page headers
- `components/MapView.tsx` - Leaflet map wrapper

### Styling

**Tailwind CSS v4:**
- Config: Uses @tailwindcss/postcss
- Global styles: app/globals.css
- Gradient background: `from-blue-50 to-white`
- Mobile-first responsive design
- Custom floating navigation for mobile

## Important Patterns

### Querying Photos

**Gallery photos (standalone):**
```typescript
query(collection(db, 'photos'),
  where('visibility', '==', 'public'),
  where('albumId', '==', null),  // Key: must be null
  orderBy('createdAt', 'desc'))
```

**Album photos:**
```typescript
query(collection(db, 'photos'),
  where('albumId', '==', albumId),  // Key: matches album ID
  orderBy('createdAt', 'desc'))
```

**Composite indexes required:**
- `photos`: `visibility ASC, albumId ASC, createdAt DESC`
- `photos`: `userId ASC, albumId ASC, createdAt DESC`

### File Upload Pattern

See components/upload/PhotoUploadForm.tsx:108-183 for the complete flow:
1. Upload file to Storage (`/photos/{userId}/{filename}`)
2. Get download URL
3. Create Firestore document with metadata
4. Update album cover if applicable

### Real-time Listeners

Use onSnapshot for live updates (app/photos/[id]/page.tsx:96-139):
- Comments: Listen to `photos/{id}/comments` subcollection
- Reactions: Listen to `photos/{id}/reactions` subcollection

## Firebase Configuration

**Environment Variables (required):**
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

**Initialization:**
- Single instance pattern in lib/firebase.ts:17-24
- Placeholder values during build prevent errors
- Exports: `auth`, `db`, `storage`, `app`

## Image Optimization

**next/config.ts remote patterns:**
- firebasestorage.googleapis.com
- storage.googleapis.com
- lh3.googleusercontent.com (Google profile photos)
- images.unsplash.com (seed data)

## Development Guidelines

### Critical Rules

**No Hardcoded Text:**
- ALL user-facing text must use the i18n system
- Never use hardcoded strings like `"Click here"` or `"Error occurred"`
- Always use `const t = useTranslations('namespace')` and `{t('key')}`
- Add translations to both `i18n/locales/en/{namespace}.json` AND `i18n/locales/it/{namespace}.json`

**No Browser Native Dialogs:**
- NEVER use `alert()`, `confirm()`, or `prompt()`
- Use `components/ui/Toast.tsx` for notifications (showToast)
- Use `components/ui/Modal.tsx` (Modal or ConfirmModal) for dialogs
- Toast example: `showToast('Photo uploaded successfully', 'success')`
- ConfirmModal example: See app/gallery/page.tsx:383-392

## Common Development Workflows

### Adding a New Page
1. Create page in `app/{route}/page.tsx`
2. Add translation keys to `i18n/locales/en/{namespace}.json` and `i18n/locales/it/{namespace}.json`
3. Import namespace in i18n/request.ts:13-22
4. Update Navigation.tsx if needed
5. Add any required Firestore security rules

### Modifying Security Rules
1. Edit firestore.rules or storage.rules
2. Test locally if possible
3. Deploy: `firebase deploy --only firestore:rules` or `firebase deploy --only storage:rules`
4. Verify in Firebase Console

### Adding New Firestore Indexes
When you see "index required" errors:
1. Click the link in the error message (creates index automatically)
2. Or manually add in Firebase Console: Firestore > Indexes
3. Common pattern: Combine `where()` clauses with `orderBy()` requires composite index

## Troubleshooting

**Build fails with Firebase errors:**
- Check that placeholder values are present in lib/firebase.ts:9-14
- Ensure NEXT_PUBLIC_* env vars are set for production

**Photos not showing:**
- Verify `albumId` field (null for Gallery, ID for Albums)
- Check Firestore indexes are created
- Verify visibility permissions in firestore.rules:6-14

**Map not loading:**
- Leaflet requires client-side rendering (use 'use client')
- CSS must be imported: `import 'leaflet/dist/leaflet.css'`
- Check photos have lat/lng fields

**Internationalization issues:**
- Verify translation keys exist in both en and it locales
- Check namespace is imported in i18n/request.ts:13-22
- Cookie `NEXT_LOCALE` persists locale choice
