import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email, tool, subject, content } = await request.json();

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
    });

    const wpText = await wpRes.text();

    if (wpRes.ok) {
      return NextResponse.json({ success: true });
    } else {
      console.error('WP email error:', wpRes.status, wpText.substring(0, 500));
      return NextResponse.json({ error: 'Email delivery failed' }, { status: 502 });
    }
  } catch (err) {
    console.error('Email proxy error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
