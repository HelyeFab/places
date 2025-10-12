# Firebase Setup Instructions

This guide will walk you through setting up Firebase for the Australia 2026 Shared Album application.

## Prerequisites

- A Google account
- Node.js and npm installed
- This Next.js project set up locally

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project name: `australia-2026-album` (or your preferred name)
4. (Optional) Enable Google Analytics if desired
5. Click "Create project"

## Step 2: Register Your Web App

1. In your Firebase project dashboard, click the **Web** icon (`</>`) to add a web app
2. Register app with nickname: `Australia 2026 Web App`
3. Check "Also set up Firebase Hosting" if you plan to deploy with Firebase Hosting (optional)
4. Click "Register app"
5. You'll see your Firebase configuration object - **keep this page open**, you'll need these values

## Step 3: Enable Authentication

1. In the Firebase Console sidebar, click **Authentication**
2. Click "Get started"
3. Click on the **Sign-in method** tab
4. Click on **Google** in the providers list
5. Toggle the **Enable** switch
6. Enter your project support email
7. Click **Save**

## Step 4: Set Up Firestore Database

1. In the Firebase Console sidebar, click **Firestore Database**
2. Click "Create database"
3. Select **Start in test mode** (you can update security rules later)
4. Choose your Cloud Firestore location (select closest to your users)
5. Click **Enable**

## Step 5: Set Up Storage

1. In the Firebase Console sidebar, click **Storage**
2. Click "Get started"
3. Review the security rules (start in test mode for development)
4. Click **Next**
5. Select your storage location (use same as Firestore)
6. Click **Done**

## Step 6: Configure Environment Variables

1. Copy the `.env.local.example` file to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Open `.env.local` and fill in your Firebase configuration values from Step 2:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
   ```

3. **Important**: Never commit `.env.local` to version control (it's already in `.gitignore`)

## Step 7: Test Your Setup

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

3. Click the "Sign in with Google" button

4. You should be able to:
   - Sign in with your Google account
   - See your name and avatar in the navbar
   - Sign out successfully

## Security Rules (Production)

Before deploying to production, update your security rules:

### Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
                   && request.resource.size < 10 * 1024 * 1024  // 10MB limit
                   && request.resource.contentType.matches('image/.*');
    }
  }
}
```

## Troubleshooting

### "Firebase: Error (auth/invalid-api-key)"
- Check that all environment variables in `.env.local` are correctly filled
- Ensure you've restarted the dev server after updating `.env.local`
- Verify the API key matches exactly from Firebase Console

### "Firebase: Error (auth/unauthorized-domain)"
- In Firebase Console, go to Authentication → Settings → Authorized domains
- Add `localhost` for development
- Add your production domain when deploying

### Google Sign-In Popup Blocked
- Ensure popups are allowed for localhost in your browser
- Try using an incognito/private window if issues persist

## Next Steps

After completing this setup:

1. Test authentication flow thoroughly
2. Review and customize security rules for your use case
3. Set up Firestore collections (will be done in Phase 2)
4. Configure Storage rules and folder structure (Phase 2)
5. Consider setting up Firebase Hosting for deployment

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Auth with Next.js](https://firebase.google.com/docs/auth/web/start)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Storage Documentation](https://firebase.google.com/docs/storage)
