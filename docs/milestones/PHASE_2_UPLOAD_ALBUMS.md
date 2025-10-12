# Phase 2: Upload & Albums System

## Overview

Implement core photo upload functionality with album organization, tagging system, and visibility controls. This phase transforms the application from a static layout into a functional photo management platform.

## Objectives

- Create photo upload interface with metadata capture
- Implement album creation and management
- Build tagging system with free-form tags
- Develop visibility control system (public, friends, hidden)
- Create public gallery with filtering capabilities

## Prerequisites

- Phase 1 completed successfully
- Firebase Authentication working
- User can sign in and see authenticated state

## Deliverables

### 1. Firestore Data Models

#### Photo Document Structure
**Collection**: `photos`

```typescript
interface Photo {
  id: string;                    // Auto-generated
  userId: string;                // Owner's Firebase Auth UID
  albumId: string | null;        // Reference to album (optional)
  url: string;                   // Firebase Storage download URL
  caption?: string;              // Optional photo caption
  tags: string[];                // Free-form tags ["Sydney", "Beach"]
  visibility: "public" | "friends" | "hidden";
  place?: string;                // Location name "Sydney Opera House"
  lat?: number | null;           // Latitude for mapping
  lng?: number | null;           // Longitude for mapping
  createdAt: Timestamp;          // Server timestamp
}
```

#### Album Document Structure
**Collection**: `albums`

```typescript
interface Album {
  id: string;                    // Auto-generated
  userId: string;                // Owner's Firebase Auth UID
  title: string;                 // Album name
  description?: string;          // Optional description
  createdAt: Timestamp;          // Server timestamp
}
```

---

### 2. Album Creation Page

#### Tasks
1. Create route `/app/albums/new/page.tsx`
2. Build form with title and description inputs
3. Implement album creation logic
4. Redirect to album detail page after creation
5. Add authentication guard

#### Acceptance Criteria
- ✅ Only authenticated users can access page
- ✅ Form validates title is not empty
- ✅ Successfully creates album in Firestore
- ✅ Redirects to `/albums/{id}` after creation
- ✅ Shows appropriate error messages

#### File: `app/albums/new/page.tsx`
```typescript
"use client";

import { useState } from "react";
import { db, auth } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";

export default function NewAlbumPage() {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const createAlbum = async () => {
    if (!user || !title.trim()) return;

    const docRef = await addDoc(collection(db, "albums"), {
      userId: user.uid,
      title,
      description,
      createdAt: serverTimestamp(),
    });

    router.push(`/albums/${docRef.id}`);
  };

  if (!user) {
    return (
      <main className="p-8 text-center">
        <p>Please sign in first.</p>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center p-8">
      <h1 className="text-2xl font-bold mb-4">🎞️ Create New Album</h1>
      <input
        type="text"
        placeholder="Album title"
        className="border rounded p-2 mb-3 w-64"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Album description (optional)"
        className="border rounded p-2 mb-3 w-64"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button
        onClick={createAlbum}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500"
      >
        Create Album
      </button>
    </main>
  );
}
```

---

### 3. Album Detail Page

#### Tasks
1. Create dynamic route `/app/albums/[id]/page.tsx`
2. Fetch album data and associated photos
3. Display photo grid with visibility filtering
4. Show album metadata (title, description, creator)

#### Acceptance Criteria
- ✅ Displays album title and description
- ✅ Shows all photos in the album
- ✅ Respects visibility rules (public/friends/hidden)
- ✅ Links photos to detail pages
- ✅ Handles non-existent albums gracefully

#### File: `app/albums/[id]/page.tsx`
```typescript
"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function AlbumDetail() {
  const { id } = useParams<{ id: string }>();
  const [user] = useAuthState(auth);
  const [album, setAlbum] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const a = await getDoc(doc(db, "albums", id as string));
      if (a.exists()) setAlbum({ id: a.id, ...a.data() });

      const qy = query(collection(db, "photos"), where("albumId", "==", id));
      const snap = await getDocs(qy);
      const all = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));

      // Filter by visibility
      const visible = all.filter((p: any) =>
        p.visibility === "public" ||
        (p.visibility === "friends" && user) ||
        p.userId === user?.uid
      );
      setPhotos(visible);
    })();
  }, [id, user]);

  if (!album) return <main>Loading…</main>;

  return (
    <main className="grid gap-4">
      <h1 className="text-2xl font-bold">🎞️ {album.title}</h1>
      {album.description && <p className="text-gray-600">{album.description}</p>}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {photos.map((p) => (
          <Link
            key={p.id}
            href={`/photos/${p.id}`}
            className="block bg-white rounded-xl shadow overflow-hidden"
          >
            <img src={p.url} alt={p.caption} className="w-full h-40 object-cover" />
          </Link>
        ))}
      </div>
    </main>
  );
}
```

---

### 4. Photo Upload Page

#### Tasks
1. Create route `/app/upload/page.tsx`
2. Build multi-field upload form
3. Implement file picker with preview
4. Upload to Firebase Storage
5. Save metadata to Firestore
6. Fetch user's albums for dropdown
7. Add tag input with comma separation
8. Add visibility selector

#### Acceptance Criteria
- ✅ Only authenticated users can access
- ✅ Supports drag-and-drop or file selection
- ✅ Shows image preview before upload
- ✅ Successfully uploads to Firebase Storage
- ✅ Creates Firestore document with metadata
- ✅ Tag input accepts comma-separated values
- ✅ Album dropdown shows user's albums
- ✅ Visibility selector includes all three options
- ✅ Optional lat/lng and place fields present

#### File: `app/upload/page.tsx`
```typescript
"use client";

import { useState, useEffect } from "react";
import { storage, db, auth } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import Link from "next/link";

export default function UploadPage() {
  const [user] = useAuthState(auth);
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [albumId, setAlbumId] = useState("");
  const [albums, setAlbums] = useState<any[]>([]);
  const [tags, setTags] = useState("");
  const [visibility, setVisibility] = useState<"public" | "friends" | "hidden">("public");
  const [place, setPlace] = useState("");
  const [lat, setLat] = useState<string>("");
  const [lng, setLng] = useState<string>("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const qy = query(collection(db, "albums"), where("userId", "==", user.uid));
      const snap = await getDocs(qy);
      setAlbums(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    })();
  }, [user]);

  const handleUpload = async () => {
    if (!file || !user) return;

    // Upload file to Storage
    const fileRef = ref(storage, `photos/${user.uid}/${Date.now()}_${file.name}`);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);

    // Save metadata to Firestore
    await addDoc(collection(db, "photos"), {
      userId: user.uid,
      albumId: albumId || null,
      caption,
      url,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      visibility,
      place: place || null,
      lat: lat ? parseFloat(lat) : null,
      lng: lng ? parseFloat(lng) : null,
      createdAt: serverTimestamp(),
    });

    alert("✅ Photo uploaded!");
    setFile(null);
    setCaption("");
    setTags("");
    setPlace("");
    setLat("");
    setLng("");
  };

  if (!user) {
    return (
      <main className="p-8 text-center">
        <p>Please log in first.</p>
      </main>
    );
  }

  return (
    <main className="grid gap-4">
      <h1 className="text-2xl font-bold">📸 Upload a Photo</h1>

      <div className="grid sm:grid-cols-2 gap-4 bg-white p-4 rounded-xl shadow">
        <div className="grid gap-3">
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <input
            className="border rounded p-2"
            placeholder="Caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
          <select
            className="border rounded p-2"
            value={albumId}
            onChange={(e) => setAlbumId(e.target.value)}
          >
            <option value="">Select Album (Optional)</option>
            {albums.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title}
              </option>
            ))}
          </select>
          <input
            className="border rounded p-2"
            placeholder="Tags (comma-separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
          <select
            className="border rounded p-2"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as any)}
          >
            <option value="public">🌍 Public</option>
            <option value="friends">👥 Friends only</option>
            <option value="hidden">🔒 Hidden</option>
          </select>
        </div>

        <div className="grid gap-3">
          <input
            className="border rounded p-2"
            placeholder="Place (e.g., Sydney Opera House)"
            value={place}
            onChange={(e) => setPlace(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              className="border rounded p-2"
              placeholder="Latitude"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
            />
            <input
              className="border rounded p-2"
              placeholder="Longitude"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
            />
          </div>
          <button
            onClick={handleUpload}
            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500"
          >
            Upload
          </button>
          <div className="text-xs text-gray-500">
            Tip: Leave lat/lng empty if you don't want the photo on the map.
          </div>
        </div>
      </div>

      <div className="text-sm flex gap-4">
        <Link href="/gallery" className="underline">Go to Gallery</Link>
        <Link href="/map" className="underline">Map</Link>
        <Link href="/timeline" className="underline">Timeline</Link>
      </div>
    </main>
  );
}
```

---

### 5. Public Gallery Page

#### Tasks
1. Create route `/app/gallery/page.tsx`
2. Fetch all photos from Firestore
3. Apply visibility filtering
4. Display photos in responsive grid
5. Link each photo to detail page
6. Show caption overlay on hover

#### Acceptance Criteria
- ✅ Displays all public photos
- ✅ Shows friends-only photos when user is logged in
- ✅ Hides hidden photos unless user is owner
- ✅ Responsive grid (2 cols mobile, 4 cols desktop)
- ✅ Photos link to `/photos/{id}`
- ✅ Lazy loading for performance

#### File: `app/gallery/page.tsx`
```typescript
"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import Link from "next/link";

export default function GalleryPage() {
  const [user] = useAuthState(auth);
  const [photos, setPhotos] = useState<any[]>([]);

  useEffect(() => {
    const fetchPhotos = async () => {
      const q = query(collection(db, "photos"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      // Apply visibility filter
      const visible = all.filter((p) => {
        if (p.visibility === "public") return true;
        if (p.visibility === "friends" && user) return true;
        if (p.userId === user?.uid) return true;
        return false;
      });

      setPhotos(visible);
    };
    fetchPhotos();
  }, [user]);

  return (
    <main className="p-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 bg-gray-50 min-h-screen">
      {photos.map((p) => (
        <Link
          href={`/photos/${p.id}`}
          key={p.id}
          className="relative group block"
        >
          <img
            src={p.url}
            alt={p.caption}
            className="rounded-lg shadow-md w-full h-full object-cover"
          />
          <div className="absolute bottom-1 left-1 text-xs bg-black/50 text-white px-2 py-1 rounded">
            {p.caption}
          </div>
        </Link>
      ))}
    </main>
  );
}
```

---

## Visibility Rules Reference

| Visibility | Condition | Who Can View |
|------------|-----------|--------------|
| `public` | Default | Everyone (including non-authenticated) |
| `friends` | User sets manually | Only logged-in users |
| `hidden` | User sets manually | Only the photo owner |

### Implementation Logic
```typescript
function isPhotoVisible(photo: Photo, currentUser: User | null): boolean {
  if (photo.visibility === "public") return true;
  if (photo.visibility === "friends" && currentUser) return true;
  if (photo.userId === currentUser?.uid) return true;
  return false;
}
```

---

## Testing Checklist

- [ ] User can create an album
- [ ] User can upload a photo without selecting an album
- [ ] User can upload a photo to a specific album
- [ ] Tags are saved as array in Firestore
- [ ] Visibility setting is respected in gallery
- [ ] Logged-out users only see public photos
- [ ] Logged-in users see public + friends photos
- [ ] Owners see all their own photos regardless of visibility
- [ ] Album detail page shows correct photos
- [ ] Lat/lng fields accept decimal numbers
- [ ] Place field accepts text input

## Database Indexes (Firestore)

Create composite indexes for performance:

1. **Photos by user and timestamp**:
   - Collection: `photos`
   - Fields: `userId` (Ascending), `createdAt` (Descending)

2. **Photos by album**:
   - Collection: `photos`
   - Fields: `albumId` (Ascending), `createdAt` (Descending)

3. **Photos by visibility**:
   - Collection: `photos`
   - Fields: `visibility` (Ascending), `createdAt` (Descending)

## Storage Organization

```
/photos
  /{userId}
    /{timestamp}_{filename}
```

**Example**: `/photos/abc123def456/1735776000000_sydney-opera.jpg`

## Next Steps

Upon completion of Phase 2, proceed to **Phase 3: Advanced Features** (see `PHASE_3_ADVANCED_FEATURES.md`).

---

**Phase Duration**: 2-3 days
**Complexity**: Medium
**Status**: Core Functionality
