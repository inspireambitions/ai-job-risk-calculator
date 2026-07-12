'use client';

import { useState, useEffect } from 'react';

const loadingMessages = [
  'Analysing your job profile...',
  'Evaluating each task for AI automation potential...',
  'Checking current AI capabilities against your role...',
  'Calculating your personalised risk score...',
  'Generating career insights...',
  'Preparing your detailed report...'
];

export default function LoadingState({ jobTitle }) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => prev < loadingMessages.length - 1 ? prev + 1 : prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-20" role="status" aria-live="polite" aria-busy="true">
      <div className="w-full max-w-md space-y-4 mb-8" aria-hidden="true">
        <div className="h-5 w-2/3 mx-auto rounded bg-gray-200 pulse-slow" />
        <div className="h-3 w-full rounded bg-gray-200 pulse-slow" />
        <div className="h-3 w-5/6 mx-auto rounded bg-gray-200 pulse-slow" />
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Analysing: {jobTitle}</h3>
      <p className="text-sm text-gray-500 pulse-slow text-center max-w-md">{loadingMessages[messageIndex]}</p>
      <div className="flex gap-2 mt-8">
        {loadingMessages.map((_, idx) => (
          <div key={idx} className={`w-2 h-2 rounded-full transition-colors duration-500 ${idx <= messageIndex ? 'bg-brand-500' : 'bg-gray-200'}`} />
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-6">This takes 10-20 seconds for a thorough analysis.</p>
    </div>
  );
}
