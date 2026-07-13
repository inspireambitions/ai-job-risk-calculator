import { occupations, regions } from '../lib/occupations';

export default function sitemap() {
  const occupationPages = occupations.flatMap((occupation) => [
    { url: `https://calculator.inspireambitions.com/jobs/${occupation.slug}`, lastModified: new Date('2026-07-13'), changeFrequency: 'quarterly', priority: 0.8 },
    ...Object.keys(regions).map((region) => ({ url: `https://calculator.inspireambitions.com/jobs/${occupation.slug}/${region}`, lastModified: new Date('2026-07-13'), changeFrequency: 'quarterly', priority: 0.7 })),
  ]);
  return [
    {
      url: 'https://calculator.inspireambitions.com',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: 'https://calculator.inspireambitions.com/methodology',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://calculator.inspireambitions.com/widget',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: 'https://calculator.inspireambitions.com/compare',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: 'https://calculator.inspireambitions.com/jobs',
      lastModified: new Date('2026-07-13'),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    ...occupationPages,
  ];
}
