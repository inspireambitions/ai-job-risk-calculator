'use client';

import { useState } from 'react';

function getTimelineText(timeline, legacyKey, currentKey) {
  return timeline?.[legacyKey] || timeline?.[currentKey] || '';
}

export function buildEmailHTML(results, formData) {
  const score = results.overallRiskScore;
  const protectionScore = results.protectionScore || 0;
  const displacementYear = results.displacementYear || null;

  const riskColor = score <= 30 ? '#22c55e' : score <= 55 ? '#eab308' : score <= 75 ? '#f97316' : '#ef4444';
  const protColor = protectionScore >= 70 ? '#22c55e' : protectionScore >= 45 ? '#eab308' : protectionScore >= 25 ? '#f97316' : '#ef4444';
  const riskLabel = score <= 30 ? 'Low Risk' : score <= 55 ? 'Moderate Risk' : score <= 75 ? 'High Risk' : 'Very High Risk';
  const protLabel = protectionScore >= 70 ? 'Strong Protection' : protectionScore >= 45 ? 'Moderate Protection' : protectionScore >= 25 ? 'Weak Protection' : 'Minimal Protection';

  let html = `<h2 style="margin:0 0 8px;color:#1a1a2e;font-size:20px;">AI Job Risk Analysis</h2>
<p style="margin:0 0 20px;color:#666;font-size:14px;">Results for <strong>${formData.jobTitle}</strong>${formData.industry ? ` in ${formData.industry}` : ''}</p>

<table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
<tr>
<td style="width:50%;text-align:center;padding:20px;background:#f8f9fa;border-radius:8px 0 0 8px;">
<div style="font-size:11px;text-transform:uppercase;color:#888;letter-spacing:1px;margin-bottom:8px;">AI Displacement Risk</div>
<div style="font-size:36px;font-weight:bold;color:${riskColor};">${score}%</div>
<div style="font-size:13px;font-weight:600;color:${riskColor};">${riskLabel}</div>
</td>
<td style="width:50%;text-align:center;padding:20px;background:#f8f9fa;border-radius:0 8px 8px 0;">
<div style="font-size:11px;text-transform:uppercase;color:#888;letter-spacing:1px;margin-bottom:8px;">Career Protection</div>
<div style="font-size:36px;font-weight:bold;color:${protColor};">${protectionScore}%</div>
<div style="font-size:13px;font-weight:600;color:${protColor};">${protLabel}</div>
</td>
</tr>
</table>`;

  if (displacementYear) {
    html += `<div style="background:#fff8f0;border:1px solid #fed7aa;border-radius:8px;padding:16px;text-align:center;margin-bottom:20px;">
<div style="font-size:11px;text-transform:uppercase;color:#888;letter-spacing:1px;">Estimated Displacement Horizon</div>
<div style="font-size:32px;font-weight:800;color:#ea580c;margin:6px 0;">${displacementYear}</div>
<div style="font-size:12px;color:#888;">Year when AI could automate 50%+ of your current tasks</div>
</div>`;
  }

  if (results.summary) {
    html += `<p style="color:#555;font-size:14px;line-height:1.6;margin-bottom:20px;">${results.summary}</p>`;
  }

  if (results.keyInsight) {
    html += `<div style="background:#eef2ff;border:1px solid #c7d2fe;border-radius:8px;padding:14px;margin-bottom:20px;">
<p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#3730a3;">Key Insight</p>
<p style="margin:0;font-size:14px;color:#4338ca;">${results.keyInsight}</p>
</div>`;
  }

  if (results.taskAnalysis && results.taskAnalysis.length > 0) {
    html += `<h3 style="margin:20px 0 12px;color:#1a1a2e;font-size:16px;">Task-by-Task Breakdown</h3>
<table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
<tr style="background:#f8f9fa;">
<th style="padding:10px;text-align:left;font-size:13px;border-bottom:2px solid #e5e7eb;">Task</th>
<th style="padding:10px;text-align:center;font-size:13px;border-bottom:2px solid #e5e7eb;width:70px;">Risk</th>
<th style="padding:10px;text-align:center;font-size:13px;border-bottom:2px solid #e5e7eb;width:90px;">Timeframe</th>
</tr>`;
    results.taskAnalysis.forEach((task) => {
      const taskColor = task.riskScore <= 30 ? '#22c55e' : task.riskScore <= 55 ? '#eab308' : task.riskScore <= 75 ? '#f97316' : '#ef4444';
      html += `<tr>
<td style="padding:10px;font-size:13px;border-bottom:1px solid #f0f0f0;">
<strong>${task.task}</strong><br><span style="color:#888;font-size:12px;">${task.reasoning}</span>
</td>
<td style="padding:10px;text-align:center;font-weight:600;color:${taskColor};border-bottom:1px solid #f0f0f0;">${task.riskScore}%</td>
<td style="padding:10px;text-align:center;font-size:12px;color:#666;border-bottom:1px solid #f0f0f0;">${task.timeframe}</td>
</tr>`;
    });
    html += `</table>`;
  }

  if (results.safeZone || results.vulnerabilities) {
    html += `<table style="width:100%;border-collapse:collapse;margin-bottom:20px;"><tr>`;
    if (results.safeZone) {
      html += `<td style="width:50%;vertical-align:top;padding:14px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;">
<p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#166534;">Your Safe Zone</p>
<p style="margin:0;font-size:13px;color:#15803d;">${results.safeZone}</p>
</td>`;
    }
    if (results.vulnerabilities) {
      html += `<td style="width:50%;vertical-align:top;padding:14px;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;${results.safeZone ? 'margin-left:8px;' : ''}">
<p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#991b1b;">Your Vulnerabilities</p>
<p style="margin:0;font-size:13px;color:#dc2626;">${results.vulnerabilities}</p>
</td>`;
    }
    html += `</tr></table>`;
  }

  if (results.timeline) {
    const shortTerm = getTimelineText(results.timeline, 'shortTerm', 'immediateRisk');
    const midTerm = getTimelineText(results.timeline, 'midTerm', 'mediumTermRisk');
    const longTerm = getTimelineText(results.timeline, 'longTerm', 'longTermRisk');

    html += `<h3 style="margin:20px 0 12px;color:#1a1a2e;font-size:16px;">Timeline Forecast</h3>
<table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
<tr><td style="padding:8px;font-size:12px;font-weight:600;color:#4338ca;background:#eef2ff;width:80px;border-radius:4px;">1-2 years</td>
<td style="padding:8px;font-size:13px;color:#555;">${shortTerm}</td></tr>
<tr><td style="padding:8px;font-size:12px;font-weight:600;color:#ca8a04;background:#fefce8;width:80px;border-radius:4px;">3-5 years</td>
<td style="padding:8px;font-size:13px;color:#555;">${midTerm}</td></tr>
<tr><td style="padding:8px;font-size:12px;font-weight:600;color:#ea580c;background:#fff7ed;width:80px;border-radius:4px;">5-10 years</td>
<td style="padding:8px;font-size:13px;color:#555;">${longTerm}</td></tr>
</table>`;
  }

  if (results.skillsToBuilt && results.skillsToBuilt.length > 0) {
    html += `<h3 style="margin:20px 0 12px;color:#1a1a2e;font-size:16px;">Skills to Build Now</h3>
<div style="margin-bottom:20px;">`;
    results.skillsToBuilt.forEach((skill) => {
      html += `<span style="display:inline-block;padding:6px 14px;margin:3px;background:#eef2ff;color:#4338ca;border:1px solid #c7d2fe;border-radius:20px;font-size:13px;">${skill}</span>`;
    });
    html += `</div>`;
  }

  if (results.careerPivots && results.careerPivots.length > 0) {
    html += `<h3 style="margin:20px 0 12px;color:#1a1a2e;font-size:16px;">Career Pivot Options</h3>
<table style="width:100%;border-collapse:collapse;margin-bottom:20px;">`;
    results.careerPivots.forEach((pivot) => {
      const tColor = pivot.transferability === 'HIGH' ? '#166534' : '#854d0e';
      const tBg = pivot.transferability === 'HIGH' ? '#dcfce7' : '#fef9c3';
      html += `<tr><td style="padding:10px;border-bottom:1px solid #f0f0f0;">
<span style="display:inline-block;padding:2px 8px;background:${tBg};color:${tColor};border-radius:4px;font-size:11px;font-weight:600;margin-right:8px;">${pivot.transferability}</span>
<strong style="font-size:14px;color:#1a1a2e;">${pivot.role}</strong>
<br><span style="font-size:12px;color:#888;">${pivot.reason}</span>
</td></tr>`;
    });
    html += `</table>`;
  }

  html += `<div style="text-align:center;margin-top:24px;">
<a href="https://inspireambitions.com/career-tools/" style="display:inline-block;background:#2eaa6f;color:#ffffff;padding:12px 32px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;">Explore More Career Tools</a>
</div>`;

  return html;
}

export default function EmailCapture({ score, jobTitle, results, formData }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || status === 'loading') return;

    setStatus('loading');
    try {
      // Send full results email via WordPress
      const emailContent = buildEmailHTML(results, formData);

      const emailRes = await fetch('/api/email-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          tool: 'AI Job Risk Calculator',
          subject: `Your AI Job Risk Analysis: ${formData.jobTitle} — ${score}% Risk`,
          content: emailContent,
        }),
      });

      // Also subscribe via existing Turso/local API
      await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, score, jobTitle }),
      }).catch(() => {});

      if (emailRes.ok) {
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
        <p className="text-sm font-bold text-brand-800 mb-1">Results sent!</p>
        <p className="text-sm text-brand-700">
          Your full AI job risk analysis has been sent to your email. Check your inbox (and spam folder).
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 fade-in-up">
      <div className="text-center mb-4">
        <p className="text-base font-bold text-gray-900">Email yourself the full report</p>
        <p className="text-sm text-gray-600 mt-1">
          Keep your AI risk analysis, career pivot options, and personalised skills roadmap in your inbox.
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
          {status === 'loading' ? 'Sending...' : 'Email My Report'}
        </button>
      </form>
      {status === 'error' && (
        <p className="text-xs text-red-500 text-center mt-2">Something went wrong. Try again.</p>
      )}
      <p className="text-[11px] text-gray-400 text-center mt-3">
        You will also receive weekly AI career insights from InspireAmbitions.com. Unsubscribe anytime.
      </p>
    </div>
  );
}
