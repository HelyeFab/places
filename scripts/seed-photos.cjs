#!/usr/bin/env node
/**
 * Seed 4K Australia photos into Firebase Storage and Firestore.
 *
 * What this script does:
 * - Searches Unsplash for high-quality Australia landscape photos
 * - Downloads each image (up to requested count)
 * - Uploads the images to your Firebase Storage bucket
 * - Writes Firestore documents compatible with the app's "photos" collection
 *
 * Requirements:
 * - Node.js 18+
 * - Firebase project with Firestore and Storage enabled
 * - Service account JSON file with proper permissions (Storage Admin, Firestore Admin, Auth Admin)
 * - Unsplash API Access Key (https://unsplash.com/developers)
 *
 * Usage:
 *   node scripts/seed-photos.cjs \
 *     --serviceAccount ./service_accounts.json \
 *     --user emmanuelfabiani23@gmail.com \
 *     --uid YOUR_FIREBASE_UID \
 *     --count 25 \
 *     --project places-fbd86 \
 *     --bucket places-fbd86.appspot.com \
 *     --unsplashKey YOUR_UNSPLASH_ACCESS_KEY
 *
 * Or set UNSPLASH_ACCESS_KEY in env:
 *   UNSPLASH_ACCESS_KEY=... npm run seed:photos
 *
 * Notes:
 * - The script will attempt to resolve the user by email in Firebase Auth (or use --uid to bypass lookup/creation).
 *   If not found and --uid is not provided, it will error unless you pass --createUserIfMissing to create it.
 * - Images are uploaded to Storage, then a long-lived signed URL is generated.
 * - Firestore documents follow the app's expected schema.
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const admin = require("firebase-admin");

const DEFAULT_QUERY = "australia landscape";
const DEFAULT_COUNT = 25;
const UNSPLASH_SEARCH_URL = "https://api.unsplash.com/search/photos";

// Basic CLI arg parser (no deps)
function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith("--")) {
        args[key] = true;
      } else {
        args[key] = next;
        i++;
      }
    }
  }
  return args;
}

function assertArg(val, message) {
  if (!val) {
    throw new Error(message);
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function chooseExtFromContentType(ct) {
  if (!ct) return "jpg";
  if (ct.includes("image/jpeg")) return "jpg";
  if (ct.includes("image/png")) return "png";
  if (ct.includes("image/webp")) return "webp";
  return "jpg";
}

function buildStoragePublicUrl(bucket, filePath) {
  // Public GCS URL (works if object is public; we will use signed URLs instead)
  return `https://storage.googleapis.com/${bucket}/${encodeURI(filePath)}`;
}

async function initFirebaseAdmin({
  serviceAccountPath,
  projectId,
  storageBucket,
}) {
  const saPath = path.resolve(process.cwd(), serviceAccountPath);
  if (!fs.existsSync(saPath)) {
    throw new Error(`Service account file not found at ${saPath}`);
  }
  const serviceAccount = JSON.parse(fs.readFileSync(saPath, "utf8"));

  const app = admin.apps.length
    ? admin.app()
    : admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: projectId || serviceAccount.project_id,
        storageBucket: storageBucket,
      });

  const firestore = admin.firestore(app);
  const bucket = admin.storage(app).bucket(storageBucket);
  const auth = admin.auth(app);

  return { app, firestore, bucket, auth };
}

async function getOrCreateUserByEmail(
  auth,
  email,
  opts = { createIfMissing: false },
) {
  try {
    const user = await auth.getUserByEmail(email);
    return user;
  } catch (err) {
    if (opts.createIfMissing) {
      const created = await auth.createUser({
        email,
        emailVerified: true,
        disabled: false,
      });
      return created;
    }
    throw new Error(
      `User with email ${email} not found in Firebase Auth. Pass --createUserIfMissing to create.`,
    );
  }
}

async function fetchUnsplashPhotos({
  accessKey,
  query,
  count,
  orientation = "landscape",
}) {
  if (!accessKey) {
    throw new Error(
      "Missing Unsplash access key: provide --unsplashKey or set UNSPLASH_ACCESS_KEY",
    );
  }

  // Unsplash Search API: up to 30 per page; fetch multiple pages if needed
  const results = [];
  const perPage = 30;
  let remaining = count;
  let page = 1;

  while (remaining > 0) {
    const pageSize = Math.min(perPage, remaining);
    const url = new URL(UNSPLASH_SEARCH_URL);
    url.searchParams.set("query", query);
    url.searchParams.set("orientation", orientation);
    url.searchParams.set("page", String(page));
    url.searchParams.set("per_page", String(pageSize));

    const res = await fetch(url, {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
      },
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(
        `Unsplash API error: ${res.status} ${res.statusText} - ${body}`,
      );
    }

    const data = await res.json();
    if (!data.results || data.results.length === 0) {
      break;
    }

    for (const item of data.results) {
      results.push(item);
      if (results.length >= count) break;
    }

    if (results.length >= count || data.results.length < pageSize) {
      break;
    }

    page++;
    remaining = count - results.length;

    // Be gentle to API
    await sleep(300);
  }

  return results;
}

async function trackUnsplashDownload(accessKey, downloadLocation) {
  if (!downloadLocation) return;
  try {
    // Per Unsplash guideline, call download_location to increment download count
    await fetch(downloadLocation, {
      headers: { Authorization: `Client-ID ${accessKey}` },
    });
  } catch {
    // non-fatal
  }
}

async function downloadImageBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(
      `Failed to download image: ${res.status} ${res.statusText} - ${t}`,
    );
  }
  const arrayBuf = await res.arrayBuffer();
  const buf = Buffer.from(arrayBuf);
  const contentType = res.headers.get("content-type") || "image/jpeg";
  return { buf, contentType };
}

async function uploadToStorage(bucket, filePath, buf, contentType) {
  const file = bucket.file(filePath);
  await file.save(buf, {
    contentType,
    resumable: false,
    metadata: {
      contentType,
      cacheControl: "public, max-age=31536000, immutable",
    },
  });

  // Create a long-lived signed URL (valid until 2099-12-31)
  const [signedUrl] = await file.getSignedUrl({
    action: "read",
    expires: "2099-12-31T23:59:59Z",
  });

  return { file, signedUrl };
}

function extractPhotoDocFromUnsplash(
  item,
  { uid, userEmail, displayName, storagePath, url },
) {
  const tags = Array.isArray(item.tags)
    ? item.tags.map((t) => t.title).filter(Boolean)
    : [];
  const uniqueTags = Array.from(new Set([...tags, "australia", "landscape"]));

  const locName =
    item.location?.name || item.location?.city || item.location?.country || "";

  const lat = item.location?.position?.latitude ?? null;
  const lng = item.location?.position?.longitude ?? null;

  const caption =
    item.alt_description ||
    item.description ||
    (locName ? `Beautiful view in ${locName}` : "Beautiful place in Australia");

  return {
    userId: uid,
    userName: displayName || "Seed Bot",
    userEmail,
    url,
    storagePath,
    caption,
    tags: uniqueTags,
    visibility: "public",
    place: locName,
    lat,
    lng,
    albumId: null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };
}

async function main() {
  const args = parseArgs(process.argv);

  const serviceAccount = args.serviceAccount;
  const userEmail = args.user || args.email;
  const count = Number(args.count || DEFAULT_COUNT);
  const projectId =
    args.project ||
    process.env.GCLOUD_PROJECT ||
    process.env.GOOGLE_CLOUD_PROJECT;
  const bucketName = args.bucket || process.env.FIREBASE_STORAGE_BUCKET;
  const query = args.query || DEFAULT_QUERY;
  const createUserIfMissing = Boolean(args.createUserIfMissing || false);
  const unsplashKey = args.unsplashKey || process.env.UNSPLASH_ACCESS_KEY;

  assertArg(serviceAccount, "--serviceAccount is required");
  assertArg(userEmail, "--user (email) is required");
  assertArg(count && count > 0, "--count must be a positive number");
  assertArg(
    projectId,
    "--project is required (or set GCLOUD_PROJECT/GOOGLE_CLOUD_PROJECT)",
  );
  assertArg(bucketName, "--bucket is required (e.g. your-project.appspot.com)");

  console.log("Initializing Firebase Admin...");
  const { firestore, bucket, auth } = await initFirebaseAdmin({
    serviceAccountPath: serviceAccount,
    projectId,
    storageBucket: bucketName,
  });

  let uid;
  let displayName = userEmail;
  if (args.uid) {
    console.log(`Using provided UID: ${args.uid}`);
    uid = args.uid;
  } else {
    console.log(`Resolving user by email: ${userEmail}`);
    const userRecord = await getOrCreateUserByEmail(auth, userEmail, {
      createIfMissing: createUserIfMissing,
    });
    uid = userRecord.uid;
    displayName = userRecord.displayName || userEmail;
  }

  console.log(`Fetching ${count} Unsplash photos for query: "${query}"`);
  const items = await fetchUnsplashPhotos({
    accessKey: unsplashKey,
    query,
    count,
    orientation: "landscape",
  });

  if (!items.length) {
    console.log("No results from Unsplash. Nothing to seed.");
    return;
  }

  console.log(`Found ${items.length} photos. Starting download and upload...`);

  let success = 0;
  let failed = 0;
  const failures = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    const preferredUrl = (() => {
      // Prefer raw with 4k width. Fallback to full.
      // Unsplash raw supports params (w=4096&q=90&fm=jpg).
      const raw = item.urls?.raw;
      const full = item.urls?.full;
      if (raw) return `${raw}&w=4096&q=90&fm=jpg`;
      if (full) return full;
      return item.urls?.regular || item.urls?.small;
    })();

    const unsplashId = item.id || crypto.randomBytes(8).toString("hex");

    try {
      // Track download in Unsplash (non-blocking)
      trackUnsplashDownload(unsplashKey, item.links?.download_location).catch(
        () => {},
      );

      // Download binary
      process.stdout.write(
        `[${i + 1}/${items.length}] Downloading ${unsplashId}... `,
      );
      const { buf, contentType } = await downloadImageBuffer(preferredUrl);
      const ext = chooseExtFromContentType(contentType);

      // Upload to Storage
      const storagePath = `seed/australia/${unsplashId}.${ext}`;
      const { signedUrl } = await uploadToStorage(
        bucket,
        storagePath,
        buf,
        contentType,
      );

      // Create Firestore doc
      const doc = extractPhotoDocFromUnsplash(item, {
        uid,
        userEmail,
        displayName,
        storagePath,
        url: signedUrl,
      });

      await firestore.collection("photos").add(doc);

      success++;
      console.log("OK");
    } catch (err) {
      failed++;
      const msg = err?.message || String(err);
      console.log("FAILED");
      console.error(`  Error: ${msg}`);
      failures.push({ id: unsplashId, error: msg });
    }

    // Gentle pacing
    await sleep(250);
  }

  console.log("---");
  console.log(`Seeding complete. Success: ${success}, Failed: ${failed}`);
  if (failures.length) {
    console.log("Failures:");
    failures.forEach((f) => console.log(` - ${f.id}: ${f.error}`));
  }
}

main().catch((err) => {
  console.error("Fatal error:", err?.message || err);
  process.exit(1);
});
