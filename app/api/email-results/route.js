import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email, tool, subject, content, source } = await request.json();

    if (!email || !email.includes('@') || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Proxy to WordPress AJAX endpoint
    const wpData = new URLSearchParams();
    wpData.append('action', 'tool_email_results');
    wpData.append('email', email);
    wpData.append('tool', tool || 'AI Job Risk Calculator');
    wpData.append('subject', subject || 'Your Assessment Results');
    wpData.append('content', content);
    wpData.append('source', source || 'ai-job-risk-calculator');

    const wpRes = await fetch('https://inspireambitions.com/wp-admin/admin-ajax.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (compatible; InspireAmbitions-Calculator/1.0)',
        'Accept': 'application/json, text/plain, */*',
        'Origin': 'https://calculator.inspireambitions.com',
        'Referer': 'https://calculator.inspireambitions.com/',
      },
      body: wpData.toString(),
      cache: 'no-store',
    });

    const wpText = await wpRes.text();

    if (!wpRes.ok) {
      console.error('WP email error:', wpRes.status, wpText.substring(0, 500));
      return NextResponse.json({ error: 'Email delivery failed' }, { status: 502 });
    }

    try {
      const wpJson = JSON.parse(wpText);

      if (wpJson.success) {
        return NextResponse.json({ success: true, data: wpJson.data || null });
      }

      console.error('WP email rejected:', wpText.substring(0, 500));
      return NextResponse.json({ error: 'Email delivery failed' }, { status: 502 });
    } catch {
      return NextResponse.json({ success: true });
    }
  } catch (err) {
    console.error('Email proxy error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
