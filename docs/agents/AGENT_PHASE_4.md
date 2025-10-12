# AI Agent Work Assignment: Phase 4 - Security & Admin System

## Agent Role
**Security & DevOps Specialist**

You are an expert in Firebase security, access control systems, and production deployment. Your role is to implement a comprehensive role-based access control system, admin dashboard, security rules, and Cloud Functions to make the application production-ready.

---

## Agent Prompt

```
You are tasked with implementing Phase 4 of the Australia 2026 Shared Album MVP.
This phase implements dynamic role-based security, admin dashboard, Firebase security rules,
and Cloud Functions. This is the final phase before production deployment.

PROJECT CONTEXT:
- Phases 1, 2, and 3 are complete and functional
- All core features working (upload, albums, map, timeline, comments, reactions)
- Currently no access control beyond basic authentication
- NO HARDCODED EMAIL LISTS - everything must be database-driven

YOUR OBJECTIVES:
1. Implement dynamic role system stored in Firestore
2. Create role management hook (useRole)
3. Build admin dashboard for user and content management
4. Deploy Firestore security rules with role-based access
5. Deploy Firebase Storage security rules
6. Create Cloud Function for auto-admin assignment
7. Protect all sensitive routes and operations

DELIVERABLES:

1. FIRESTORE USERS COLLECTION
   Create collection: "users"
   {
     id: string (Firebase Auth UID),
     email: string,
     displayName: string,
     role: "admin" | "user" | "viewer",
     joinedAt: Timestamp
   }

   ROLE DEFINITIONS:
   - admin: Full access (upload, create albums, delete any content, manage users)
   - user: Can upload and manage own content only
   - viewer: Read-only access (can view and comment/react)

2. ROLE MANAGEMENT HOOK
   - Create file: lib/useRole.ts
   - Export function: useRole()
   - Returns: { user, role, isAdmin, isAllowed, loading }
   - Logic:
     * On user auth, fetch user doc from Firestore
     * If doc doesn't exist, create with role "viewer"
     * Return role state and derived booleans
     * Handle loading state properly
   - Use useAuthState from react-firebase-hooks
   - Use getDoc and setDoc from Firestore
   - Auto-create user document with serverTimestamp

3. PROTECTED ROUTE IMPLEMENTATION
   Update these pages with role checks:

   A. app/upload/page.tsx
   - Import useRole
   - Check: if (!user) show "Please sign in"
   - Check: if (!isAllowed) show "Account cannot upload"
   - Only admin and user roles can access

   B. app/albums/new/page.tsx
   - Same protection as upload page
   - Only admin and user roles can create albums

4. ADMIN DASHBOARD - USER MANAGEMENT
   - Create file: app/admin/users/page.tsx
   - Fetch all users from Firestore
   - Display table with columns:
     * Display Name
     * Email
     * Role
     * Actions (dropdown to change role)
   - Only accessible to isAdmin
   - Redirect non-admins to home
   - Use updateDoc to change roles
   - Update local state after role change for instant UI update

5. ADMIN DASHBOARD - CONTENT MODERATION
   - Create file: app/admin/page.tsx
   - Fetch ALL photos (ignore visibility filtering)
   - Display grid with:
     * Photo image
     * Caption
     * Visibility status
     * Delete button
   - Confirm before deletion
   - Use deleteDoc to remove photo
   - Update UI after deletion
   - Only accessible to isAdmin

6. FIRESTORE SECURITY RULES
   Create file: firestore.rules (locally) or update in Firebase Console

   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {

       function userRole() {
         return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
       }

       match /photos/{photoId} {
         allow read: if true;
         allow write: if request.auth != null && (
           userRole() == "admin" ||
           (userRole() == "user" && request.auth.uid == request.resource.data.userId)
         );
       }

       match /albums/{albumId} {
         allow read: if true;
         allow write: if request.auth != null && (
           userRole() == "admin" ||
           (userRole() == "user" && request.auth.uid == request.resource.data.userId)
         );
       }

       match /users/{uid} {
         allow read: if request.auth != null && (
           request.auth.uid == uid || userRole() == "admin"
         );
         allow write: if userRole() == "admin";
       }

       match /photos/{photoId}/comments/{commentId} {
         allow read: if true;
         allow write: if request.auth != null;
       }

       match /photos/{photoId}/reactions/{reactionId} {
         allow read: if true;
         allow write: if request.auth != null;
       }
     }
   }

   Deploy: firebase deploy --only firestore:rules

7. FIREBASE STORAGE SECURITY RULES
   Create file: storage.rules or update in Firebase Console

   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /photos/{userId}/{allPaths=**} {
         allow read: if true;
         allow write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }

   Deploy: firebase deploy --only storage

8. CLOUD FUNCTION - AUTO ADMIN ASSIGNMENT
   Setup:
   - Run: firebase init functions
   - Select TypeScript
   - Install: cd functions && npm install firebase-admin firebase-functions

   Create file: functions/src/index.ts

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

   Deploy: firebase deploy --only functions

TECHNICAL REQUIREMENTS:
- NO hardcoded email lists anywhere
- All role checks must query Firestore
- Security rules must be server-enforced
- Admin routes must redirect non-admins
- Loading states during role fetch
- Proper TypeScript typing for roles
- Error handling for Firestore operations
- Confirmation dialogs before destructive actions

FIREBASE CONSOLE TASKS:
1. Enable Cloud Functions billing (required for deployment)
2. Deploy Firestore rules
3. Deploy Storage rules
4. Deploy Cloud Functions
5. Verify function triggers in Functions dashboard

TESTING CHECKLIST:
- [ ] First user signup gets "admin" role automatically
- [ ] Second user signup gets "viewer" role automatically
- [ ] Admin can access /admin/users
- [ ] Admin can change user roles
- [ ] Admin can delete any photo
- [ ] User can access /upload
- [ ] User can create albums
- [ ] Viewer cannot access /upload
- [ ] Viewer cannot create albums
- [ ] Viewer can comment and react
- [ ] Non-admin redirected from /admin pages
- [ ] Firestore rules prevent unauthorized writes
- [ ] Storage rules prevent writing to other user folders
- [ ] Cloud Function triggers on new signup
- [ ] Role changes reflect immediately in UI

SECURITY VALIDATION:
Test these scenarios:
1. Logged out user tries to upload → Blocked at UI level
2. Viewer tries to upload → Blocked at UI level
3. User tries to modify another user's photo → Blocked by Firestore rules
4. User tries to upload to another user's Storage folder → Blocked by Storage rules
5. Viewer tries to change own role → Blocked by Firestore rules
6. Non-admin tries to access /admin → Redirected
7. User tries to delete photo → Blocked by Firestore rules (only admin can delete)

FILE STRUCTURE TO CREATE:
/app
├── admin/
│   ├── page.tsx (content moderation)
│   └── users/
│       └── page.tsx (user management)
/lib
└── useRole.ts
/functions
└── src/
    └── index.ts

FIRESTORE INDEXES NEEDED:
- Collection: users
  Field: role (Ascending)
  (Auto-created by Cloud Function query)

ACCEPTANCE CRITERIA:
✅ Dynamic role system working
✅ Admin dashboard functional
✅ Firestore rules deployed and enforced
✅ Storage rules deployed and enforced
✅ Cloud Function auto-assigns roles
✅ No hardcoded credentials
✅ All routes protected appropriately
✅ Role changes instant in UI
✅ Security rules tested and validated
✅ Documentation updated

REFERENCE DOCUMENTATION:
- Milestone document: docs/milestones/PHASE_4_SECURITY_ADMIN.md
- Phase 3 completion report
- Firebase Security Rules: https://firebase.google.com/docs/firestore/security/rules-query
- Cloud Functions: https://firebase.google.com/docs/functions

COMPLETION REPORT:
When finished, provide:
1. Confirmation of all security features implemented
2. Security testing results (all scenarios passed)
3. Screenshot of admin dashboard
4. Screenshot of user management interface
5. Cloud Function deployment logs
6. Firestore rules test results
7. Storage rules test results
8. Production readiness checklist
9. Deployment guide for going live
```

---

## Success Metrics

- **Security**: 100% of unauthorized operations blocked
- **Automation**: First signup auto-promotes to admin
- **Admin UX**: Role changes take effect instantly
- **Compliance**: All security rules enforced server-side

## Common Pitfalls to Avoid

1. **Rules Syntax**: Firestore rules fail silently if function syntax is wrong
2. **Billing**: Cloud Functions require Blaze plan (pay-as-you-go)
3. **Rule Testing**: Not testing rules in Firebase Console simulator before deploy
4. **Race Condition**: Cloud Function may not create user doc before useRole queries
5. **Storage Path**: Storage rules must match exact path structure used in code
6. **Role Cache**: Client may cache old role; force refresh after changes
7. **Admin Lock-out**: Accidentally demoting yourself locks you out
8. **Rules Deployment**: `firebase deploy` without `--only` redeploys everything

## Production Deployment Checklist

Before going live:
- ✅ All 4 phases completed and tested
- ✅ Firestore rules deployed to production
- ✅ Storage rules deployed to production
- ✅ Cloud Functions deployed and verified
- ✅ First admin account created and tested
- ✅ Security scenarios tested with multiple accounts
- ✅ No hardcoded credentials in repository
- ✅ Environment variables configured in hosting platform
- ✅ Custom domain configured (if applicable)
- ✅ SSL certificate active
- ✅ Backup strategy documented
- ✅ Monitoring and logging enabled

**Final Step**: Deploy Next.js app to Vercel/Netlify and share URL with friends!

---

**Estimated Duration**: 10-14 hours
**Complexity Level**: High
**Dependencies**: Phases 1, 2, and 3 complete
**Status**: Production-Ready
