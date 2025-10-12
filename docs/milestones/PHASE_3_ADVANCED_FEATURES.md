# Phase 3: Advanced Features

## Overview

Enhance the photo-sharing platform with interactive features including map visualization, comments, reactions, and timeline view. This phase transforms the application from a simple gallery into an engaging social travel diary.

## Objectives

- Implement interactive map with geotagged photos
- Add photo detail pages with comments and reactions
- Create timeline view grouped by date
- Polish UI/UX with responsive design improvements
- Enable real-time social interactions

## Prerequisites

- Phase 2 completed successfully
- Photos can be uploaded with lat/lng coordinates
- Gallery displays photos correctly
- User authentication functional

## Deliverables

### 1. Interactive Map View

#### Tasks
1. Install mapping libraries: `npm install leaflet react-leaflet date-fns`
2. Create map component with Leaflet
3. Display geotagged photos as markers
4. Add photo popups on marker click
5. Implement visibility filtering on map

#### Acceptance Criteria
- ✅ Map displays all geotagged photos
- ✅ Markers show photo preview in popup
- ✅ Clicking marker popup link navigates to photo detail
- ✅ Map respects visibility rules (public/friends/hidden)
- ✅ Map auto-centers based on photo locations
- ✅ Responsive on mobile and desktop

#### File: `app/map/page.tsx`
```typescript
import dynamic from "next/dynamic";

const MapClient = dynamic(() => import("@/components/MapView"), { ssr: false });

export default function MapPage() {
  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-bold">🗺️ Trip Map</h1>
      <MapClient />
    </div>
  );
}
```

#### File: `components/MapView.tsx`
```typescript
"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import Link from "next/link";

const pin = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

type Photo = {
  id: string;
  url: string;
  caption?: string;
  lat?: number | null;
  lng?: number | null;
  place?: string | null;
  userId: string;
  visibility: "public" | "friends" | "hidden";
};

export default function MapView() {
  const [user] = useAuthState(auth);
  const [points, setPoints] = useState<Photo[]>([]);

  useEffect(() => {
    (async () => {
      const snap = await getDocs(
        query(collection(db, "photos"), orderBy("createdAt", "desc"))
      );
      const all = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Photo[];

      // Filter: must have coordinates AND be visible
      const visible = all.filter(
        (p) =>
          p.lat != null &&
          p.lng != null &&
          (p.visibility === "public" ||
            (p.visibility === "friends" && user) ||
            p.userId === user?.uid)
      );
      setPoints(visible);
    })();
  }, [user]);

  // Default center: Perth, Australia
  const center = points.length
    ? [points[0].lat as number, points[0].lng as number]
    : [-31.95, 115.86];

  return (
    <div className="h-[70vh] rounded-xl overflow-hidden shadow">
      <MapContainer center={center as any} zoom={6} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {points.map((p) => (
          <Marker key={p.id} position={[p.lat as number, p.lng as number]} icon={pin}>
            <Popup>
              <div className="text-sm">
                {p.place && <div className="font-semibold">{p.place}</div>}
                <div className="mt-1">
                  <img
                    src={p.url}
                    alt={p.caption}
                    className="w-48 h-32 object-cover rounded"
                  />
                </div>
                <div className="mt-1">{p.caption}</div>
                <Link href={`/photos/${p.id}`} className="underline text-blue-600 text-xs">
                  Open photo
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
```

---

### 2. Photo Detail Page with Comments & Reactions

#### Tasks
1. Create dynamic route `/app/photos/[id]/page.tsx`
2. Display full-size photo with metadata
3. Implement emoji reaction system
4. Add comment thread
5. Use real-time Firestore listeners

#### Subcollections
**Comments**: `photos/{photoId}/comments`
```typescript
interface Comment {
  id: string;
  userId: string;
  displayName: string;
  text: string;
  createdAt: Timestamp;
}
```

**Reactions**: `photos/{photoId}/reactions/{userId}`
```typescript
interface Reaction {
  "❤️"?: boolean;
  "🔥"?: boolean;
  "😄"?: boolean;
  "👏"?: boolean;
  "😍"?: boolean;
}
```

#### Acceptance Criteria
- ✅ Full-size photo displayed
- ✅ Caption and place shown
- ✅ Users can toggle reactions (❤️🔥😄👏😍)
- ✅ Reaction counts update in real-time
- ✅ Users can add comments
- ✅ Comments sorted by timestamp
- ✅ Real-time comment updates via Firestore listener

#### File: `app/photos/[id]/page.tsx`
```typescript
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

type Photo = {
  id: string;
  url: string;
  caption?: string;
  userId: string;
  visibility: "public" | "friends" | "hidden";
  place?: string | null;
  lat?: number | null;
  lng?: number | null;
  createdAt?: any;
};

const EMOJIS = ["❤️", "🔥", "😄", "👏", "😍"];

export default function PhotoPage() {
  const { id } = useParams<{ id: string }>();
  const [user] = useAuthState(auth);
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>({});
  const [myReactions, setMyReactions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!id) return;

    // Fetch photo
    (async () => {
      const snap = await getDoc(doc(db, "photos", id as string));
      if (snap.exists()) setPhoto({ id: snap.id, ...(snap.data() as any) });
    })();

    // Listen to comments
    const unsubComments = onSnapshot(
      collection(db, "photos", id as string, "comments"),
      (qs) => {
        setComments(qs.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
      }
    );

    // Listen to reactions
    const unsubReactions = onSnapshot(
      collection(db, "photos", id as string, "reactions"),
      (qs) => {
        const counts: Record<string, number> = {};
        qs.forEach((d) => {
          const data = d.data() as Record<string, boolean>;
          EMOJIS.forEach((e) => {
            if (data[e]) counts[e] = (counts[e] || 0) + 1;
          });
        });
        setReactionCounts(counts);

        if (user) {
          const mine = qs.docs.find((d) => d.id === user.uid)?.data() as
            | Record<string, boolean>
            | undefined;
          setMyReactions(mine || {});
        }
      }
    );

    return () => {
      unsubComments();
      unsubReactions();
    };
  }, [id, user]);

  const addComment = async () => {
    if (!user || !text.trim() || !id) return;
    await addDoc(collection(db, "photos", id as string, "comments"), {
      userId: user.uid,
      displayName: user.displayName || "Anonymous",
      text,
      createdAt: serverTimestamp(),
    });
    setText("");
  };

  const toggleReaction = async (emoji: string) => {
    if (!user || !id) return;
    const ref = doc(db, "photos", id as string, "reactions", user.uid);
    const next = { ...myReactions, [emoji]: !myReactions[emoji] };
    await setDoc(ref, next, { merge: true });
  };

  if (!photo) return <main>Loading…</main>;

  return (
    <main className="grid lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <img
          src={photo.url}
          alt={photo.caption}
          className="w-full object-contain max-h-[70vh]"
        />
        <div className="p-4 text-sm text-gray-700">
          <div className="font-semibold">{photo.caption}</div>
          {photo.place && <div className="text-xs text-gray-500 mt-1">📍 {photo.place}</div>}
        </div>
      </div>

      <div className="grid gap-4">
        {/* Reactions */}
        <div className="bg-white rounded-xl shadow p-4">
          <div className="mb-2 font-semibold">Reactions</div>
          <div className="flex gap-2 flex-wrap">
            {EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => toggleReaction(e)}
                className={`px-3 py-1 rounded-full border text-lg ${
                  myReactions[e] ? "bg-blue-50 border-blue-300" : "bg-white"
                }`}
                title={myReactions[e] ? "Remove reaction" : "React"}
              >
                {e} <span className="text-xs ml-1">{reactionCounts[e] || 0}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Comments */}
        <div className="bg-white rounded-xl shadow p-4">
          <div className="mb-2 font-semibold">Comments</div>
          <div className="grid gap-3 max-h-[40vh] overflow-auto">
            {comments
              .sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0))
              .map((c) => (
                <div key={c.id} className="border rounded p-2">
                  <div className="text-xs text-gray-500">{c.displayName || "User"}</div>
                  <div>{c.text}</div>
                </div>
              ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input
              className="border rounded p-2 flex-1"
              placeholder="Write a comment…"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button onClick={addComment} className="bg-blue-600 text-white px-3 rounded">
              Send
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
```

---

### 3. Timeline View

#### Tasks
1. Create route `/app/timeline/page.tsx`
2. Fetch all photos sorted by date
3. Group photos by day
4. Display in chronological order
5. Apply visibility filtering

#### Acceptance Criteria
- ✅ Photos grouped by date (YYYY-MM-DD format)
- ✅ Most recent dates appear first
- ✅ Each day shows grid of photos
- ✅ Clicking photo navigates to detail page
- ✅ Respects visibility rules

#### File: `app/timeline/page.tsx`
```typescript
"use client";

import { useEffect, useMemo, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { format } from "date-fns";
import Link from "next/link";

type Photo = {
  id: string;
  url: string;
  caption?: string;
  createdAt?: any;
  userId: string;
  visibility: "public" | "friends" | "hidden";
};

function dayKey(ts?: any) {
  if (!ts?.toDate) return "Unknown";
  return format(ts.toDate(), "yyyy-MM-dd");
}

export default function TimelinePage() {
  const [user] = useAuthState(auth);
  const [photos, setPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    (async () => {
      const snap = await getDocs(
        query(collection(db, "photos"), orderBy("createdAt", "desc"))
      );
      const all = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Photo[];

      const visible = all.filter(
        (p) =>
          p.visibility === "public" ||
          (p.visibility === "friends" && user) ||
          p.userId === user?.uid
      );
      setPhotos(visible);
    })();
  }, [user]);

  const groups = useMemo(() => {
    const map = new Map<string, Photo[]>();
    photos.forEach((p) => {
      const key = dayKey(p.createdAt);
      map.set(key, [...(map.get(key) || []), p]);
    });
    return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [photos]);

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-bold">🕓 Timeline</h1>
      {groups.map(([day, items]) => (
        <section key={day}>
          <h2 className="text-lg font-semibold text-gray-700">{day}</h2>
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {items.map((p) => (
              <Link
                key={p.id}
                href={`/photos/${p.id}`}
                className="block bg-white rounded-xl shadow overflow-hidden"
              >
                <img src={p.url} alt={p.caption} className="w-full h-40 object-cover" />
                {p.caption && (
                  <div className="p-2 text-sm text-gray-700 line-clamp-2">{p.caption}</div>
                )}
              </Link>
            ))}
          </div>
        </section>
      ))}
      {!groups.length && <div>No photos yet.</div>}
    </div>
  );
}
```

---

### 4. UI/UX Polish

#### Tasks
1. Update global layout with improved navbar
2. Add hero section to landing page
3. Ensure mobile responsiveness across all pages
4. Add loading states
5. Improve color scheme and typography

#### Improvements
- Gradient backgrounds
- Card-based layouts
- Hover effects on interactive elements
- Consistent spacing and typography
- Mobile-first responsive design

---

## Testing Checklist

- [ ] Map displays all geotagged photos
- [ ] Marker popups show correct photo previews
- [ ] Photo detail page loads correctly
- [ ] Users can add reactions
- [ ] Reaction counts update in real-time
- [ ] Users can post comments
- [ ] Comments appear in chronological order
- [ ] Timeline groups photos by date correctly
- [ ] All pages responsive on mobile
- [ ] Loading states display appropriately
- [ ] Visibility rules enforced on map and timeline

## Dependencies

```json
{
  "dependencies": {
    "leaflet": "^1.9.4",
    "react-leaflet": "^4.2.1",
    "date-fns": "^3.0.0"
  }
}
```

## Performance Considerations

1. **Map Optimization**:
   - Only load markers for visible photos
   - Use marker clustering for dense areas (future enhancement)

2. **Real-time Listeners**:
   - Unsubscribe from listeners when component unmounts
   - Limit comment/reaction fetches to recent items

3. **Image Loading**:
   - Use Next.js Image component for optimization (optional)
   - Implement lazy loading for gallery grids

## Next Steps

Upon completion of Phase 3, proceed to **Phase 4: Security & Admin System** (see `PHASE_4_SECURITY_ADMIN.md`).

---

**Phase Duration**: 2-3 days
**Complexity**: Medium-High
**Status**: Enhanced Features
