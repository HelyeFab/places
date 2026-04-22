import { NextRequest, NextResponse } from 'next/server';
import { listPhotosInAlbum } from '@/lib/google-drive-storage';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const photos = await listPhotosInAlbum(id);
    return NextResponse.json(photos);
  } catch (error: any) {
    console.error('[API] Error listing photos:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
