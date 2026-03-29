import { NextResponse } from 'next/server';
import { getTursoClient } from '@/lib/turso';

export async function POST(request) {
  try {
    const { email, score, jobTitle } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    // Store in Turso database
    const db = getTursoClient();
    await db.execute({
      sql: 'INSERT OR IGNORE INTO subscribers (email, source) VALUES (?, ?)',
      args: [email.toLowerCase().trim(), 'ai-job-risk-calculator'],
    });

    // Also log for monitoring
    console.log(JSON.stringify({
      type: 'NEW_SUBSCRIBER',
      email: email.toLowerCase().trim(),
      score: score || null,
      jobTitle: jobTitle || null,
      timestamp: new Date().toISOString(),
    }));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Subscribe error:', err);

    // If Turso is down, still return success to not break UX
    if (err.message && err.message.includes('TURSO')) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
