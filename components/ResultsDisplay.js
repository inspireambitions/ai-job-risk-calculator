'use client';

import { useEffect, useRef, useState } from 'react';
import { trackToolEvent } from './analytics';

function getRiskColor(score) {
  if (score <= 30) return { bg: 'bg-green-500', text: 'text-green-700', light: 'bg-green-50', border: 'border-green-200' };
  if (score <= 55) return { bg: 'bg-yellow-500', text: 'text-yellow-700', light: 'bg-yellow-50', border: 'border-yellow-200' };
  if (score <= 75) return { bg: 'bg-orange-500', text: 'text-orange-700', light: 'bg-orange-50', border: 'border-orange-200' };
  return { bg: 'bg-red-500', text: 'text-red-700', light: 'bg-red-50', border: 'border-red-200' };
}

function getProtectionColor(score) {
  if (score >= 70) return { bg: 'bg-green-500', text: 'text-green-700', light: 'bg-green-50', border: 'border-green-200' };
  if (score >= 45) return { bg: 'bg-yellow-500', text: 'text-yellow-700', light: 'bg-yellow-50', border: 'border-yellow-200' };
  if (score >= 25) return { bg: 'bg-orange-500', text: 'text-orange-700', light: 'bg-orange-50', border: 'border-orange-200' };
  return { bg: 'bg-red-500', text: 'text-red-700', light: 'bg-red-50', border: 'border-red-200' };
}

function getRiskLabel(score) {
  if (score <= 30) return 'Low Risk';
  if (score <= 55) return 'Moderate Risk';
  if (score <= 75) return 'High Risk';
  return 'Very High Risk';
}

function getProtectionLabel(score) {
  if (score >= 70) return 'Strong Protection';
  if (score >= 45) return 'Moderate Protection';
  if (score >= 25) return 'Weak Protection';
  return 'Minimal Protection';
}

function getDisplacementUrgency(year) {
  const now = new Date().getFullYear();
  const diff = year - now;
  if (diff <= 3) return { label: 'Imminent', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
  if (diff <= 7) return { label: 'Near-term', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' };
  if (diff <= 12) return { label: 'Medium-term', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
  return { label: 'Long-term', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
}

function getTimelineText(timeline, legacyKey, currentKey) {
  return timeline?.[legacyKey] || timeline?.[currentKey] || '';
}

function getResultArticle(score, jobTitle) {
  const title = jobTitle.toLowerCase();
  if (/human resources|\bhr\b/.test(title)) {
    return {
      title: 'Will AI replace HR jobs?',
      url: 'https://inspireambitions.com/will-ai-replace-hr/',
    };
  }
  if (score >= 56) {
    return {
      title: 'Will AI take my job?',
      url: 'https://inspireambitions.com/will-ai-take-my-job/',
    };
  }
  return {
    title: 'Build creative thinking and AI fluency',
    url: 'https://inspireambitions.com/creative-thinking-ai-fluency-career-skills-2026/',
  };
}

function TaskBar({ task }) {
  const colors = getRiskColor(task.riskScore);
  return (
    <div className="py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-gray-800">{task.task}</span>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors.light} ${colors.text} ${colors.border} border`}>
            {task.timeframe}
          </span>
          <span className="text-sm font-semibold text-gray-700 w-10 text-end">{task.riskScore}%</span>
        </div>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2 mb-1.5">
        <div
          className={`h-2 rounded-full risk-fill ${colors.bg}`}
          style={{ '--risk-width': `${task.riskScore}%` }}
        />
      </div>
      <p className="text-xs text-gray-500">{task.reasoning}</p>
      {task.protectionPlan && <div className="mt-2 border-s-2 border-brand-400 ps-3"><p className="text-xs font-semibold text-brand-800">Protection action</p><p className="mt-0.5 text-xs text-gray-600">{task.protectionPlan}</p></div>}
    </div>
  );
}

export default function ResultsDisplay({ results, formData, onReset }) {
  const resultHeadingRef = useRef(null);
  const [copyText, setCopyText] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [benchmark, setBenchmark] = useState(null);
  const [handoffOpen, setHandoffOpen] = useState(false);
  const [handoffStatus, setHandoffStatus] = useState('idle');
  const benchmarkRecorded = useRef(false);
  const score = results.overallRiskScore;
  const protectionScore = results.protectionScore || 0;
  const leverageScore = results.leverageScore || 0;
  const displacementYear = results.displacementYear || null;
  const displacementRange = results.displacementRange || null;
  const researchContext = results.researchContext || [];
  const colors = getRiskColor(score);
  const protColors = getProtectionColor(protectionScore);
  const toolUrl = 'https://calculator.inspireambitions.com/';
  const resultArticle = getResultArticle(score, formData.jobTitle);

  const trackResultRoute = (eventName, destination) => {
    trackToolEvent(eventName, {
      surface: 'result',
      destination,
      score_band: results.riskLevel,
      journey: 'applications',
    });
  };

  const yearStr = displacementYear
    ? `Estimated task-displacement horizon: ~${displacementYear}${displacementRange ? ` (${displacementRange.earliest}-${displacementRange.latest})` : ''}.`
    : '';
  const shareMessage = `My AI Job Risk Score: ${score}% | Protection Score: ${protectionScore}% for "${formData.jobTitle}". ${yearStr} Check yours:`;

  const getShareUrl = async () => {
    if (shareUrl) return shareUrl;
    try {
      const response = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: formData.jobTitle,
          country: formData.country,
          overallRiskScore: score,
          protectionScore,
          leverageScore,
          displacementYear,
          displacementRange,
          riskLevel: results.riskLevel,
          libraryVersion: results.libraryVersion,
        }),
      });
      if (!response.ok) return toolUrl;
      const data = await response.json();
      const nextUrl = `${window.location.origin}/r/${data.id}`;
      setShareUrl(nextUrl);
      return nextUrl;
    } catch {
      return toolUrl;
    }
  };

  const handleLinkedIn = async () => {
    const shared = await getShareUrl();
    trackToolEvent('result_shared', { surface: 'result', channel: 'linkedin' });
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shared)}`;
    window.open(url, '_blank', 'width=600,height=500');
  };

  const handleX = async () => {
    const shared = await getShareUrl();
    trackToolEvent('result_shared', { surface: 'result', channel: 'x' });
    const url = `https://x.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(shared)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const handleWhatsApp = async () => {
    const shared = await getShareUrl();
    trackToolEvent('result_shared', { surface: 'result', channel: 'whatsapp' });
    const url = `https://wa.me/?text=${encodeURIComponent(shareMessage + ' ' + shared)}`;
    window.open(url, '_blank');
  };

  const handleCopy = async () => {
    const shared = await getShareUrl();
    const text = `${shareMessage} ${shared}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopyText('Copied!');
      trackToolEvent('result_shared', { surface: 'result', channel: 'link' });
      setTimeout(() => setCopyText(''), 3000);
    }).catch(() => {});
  };

  const urgency = displacementYear ? getDisplacementUrgency(displacementYear) : null;

  const startCvHandoff = async () => {
    setHandoffStatus('loading');
    try {
      const response = await fetch('/api/handoff/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: formData.jobTitle, country: formData.country, tasks: formData.tasks }),
      });
      if (!response.ok) throw new Error('handoff unavailable');
      const { token } = await response.json();
      trackToolEvent('cv_handoff_clicked', { surface: 'result', score_band: results.riskLevel });
      trackResultRoute('next_tool_clicked', 'cv_builder');
      window.location.href = `https://cv.inspireambitions.com/?handoff=${encodeURIComponent(token)}`;
    } catch {
      setHandoffStatus('error');
    }
  };

  useEffect(() => {
    resultHeadingRef.current?.focus();
  }, []);

  useEffect(() => {
    if (benchmarkRecorded.current) return;
    benchmarkRecorded.current = true;
    const payload = { occupation: formData.jobTitle, country: formData.country || '', score };
    fetch('/api/benchmark', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      .then(() => fetch(`/api/benchmark?occupation=${encodeURIComponent(payload.occupation)}&country=${encodeURIComponent(payload.country)}&score=${score}`))
      .then((response) => response.ok ? response.json() : null)
      .then((data) => data && setBenchmark(data))
      .catch(() => {});
  }, [formData.country, formData.jobTitle, score]);

  return (
    <div className="space-y-6">
      <h2 ref={resultHeadingRef} tabIndex={-1} className="sr-only">
        AI job risk results for {formData.jobTitle}
      </h2>
      {/* Three-score card */}
      <div className={`bg-white rounded-xl border-2 ${colors.border} p-6 sm:p-8 fade-in-up`}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mb-6">
          {/* Risk Score */}
          <div className="text-center">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              AI Displacement Risk
            </p>
            <div className="relative inline-flex items-center justify-center mb-3">
              <div className={`w-28 h-28 sm:w-36 sm:h-36 rounded-full border-8 ${colors.border} flex items-center justify-center`}>
                <div>
                  <span className={`text-3xl sm:text-4xl font-bold ${colors.text}`}>{score}</span>
                  <span className={`text-base ${colors.text}`}>%</span>
                </div>
              </div>
            </div>
            <p className={`text-sm font-bold ${colors.text}`}>
              {getRiskLabel(score)}
            </p>
          </div>

          <div className="text-center">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Leverage Score</p>
            <div className="relative inline-flex items-center justify-center mb-3">
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-8 border-blue-200 flex items-center justify-center" aria-label={`${leverageScore} out of 100 leverage score`}>
                <div><span className="text-3xl sm:text-4xl font-bold text-blue-700">{leverageScore}</span><span className="text-base text-blue-700">%</span></div>
              </div>
            </div>
            <p className="text-sm font-bold text-blue-700">{leverageScore >= 65 ? 'Highly actionable' : leverageScore >= 35 ? 'Partly actionable' : 'Structural exposure'}</p>
          </div>

          {/* Protection Score */}
          <div className="text-center">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Career Protection
            </p>
            <div className="relative inline-flex items-center justify-center mb-3">
              <div className={`w-28 h-28 sm:w-36 sm:h-36 rounded-full border-8 ${protColors.border} flex items-center justify-center`}>
                <div>
                  <span className={`text-3xl sm:text-4xl font-bold ${protColors.text}`}>{protectionScore}</span>
                  <span className={`text-base ${protColors.text}`}>%</span>
                </div>
              </div>
            </div>
            <p className={`text-sm font-bold ${protColors.text}`}>
              {getProtectionLabel(protectionScore)}
            </p>
          </div>
        </div>

        {/* Displacement Year */}
        {displacementYear && urgency && (
          <div className={`${urgency.bg} ${urgency.border} border rounded-lg p-4 mb-5 text-center`}>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Estimated Displacement Horizon
            </p>
            <p className={`text-3xl sm:text-4xl font-extrabold ${urgency.color} mb-1`}>
              {displacementRange ? `~${displacementYear} (${displacementRange.earliest}-${displacementRange.latest})` : '10+ years'}
            </p>
            <p className="text-xs text-gray-500">
              {displacementRange ? 'Estimated range for when AI could automate 50%+ of your current tasks. This is a planning signal, not a promised date.' : 'No credible near-term displacement horizon. Keep adapting as tools and tasks change.'}
            </p>
            <span className={`inline-block mt-2 text-xs font-bold px-3 py-1 rounded-full ${urgency.bg} ${urgency.color} border ${urgency.border}`}>
              {urgency.label}
            </span>
          </div>
        )}

        <p className="text-sm text-gray-600 max-w-lg mx-auto mb-5 text-center">
          {results.summary}
        </p>

        {benchmark?.available ? (
          <p className="mb-5 text-center text-sm font-semibold text-brand-800">
            Your role is safer than {benchmark.percentileSafer}% of comparable {formData.jobTitle} results{benchmark.scope === 'country' && formData.country ? ` in ${formData.country}` : ''}.
          </p>
        ) : benchmark?.count > 0 ? (
          <p className="mb-5 text-center text-xs text-gray-500">Benchmark building: {benchmark.count} of 30 comparable results.</p>
        ) : null}

        {/* Share Buttons */}
        <div className="mb-4">
          <p className="text-xs text-gray-400 mb-2 text-center">Share your score</p>
          <div className="flex justify-center gap-2 flex-wrap">
            <button
              onClick={handleWhatsApp}
              className="px-4 py-2 bg-[#25D366] text-white rounded-lg text-sm font-medium hover:bg-[#1DA851] transition-colors"
            >
              WhatsApp
            </button>
            <button onClick={handleLinkedIn} className="px-4 py-2 bg-[#0A66C2] text-white rounded-lg text-sm font-medium hover:bg-[#004182] transition-colors">LinkedIn</button>
            <button onClick={handleX} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">X / Twitter</button>
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              {copyText || 'Copy Link'}
            </button>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={onReset}
            className="px-5 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Analyse Another Role
          </button>
        </div>
      </div>

      {/* Key Insight */}
      {results.keyInsight && (
        <div className="bg-brand-50 border border-brand-200 rounded-xl p-5 fade-in-up fade-in-up-delay-1">
          <p className="text-sm font-semibold text-brand-800 mb-1">Key Insight</p>
          <p className="text-sm text-brand-700">{results.keyInsight}</p>
        </div>
      )}

      {/* Task-by-Task Breakdown */}
      {results.taskAnalysis && results.taskAnalysis.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 shadow-sm fade-in-up fade-in-up-delay-2">
          <h3 className="text-base font-bold text-gray-900 mb-4">
            Task-by-Task Breakdown
          </h3>
          <div>
            {results.taskAnalysis.map((task, idx) => (
              <TaskBar key={idx} task={task} />
            ))}
          </div>
        </div>
      )}

      {/* Safe Zone & Vulnerabilities */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 fade-in-up fade-in-up-delay-3">
        {results.safeZone && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-5">
            <h4 className="text-sm font-bold text-green-800 mb-2">Your Safe Zone</h4>
            <p className="text-sm text-green-700">{results.safeZone}</p>
          </div>
        )}
        {results.vulnerabilities && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5">
            <h4 className="text-sm font-bold text-red-800 mb-2">Your Vulnerabilities</h4>
            <p className="text-sm text-red-700">{results.vulnerabilities}</p>
          </div>
        )}
      </div>

      {/* Research Context */}
      {researchContext.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 shadow-sm fade-in-up fade-in-up-delay-3">
          <h3 className="text-base font-bold text-gray-900 mb-1">Context informed by published research</h3>
          <p className="text-xs text-gray-400 mb-4">Published findings used as context, not endorsements of this calculator</p>
          <div className="space-y-3">
            {researchContext.map((ref, idx) => (
              <div key={idx} className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold">
                  {idx + 1}
                </div>
                <div>
                  <p className="text-xs font-bold text-brand-700 mb-0.5">{ref.source}</p>
                  <p className="text-sm text-gray-700">{ref.finding}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      {results.timeline && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 shadow-sm fade-in-up fade-in-up-delay-4">
          <h3 className="text-base font-bold text-gray-900 mb-4">Timeline Forecast</h3>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-20 sm:w-24">
                <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded">1-2 years</span>
              </div>
              <p className="text-sm text-gray-700">{getTimelineText(results.timeline, 'shortTerm', 'immediateRisk')}</p>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-20 sm:w-24">
                <span className="text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded">3-5 years</span>
              </div>
              <p className="text-sm text-gray-700">{getTimelineText(results.timeline, 'midTerm', 'mediumTermRisk')}</p>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-20 sm:w-24">
                <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded">5-10 years</span>
              </div>
              <p className="text-sm text-gray-700">{getTimelineText(results.timeline, 'longTerm', 'longTermRisk')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Skills to Build */}
      {results.skillsToBuilt && results.skillsToBuilt.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 shadow-sm fade-in-up fade-in-up-delay-5">
          <h3 className="text-base font-bold text-gray-900 mb-3">Skills to Build Now</h3>
          <div className="flex flex-wrap gap-2">
            {results.skillsToBuilt.map((skill, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 bg-brand-50 text-brand-700 border border-brand-200 rounded-full text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Career Pivots */}
      {results.careerPivots && results.careerPivots.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 shadow-sm fade-in-up fade-in-up-delay-5">
          <h3 className="text-base font-bold text-gray-900 mb-4">Career Pivot Options</h3>
          <div className="space-y-3">
            {results.careerPivots.map((pivot, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <span className={`flex-shrink-0 text-xs font-bold px-2 py-1 rounded ${
                  pivot.transferability === 'HIGH'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {pivot.transferability}
                </span>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{pivot.role}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{pivot.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Methodology Note */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 fade-in-up">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Methodology</h4>
        <p className="text-xs text-gray-500 leading-relaxed">
          This analysis uses AI to assess each of your tasks against current automation capabilities.
          The result is informed by published research from the World Economic Forum, the International Labour
          Organization and Goldman Sachs. These organisations do not endorse this calculator. The deterministic
          score uses your task profile, experience, work setting and region. Read the <a className="underline" href="/methodology">full method and limitations</a>.
        </p>
      </div>

      <p className="text-center text-xs text-gray-500">
        Share links store only an anonymous score snapshot and expire after 90 days. Your email and task text are not included.
      </p>

      <aside className="border border-[#d8c895] bg-[#faf7ee] p-6 fade-in-up" aria-labelledby="result-route-title">
        <p className="text-xs font-bold uppercase tracking-wider text-[#2f6b5e]">Your next step</p>
        <h3 id="result-route-title" className="mt-2 text-lg font-bold text-[#1a2744]">Read guidance matched to this result</h3>
        <p className="mt-2 text-sm text-gray-600">Use the analysis as a planning signal, then turn it into a specific skills and application plan.</p>
        <a
          href={resultArticle.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackResultRoute('result_article_clicked', resultArticle.url)}
          className="mt-4 inline-block font-semibold text-[#806017] underline"
        >
          {resultArticle.title}
        </a>
      </aside>

      {/* CTA */}
      <div className="border border-brand-200 bg-brand-50 p-6 text-center fade-in-up">
        <p className="text-base font-bold text-gray-900 mb-2">Turn your real tasks into a stronger GCC CV</p>
        <p className="text-sm text-gray-600 mb-4">
          Use the CV builder to turn your experience into evidence-led achievements and tailor it to a real vacancy.
        </p>
        <button
          type="button"
          onClick={() => setHandoffOpen(true)}
          className="inline-block px-6 py-2.5 bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors"
        >
          Build and Tailor My CV
        </button>
      </div>

      {handoffOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="handoff-title">
          <div className="w-full max-w-lg bg-white p-6 shadow-xl">
            <h3 id="handoff-title" className="text-xl font-bold text-gray-900">Send these details to the CV builder?</h3>
            <p className="mt-2 text-sm text-gray-600">You choose what moves. No email or score is included.</p>
            <dl className="mt-5 space-y-3 text-sm"><div><dt className="font-semibold">Role</dt><dd>{formData.jobTitle}</dd></div><div><dt className="font-semibold">Country</dt><dd>{formData.country || 'Not provided'}</dd></div><div><dt className="font-semibold">Daily tasks</dt><dd>{formData.tasks.length} task{formData.tasks.length === 1 ? '' : 's'}</dd></div></dl>
            {handoffStatus === 'error' && <p className="mt-4 text-sm text-red-700" role="alert">The secure handoff is not available yet. Your result remains here.</p>}
            <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setHandoffOpen(false)} className="border border-gray-300 px-4 py-2 text-sm font-semibold">Cancel</button><button type="button" disabled={handoffStatus === 'loading'} onClick={startCvHandoff} className="bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{handoffStatus === 'loading' ? 'Preparing...' : 'Send and open CV builder'}</button></div>
          </div>
        </div>
      )}

      {/* General guidance CTA */}
      <div className="bg-gray-900 text-white rounded-xl p-6 text-center fade-in-up">
        <p className="text-base font-bold mb-2">Want deeper career guidance?</p>
        <p className="text-sm text-gray-300 mb-4">
          Visit InspireAmbitions.com for expert HR insights and career strategies.
        </p>
        <a
          href="https://inspireambitions.com/career-tools/"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackResultRoute('next_tool_clicked', 'career_tools_hub')}
          className="inline-block px-6 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-500 transition-colors"
        >
          Explore Career Tools
        </a>
      </div>
    </div>
  );
}
