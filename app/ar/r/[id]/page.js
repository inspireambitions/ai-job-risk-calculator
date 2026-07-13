import Link from 'next/link';
import { notFound } from 'next/navigation';
import { readSnapshot } from '../../../../lib/result-snapshots';

export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false, follow: true } };

export default async function ArabicSharedResultPage({ params }) {
  const { id } = await params;
  const result = await readSnapshot(id).catch(() => null);
  if (!result) notFound();
  return (
    <main lang="ar" dir="rtl" className="min-h-screen bg-gray-50 px-4 py-10 text-gray-900">
      <article className="mx-auto max-w-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold text-brand-700">نتيجة مجهولة الهوية</p>
        <h1 className="mt-2 text-3xl font-bold"><bdi>{result.jobTitle}</bdi></h1>
        <div className="mt-8 grid grid-cols-3 gap-3 text-center">
          {[['مخاطر الاستبدال', result.risk], ['الحماية', result.protection], ['الاستفادة', result.leverage]].map(([label, value]) => <div key={label} className="border border-gray-200 p-3"><p className="text-xs text-gray-500">{label}</p><p dir="ltr" className="mt-1 text-2xl font-bold">{value}%</p></div>)}
        </div>
        <p className="mt-6 text-center text-lg font-semibold" dir="ltr">~{result.year} ({result.earliest}-{result.latest})</p>
        <p className="mt-2 text-center text-sm text-gray-500">هذا نطاق للتخطيط وليس تاريخاً مؤكداً.</p>
        <Link className="mt-8 block bg-brand-600 px-5 py-3 text-center font-semibold text-white" href="/">افحص مهامك مجاناً</Link>
        <p className="mt-5 text-center text-xs text-gray-500">تنتهي صلاحية هذه النتيجة تلقائياً. لا تحتوي على بريد إلكتروني أو نص المهام.</p>
      </article>
    </main>
  );
}
