import { afterEach, describe, expect, it } from 'vitest';
import { runAnalysis } from '../app/api/analyze/route';

const validToolResponse = {
  content: [{
    type: 'tool_use',
    name: 'submit_job_risk_analysis',
    input: {
      overallRiskScore: 40,
      protectionScore: 70,
      riskLevel: 'MEDIUM',
      displacementYear: 2032,
      displacementRange: { earliest: 2030, latest: 2035 },
      summary: 'A cautious summary.',
      taskAnalysis: [{ task: 'Interview candidates', riskScore: 25, timeframe: '5-10 years', reasoning: 'Human judgement remains important.', automationBarriers: ['Trust'] }],
      timeline: { immediateRisk: 'Administrative support', mediumTermRisk: 'Drafting support', longTermRisk: 'Decision support' },
      skillsToBuilt: ['AI-assisted recruiting'],
      careerPivots: [{ role: 'People Partner', reason: 'Strong transferability', transferability: 'HIGH' }],
      keyInsight: 'Use AI for preparation, not final judgement.',
      researchContext: [{ source: 'World Economic Forum, 2025', finding: 'Skills are changing across many roles.' }],
    },
  }],
};

const input = { jobTitle: 'HR Manager', tasks: ['Interview candidates'], industry: '', experience: '', workEnvironment: '', country: 'UAE' };

afterEach(() => {
  delete process.env.ANTHROPIC_PRIMARY_MODEL;
  delete process.env.ANTHROPIC_FALLBACK_MODELS;
});

describe('model routing', () => {
  it('moves immediately to the fallback after a non-retryable model error', async () => {
    process.env.ANTHROPIC_PRIMARY_MODEL = 'retired-model';
    process.env.ANTHROPIC_FALLBACK_MODELS = 'working-model';
    const calls = [];
    const client = { messages: { create: async ({ model }) => {
      calls.push(model);
      if (model === 'retired-model') throw Object.assign(new Error('not found'), { status: 404 });
      return validToolResponse;
    } } };

    const result = await runAnalysis(input, client);
    expect(calls).toEqual(['retired-model', 'working-model']);
    expect(result.model).toBe('working-model');
    expect(result.analysis.overallRiskScore).toBe(40);
  });

  it('retries a transient error once before succeeding', async () => {
    process.env.ANTHROPIC_PRIMARY_MODEL = 'working-model';
    let calls = 0;
    const client = { messages: { create: async () => {
      calls += 1;
      if (calls === 1) throw Object.assign(new Error('busy'), { status: 503 });
      return validToolResponse;
    } } };

    const result = await runAnalysis(input, client);
    expect(calls).toBe(2);
    expect(result.analysis.protectionScore).toBe(70);
  });
});
