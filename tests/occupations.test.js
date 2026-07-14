import { describe, expect, it } from 'vitest';
import { occupationSources, occupations, regions } from '../lib/occupations';

const words = (occupation) => [
  occupation.outlook,
  occupation.riskInterpretation,
  occupation.protectionPlan,
  ...occupation.tasks.map((task) => `${task.task} ${task.explanation}`),
  ...occupation.faqs.flatMap((faq) => [faq.question, faq.answer]),
  ...Object.values(occupation.regions),
].join(' ').toLowerCase().match(/[a-z0-9]+/g) || [];

const jaccard = (left, right) => {
  const a = new Set(left);
  const b = new Set(right);
  const intersection = [...a].filter((word) => b.has(word)).length;
  return intersection / new Set([...a, ...b]).size;
};

describe('occupation launch gate', () => {
  it('ships the approved 60-role, 180-page tranche', () => {
    expect(occupations).toHaveLength(60);
    expect(occupations.length * (1 + Object.keys(regions).length)).toBe(180);
  });

  it('has no thin or incomplete occupation records', () => {
    for (const occupation of occupations) {
      expect(occupation.wordCount, occupation.slug).toBeGreaterThanOrEqual(900);
      expect(occupation.tasks.length, occupation.slug).toBeGreaterThanOrEqual(8);
      expect(occupation.faqs, occupation.slug).toHaveLength(4);
      expect(occupation.regions.uae, occupation.slug).toBeTruthy();
      expect(occupation.regions['saudi-arabia'], occupation.slug).toBeTruthy();
    }
  });

  it('keeps unverified ISCO mappings out of the public taxonomy', () => {
    expect(occupations.filter((occupation) => !occupation.iscoVerified)).toHaveLength(21);
  });

  it('keeps source numbering and task vocabularies consistent', () => {
    expect(occupationSources.S3.label).toBe('SDAIA, National Strategy for Data and AI');
    expect(occupationSources.S8.label).toBe('PwC, 2026 Global AI Jobs Barometer');
    expect(new Set(Object.values(occupationSources).map((source) => source.url)).size).toBe(14);

    const categories = new Set(['admin_processing', 'communication', 'compliance', 'customer_interaction', 'data_work', 'judgement', 'physical', 'supervision', 'technical']);
    const horizons = new Set(['0-2y', '2-5y', '5-10y', '10y+']);
    for (const occupation of occupations) {
      expect(occupation.regions['saudi-arabia'], occupation.slug).not.toMatch(/https?:\/\//);
      for (const task of occupation.tasks) {
        expect(categories.has(task.category), `${occupation.slug}: ${task.category}`).toBe(true);
        expect(horizons.has(task.horizon), `${occupation.slug}: ${task.horizon}`).toBe(true);
      }
    }
  });

  it('keeps editorial review markers out of public occupation content', () => {
    const publicPayload = JSON.stringify(occupations);
    expect(publicPayload).not.toMatch(/KIM REVIEW|kim_review_pending|\(verify\)|MACHINE-CHECK/i);
  });

  it('keeps enough live related occupation links on every page', () => {
    const slugs = new Set(occupations.map((occupation) => occupation.slug));
    for (const occupation of occupations) {
      const liveRelated = occupation.related.filter((item) => slugs.has(item.slug));
      expect(liveRelated.length, occupation.slug).toBeGreaterThanOrEqual(3);
      expect(liveRelated, occupation.slug).toHaveLength(occupation.related.length);
    }
  });

  it('keeps pairwise content similarity below the launch threshold', () => {
    let maximum = 0;
    for (let i = 0; i < occupations.length; i += 1) {
      for (let j = i + 1; j < occupations.length; j += 1) maximum = Math.max(maximum, jaccard(words(occupations[i]), words(occupations[j])));
    }
    expect(maximum).toBeLessThan(0.35);
  });
});
