'use client';

import { useState } from 'react';
import { buildEmailHTML } from './EmailCapture';

export default function EmailGate({ results, formData, onUnlock }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');

  const score = results.overallRiskScore;
  const protectionScore = results.protectionScore || 0;
  const riskLabel = score <= 30 ? 'Low Risk' : score <= 55 ? 'Moderate Risk' : score <= 75 ? 'High Risk' : 'Very High Risk';

  const riskColor = score <= 30
    ? { border: 'border-green-300', text: 'text-green-600', bg: 'bg-green-50' }
    : score <= 55
    ? { border: 'border-yellow-300', text: 'text-yellow-600', bg: 'bg-yellow-50' }
    : score <= 75
    ? { border: 'border-orange-300', text: 'text-orange-600', bg: 'bg-orange-50' }
    : { border: 'border-red-300', text: 'text-red-600', bg: 'bg-red-50' };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || status === 'loading') return;

    setStatus('loading');
    try {
      const emailContent = buildEmailHTML(results, formData);

      // Unlock results immediately — email delivery is best-effort
      onUnlock(email);

      // Send email and subscribe in background (non-blocking)
      fetch('/api/email-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          tool: 'AI Job Risk Calculator',
          subject: `Your AI Job Risk Analysis: ${formData.jobTitle} — ${score}% Risk`,
          content: emailContent,
        }),
      }).catch(() => {});

      fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, score, jobTitle: formData.jobTitle }),
      }).catch(() => {});
    } catch {
      // Even if something goes wrong, unlock results
      onUnlock(email);
    }
  };

  return (
    <div className="fade-in-up">
      {/* Teaser Card */}
      <div className={`bg-white rounded-xl border-2 ${riskColor.border} p-6 sm:p-8 mb-6`}>
        <p className="text-center text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Your analysis is ready
        </p>
        <h2 className="text-center text-xl sm:text-2xl font-bold text-gray-900 mb-6">
          AI Job Risk Results for {formData.jobTitle}
        </h2>

        {/* Blurred preview scores */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="text-center">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              AI Displacement Risk
            </p>
            <div className={`inline-flex w-24 h-24 sm:w-28 sm:h-28 rounded-full border-6 ${riskColor.border} items-center justify-center`}>
              <span className={`text-3xl sm:text-4xl font-bold ${riskColor.text}`}>{score}%</span>
            </div>
            <p className={`text-sm font-bold ${riskColor.text} mt-2`}>{riskLabel}</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Career Protection
            </p>
            <div className="inline-flex w-24 h-24 sm:w-28 sm:h-28 rounded-full border-6 border-gray-200 items-center justify-center relative">
              <span className="text-3xl sm:text-4xl font-bold text-gray-300 blur-sm select-none">{protectionScore}%</span>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-400 mt-2">Unlock below</p>
          </div>
        </div>

        {/* Blurred task preview */}
        {results.taskAnalysis && results.taskAnalysis.length > 0 && (
          <div className="relative rounded-lg overflow-hidden mb-6">
            <div className="blur-md select-none pointer-events-none bg-gray-50 p-4 rounded-lg border border-gray-200">
              {results.taskAnalysis.slice(0, 3).map((task, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-700">{task.task}</span>
                  <span className="text-sm font-semibold text-gray-700">{task.riskScore}%</span>
                </div>
              ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-lg">
              <div className="flex items-center gap-2 text-gray-500">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-sm font-semibold">Task breakdown, timelines &amp; career pivots locked</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Email Gate Form */}
      <div className="bg-white rounded-xl border-2 border-brand-200 p-6 sm:p-8 shadow-lg">
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-100 rounded-full mb-3">
            <svg className="w-6 h-6 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            Enter your email to unlock your full results
          </h3>
          <p className="text-sm text-gray-600">
            We will also send a copy of your complete analysis to your inbox — including task breakdown, displacement timeline, career pivots, and skills roadmap.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-sm mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent mb-3"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full py-3 bg-brand-600 text-white rounded-lg text-base font-semibold hover:bg-brand-700 transition-colors disabled:opacity-50"
          >
            {status === 'loading' ? 'Unlocking...' : 'Unlock My Full Results'}
          </button>
        </form>

        {status === 'error' && (
          <p className="text-xs text-red-500 text-center mt-2">Something went wrong. Please try again.</p>
        )}

        <p className="text-[11px] text-gray-400 text-center mt-3">
          You will also receive weekly AI career insights from InspireAmbitions.com. Unsubscribe anytime.
        </p>
      </div>
    </div>
  );
}
