'use client';

import { useState } from 'react';

export default function EmailCapture({ score, jobTitle }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || status === 'loading') return;

    setStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, score, jobTitle }),
      });
      if (res.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-brand-50 border border-brand-200 rounded-xl p-6 text-center fade-in-up">
        <p className="text-sm font-bold text-brand-800 mb-1">You are in.</p>
        <p className="text-sm text-brand-700">
          Weekly AI career insights from InspireAmbitions.com will land in your inbox.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 fade-in-up">
      <div className="text-center mb-4">
        <p className="text-base font-bold text-gray-900">AI is moving fast. Stay ahead.</p>
        <p className="text-sm text-gray-600 mt-1">
          Get weekly career insights and AI workforce trends. No spam. Unsubscribe anytime.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-5 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          {status === 'loading' ? 'Subscribing...' : 'Get Insights'}
        </button>
      </form>
      {status === 'error' && (
        <p className="text-xs text-red-500 text-center mt-2">Something went wrong. Try again.</p>
      )}
      <p className="text-[11px] text-gray-400 text-center mt-3">
        Join 2,000+ professionals reading InspireAmbitions.com
      </p>
    </div>
  );
}
