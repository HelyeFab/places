# Australia 2026 Shared Album - MVP Overview

## Project Vision

A collaborative photo-sharing platform for friends traveling to Australia in 2026. The application enables secure, privacy-aware photo management with advanced features including geotagging, timeline views, and collaborative interaction.

## Core Objectives

1. **User-Friendly Photo Management**: Enable each friend to upload, tag, and manage their own photos effortlessly
2. **Privacy-Aware Sharing**: Photos and albums are shared by default with granular privacy controls (public, friends-only, hidden)
3. **Unified Access**: Everyone can view shared albums via a single public landing page
4. **Cross-Platform Experience**: Optimized for both mobile and desktop usage
5. **Secure Access Control**: Dynamic role-based authentication system without hardcoded credentials

## Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Frontend | Next.js 15 + TypeScript + Tailwind CSS | Modern React framework with type safety and utility-first styling |
| Storage | Firebase Storage | Scalable image hosting |
| Database | Firestore | NoSQL database for metadata, albums, users, and tags |
| Authentication | Firebase Authentication | Google and Email/Password login |
| Functions | Firebase Cloud Functions | Server-side automation and triggers |
| Hosting | Netlify or Vercel | Edge-optimized deployment |

## Core Feature Set

### 1. Public Landing Page
- Displays "Australia 2026" album overview
- Accessible to anyone with the link (public photos only)
- Clear call-to-action buttons: "View Albums", "Login to Upload"

### 2. Authentication & User Profiles
- **Sign-in Methods**: Google OAuth and Email/Password
- **User Profile Data**:
  - Display name
  - Avatar image
  - Optional short bio
  - Personal "My Albums" dashboard

### 3. Photo Upload System
- **Interface**: Drag-and-drop or file selector
- **Storage**: Firebase Storage for image files
- **Metadata** (Firestore):
  ```json
  {
    "userId": "string",
    "albumId": "string",
    "url": "string",
    "caption": "string",
    "tags": ["string"],
    "location": "string",
    "visibility": "public | friends | hidden",
    "place": "string",
    "lat": "number",
    "lng": "number",
    "createdAt": "Timestamp"
  }
  ```

### 4. Album Management
- Create, rename, and delete albums
- Albums shared by default with selective hidden images
- Auto-generated album cover from first public photo
- Album detail pages showing all contained photos

### 5. Tagging System
- Free-form tags (e.g., "Sydney", "Beach", "Sunset")
- Comma-separated tag input
- Tag-based filtering and search

### 6. Public Gallery
- Browse photos by:
  - Tag
  - Album
  - User
- Lazy-loaded photo grid for performance
- Lightbox view for full-size images
- Click-through to detailed photo pages

### 7. Visibility & Privacy Rules

| Visibility Level | Who Can View | Use Case |
|-----------------|--------------|----------|
| Public | Everyone with the link | Shareable trip highlights |
| Friends | Logged-in users only | Group-only moments |
| Hidden | Photo owner only | Personal backups, drafts |

### 8. Interactive Map View
- Display geotagged photos on interactive map (Leaflet)
- Marker popups with photo previews
- Click to open full photo detail
- Auto-center based on available photo locations

### 9. Timeline / Travel Diary
- Photos grouped by date
- Chronological trip progression
- Day-by-day visual storytelling

### 10. Photo Interaction
- **Comments**: Simple threaded comments under each photo
- **Reactions**: Emoji reactions (❤️, 🔥, 😄, 👏, 😍)
- Real-time updates via Firestore listeners

### 11. Dynamic Role-Based Access Control

#### Roles

| Role | Upload | Create Albums | Delete Any Photo | Manage Users | Comment/React |
|------|--------|---------------|------------------|--------------|---------------|
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ |
| User | ✅ (own) | ✅ | ❌ | ❌ | ✅ |
| Viewer | ❌ | ❌ | ❌ | ❌ | ✅ |

#### Auto-Assignment
- First user to sign up → **Admin**
- Subsequent users → **Viewer** (can be promoted by admin)
- No hardcoded email lists

#### Admin Dashboard
- User management interface
- Promote/demote user roles in real-time
- Content moderation (delete inappropriate photos)
- View all visibility levels

## Security Architecture

### Client-Side Protection
- Role-based route guards
- Conditional UI rendering based on permissions
- Automatic redirects for unauthorized access

### Server-Side Protection

#### Firestore Security Rules
- Dynamic role checking via Firestore `get()` function
- Write operations validate user roles and ownership
- Admin-only access to user management

#### Firebase Storage Rules
- Users can only write to their own folder (`/photos/{userId}/`)
- Read access open to all (visibility filtering handled in application layer)

#### Cloud Function Triggers
- `onUserCreate`: Auto-assign role on first signup
- Server-side validation ensures role integrity

## Project Structure

```
/australia-2026-app
├── app/
│   ├── page.tsx                      # Landing page
│   ├── layout.tsx                    # Global layout with navbar
│   ├── albums/
│   │   ├── new/page.tsx              # Create album
│   │   └── [id]/page.tsx             # Album detail
│   ├── upload/page.tsx               # Upload interface
│   ├── gallery/page.tsx              # Public gallery
│   ├── map/page.tsx                  # Map view
│   ├── timeline/page.tsx             # Timeline view
│   ├── photos/[id]/page.tsx          # Photo detail with comments/reactions
│   ├── admin/
│   │   ├── page.tsx                  # Admin dashboard
│   │   └── users/page.tsx            # User management
│   └── api/
│       ├── photos/route.ts           # Photo CRUD endpoints
│       └── albums/route.ts           # Album CRUD endpoints
├── lib/
│   ├── firebase.ts                   # Firebase initialization
│   ├── useRole.ts                    # Dynamic role hook
│   └── utils.ts                      # Utility functions
├── components/
│   ├── PhotoGrid.tsx                 # Photo grid component
│   ├── AlbumCard.tsx                 # Album card component
│   ├── UploadForm.tsx                # Upload form component
│   ├── AuthButton.tsx                # Authentication button
│   ├── MapView.tsx                   # Leaflet map component
│   └── Navbar.tsx                    # Navigation bar
├── functions/
│   └── src/
│       └── index.ts                  # Cloud Functions
├── docs/                             # Documentation
│   ├── MVP_OVERVIEW.md               # This file
│   ├── milestones/                   # Phase-based milestones
│   └── agents/                       # AI agent work assignments
└── tailwind.config.ts                # Tailwind configuration
```

## Post-MVP Enhancement Opportunities

| Feature | Description | Priority |
|---------|-------------|----------|
| Share Links with Expiration | Generate time-limited shareable album links | Medium |
| EXIF Data Extraction | Auto-populate location from photo metadata | Low |
| Activity Feed | "John added 3 new photos to Sydney Adventures" | Low |
| Album Collaboration | Multiple users can contribute to shared albums | Medium |
| Bulk Upload | Upload multiple photos at once | High |
| Photo Editing | Basic crop, rotate, filters | Low |
| Export Albums | Download entire albums as ZIP | Medium |
| Mobile App | Native iOS/Android experience | Low |

## Success Metrics

1. **Usability**: All 4 friends can upload photos within 5 minutes of signup
2. **Performance**: Gallery loads <3 seconds with 100+ photos
3. **Security**: Zero unauthorized access incidents
4. **Engagement**: Average of 10+ reactions per photo
5. **Reliability**: 99.9% uptime during trip dates

## Implementation Timeline

See detailed milestone documents in `/docs/milestones/` for phase-by-phase breakdown.

## Deployment Checklist

- [ ] Firebase project configured with Authentication, Firestore, Storage, Functions
- [ ] Environment variables set in hosting platform
- [ ] Firestore security rules deployed
- [ ] Storage security rules deployed
- [ ] Cloud Functions deployed
- [ ] First admin user created
- [ ] SSL certificate active
- [ ] Custom domain configured (optional)
- [ ] Backup strategy established

---

**Document Version**: 1.0
**Last Updated**: 2025-10-12
**Status**: Active Development
