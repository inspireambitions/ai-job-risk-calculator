import { notFound } from 'next/navigation';
import OccupationPage from '../../../components/OccupationPage';
import { occupations } from '../../../lib/occupations';

export function generateStaticParams() { return occupations.map((occupation) => ({ occupation: occupation.slug })); }
export async function generateMetadata({ params }) { const { occupation: slug } = await params; const occupation = occupations.find((item) => item.slug === slug); if (!occupation) return {}; return { title: `Will AI Replace ${occupation.title}s? Task Risk Guide`, description: `See which ${occupation.title.toLowerCase()} tasks AI may change, the protected skills to build and a practical career plan.`, alternates: { canonical: `https://calculator.inspireambitions.com/jobs/${slug}` }, openGraph: { title: `Will AI Replace ${occupation.title}s?`, description: `A task-level AI risk guide for ${occupation.title.toLowerCase()} work.`, url: `https://calculator.inspireambitions.com/jobs/${slug}` } }; }
export default async function Page({ params }) { const { occupation: slug } = await params; const occupation = occupations.find((item) => item.slug === slug); if (!occupation) notFound(); return <OccupationPage occupation={occupation} />; }
