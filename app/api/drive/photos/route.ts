import { NextResponse } from 'next/server';
import { listAllPhotos } from '@/lib/google-drive-storage';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const photos = await listAllPhotos();
    return NextResponse.json(photos);
  } catch (error: any) {
    console.error('[API] Error listing all photos:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
