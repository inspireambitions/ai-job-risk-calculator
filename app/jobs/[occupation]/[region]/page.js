import { notFound } from 'next/navigation';
import OccupationPage from '../../../../components/OccupationPage';
import { occupations, regions } from '../../../../lib/occupations';

export function generateStaticParams() { return occupations.flatMap((occupation) => Object.keys(regions).map((region) => ({ occupation: occupation.slug, region }))); }
export async function generateMetadata({ params }) { const { occupation: slug, region } = await params; const occupation = occupations.find((item) => item.slug === slug); const regionInfo = regions[region]; if (!occupation || !regionInfo) return {}; const url = `https://calculator.inspireambitions.com/jobs/${slug}/${region}`; return { title: `${occupation.title} AI Risk in ${regionInfo.name} | Task Guide`, description: `Task-level AI risk and protection guidance for ${occupation.title.toLowerCase()} careers in ${regionInfo.name}.`, alternates: { canonical: url }, openGraph: { title: `${occupation.title} AI Risk in ${regionInfo.name}`, description: `A practical task-level career guide for ${regionInfo.name}.`, url } }; }
export default async function Page({ params }) { const { occupation: slug, region } = await params; const occupation = occupations.find((item) => item.slug === slug); if (!occupation || !regions[region]) notFound(); return <OccupationPage occupation={occupation} region={region} />; }
