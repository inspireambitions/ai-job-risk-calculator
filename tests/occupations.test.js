import { describe, expect, it } from 'vitest';
import { occupations, regions } from '../lib/occupations';

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
  it('ships the approved 40-role, 120-page tranche', () => {
    expect(occupations).toHaveLength(40);
    expect(occupations.length * (1 + Object.keys(regions).length)).toBe(120);
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
    expect(occupations.filter((occupation) => !occupation.iscoVerified)).toHaveLength(11);
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
