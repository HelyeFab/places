/**
 * Google Drive Storage Adapter for Places
 * Read-only access to photos stored in Google Drive
 * Adapted from Ludo project
 */

import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { join } from 'path';

function getDriveClient() {
  const credentialsPath = process.env.GOOGLE_DRIVE_CREDENTIALS_PATH;
  if (!credentialsPath) {
    throw new Error('GOOGLE_DRIVE_CREDENTIALS_PATH is not set');
  }

  const credentials = JSON.parse(
    readFileSync(join(process.cwd(), credentialsPath), 'utf8')
  );

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });

  return google.drive({ version: 'v3', auth });
}

export interface DrivePhoto {
  id: string;
  name: string;
  mimeType: string;
  createdTime: string;
  modifiedTime: string;
  size: string;
}

export interface DriveAlbum {
  id: string;
  name: string;
  createdTime: string;
  modifiedTime: string;
  photoCount: number;
  coverPhotoId?: string;
}

/**
 * List all albums (subfolders) in the main Drive folder
 */
export async function listAlbums(): Promise<DriveAlbum[]> {
  const drive = getDriveClient();
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!folderId) {
    throw new Error('GOOGLE_DRIVE_FOLDER_ID is not set');
  }

  const response = await drive.files.list({
    q: `'${folderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id, name, createdTime, modifiedTime)',
    orderBy: 'name',
  });

  const folders = response.data.files || [];

  const albums = await Promise.all(
    folders.map(async (folder) => {
      const photosResponse = await drive.files.list({
        q: `'${folder.id}' in parents and (mimeType contains 'image/') and trashed=false`,
        fields: 'files(id)',
        orderBy: 'createdTime',
        pageSize: 1,
      });

      // Get total count
      const countResponse = await drive.files.list({
        q: `'${folder.id}' in parents and (mimeType contains 'image/') and trashed=false`,
        fields: 'files(id)',
      });

      const firstPhoto = photosResponse.data.files?.[0];

      return {
        id: folder.id!,
        name: folder.name!,
        createdTime: folder.createdTime!,
        modifiedTime: folder.modifiedTime!,
        photoCount: countResponse.data.files?.length || 0,
        coverPhotoId: firstPhoto?.id || undefined,
      };
    })
  );

  return albums.filter((album) => album.photoCount > 0);
}

/**
 * List all photos in a specific album (folder)
 */
export async function listPhotosInAlbum(albumId: string): Promise<DrivePhoto[]> {
  const drive = getDriveClient();

  const response = await drive.files.list({
    q: `'${albumId}' in parents and (mimeType contains 'image/') and trashed=false`,
    fields: 'files(id, name, mimeType, createdTime, modifiedTime, size)',
    orderBy: 'createdTime desc',
  });

  return (response.data.files || []).map((file) => ({
    id: file.id!,
    name: file.name!,
    mimeType: file.mimeType!,
    createdTime: file.createdTime!,
    modifiedTime: file.modifiedTime!,
    size: file.size || '0',
  }));
}

/**
 * List ALL photos across all albums (for gallery view)
 */
export async function listAllPhotos(): Promise<(DrivePhoto & { albumId: string; albumName: string })[]> {
  const albums = await listAlbums();
  const allPhotos: (DrivePhoto & { albumId: string; albumName: string })[] = [];

  for (const album of albums) {
    const photos = await listPhotosInAlbum(album.id);
    for (const photo of photos) {
      allPhotos.push({ ...photo, albumId: album.id, albumName: album.name });
    }
  }

  // Sort by creation time descending
  allPhotos.sort((a, b) => new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime());
  return allPhotos;
}

/**
 * Get a photo as a stream from Google Drive (used by proxy endpoint)
 */
export async function getPhotoStream(
  fileId: string
): Promise<{ stream: NodeJS.ReadableStream; mimeType: string }> {
  const drive = getDriveClient();

  const fileMetadata = await drive.files.get({
    fileId,
    fields: 'mimeType',
  });

  const mimeType = fileMetadata.data.mimeType || 'image/jpeg';

  const response = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'stream' }
  );

  return {
    stream: response.data as NodeJS.ReadableStream,
    mimeType,
  };
}

export function isGoogleDriveConfigured(): boolean {
  return !!(
    process.env.GOOGLE_DRIVE_FOLDER_ID &&
    process.env.GOOGLE_DRIVE_CREDENTIALS_PATH
  );
}
