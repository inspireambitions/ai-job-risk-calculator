import { createHmac, createHash } from 'node:crypto';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const limits = globalThis.__handoffLimits || new Map();
globalThis.__handoffLimits = limits;

const clean = (value, max) => String(value || '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);

export async function POST(request) {
  const secret = process.env.HANDOFF_SECRET;
  if (!secret || secret.length < 32) return NextResponse.json({ error: 'CV handoff is not configured.' }, { status: 503 });
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const key = createHash('sha256').update(ip).digest('hex');
  const now = Date.now();
  const current = limits.get(key);
  if (current && current.resetAt > now && current.count >= 10) return NextResponse.json({ error: 'Too many handoff requests.' }, { status: 429 });
  limits.set(key, current && current.resetAt > now ? { ...current, count: current.count + 1 } : { count: 1, resetAt: now + 60 * 60 * 1000 });

  const input = await request.json();
  const payload = {
    role: clean(input.role, 120),
    country: clean(input.country, 60),
    tasks: Array.isArray(input.tasks) ? input.tasks.slice(0, 8).map((task) => clean(task, 300)).filter(Boolean) : [],
    source: 'ai-job-risk-calculator',
    exp: Math.floor(now / 1000) + 15 * 60,
  };
  if (!payload.role || payload.tasks.length === 0) return NextResponse.json({ error: 'Role and tasks are required.' }, { status: 400 });
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = createHmac('sha256', secret).update(encoded).digest('base64url');
  return NextResponse.json({ token: `${encoded}.${signature}`, expiresIn: 900 });
}
