export const metadata = {
  title: 'Free AI Job Risk Calculator Widget',
  description: 'Embed the InspireAmbitions AI Job Risk Calculator on a careers, university or coaching website.',
  alternates: { canonical: 'https://calculator.inspireambitions.com/widget' },
};

export default function WidgetPage() {
  const snippet = '<iframe src="https://calculator.inspireambitions.com/embed" title="AI Job Risk Calculator" width="100%" height="340" loading="lazy" style="border:0"></iframe>';
  return <main className="min-h-screen bg-gray-50 px-4 py-12 text-gray-900"><div className="mx-auto max-w-3xl"><h1 className="text-3xl font-bold">Embed the free AI Job Risk Calculator</h1><p className="mt-4 text-gray-600">Add this compact tool to a careers, university or coaching website. The widget links to the full task-level calculator.</p><h2 className="mt-8 text-xl font-bold">Embed code</h2><pre className="mt-3 overflow-x-auto border border-gray-200 bg-white p-4 text-sm"><code>{snippet}</code></pre><div className="mt-8"><iframe src="/embed" title="AI Job Risk Calculator preview" className="h-[340px] w-full border border-gray-200" /></div></div></main>;
}
