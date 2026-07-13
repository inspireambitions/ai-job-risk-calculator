import { describe, expect, it } from 'vitest';
import { sanitiseSnapshot } from '../lib/result-snapshots';

describe('anonymous result snapshots', () => {
  it('keeps only the public score fields', () => {
    const result = sanitiseSnapshot({ jobTitle: 'HR Manager', email: 'private@example.com', tasks: ['Private task'], overallRiskScore: 54, protectionScore: 61, leverageScore: 72, displacementYear: 2032, displacementRange: { earliest: 2029, latest: 2036 }, riskLevel: 'MEDIUM' });
    expect(result).not.toHaveProperty('email');
    expect(result).not.toHaveProperty('tasks');
    expect(result.risk).toBe(54);
  });
});
