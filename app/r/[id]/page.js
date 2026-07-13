import Link from 'next/link';
import { notFound } from 'next/navigation';
import { readSnapshot } from '../../../lib/result-snapshots';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const result = await readSnapshot(id).catch(() => null);
  if (!result) return { title: 'Expired AI Job Risk result', robots: { index: false, follow: true } };
  return {
    title: `${result.jobTitle}: ${result.risk}% AI Job Risk`,
    description: `Anonymous AI Job Risk result with ${result.protection}% protection and ${result.leverage}% leverage.`,
    robots: { index: false, follow: true },
    openGraph: { images: [`/r/${id}/opengraph-image`] },
  };
}

export default async function SharedResultPage({ params }) {
  const { id } = await params;
  const result = await readSnapshot(id).catch(() => null);
  if (!result) notFound();
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 text-gray-900">
      <article className="mx-auto max-w-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold text-brand-700">Anonymous result</p>
        <h1 className="mt-2 text-3xl font-bold">{result.jobTitle}</h1>
        {result.country && <p className="mt-1 text-gray-500">{result.country}</p>}
        <div className="mt-8 grid grid-cols-3 gap-3 text-center">
          {[['Risk', result.risk], ['Protection', result.protection], ['Leverage', result.leverage]].map(([label, value]) => (
            <div key={label} className="border border-gray-200 p-3"><p className="text-xs text-gray-500">{label}</p><p className="mt-1 text-2xl font-bold">{value}%</p></div>
          ))}
        </div>
        <p className="mt-6 text-center text-lg font-semibold">Horizon: ~{result.year} ({result.earliest}-{result.latest})</p>
        <p className="mt-2 text-center text-sm text-gray-500">A planning range, not a promised date.</p>
        <Link className="mt-8 block bg-brand-600 px-5 py-3 text-center font-semibold text-white" href="/">Check your own tasks free</Link>
        <p className="mt-5 text-center text-xs text-gray-500">This snapshot expires automatically. It contains no email address or task text.</p>
      </article>
    </main>
  );
}
