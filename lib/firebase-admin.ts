import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { join } from 'path';

let adminApp: App;

function getAdminApp(): App {
  if (getApps().length > 0) return getApps()[0];

  // Env var first, file second — same reasoning as lib/google-drive-storage.ts:
  // a serverless host has no disk to put a key on, and this repo is public. The
  // hardcoded filename is kept as the fallback so the server's image still works.
  const inline = process.env.FIREBASE_ADMIN_CREDENTIALS;
  const cred = inline
    ? JSON.parse(
        inline.trimStart().startsWith('{')
          ? inline
          : Buffer.from(inline, 'base64').toString('utf8'),
      )
    : JSON.parse(
        readFileSync(
          join(process.cwd(), 'places-fbd86-firebase-adminsdk-fbsvc-d35e3eb7c1.json'),
          'utf8',
        ),
      );

  adminApp = initializeApp({ credential: cert(cred) });
  return adminApp;
}

export function getAdminFirestore() {
  return getFirestore(getAdminApp());
}
