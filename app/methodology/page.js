import Link from 'next/link';
import { LIBRARY_VERSION } from '../../lib/scoring';

export const metadata = {
  title: 'Methodology | AI Job Risk Calculator',
  description: 'How the AI Job Risk, Protection and Leverage scores are calculated, including sources, uncertainty and limitations.',
  alternates: { canonical: 'https://calculator.inspireambitions.com/methodology' },
};

const sources = [
  ['World Economic Forum, Future of Jobs Report 2025', 'https://www.weforum.org/publications/the-future-of-jobs-report-2025/', 'Employer expectations about changing jobs and skills.'],
  ['International Labour Organization, Generative AI and Jobs: A 2025 Update', 'https://www.ilo.org/publications/generative-ai-and-jobs-2025-update', 'Task-level occupational exposure and the distinction between exposure and job loss.'],
  ['Goldman Sachs Research, AI substitution and augmentation, 2026', 'https://www.goldmansachs.com/insights/articles/the-jobs-ai-is-likely-to-boost-and-those-it-may-disrupt', 'The different labour effects of AI replacing tasks and helping people do more work.'],
];

export default function MethodologyPage() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <article className="mx-auto max-w-3xl px-4 py-10 sm:py-16">
        <Link className="text-sm font-medium text-brand-700 underline" href="/">Back to the calculator</Link>
        <h1 className="mt-6 text-3xl font-bold sm:text-4xl">How the calculator works</h1>
        <p className="mt-4 text-lg leading-8 text-gray-600">
          This tool is informed by published research. It does not copy a research score or predict a certain job loss date. It turns your task list into a consistent planning signal.
        </p>

        <section className="mt-10 space-y-4">
          <h2 className="text-2xl font-bold">Three scores</h2>
          <p><strong>Risk Score</strong> estimates how much of your current task mix overlaps with known AI capabilities. Routine information work starts higher. Trust, physical work and accountable judgement start lower.</p>
          <p><strong>Protection Score</strong> starts from the task risk and adds a limited bonus where the role depends on human trust, physical presence or accountable decisions.</p>
          <p><strong>Leverage Score</strong> estimates how much of the exposed work you may be able to improve with AI while keeping human responsibility for the result.</p>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-2xl font-bold">A deterministic calculation</h2>
          <p>Each recognised task maps to a reviewed task category and base exposure. The tool then applies small, published multipliers for region, experience and work setting. The same input and scoring-library version always produce the same numbers.</p>
          <div className="rounded-lg border border-gray-200 bg-white p-5 text-sm">
            <p><strong>Risk</strong> = weighted task exposure × region × experience × work setting.</p>
            <p className="mt-2"><strong>Protection</strong> = 100 − base exposure + a capped structural protection factor.</p>
            <p className="mt-2"><strong>Leverage</strong> = exposed work with a practical AI-assisted action ÷ total exposed work.</p>
          </div>
          <p>Unrecognised free-text tasks receive a neutral starting score of 50 and are marked as estimated. They do not silently receive an invented precise score.</p>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-2xl font-bold">Why the year is a range</h2>
          <p>The displacement horizon is an uncertainty band, such as “~2031 (2029–2034)”. It is not a forecast of redundancy. It estimates when AI could perform at least half of the current task mix under the model assumptions. Low-risk results show “10+ years” because a precise year would not be credible.</p>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-2xl font-bold">Research sources</h2>
          <p>These sources inform the product direction and task-level framing. They do not endorse this calculator.</p>
          <ul className="space-y-4">
            {sources.map(([title, url, note]) => (
              <li key={url} className="border-s-2 border-brand-500 ps-4">
                <a className="font-semibold text-brand-700 underline" href={url} target="_blank" rel="noopener noreferrer">{title}</a>
                <p className="mt-1 text-sm text-gray-600">{note}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-2xl font-bold">Limits</h2>
          <p>AI capability, regulation, costs and employer choices change. A title can also hide very different work. The result cannot know your employer’s plans, local demand, performance or personal network. Use it to choose skills and redesign tasks, not to decide whether to resign.</p>
          <p>The written explanation is produced by an AI model. The three numerical scores are produced by the deterministic library after that response. Model version: <strong>{LIBRARY_VERSION}</strong>.</p>
        </section>

        <section className="mt-10 rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-xl font-bold">Privacy</h2>
          <p className="mt-2 text-gray-600">Your current analysis is processed to produce the result and is not stored with your identity. Anonymous statistics and optional share links will only be introduced with clear controls before those features launch.</p>
        </section>
      </article>
    </main>
  );
}
