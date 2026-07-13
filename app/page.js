'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import JobForm from '../components/JobForm';
import SEOContent from '../components/SEOContent';
import ExampleResult from '../components/ExampleResult';
import { trackToolEvent } from '../components/analytics';
import ThemeToggle from '../components/ThemeToggle';

const LoadingState = dynamic(() => import('../components/LoadingState'));
const ResultsDisplay = dynamic(() => import('../components/ResultsDisplay'));

export default function Home() {
  const [step, setStep] = useState('form'); // form | loading | results
  const [results, setResults] = useState(null);
  const [formData, setFormData] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const errorRef = useRef(null);

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  const handleSubmit = useCallback(async (data) => {
    if (submitting) return;
    setFormData(data);
    setStep('loading');
    setError(null);
    setSubmitting(true);
    trackToolEvent('tool_started', { surface: 'ai_job_risk_form' });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      const analysis = await response.json();

      if (!response.ok || analysis.error) {
        throw new Error(analysis.error || 'Our servers are busy right now. Please wait a moment and try again.');
      }

      setResults(analysis);
      setStep('results');
      trackToolEvent('risk_analysis_run', {
        surface: 'ai_job_risk_results',
        score_band: analysis.riskLevel,
        country: data.country || 'not_specified',
        industry: data.industry || 'not_specified',
        task_count: data.tasks.length,
      });
    } catch (err) {
      const message = err.name === 'AbortError'
        ? 'The analysis took too long. Your details are still here, so you can try again.'
        : err.message || 'Our servers are busy right now. Please wait a moment and try again.';
      setError(message);
      trackToolEvent('analysis_failed', { surface: 'ai_job_risk_form' });
      setStep('form');
    } finally {
      clearTimeout(timeout);
      setSubmitting(false);
    }
  }, [submitting]);

  const handleReset = useCallback(() => {
    setStep('form');
    setResults(null);
    setFormData(null);
    setError(null);
    setSubmitting(false);
  }, []);

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                AI Job Risk Calculator
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Powered by InspireAmbitions.com
              </p>
            </div>
            {step === 'results' && (
              <button
                onClick={handleReset}
                className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
              >
                New Analysis
              </button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10">
        {/* Error banner with retry */}
        {error && (
          <div ref={errorRef} tabIndex={-1} role="alert" className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-amber-800 text-sm">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  if (formData) handleSubmit(formData);
                }}
                className="ms-4 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors whitespace-nowrap"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Form Step */}
        {step === 'form' && (
          <div className="fade-in-up">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                Will AI Replace Your Job?
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto mb-3">
                Get your AI Risk Score, Protection Score, and Displacement Year based on your actual daily tasks. Not a generic job-title lookup. A real analysis of what AI can and cannot do in your role.
              </p>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-gray-400 max-w-xl mx-auto mt-3">
                <span>WEF Future of Jobs 2025</span>
                <span className="text-gray-300">|</span>
                <span>Goldman Sachs Research</span>
                <span className="text-gray-300">|</span>
                <span>International Labour Organization</span>
              </div>
            </div>

            <ExampleResult />

            <JobForm onSubmit={handleSubmit} initialData={formData} />
            <SEOContent />
          </div>
        )}

        {/* Loading Step */}
        {step === 'loading' && (
          <LoadingState jobTitle={formData?.jobTitle} />
        )}

        {/* Results Step */}
        {step === 'results' && results && (
          <ResultsDisplay
            results={results}
            formData={formData}
            onReset={handleReset}
          />
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          <p>
            Built by{' '}
            <a
              href="https://inspireambitions.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-600 hover:underline"
            >
              InspireAmbitions.com
            </a>
            {' '}| Your job is made of tasks. AI replaces tasks, not jobs.
          </p>
          <p className="mt-2">
            <a className="text-brand-600 hover:underline" href="/methodology">Methodology</a>
            {' '}|{' '}
            <a className="text-brand-600 hover:underline" href="/embed">Embed this calculator</a>
          </p>
        </div>
      </footer>
    </main>
  );
        }
