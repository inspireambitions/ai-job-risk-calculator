import { NextResponse } from 'next/server';
import { addAnonymousStat, getBenchmark } from '../../../lib/benchmarks';

export const runtime = 'nodejs';

const configured = () => process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN;

export async function POST(request) {
  if (!configured()) return NextResponse.json({ error: 'Benchmarks are not configured.' }, { status: 503 });
  try {
    await addAnonymousStat(await request.json());
    return NextResponse.json({ stored: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Could not record the anonymous result.' }, { status: 400 });
  }
}

export async function GET(request) {
  if (!configured()) return NextResponse.json({ available: false, count: 0, required: 30 });
  const url = new URL(request.url);
  const result = await getBenchmark({ occupation: url.searchParams.get('occupation'), country: url.searchParams.get('country'), score: url.searchParams.get('score') });
  return NextResponse.json(result, { headers: { 'Cache-Control': 'private, max-age=60' } });
}
