import Link from 'next/link';

export const metadata = { title: 'AI Job Risk Calculator Embed', robots: { index: false, follow: true } };

export default function EmbedPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-4 text-gray-900">
      <div className="mx-auto max-w-lg border border-gray-200 bg-white p-5">
        <h1 className="text-xl font-bold">AI Job Risk Calculator</h1>
        <p className="mt-2 text-sm text-gray-600">Score your real daily tasks, not only your job title.</p>
        <Link className="mt-5 block bg-brand-600 px-5 py-3 text-center font-semibold text-white" href="/" target="_blank">Check my job risk free</Link>
        <p className="mt-4 text-center text-xs text-gray-500">Powered by <a className="underline" href="https://inspireambitions.com" target="_blank" rel="noopener noreferrer">InspireAmbitions</a></p>
      </div>
    </main>
  );
}
