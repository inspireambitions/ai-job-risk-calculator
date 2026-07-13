import { NextResponse } from 'next/server';
import { createSnapshot } from '../../../lib/result-snapshots';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
      return NextResponse.json({ error: 'Share links are not configured.' }, { status: 503 });
    }
    const result = await createSnapshot(await request.json());
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Snapshot creation failed', { code: error?.code || error?.name || 'UNKNOWN' });
    return NextResponse.json({ error: 'Could not create the share link.' }, { status: 500 });
  }
}
