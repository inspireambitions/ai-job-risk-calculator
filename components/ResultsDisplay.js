'use client';

import { useState } from 'react';
import EmailCapture from './EmailCapture';

function getRiskColor(score) {
  if (score <= 30) return { bg: 'bg-green-500', text: 'text-green-700', light: 'bg-green-50', border: 'border-green-200' };
  if (score <= 55) return { bg: 'bg-yellow-500', text: 'text-yellow-700', light: 'bg-yellow-50', border: 'border-yellow-200' };
  if (score <= 75) return { bg: 'bg-orange-500', text: 'text-orange-700', light: 'bg-orange-50', border: 'border-orange-200' };
  return { bg: 'bg-red-500', text: 'text-red-700', light: 'bg-red-50', border: 'border-red-200' };
}

function getRiskLabel(score) {
  if (score <= 30) return 'Low Risk';
  if (score <= 55) return 'Moderate Risk';
  if (score <= 75) return 'High Risk';
  return 'Very High Risk';
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
          <span className="text-sm font-semibold text-gray-700 w-10 text-right">{task.riskScore}%</span>
        </div>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2 mb-1.5">
        <div
          className={`h-2 rounded-full risk-fill ${colors.bg}`}
          style={{ '--risk-width': `${task.riskScore}%` }}
        />
      </div>
      <p className="text-xs text-gray-500">{task.reasoning}</p>
    </div>
  );
}

export default function ResultsDisplay({ results, formData, onReset }) {
  const [copyText, setCopyText] = useState('');
  const score = results.overallRiskScore;
  const colors = getRiskColor(score);
  const toolUrl = 'https://ai-job-risk-calculator.vercel.app/';

  const shareMessage = `My AI Job Displacement Risk Score for "${formData.jobTitle}": ${score}% (${getRiskLabel(score)}). Check yours:`;

  const handleLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(toolUrl)}`;
    window.open(url, '_blank', 'width=600,height=500');
  };

  const handleX = () => {
    const url = `https://x.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(toolUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const handleWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareMessage + ' ' + toolUrl)}`;
    window.open(url, '_blank');
  };

  const handleCopy = () => {
    const text = `${shareMessage} ${toolUrl}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopyText('Copied!');
      setTimeout(() => setCopyText(''), 3000);
    }).catch(() => {});
  };

  return (
    <div className="space-y-6">
      {/* Score Card */}
      <div className={`bg-white rounded-xl border-2 ${colors.border} p-6 sm:p-8 text-center fade-in-up`}>
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Your AI Displacement Risk Score
        </p>

        <div className="relative inline-flex items-center justify-center mb-4">
          <div className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full border-8 ${colors.border} flex items-center justify-center`}>
            <div>
              <span className={`text-4xl sm:text-5xl font-bold ${colors.text}`}>{score}</span>
              <span className={`text-lg ${colors.text}`}>%</span>
            </div>
          </div>
        </div>

        <p className={`text-lg font-bold ${colors.text} mb-2`}>
          {getRiskLabel(score)}
        </p>

        <p className="text-sm text-gray-600 max-w-lg mx-auto mb-5">
          {results.summary}
        </p>

        {/* Share Buttons */}
        <div className="mb-4">
          <p className="text-xs text-gray-400 mb-2">Share your score</p>
          <div className="flex justify-center gap-2 flex-wrap">
            <button
              onClick={handleLinkedIn}
              className="px-4 py-2 bg-[#0A66C2] text-white rounded-lg text-sm font-medium hover:bg-[#004182] transition-colors"
            >
              LinkedIn
            </button>
            <button
              onClick={handleX}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              X / Twitter
            </button>
            <button
              onClick={handleWhatsApp}
              className="px-4 py-2 bg-[#25D366] text-white rounded-lg text-sm font-medium hover:bg-[#1DA851] transition-colors"
            >
              WhatsApp
            </button>
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              {copyText || 'Copy Link'}
            </button>
          </div>
        </div>

        <button
          onClick={onReset}
          className="px-5 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Analyse Another Role
        </button>
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

      {/* Email Capture */}
      <EmailCapture score={score} jobTitle={formData.jobTitle} />

      {/* Timeline */}
      {results.timeline && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 shadow-sm fade-in-up fade-in-up-delay-4">
          <h3 className="text-base font-bold text-gray-900 mb-4">Timeline Forecast</h3>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-20 sm:w-24">
                <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded">1-2 years</span>
              </div>
              <p className="text-sm text-gray-700">{results.timeline.shortTerm}</p>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-20 sm:w-24">
                <span className="text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded">3-5 years</span>
              </div>
              <p className="text-sm text-gray-700">{results.timeline.midTerm}</p>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-20 sm:w-24">
                <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded">5-10 years</span>
              </div>
              <p className="text-sm text-gray-700">{results.timeline.longTerm}</p>
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

      {/* CTA */}
      <div className="bg-gray-900 text-white rounded-xl p-6 text-center fade-in-up">
        <p className="text-base font-bold mb-2">Want deeper career guidance?</p>
        <p className="text-sm text-gray-300 mb-4">
          Visit InspireAmbitions.com for expert HR insights and career strategies.
        </p>
        <a
          href="https://inspireambitions.com/career-tools/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-6 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-500 transition-colors"
        >
          Explore Career Tools
        </a>
      </div>
    </div>
  );
          }
