# AI Agent Work Assignment: Phase 3 - Advanced Features

## Agent Role
**Advanced Features & UI/UX Specialist**

You are an expert full-stack developer specializing in interactive web applications with mapping, real-time updates, and modern UI/UX. Your role is to implement advanced social features that transform the photo platform into an engaging travel diary.

---

## Agent Prompt

```
You are tasked with implementing Phase 3 of the Australia 2026 Shared Album MVP.
This phase adds interactive map visualization, photo detail pages with social features,
timeline view, and UI/UX enhancements.

PROJECT CONTEXT:
- Phases 1 and 2 are complete and functional
- Users can upload photos with lat/lng coordinates
- Gallery displays photos with visibility filtering
- You are adding interactive and social features

YOUR OBJECTIVES:
1. Implement interactive map with Leaflet showing geotagged photos
2. Create photo detail pages with comments and reactions
3. Build timeline view grouped by date
4. Enhance UI/UX with modern design patterns
5. Implement real-time updates with Firestore listeners

DELIVERABLES:

1. INSTALL DEPENDENCIES
   Run: npm install leaflet react-leaflet date-fns
   Note: Leaflet requires CSS import and SSR disabling

2. INTERACTIVE MAP VIEW
   - Create file: app/map/page.tsx
   - Use dynamic import to disable SSR:
     const MapClient = dynamic(() => import("@/components/MapView"), { ssr: false });
   - Create file: components/MapView.tsx
   - Use "use client" directive
   - Import Leaflet CSS: import "leaflet/dist/leaflet.css"
   - Implement MapContainer from react-leaflet
   - Fetch photos with lat/lng not null
   - Apply visibility filtering
   - Add Marker for each geotagged photo
   - Create Popup with:
     * Photo preview (w-48 h-32)
     * Place name (if available)
     * Caption
     * Link to /photos/{id}
   - Default center: Perth, Australia [-31.95, 115.86]
   - Zoom level: 6
   - Use OpenStreetMap tiles

3. PHOTO DETAIL PAGE WITH COMMENTS & REACTIONS
   - Create file: app/photos/[id]/page.tsx
   - Layout: 2-column grid (lg:grid-cols-2)
     * Left: Full-size photo + metadata
     * Right: Reactions + Comments sections

   SUBCOLLECTIONS:
   - photos/{photoId}/comments
     {
       id: string,
       userId: string,
       displayName: string,
       text: string,
       createdAt: Timestamp
     }

   - photos/{photoId}/reactions/{userId}
     {
       "❤️": boolean,
       "🔥": boolean,
       "😄": boolean,
       "👏": boolean,
       "😍": boolean
     }

   REACTIONS SYSTEM:
   - Display 5 emoji buttons: ❤️ 🔥 😄 👏 😍
   - Each button shows count of reactions
   - Toggle on/off when clicked
   - Use setDoc with merge:true for user's reaction document
   - Aggregate counts across all users in real-time
   - Highlight user's own reactions (bg-blue-50)

   COMMENTS SYSTEM:
   - Display comments sorted by createdAt ascending
   - Input field for new comment
   - "Send" button to submit
   - Use addDoc to create comment
   - Show displayName and text for each comment
   - Scroll container with max-h-[40vh]

   REAL-TIME UPDATES:
   - Use onSnapshot for comments collection
   - Use onSnapshot for reactions collection
   - Unsubscribe on component unmount
   - Update UI automatically when data changes

4. TIMELINE VIEW
   - Create file: app/timeline/page.tsx
   - Fetch all photos ordered by createdAt descending
   - Apply visibility filtering
   - Group photos by date (YYYY-MM-DD format)
   - Use date-fns format function:
     import { format } from "date-fns";
     const day = format(timestamp.toDate(), "yyyy-MM-dd");
   - Display groups in reverse chronological order
   - Each group:
     * H2 heading with date
     * Photo grid (2/3/4 columns responsive)
     * Each photo links to /photos/{id}
   - Handle "Unknown" date if timestamp missing

5. UI/UX ENHANCEMENTS
   - Update gallery page:
     * Link photos to /photos/{id} instead of just displaying
     * Add hover effects
   - Consistent card-based layouts
   - Rounded corners (rounded-xl)
   - Drop shadows (shadow, shadow-md)
   - Proper spacing (gap-4, gap-6)
   - Responsive breakpoints:
     * Mobile: grid-cols-2
     * Tablet: sm:grid-cols-3
     * Desktop: md:grid-cols-4

TECHNICAL REQUIREMENTS:
- Leaflet map must use dynamic import with ssr:false
- All real-time listeners must unsubscribe on unmount
- Use onSnapshot for reactive data
- Implement proper loading states
- Handle empty states (no photos, no comments)
- Use TypeScript interfaces for all data
- Error boundaries for map rendering
- Accessibility: proper alt text, aria labels

LEAFLET MARKER SETUP:
import { Icon } from "leaflet";

const pin = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

FIREBASE IMPORTS FOR REAL-TIME:
import {
  doc,
  getDoc,
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  query,
  orderBy,
} from "firebase/firestore";

TESTING CHECKLIST:
- [ ] Map displays all geotagged photos
- [ ] Map markers show photo preview popups
- [ ] Clicking popup link navigates to photo detail
- [ ] Map respects visibility rules
- [ ] Map centers on photos (or default Perth)
- [ ] Photo detail page shows full-size image
- [ ] Users can toggle reactions on/off
- [ ] Reaction counts update in real-time
- [ ] Users can post comments
- [ ] Comments appear immediately without refresh
- [ ] Comments sorted chronologically
- [ ] Timeline groups photos by date correctly
- [ ] Timeline shows most recent dates first
- [ ] All pages responsive on mobile/tablet/desktop
- [ ] No console errors related to Leaflet SSR
- [ ] Real-time listeners properly unsubscribe

FILE STRUCTURE TO CREATE:
/app
├── map/
│   └── page.tsx
├── photos/
│   └── [id]/
│       └── page.tsx
└── timeline/
    └── page.tsx
/components
└── MapView.tsx

EDGE CASES TO HANDLE:
1. Photo with no lat/lng should not appear on map
2. Photo with no place name should show caption in popup
3. Comment without displayName should show "Anonymous"
4. Timeline with no photos should show empty state
5. Map with no geotagged photos should show default center
6. Real-time updates should not cause infinite loops
7. Leaflet icons should load from CDN correctly

ACCEPTANCE CRITERIA:
✅ Map view functional with photo markers
✅ Photo detail page with working comments
✅ Reactions toggle and count correctly
✅ Real-time updates work without refresh
✅ Timeline grouped by date properly
✅ All pages responsive
✅ No TypeScript errors
✅ No SSR errors with Leaflet
✅ Proper cleanup of listeners
✅ Loading states displayed

REFERENCE DOCUMENTATION:
- Milestone document: docs/milestones/PHASE_3_ADVANCED_FEATURES.md
- Phase 2 completion report
- Leaflet docs: https://react-leaflet.js.org/
- Firestore real-time: https://firebase.google.com/docs/firestore/query-data/listen

COMPLETION REPORT:
When finished, provide:
1. Confirmation of all features working
2. Testing checklist status
3. Screenshot of map with markers
4. Screenshot of photo detail with reactions/comments
5. Screenshot of timeline view
6. Performance notes (map load time, real-time latency)
7. Any UX improvements made
8. Recommendations for Phase 4
```

---

## Success Metrics

- **Interactivity**: Real-time updates appear within 1 second
- **Map Performance**: Renders with 50+ markers in <3 seconds
- **User Engagement**: Comments and reactions work flawlessly
- **UX Quality**: Intuitive navigation and responsive design

## Common Pitfalls to Avoid

1. **Leaflet SSR**: Not using dynamic import causes "window is not defined" error
2. **Memory Leaks**: Forgetting to unsubscribe from onSnapshot causes crashes
3. **Reaction Logic**: Not using merge:true overwrites entire reaction document
4. **Map Icons**: Leaflet icons fail to load without proper Icon configuration
5. **Timestamp Handling**: Not checking if timestamp exists before calling .toDate()
6. **Real-time Loops**: setState inside onSnapshot callback can cause infinite loops
7. **CSS Import**: Forgetting Leaflet CSS import causes broken map styling

## Handoff to Phase 4

Before proceeding to Phase 4, ensure:
- ✅ All Phase 3 acceptance criteria met
- ✅ Map, photo detail, and timeline pages fully functional
- ✅ Real-time updates working reliably
- ✅ No memory leaks from listeners
- ✅ Mobile UX tested and responsive
- ✅ Code committed with descriptive messages

**Next Agent**: Security & Admin Specialist (see `AGENT_PHASE_4.md`)

---

**Estimated Duration**: 8-12 hours
**Complexity Level**: Medium-High
**Dependencies**: Phases 1 and 2 complete
