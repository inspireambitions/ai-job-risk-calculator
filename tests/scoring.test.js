import { describe, expect, it } from 'vitest';
import { classifyTask, computeDeterministicScores } from '../lib/scoring';

const base = { tasks: ['Enter invoice data'], country: '', experience: '', workEnvironment: '' };

describe('deterministic scoring', () => {
  it('returns identical output for identical input', () => expect(computeDeterministicScores(base, 2026)).toEqual(computeDeterministicScores(base, 2026)));
  it('clamps certainty below 100', () => expect(computeDeterministicScores({ ...base, country: 'UAE', experience: '0-2', workEnvironment: 'Office-based' }, 2026).overallRiskScore).toBeLessThanOrEqual(97));
  it('uses a 50-point estimate for unmatched free text', () => expect(classifyTask('Coordinate the unusual blue folder ritual')).toMatchObject({ risk: 50, estimated: true }));
  it('renormalises equal task weights', () => expect(computeDeterministicScores({ ...base, tasks: ['Enter invoice data', 'Coach team members'] }, 2026).overallRiskScore).toBeGreaterThan(2));
  it('suppresses a fake near-term range for low risk', () => expect(computeDeterministicScores({ ...base, tasks: ['Lead regulated safety decisions'] }, 2026).displacementRange).toBeNull());
});
