import { computeDeterministicScores, LIBRARY_VERSION } from '../../../lib/scoring';

export const dynamic = 'force-dynamic';

export async function GET() {
  const sample = computeDeterministicScores({
    tasks: ['Analyse monthly performance reports', 'Coach team members'],
    country: 'UAE',
    experience: '6-10',
    workEnvironment: 'Office',
  }, 2026);

  const healthy = Number.isFinite(sample.overallRiskScore)
    && Number.isFinite(sample.protectionScore)
    && Number.isFinite(sample.leverageScore);

  return Response.json({
    status: healthy ? 'ok' : 'degraded',
    scoring: healthy,
    libraryVersion: LIBRARY_VERSION,
  }, {
    status: healthy ? 200 : 503,
    headers: { 'Cache-Control': 'no-store' },
  });
}
