import Link from 'next/link';
import ThemeToggle from './ThemeToggle';
import { averageRisk, calculatorHref, getOccupation, occupationSources, regions, riskLabel } from '../lib/occupations';

function SourceText({ children }) {
  const parts = String(children).split(/(\[S\d+\])/g);
  return parts.map((part, index) => {
    const key = part.match(/^\[(S\d+)\]$/)?.[1];
    const source = key ? occupationSources[key] : null;
    return source ? <a key={`${key}-${index}`} href={source.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-600 hover:underline">[{key}]</a> : part;
  });
}

export default function OccupationPage({ occupation, region }) {
  const score = averageRisk(occupation);
  const regionInfo = region ? regions[region] : null;
  const related = occupation.related.map((item) => ({ ...item, occupation: getOccupation(item.slug) })).filter((item) => item.occupation);
  const usedSources = occupation.sourceKeys.map((key) => ({ key, ...occupationSources[key] })).filter((source) => source.url);
  const pageTitle = `Will AI replace ${occupation.title.toLowerCase()} jobs${regionInfo ? ` in ${regionInfo.name}` : ''}?`;
  const canonical = `https://calculator.inspireambitions.com/jobs/${occupation.slug}${region ? `/${region}` : ''}`;
  const faqSchema = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: occupation.faqs.map((faq) => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })) };
  const breadcrumbSchema = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'AI Job Risk Calculator', item: 'https://calculator.inspireambitions.com' },
    { '@type': 'ListItem', position: 2, name: 'Jobs', item: 'https://calculator.inspireambitions.com/jobs' },
    { '@type': 'ListItem', position: 3, name: occupation.title, item: `https://calculator.inspireambitions.com/jobs/${occupation.slug}` },
    ...(regionInfo ? [{ '@type': 'ListItem', position: 4, name: regionInfo.name, item: canonical }] : []),
  ] };

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/" className="font-bold text-gray-900">AI Job Risk Calculator</Link>
          <ThemeToggle />
        </div>
      </header>

      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
          <nav aria-label="Breadcrumb" className="mb-5 text-sm text-gray-500">
            <Link href="/jobs" className="hover:underline">Jobs</Link> / <span>{occupation.title}</span>{regionInfo && <> / <span>{regionInfo.name}</span></>}
          </nav>
          <p className="mb-3 text-sm font-semibold uppercase text-brand-600">{occupation.sector} · {occupation.isco}</p>
          <h1 className="max-w-3xl text-3xl font-bold text-gray-900 sm:text-4xl">{pageTitle}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-gray-600"><SourceText>{occupation.outlook}</SourceText></p>
          <div className="mt-8 flex flex-wrap items-end gap-6 border-y border-gray-200 py-6">
            <div><span className="block text-4xl font-bold tabular-nums text-gray-900">{score}/100</span><span className="text-sm text-gray-500">Sample task risk</span></div>
            <div><span className="block text-xl font-bold text-gray-900">{riskLabel(score)}</span><span className="text-sm text-gray-500">Based on the typical tasks below</span></div>
            <Link href={calculatorHref(occupation, region)} className="rounded-lg bg-brand-600 px-5 py-3 font-semibold text-white hover:bg-brand-700">Check your actual tasks</Link>
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-5xl px-4 py-10" aria-labelledby="task-heading">
        <h2 id="task-heading" className="text-2xl font-bold text-gray-900">How AI may change the work</h2>
        <p className="mt-2 max-w-3xl text-gray-600">A job is a mix of tasks. The title alone cannot show your personal risk.</p>
        <div className="mt-7 divide-y divide-gray-200 border-y border-gray-200">
          {occupation.tasks.map((task) => (
            <article key={task.order} className="grid gap-3 py-5 sm:grid-cols-[minmax(0,1fr)_120px] sm:items-start">
              <div><h3 className="font-bold text-gray-900">{task.task}</h3><p className="mt-2 leading-7 text-gray-600">{task.explanation}</p><p className="mt-2 text-sm text-gray-500">Expected horizon: {task.horizon}</p></div>
              <div><div className="mb-2 flex justify-between text-sm font-semibold"><span>Risk</span><span className="tabular-nums">{task.baseRisk}%</span></div><div className="h-2 overflow-hidden rounded-full bg-gray-200"><div className="h-full bg-brand-600" style={{ width: `${task.baseRisk}%` }} /></div></div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-gray-200 bg-white">
        <div className="mx-auto grid max-w-5xl gap-10 px-4 py-10 md:grid-cols-2">
          <div><h2 className="text-2xl font-bold text-gray-900">What the score means</h2><p className="mt-4 leading-7 text-gray-600"><SourceText>{occupation.riskInterpretation}</SourceText></p></div>
          <div><h2 className="text-2xl font-bold text-gray-900">Your protection plan</h2><p className="mt-4 leading-7 text-gray-600"><SourceText>{occupation.protectionPlan}</SourceText></p></div>
        </div>
      </section>

      {regionInfo && <section className="mx-auto max-w-5xl px-4 py-10"><h2 className="text-2xl font-bold text-gray-900">What this means in {regionInfo.name}</h2><p className="mt-4 max-w-3xl leading-7 text-gray-600"><SourceText>{occupation.regions[region]}</SourceText></p><p className="mt-5 text-sm text-gray-500">Regional guidance reflects published national strategies and the practical view of a Gulf HR Career Specialist.</p></section>}

      <section className="border-y border-gray-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-10"><h2 className="text-2xl font-bold text-gray-900">Questions people ask</h2><div className="mt-6 divide-y divide-gray-200">{occupation.faqs.map((faq) => <details key={faq.question} className="py-4"><summary className="cursor-pointer font-bold text-gray-900">{faq.question}</summary><p className="mt-3 max-w-3xl leading-7 text-gray-600"><SourceText>{faq.answer}</SourceText></p></details>)}</div></div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10">
        <h2 className="text-2xl font-bold text-gray-900">Explore related roles</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">{related.map((item) => <div key={item.slug} className="border-t border-gray-300 pt-4"><Link href={`/jobs/${item.slug}${region ? `/${region}` : ''}`} className="font-bold text-brand-600 hover:underline">{item.occupation.title}</Link><p className="mt-2 text-sm leading-6 text-gray-600">{item.reason}</p></div>)}</div>
        {!region && <div className="mt-8 flex flex-wrap gap-3"><Link href={`/jobs/${occupation.slug}/uae`} className="rounded-lg border border-gray-300 px-4 py-2 font-semibold">UAE outlook</Link><Link href={`/jobs/${occupation.slug}/saudi-arabia`} className="rounded-lg border border-gray-300 px-4 py-2 font-semibold">Saudi Arabia outlook</Link></div>}
      </section>

      <section className="border-y border-gray-200 bg-white"><div className="mx-auto max-w-5xl px-4 py-10"><h2 className="text-2xl font-bold text-gray-900">Sources and method</h2><ul className="mt-5 space-y-3 text-sm text-gray-600">{usedSources.map((source) => <li key={source.key}><a href={source.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-600 hover:underline">[{source.key}] {source.label}</a> <span>Accessed {source.accessed}.</span></li>)}</ul><p className="mt-6 text-sm text-gray-600">This page uses a reviewed task profile, not a generic job-title probability. <Link href="/methodology" className="font-semibold text-brand-600 hover:underline">Read the full methodology and limitations.</Link></p></div></section>

      <footer className="mx-auto max-w-5xl px-4 py-8 text-sm text-gray-500">Built by InspireAmbitions. AI replaces tasks, not jobs.</footer>
    </main>
  );
}
