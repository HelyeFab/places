import { NextResponse } from 'next/server';
import { listAlbums } from '@/lib/google-drive-storage';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const albums = await listAlbums();
    return NextResponse.json(albums);
  } catch (error: any) {
    console.error('[API] Error listing albums:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
