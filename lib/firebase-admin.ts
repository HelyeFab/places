import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { join } from 'path';

let adminApp: App;

function getAdminApp(): App {
  if (getApps().length > 0) return getApps()[0];

  const credPath = join(process.cwd(), 'places-fbd86-firebase-adminsdk-fbsvc-d35e3eb7c1.json');
  const cred = JSON.parse(readFileSync(credPath, 'utf8'));
  adminApp = initializeApp({ credential: cert(cred) });
  return adminApp;
}

export function getAdminFirestore() {
  return getFirestore(getAdminApp());
}
