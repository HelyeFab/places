# Phase 4: Security & Admin System

## Overview

Implement a comprehensive security architecture with dynamic role-based access control, admin dashboard, and Firebase security rules. This phase eliminates hardcoded credentials and establishes a production-ready authorization system.

## Objectives

- Implement dynamic role-based access control (RBAC)
- Create admin dashboard for user management
- Deploy Firestore security rules
- Deploy Firebase Storage security rules
- Set up Cloud Functions for auto-role assignment
- Eliminate all hardcoded email lists

## Prerequisites

- Phase 3 completed successfully
- All core features functional
- Firebase project fully configured

## Deliverables

### 1. Dynamic Role System

#### User Roles

| Role | Description | Auto-Assigned |
|------|-------------|---------------|
| `admin` | Full system control | First user only |
| `user` | Can upload and manage own content | Manual promotion |
| `viewer` | Read-only access | Default for new users |

#### Firestore Collection: `users`

```typescript
interface User {
  id: string;              // Firebase Auth UID
  email: string;
  displayName: string;
  role: "admin" | "user" | "viewer";
  joinedAt: Timestamp;
}
```

---

### 2. Role Hook Implementation

#### Tasks
1. Create `lib/useRole.ts` hook
2. Fetch user role from Firestore on authentication
3. Auto-create user document if doesn't exist
4. Provide role state to components

#### Acceptance Criteria
- ✅ Returns user, role, isAdmin, isAllowed, loading states
- ✅ Creates user document with "viewer" role if new
- ✅ Fetches role from Firestore on mount
- ✅ Updates when user signs in/out

#### File: `lib/useRole.ts`
```typescript
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

type Role = "admin" | "user" | "viewer";

export function useRole() {
  const [user] = useAuthState(auth);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }

    (async () => {
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        // New user - create with "viewer" role
        // Cloud Function will handle first admin assignment
        await setDoc(ref, {
          email: user.email,
          displayName: user.displayName,
          role: "viewer",
          joinedAt: serverTimestamp(),
        });
        setRole("viewer");
      } else {
        setRole(snap.data().role);
      }
      setLoading(false);
    })();
  }, [user]);

  const isAdmin = role === "admin";
  const isAllowed = role === "admin" || role === "user";

  return { user, role, isAdmin, isAllowed, loading };
}
```

---

### 3. Protected Routes

#### Tasks
1. Update upload page with role check
2. Update album creation with role check
3. Redirect unauthorized users
4. Display appropriate error messages

#### Acceptance Criteria
- ✅ Only `admin` and `user` roles can upload
- ✅ Only `admin` and `user` roles can create albums
- ✅ `viewer` role sees friendly message
- ✅ Non-authenticated users prompted to sign in

#### Example Protection (Apply to `/app/upload/page.tsx` and `/app/albums/new/page.tsx`)
```typescript
import { useRole } from "@/lib/useRole";

export default function UploadPage() {
  const { user, isAllowed, loading } = useRole();

  if (loading) return <main className="p-8 text-center"><p>Loading...</p></main>;
  if (!user) return <main className="p-8 text-center"><p>Please sign in first.</p></main>;
  if (!isAllowed) {
    return (
      <main className="p-8 text-center">
        <p>⛔ Sorry, this account cannot upload or create albums.</p>
        <p className="text-sm text-gray-600 mt-2">
          Please contact an admin to upgrade your account.
        </p>
      </main>
    );
  }

  // Rest of component...
}
```

---

### 4. Admin Dashboard - User Management

#### Tasks
1. Create route `/app/admin/users/page.tsx`
2. Fetch all users from Firestore
3. Display user table with role dropdown
4. Implement role update functionality
5. Add admin-only route protection

#### Acceptance Criteria
- ✅ Only accessible to `isAdmin` users
- ✅ Displays all users with email, name, role
- ✅ Admin can change roles via dropdown
- ✅ Updates persist to Firestore
- ✅ Non-admins redirected to home

#### File: `app/admin/users/page.tsx`
```typescript
"use client";

import { useEffect, useState } from "react";
import { useRole } from "@/lib/useRole";
import { db } from "@/lib/firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function UsersAdminPage() {
  const { user, isAdmin, loading } = useRole();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push("/");
    }
  }, [loading, isAdmin, router]);

  useEffect(() => {
    const fetchUsers = async () => {
      const snap = await getDocs(collection(db, "users"));
      setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    if (isAdmin) fetchUsers();
  }, [isAdmin]);

  const changeRole = async (uid: string, newRole: string) => {
    await updateDoc(doc(db, "users", uid), { role: newRole });
    setUsers((u) =>
      u.map((usr) => (usr.id === uid ? { ...usr, role: newRole } : usr))
    );
  };

  if (loading) return <main className="p-8">Loading...</main>;
  if (!isAdmin) return null;

  return (
    <main className="grid gap-6">
      <h1 className="text-2xl font-bold">👥 Manage Users</h1>
      <div className="bg-white rounded-xl shadow p-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Email</th>
              <th className="text-left p-2">Role</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b">
                <td className="p-2">{u.displayName}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2">{u.role}</td>
                <td className="p-2">
                  <select
                    value={u.role}
                    onChange={(e) => changeRole(u.id, e.target.value)}
                    className="border rounded p-1"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
```

---

### 5. Admin Dashboard - Content Moderation

#### Tasks
1. Create route `/app/admin/page.tsx`
2. Display all photos with delete capability
3. Add photo metadata (uploader, visibility)
4. Implement deletion with confirmation

#### Acceptance Criteria
- ✅ Admin can view all photos regardless of visibility
- ✅ Shows uploader name and visibility status
- ✅ Delete button removes photo from Firestore
- ✅ Confirmation dialog before deletion
- ✅ Real-time UI update after deletion

#### File: `app/admin/page.tsx`
```typescript
"use client";

import { useRouter } from "next/navigation";
import { useRole } from "@/lib/useRole";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query, deleteDoc, doc } from "firebase/firestore";

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAdmin, loading } = useRole();
  const [photos, setPhotos] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push("/");
    }
  }, [loading, isAdmin, router]);

  useEffect(() => {
    const load = async () => {
      const qy = query(collection(db, "photos"), orderBy("createdAt", "desc"));
      const snap = await getDocs(qy);
      setPhotos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    if (isAdmin) load();
  }, [isAdmin]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this photo?")) return;
    await deleteDoc(doc(db, "photos", id));
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  if (loading) return <main className="p-8">Loading...</main>;
  if (!isAdmin) return null;

  return (
    <main className="grid gap-6">
      <h1 className="text-2xl font-bold">🛠 Admin Dashboard</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {photos.map((p) => (
          <div key={p.id} className="bg-white rounded-lg shadow p-2">
            <img
              src={p.url}
              alt={p.caption}
              className="rounded-md h-40 w-full object-cover"
            />
            <div className="text-xs mt-1 text-gray-600">{p.caption}</div>
            <div className="text-xs text-gray-500">
              Visibility: {p.visibility}
            </div>
            <button
              onClick={() => handleDelete(p.id)}
              className="text-red-600 text-xs mt-2 hover:underline"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
```

---

### 6. Firestore Security Rules

#### Tasks
1. Define role-based rules in Firebase Console
2. Implement dynamic role checking
3. Protect user management operations
4. Deploy rules to production

#### Acceptance Criteria
- ✅ Public read access to photos and albums
- ✅ Only admin and user roles can write
- ✅ Users can only modify own content
- ✅ Admin can modify any content
- ✅ Only admin can update user roles

#### Firestore Rules (`firestore.rules`)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function to get user role
    function userRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }

    // Photos collection
    match /photos/{photoId} {
      allow read: if true;
      allow write: if request.auth != null && (
        userRole() == "admin" ||
        (userRole() == "user" && request.auth.uid == request.resource.data.userId)
      );
    }

    // Albums collection
    match /albums/{albumId} {
      allow read: if true;
      allow write: if request.auth != null && (
        userRole() == "admin" ||
        (userRole() == "user" && request.auth.uid == request.resource.data.userId)
      );
    }

    // Users collection
    match /users/{uid} {
      allow read: if request.auth != null && (
        request.auth.uid == uid || userRole() == "admin"
      );
      allow write: if userRole() == "admin";
    }

    // Comments subcollection
    match /photos/{photoId}/comments/{commentId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Reactions subcollection
    match /photos/{photoId}/reactions/{reactionId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

**Deployment**:
```bash
firebase deploy --only firestore:rules
```

---

### 7. Firebase Storage Security Rules

#### Tasks
1. Restrict writes to photo owners
2. Allow public read access
3. Deploy to Firebase

#### Acceptance Criteria
- ✅ Users can only write to their own folder
- ✅ Anyone can read uploaded photos
- ✅ Path structure enforced: `/photos/{userId}/{filename}`

#### Storage Rules (`storage.rules`)
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /photos/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

**Deployment**:
```bash
firebase deploy --only storage
```

---

### 8. Cloud Function: Auto-Admin Assignment

#### Tasks
1. Initialize Firebase Functions: `firebase init functions`
2. Install dependencies in `/functions`
3. Create `onUserCreate` trigger
4. Assign first user as admin, others as viewer
5. Deploy function

#### Acceptance Criteria
- ✅ First signup gets `admin` role
- ✅ Subsequent signups get `viewer` role
- ✅ User document created automatically
- ✅ No manual Firestore edits needed

#### Setup
```bash
cd functions
npm install firebase-admin firebase-functions
```

#### File: `functions/src/index.ts`
```typescript
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

export const onUserCreate = functions.auth.user().onCreate(async (user) => {
  const usersRef = db.collection("users");

  // Check if any admin exists
  const existingAdmins = await usersRef.where("role", "==", "admin").limit(1).get();
  const isFirstAdmin = existingAdmins.empty;

  const role = isFirstAdmin ? "admin" : "viewer";

  await usersRef.doc(user.uid).set({
    email: user.email,
    displayName: user.displayName || "Anonymous",
    role,
    joinedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log(`Created user ${user.email} with role: ${role}`);
});
```

#### Deployment
```bash
firebase deploy --only functions
```

---

## Security Checklist

- [ ] No hardcoded email lists in codebase
- [ ] Firestore rules enforce role-based access
- [ ] Storage rules prevent unauthorized uploads
- [ ] Cloud Function auto-assigns roles
- [ ] Admin dashboard only accessible to admins
- [ ] Upload/album creation only for allowed roles
- [ ] User role changes logged (optional audit trail)
- [ ] All sensitive operations protected server-side

## Testing Checklist

### Role Assignment
- [ ] First user signup receives `admin` role
- [ ] Second user signup receives `viewer` role
- [ ] Admin can promote viewer to user
- [ ] Admin can promote user to admin

### Access Control
- [ ] Viewer cannot access `/upload`
- [ ] Viewer cannot access `/albums/new`
- [ ] User can access `/upload`
- [ ] User can create albums
- [ ] Non-admin cannot access `/admin`
- [ ] Admin can access all admin pages

### Firestore Rules
- [ ] Viewer can read photos but not write
- [ ] User can write own photos only
- [ ] Admin can write any photo
- [ ] Only admin can modify user roles

### Storage Rules
- [ ] User can upload to own folder only
- [ ] User cannot upload to another user's folder
- [ ] Public can read all photos

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Cloud Function not triggering | Check Firebase Console logs; ensure billing enabled |
| Firestore rules failing | Test rules in Firebase Console Rules Playground |
| Role not updating in UI | Clear browser cache; check Firestore data directly |
| First user not getting admin | Delete user doc and re-signup to trigger function |

## Production Deployment

1. **Deploy Firestore Rules**: `firebase deploy --only firestore:rules`
2. **Deploy Storage Rules**: `firebase deploy --only storage`
3. **Deploy Cloud Functions**: `firebase deploy --only functions`
4. **Test First Signup**: Create new user and verify admin role
5. **Test Role Changes**: Promote/demote users from admin dashboard
6. **Test Access Control**: Verify protected routes block unauthorized access

## Future Enhancements

| Enhancement | Description |
|-------------|-------------|
| Audit Logs | Track all admin actions (deletions, role changes) |
| Invite System | Admin sends email invites to specific users |
| Custom Claims | Use Firebase Auth custom claims for faster role checks |
| Rate Limiting | Prevent abuse on upload/comment endpoints |
| 2FA for Admins | Require two-factor authentication for admin accounts |

## Next Steps

Phase 4 completes the MVP. After deployment:
- **Onboard Friends**: Share app URL and have first friend create admin account
- **Configure Roles**: Promote trusted friends to `user` role
- **Monitor Usage**: Check Firebase Console for activity
- **Plan Post-MVP**: Review enhancement backlog

---

**Phase Duration**: 2-3 days
**Complexity**: High
**Status**: Production-Ready Security
