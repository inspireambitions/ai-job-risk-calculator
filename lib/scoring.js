export const LIBRARY_VERSION = '2026.07.1';

const TASK_RULES = [
  { pattern: /data entry|transcrib|copy|filing|schedule|calendar|invoice|reconcil|bookkeep|payroll|report generat|format document/i, risk: 86, category: 'routine_information', addressability: 1, prescription: 'Use an AI assistant for the first draft, then own exception checks, judgement and the final record.' },
  { pattern: /analyse|analysis|forecast|research|dashboard|financial model|risk assess|audit/i, risk: 68, category: 'analysis', addressability: 1, prescription: 'Automate repeatable analysis, then strengthen source checking, scenario judgement and the recommendation you present.' },
  { pattern: /write|draft|content|translate|email|presentation|marketing copy/i, risk: 72, category: 'content', addressability: 1, prescription: 'Use AI for drafts, then build value through original evidence, audience judgement and accountable editing.' },
  { pattern: /interview|coach|counsel|negotiate|mediate|advise|stakeholder|relationship|patient|guest|customer complaint/i, risk: 27, category: 'human_trust', addressability: 0.5, prescription: 'Document the judgement, trust and conflict-resolution decisions that make this work hard to automate.' },
  { pattern: /repair|install|inspect site|operate machinery|cook|clean|drive|deliver|lift|warehouse|construction|clinical procedure/i, risk: 31, category: 'physical_presence', addressability: 0.5, prescription: 'Add digital planning and diagnostic skills while keeping responsibility for safe physical execution.' },
  { pattern: /lead|manage team|strategy|approve|sign off|governance|regulat|legal judgement|safety decision/i, risk: 24, category: 'accountable_judgement', addressability: 0.5, prescription: 'Use AI for options and monitoring, but make your accountable judgement and governance evidence visible.' },
  { pattern: /design|create concept|innovate|creative direction|brand strategy/i, risk: 44, category: 'creative_origination', addressability: 1, prescription: 'Use AI to widen options, then own the brief, selection logic, cultural fit and final creative direction.' },
];

const REGION_MULTIPLIERS = { UAE: 1.03, 'Saudi Arabia': 1.02, Qatar: 1, Bahrain: 1, Kuwait: 0.98, Oman: 0.96 };
const EXPERIENCE_MULTIPLIERS = { '0-2': 1.1, '3-5': 1, '6-10': 0.92, '11-15': 0.85, '16+': 0.8 };

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const roundHalfAway = (value) => Math.sign(value) * Math.floor(Math.abs(value) + 0.5);

export function classifyTask(task) {
  const match = TASK_RULES.find((rule) => rule.pattern.test(task));
  return match ? { ...match, estimated: false } : { risk: 50, category: 'unmatched', addressability: 0.5, prescription: 'Break this task into repeatable and judgement-heavy steps before deciding where AI can help.', estimated: true };
}

export function computeDeterministicScores(input, currentYear = new Date().getFullYear()) {
  const tasks = input.tasks.map((task) => ({ task, ...classifyTask(task) }));
  const weight = 1 / tasks.length;
  const rawRisk = tasks.reduce((sum, task) => sum + weight * task.risk, 0);
  const region = REGION_MULTIPLIERS[input.country] ?? 1;
  const experience = EXPERIENCE_MULTIPLIERS[input.experience] ?? 1;
  const environmentText = String(input.workEnvironment || '').toLowerCase();
  const environment = /field|healthcare|factory|warehouse|retail|customer/.test(environmentText) ? 0.9 : /office|remote/.test(environmentText) ? 1.05 : 1;
  const overallRiskScore = clamp(roundHalfAway(rawRisk * region * experience * environment), 2, 97);
  const protectionBonus = tasks.some((task) => ['human_trust', 'physical_presence', 'accountable_judgement'].includes(task.category)) ? 10 : 0;
  const protectionScore = clamp(roundHalfAway(100 - rawRisk + protectionBonus), 3, 98);
  const denominator = Math.max(tasks.reduce((sum, task) => sum + weight * task.risk, 0), 1);
  const leverageScore = clamp(roundHalfAway(tasks.reduce((sum, task) => sum + weight * task.risk * task.addressability, 0) / denominator * 100), 0, 100);
  const horizon = overallRiskScore >= 80 ? 3 : overallRiskScore >= 65 ? 5 : overallRiskScore >= 45 ? 8 : overallRiskScore >= 25 ? 12 : 15;
  const displacementYear = currentYear + horizon;
  const displacementRange = overallRiskScore < 25 ? null : { earliest: displacementYear - Math.max(2, roundHalfAway(horizon * 0.25)), latest: displacementYear + Math.max(3, roundHalfAway(horizon * 0.4)) };
  const riskLevel = overallRiskScore <= 30 ? 'LOW' : overallRiskScore <= 55 ? 'MEDIUM' : overallRiskScore <= 75 ? 'HIGH' : 'VERY HIGH';
  return { libraryVersion: LIBRARY_VERSION, overallRiskScore, protectionScore, leverageScore, riskLevel, displacementYear, displacementRange, confidence: tasks.some((task) => task.estimated) ? 'estimated' : 'library', tasks };
}

export function applyDeterministicScores(analysis, input) {
  const scores = computeDeterministicScores(input);
  const byTask = new Map(scores.tasks.map((task) => [task.task.toLowerCase(), task]));
  return {
    ...analysis,
    ...scores,
    taskAnalysis: analysis.taskAnalysis.map((item) => {
      const scored = byTask.get(item.task.toLowerCase()) || classifyTask(item.task);
      return { ...item, riskScore: scored.risk, protectionPlan: scored.prescription, scoreEstimated: scored.estimated };
    }),
  };
}
