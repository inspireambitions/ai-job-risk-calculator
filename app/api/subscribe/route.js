import { NextResponse } from 'next/server';
import { getTursoClient } from '@/lib/turso';

const SENDY_URL = 'https://inspire-ambitions.sendybay.com/subscribe';
const SENDY_LIST_ID = process.env.SENDY_LIST_ID || 'M763FI3Su6ageZWvxV2v6eSg';

function isSendySuccess(responseText) {
  const body = responseText.trim().toLowerCase();
  return body === '1' || body === 'true' || body.includes('already subscribed');
}

async function subscribeToSendy({ email, score, jobTitle }) {
  const body = new URLSearchParams();
  body.set('email', email);
  body.set('list', SENDY_LIST_ID);
  body.set('boolean', 'true');
  body.set('subform', 'yes');
  body.set('Source', 'ai-job-risk-calculator');

  if (score !== null && score !== undefined) {
    body.set('AI Risk Score', String(score));
  }

  if (jobTitle) {
    body.set('Job Title', jobTitle);
  }

  const response = await fetch(SENDY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (compatible; InspireAmbitions-Calculator/1.0)',
    },
    body: body.toString(),
    cache: 'no-store',
  });

  const responseText = await response.text();

  if (!response.ok || !isSendySuccess(responseText)) {
    throw new Error(`Sendy subscribe failed: ${response.status} ${responseText.slice(0, 120)}`);
  }

  return responseText.trim();
}

export async function POST(request) {
  let normalizedEmail = '';
  let score = null;
  let jobTitle = null;
  let stored = false;
  let sendySubscribed = false;

  try {
    const payload = await request.json();
    normalizedEmail = String(payload.email || '').toLowerCase().trim();
    score = payload.score ?? null;
    jobTitle = payload.jobTitle || null;

    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    try {
      const db = getTursoClient();
      await db.execute({
        sql: 'INSERT OR IGNORE INTO subscribers (email, source) VALUES (?, ?)',
        args: [normalizedEmail, 'ai-job-risk-calculator'],
      });
      stored = true;
    } catch (err) {
      console.error('Turso subscribe storage error:', err);
    }

    try {
      await subscribeToSendy({ email: normalizedEmail, score, jobTitle });
      sendySubscribed = true;
    } catch (err) {
      console.error('Sendy subscribe error:', err);
    }

    console.log(JSON.stringify({
      type: 'NEW_SUBSCRIBER',
      email: normalizedEmail,
      score,
      jobTitle,
      stored,
      sendySubscribed,
      timestamp: new Date().toISOString(),
    }));

    return NextResponse.json({ success: true, stored, sendySubscribed });
  } catch (err) {
    console.error('Subscribe error:', err);

    if (normalizedEmail) {
      return NextResponse.json({ success: true, stored, sendySubscribed });
    }

    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
