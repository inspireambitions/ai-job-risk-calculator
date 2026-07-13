import Link from 'next/link';
import CompareClient from './CompareClient';

export const metadata = { title: 'Compare Two Jobs for AI Risk', description: 'Compare the task-level AI risk, protection and leverage of two roles.', alternates: { canonical: 'https://calculator.inspireambitions.com/compare' } };

export default function ComparePage() {
  return <main className="min-h-screen bg-gray-50 px-4 py-10 text-gray-900"><div className="mx-auto max-w-4xl"><Link className="text-sm font-semibold text-brand-700 underline" href="/">Back to calculator</Link><h1 className="mt-5 text-3xl font-bold">Compare two jobs</h1><p className="mt-3 max-w-2xl text-gray-600">Use real daily tasks from each role. The same deterministic scoring library checks both sides.</p><div className="mt-8"><CompareClient /></div></div></main>;
}
