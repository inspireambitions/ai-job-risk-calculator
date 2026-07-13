import Link from 'next/link';
import ThemeToggle from '../../components/ThemeToggle';
import { averageRisk, occupations, riskLabel } from '../../lib/occupations';

export const metadata = {
  title: 'AI Job Risk by Occupation | GCC Career Guides',
  description: 'Explore task-level AI risk, protection plans and regional guidance for 20 Gulf-relevant occupations.',
  alternates: { canonical: 'https://calculator.inspireambitions.com/jobs' },
};

export default function JobsPage() {
  return <main className="min-h-screen"><header className="border-b border-gray-200 bg-white"><div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4"><Link href="/" className="font-bold">AI Job Risk Calculator</Link><ThemeToggle /></div></header><div className="mx-auto max-w-5xl px-4 py-12"><h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">AI job risk by occupation</h1><p className="mt-4 max-w-2xl text-lg leading-8 text-gray-600">Reviewed task profiles for Gulf careers. Each guide shows which duties may change, which skills protect you and what to do next.</p><div className="mt-10 divide-y divide-gray-200 border-y border-gray-200">{occupations.map((occupation) => { const score = averageRisk(occupation); return <article key={occupation.slug} className="grid gap-3 py-5 sm:grid-cols-[minmax(0,1fr)_160px] sm:items-center"><div><Link href={`/jobs/${occupation.slug}`} className="text-lg font-bold text-brand-600 hover:underline">{occupation.title}</Link><p className="mt-1 text-sm text-gray-500">{occupation.sector}</p></div><div><span className="font-bold tabular-nums text-gray-900">{score}/100</span><span className="ms-2 text-sm text-gray-500">{riskLabel(score)}</span></div></article>; })}</div></div></main>;
}
