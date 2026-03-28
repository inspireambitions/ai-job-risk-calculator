'use client';

import { useState, useCallback } from 'react';
import JobForm from '../components/JobForm';
import ResultsDisplay from '../components/ResultsDisplay';
import LoadingState from '../components/LoadingState';

export default function Home() {
  const [step, setStep] = useState('form');
  const [results, setResults] = useState(null);
  const [formData, setFormData] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = useCallback(async (data) => {
    setFormData(data);
    setStep('loading');
    setError(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const analysis = await response.json();

      if (analysis.error) {
        throw new Error(analysis.error);
      }

      setResults(analysis);
      setStep('results');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setStep('form');
    }
  }, []);

  const handleReset = useCallback(() => {
    setStep('form');
    setResults(null);
    setFormData(null);
    setError(null);
  }, []);

  return (
    <main className="min-h-screen">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between">
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
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {step === 'form' && (
          <div className="fade-in-up">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                Will AI Replace Your Job?
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Get a personalised risk assessment based on your actual daily tasks.
                Not a generic score. A real analysis of what AI can and cannot do in your role.
              </p>
            </div>
            <JobForm onSubmit={handleSubmit} initialData={formData} />
          </div>
        )}

        {step === 'loading' && (
          <LoadingState jobTitle={formData?.jobTitle} />
        )}

        {step === 'results' && results && (
          <ResultsDisplay
            results={results}
            formData={formData}
            onReset={handleReset}
          />
        )}
      </div>

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
            {' '} | Your job is made of tasks. AI replaces tasks, not jobs.
          </p>
        </div>
      </footer>
    </main>
  );
}
