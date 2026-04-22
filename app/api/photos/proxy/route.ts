import { NextRequest, NextResponse } from 'next/server';
import { getPhotoStream } from '@/lib/google-drive-storage';
import sharp from 'sharp';
import { Readable } from 'stream';

/**
 * Photo proxy: fetches images from Google Drive, optionally optimizes them.
 * ?id=DRIVE_FILE_ID&w=WIDTH&q=QUALITY
 */
export async function GET(request: NextRequest) {
  try {
    const fileId = request.nextUrl.searchParams.get('id');
    const width = parseInt(request.nextUrl.searchParams.get('w') || '0');
    const quality = parseInt(request.nextUrl.searchParams.get('q') || '80');

    if (!fileId) {
      return new NextResponse('Missing id parameter', { status: 400 });
    }

    const { stream, mimeType } = await getPhotoStream(fileId);

    // Convert stream to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of stream as Readable) {
      chunks.push(Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);

    // If width requested, optimize with sharp
    if (width > 0) {
      const optimized = await sharp(buffer)
        .resize(width, null, { withoutEnlargement: true, fit: 'inside' })
        .webp({ quality })
        .toBuffer();

      return new NextResponse(new Uint8Array(optimized), {
        status: 200,
        headers: {
          'Content-Type': 'image/webp',
          'Cache-Control': 'public, max-age=604800, immutable',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    }

    // Return original image
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=604800, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error: any) {
    console.error('[PHOTO PROXY] Error:', error);
    return new NextResponse('Photo not found', { status: 404 });
  }
}
