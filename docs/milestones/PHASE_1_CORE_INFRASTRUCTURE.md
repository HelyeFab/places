# Phase 1: Core Infrastructure Setup

## Overview

Establish the foundational architecture for the Australia 2026 shared album application. This phase focuses on creating a robust, scalable base using Next.js 15, Firebase services, and essential authentication mechanisms.

## Objectives

- Set up Next.js 15 project with TypeScript and Tailwind CSS
- Configure Firebase services (Authentication, Firestore, Storage)
- Implement basic authentication flow
- Create global layout and navigation structure
- Establish development environment and tooling

## Prerequisites

- Node.js 18+ installed
- Firebase account created
- Code editor (VS Code recommended)
- Git for version control

## Deliverables

### 1. Project Initialization

#### Tasks
1. Create Next.js 15 application with App Router
2. Configure TypeScript for type safety
3. Set up Tailwind CSS for styling
4. Initialize Git repository

#### Acceptance Criteria
- ✅ `npm run dev` starts development server successfully
- ✅ TypeScript compilation has no errors
- ✅ Tailwind CSS classes render correctly
- ✅ `.gitignore` excludes `node_modules`, `.env.local`, `.next`

#### Technical Specifications
```bash
npx create-next-app@latest australia-2026 \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*"
```

---

### 2. Firebase Configuration

#### Tasks
1. Create Firebase project in console
2. Enable Authentication (Google + Email/Password)
3. Enable Cloud Firestore database
4. Enable Firebase Storage
5. Configure Firebase SDK in application

#### Acceptance Criteria
- ✅ Firebase project created: "Australia 2026"
- ✅ Authentication providers enabled
- ✅ Firestore database created in production mode
- ✅ Storage bucket created
- ✅ Firebase credentials stored in `.env.local`

#### File: `lib/firebase.ts`
```typescript
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

#### Environment Variables (`.env.local`)
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

---

### 3. Authentication System

#### Tasks
1. Install Firebase hooks: `npm install firebase react-firebase-hooks`
2. Create authentication button component
3. Implement Google sign-in flow
4. Implement sign-out functionality
5. Display user profile information

#### Acceptance Criteria
- ✅ Users can sign in with Google OAuth
- ✅ Users can sign out
- ✅ User display name and avatar shown when authenticated
- ✅ Authentication state persists across page reloads

#### File: `components/AuthButton.tsx`
```typescript
"use client";

import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";

export default function AuthButton() {
  const [user] = useAuthState(auth);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <div className="flex items-center gap-3">
      {user ? (
        <>
          <img
            src={user.photoURL ?? "/avatar.png"}
            alt="user avatar"
            className="w-8 h-8 rounded-full"
          />
          <span>{user.displayName}</span>
          <button
            onClick={logout}
            className="px-3 py-1 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
          >
            Sign out
          </button>
        </>
      ) : (
        <button
          onClick={login}
          className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-500"
        >
          Sign in with Google
        </button>
      )}
    </div>
  );
}
```

---

### 4. Global Layout & Navigation

#### Tasks
1. Create root layout with navbar
2. Design responsive navigation menu
3. Add footer
4. Configure global styles

#### Acceptance Criteria
- ✅ Navbar visible on all pages
- ✅ Navbar shows: Gallery, Map, Timeline, New Album, Upload links
- ✅ Navbar displays AuthButton
- ✅ Responsive design works on mobile and desktop
- ✅ Footer displays project attribution

#### File: `app/layout.tsx`
```typescript
import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Australia 2026",
  description: "Shared travel album"
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-b from-blue-50 to-white text-gray-900">
        <nav className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
            <Link href="/" className="font-bold text-xl">
              🇦🇺 Australia 2026
            </Link>
            <div className="flex gap-4 text-sm">
              <Link href="/gallery" className="hover:underline">Gallery</Link>
              <Link href="/map" className="hover:underline">Map</Link>
              <Link href="/timeline" className="hover:underline">Timeline</Link>
              <Link href="/albums/new" className="hover:underline">New Album</Link>
              <Link href="/upload" className="hover:underline">Upload</Link>
            </div>
          </div>
        </nav>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        <footer className="mx-auto max-w-6xl px-4 py-8 text-center text-xs text-gray-500">
          Built with ❤️ for our 2026 adventure
        </footer>
      </body>
    </html>
  );
}
```

---

### 5. Landing Page

#### Tasks
1. Create homepage with hero section
2. Add CTA buttons for gallery and login
3. Display project description

#### Acceptance Criteria
- ✅ Hero title: "🇦🇺 Australia 2026"
- ✅ Descriptive tagline present
- ✅ Buttons link to Gallery, Timeline, Map
- ✅ AuthButton integrated

#### File: `app/page.tsx`
```typescript
import AuthButton from "@/components/AuthButton";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="text-center grid gap-4">
      <h1 className="text-4xl font-bold">🇦🇺 Australia 2026</h1>
      <p className="text-gray-600">
        A privacy-aware shared album for our trip. Upload, tag, map, and relive moments.
      </p>
      <div className="flex items-center justify-center gap-3">
        <Link
          href="/gallery"
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-500"
        >
          View Gallery
        </Link>
        <Link href="/timeline" className="px-4 py-2 rounded-lg border">
          Open Timeline
        </Link>
        <Link href="/map" className="px-4 py-2 rounded-lg border">
          Open Map
        </Link>
      </div>
      <div className="flex justify-center mt-2">
        <AuthButton />
      </div>
    </div>
  );
}
```

---

## Testing Checklist

- [ ] Development server runs without errors
- [ ] TypeScript compilation succeeds
- [ ] User can sign in with Google
- [ ] User can sign out
- [ ] User avatar and name display correctly
- [ ] Navigation links work
- [ ] Layout renders correctly on mobile and desktop
- [ ] Firebase connection established (no console errors)

## Dependencies

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "firebase": "^10.0.0",
    "react-firebase-hooks": "^5.1.1"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "tailwindcss": "^3.4.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^15.0.0"
  }
}
```

## Environment Setup

1. Copy `.env.local.example` to `.env.local`
2. Fill in Firebase credentials from Firebase Console
3. Restart development server

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Firebase not initialized | Check environment variables are prefixed with `NEXT_PUBLIC_` |
| Auth popup blocked | Enable popups in browser settings |
| TypeScript errors | Run `npm install @types/react @types/node` |
| Tailwind not working | Verify `tailwind.config.ts` includes `./app/**/*.{ts,tsx}` |

## Next Steps

Upon completion of Phase 1, proceed to **Phase 2: Upload & Albums System** (see `PHASE_2_UPLOAD_ALBUMS.md`).

---

**Phase Duration**: 1-2 days
**Complexity**: Low
**Status**: Foundation
