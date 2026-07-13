import occupationData from '../data/occupations.json';

export const occupations = occupationData.occupations;
export const occupationSources = occupationData.sources;
export const regions = {
  uae: { name: 'UAE', country: 'UAE' },
  'saudi-arabia': { name: 'Saudi Arabia', country: 'Saudi Arabia' },
};

export function getOccupation(slug) {
  return occupations.find((occupation) => occupation.slug === slug);
}

export function averageRisk(occupation) {
  return Math.round(occupation.tasks.reduce((sum, task) => sum + task.baseRisk, 0) / occupation.tasks.length);
}

export function riskLabel(score) {
  if (score < 31) return 'Lower exposure';
  if (score < 56) return 'Moderate exposure';
  if (score < 76) return 'High exposure';
  return 'Very high exposure';
}

export function calculatorHref(occupation, region) {
  const params = new URLSearchParams({
    role: occupation.title,
    tasks: occupation.tasks.slice(0, 8).map((task) => task.task).join('|'),
  });
  if (region) params.set('country', regions[region].country);
  return `/?${params.toString()}`;
}
