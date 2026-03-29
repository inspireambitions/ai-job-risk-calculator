import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email, score, jobTitle } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    // Log subscriber to Vercel function logs (visible in Vercel dashboard > Logs)
    console.log(JSON.stringify({
      type: 'NEW_SUBSCRIBER',
      email,
      score: score || null,
      jobTitle: jobTitle || null,
      timestamp: new Date().toISOString(),
    }));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Subscribe error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
