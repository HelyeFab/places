/**
 * Daily Digest: Checks Google Drive for new photos and emails all Firebase users.
 * Run via cron at 10 AM Italian time.
 * Respects email_preferences in Firestore (users can opt out via unsubscribe link).
 */

import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createTransport } from 'nodemailer';
import { createHmac } from 'crypto';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..', '..');

// --- Config ---
const DRIVE_CREDENTIALS_PATH = join(PROJECT_ROOT, 'google-drive-credentials.json');
const FIREBASE_CREDENTIALS_PATH = join(PROJECT_ROOT, 'places-fbd86-firebase-adminsdk-fbsvc-d35e3eb7c1.json');
const DRIVE_FOLDER_ID = '1hckGYv3_p8lPWpjMqkrtH1G-_bfyZdoA';
const GMAIL_USER = 'emmanuelfabiani23@gmail.com';
const GMAIL_APP_PASSWORD = 'cxyl hjww yroo ynpc';
const PLACES_URL = 'https://places.appsparkle.org';
const UNSUBSCRIBE_SECRET = process.env.EMAIL_UNSUBSCRIBE_SECRET || 'places-japan-2026-unsub';

// --- Google Drive ---
function getDriveClient() {
  const credentials = JSON.parse(readFileSync(DRIVE_CREDENTIALS_PATH, 'utf8'));
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });
  return google.drive({ version: 'v3', auth });
}

async function getNewPhotos() {
  const drive = getDriveClient();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const foldersRes = await drive.files.list({
    q: "'" + DRIVE_FOLDER_ID + "' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false",
    fields: 'files(id, name)',
  });
  const folders = foldersRes.data.files || [];

  const newPhotos = [];

  for (const folder of folders) {
    const photosRes = await drive.files.list({
      q: "'" + folder.id + "' in parents and (mimeType contains 'image/') and trashed=false and createdTime > '" + since + "'",
      fields: 'files(id, name, createdTime)',
      orderBy: 'createdTime desc',
    });

    const photos = photosRes.data.files || [];
    for (const photo of photos) {
      newPhotos.push({ ...photo, albumName: folder.name });
    }
  }

  return newPhotos;
}

// --- Firebase Auth & Firestore ---
function initFirebase() {
  const cred = JSON.parse(readFileSync(FIREBASE_CREDENTIALS_PATH, 'utf8'));
  const app = initializeApp({ credential: cert(cred) });
  return { auth: getAuth(app), db: getFirestore(app) };
}

async function getFirebaseUsers(auth) {
  const emails = [];
  let nextPageToken;

  do {
    const result = await auth.listUsers(1000, nextPageToken);
    for (const user of result.users) {
      if (user.email) emails.push(user.email);
    }
    nextPageToken = result.pageToken;
  } while (nextPageToken);

  return emails;
}

async function getOptedOutEmails(db) {
  const snapshot = await db.collection('email_preferences')
    .where('optedOut', '==', true)
    .get();

  const optedOut = new Set();
  snapshot.forEach(function(doc) {
    optedOut.add(doc.id); // doc ID is the email address
  });
  return optedOut;
}

// --- Unsubscribe token ---
function makeUnsubscribeUrl(email) {
  const token = createHmac('sha256', UNSUBSCRIBE_SECRET)
    .update(email.toLowerCase())
    .digest('hex');
  return PLACES_URL + '/api/email/unsubscribe?email=' + encodeURIComponent(email) + '&token=' + token;
}

// --- Email ---
function createMailer() {
  return createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
  });
}

function buildEmail(newPhotos, recipientEmail) {
  const albumCounts = {};
  for (const photo of newPhotos) {
    albumCounts[photo.albumName] = (albumCounts[photo.albumName] || 0) + 1;
  }

  const total = newPhotos.length;
  const plural = total > 1 ? 's' : '';
  const subject = 'New photo' + plural + ' from Japan!';
  const unsubUrl = makeUnsubscribeUrl(recipientEmail);

  const albumLines = Object.entries(albumCounts)
    .map(function(entry) { return '  ' + entry[0] + ': ' + entry[1] + ' new photo' + (entry[1] > 1 ? 's' : ''); })
    .join('\n');

  const text = 'Hi there!\n\n'
    + 'Emmanuel just added ' + total + ' new photo' + plural + ' from Japan:\n\n'
    + albumLines + '\n\n'
    + 'Check them out: ' + PLACES_URL + '/gallery\n\n'
    + '— Places Japan 2026\n\n'
    + 'Don\'t want these emails? Unsubscribe: ' + unsubUrl;

  const albumHtml = Object.entries(albumCounts)
    .map(function(entry) {
      return '<div style="padding: 4px 0;"><strong>' + entry[0] + '</strong>: ' + entry[1] + ' new photo' + (entry[1] > 1 ? 's' : '') + '</div>';
    })
    .join('');

  const html = '<div style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">'
    + '<h2 style="color: #1a1a2e;">New photos from Japan!</h2>'
    + '<p>Emmanuel just added <strong>' + total + '</strong> new photo' + plural + ':</p>'
    + '<div style="background: #f5f5f7; border-radius: 12px; padding: 16px; margin: 16px 0;">'
    + albumHtml
    + '</div>'
    + '<a href="' + PLACES_URL + '/gallery" style="display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 8px;">View Photos</a>'
    + '<p style="color: #888; font-size: 13px; margin-top: 24px;">— Places Japan 2026</p>'
    + '<hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">'
    + '<p style="color: #aaa; font-size: 11px;"><a href="' + unsubUrl + '" style="color: #aaa;">Unsubscribe</a> from daily photo updates</p>'
    + '</div>';

  return { subject, text, html };
}

// --- Main ---
async function main() {
  console.log('[' + new Date().toISOString() + '] Daily digest starting...');

  // 1. Check for new photos
  const newPhotos = await getNewPhotos();
  console.log('Found ' + newPhotos.length + ' new photo(s) in last 24h');

  if (newPhotos.length === 0) {
    console.log('No new photos — skipping email.');
    return;
  }

  // 2. Get all Firebase user emails and opt-out preferences
  const { auth, db } = initFirebase();
  const allEmails = await getFirebaseUsers(auth);
  const optedOut = await getOptedOutEmails(db);

  const activeEmails = allEmails.filter(function(email) {
    return !optedOut.has(email.toLowerCase());
  });

  console.log('Found ' + allEmails.length + ' user(s), ' + optedOut.size + ' opted out, sending to ' + activeEmails.length);

  if (activeEmails.length === 0) {
    console.log('No active recipients — skipping email.');
    return;
  }

  // 3. Send emails
  const mailer = createMailer();

  for (const email of activeEmails) {
    try {
      const { subject, text, html } = buildEmail(newPhotos, email);
      await mailer.sendMail({
        from: '"Places Japan 2026" <' + GMAIL_USER + '>',
        to: email,
        subject,
        text,
        html,
      });
      console.log('Sent to ' + email);
    } catch (err) {
      console.error('Failed to send to ' + email + ': ' + err.message);
    }
  }

  console.log('Daily digest complete.');
}

main().catch(function(err) {
  console.error('Fatal error:', err);
  process.exit(1);
});
