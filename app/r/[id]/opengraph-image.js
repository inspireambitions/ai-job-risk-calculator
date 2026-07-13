import { ImageResponse } from 'next/og';
import { readSnapshot } from '../../../lib/result-snapshots';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const runtime = 'nodejs';

export default async function Image({ params }) {
  const { id } = await params;
  const result = await readSnapshot(id).catch(() => null);
  const data = result || { jobTitle: 'AI Job Risk Result', risk: 0, protection: 0, leverage: 0, year: 'Unknown', earliest: '', latest: '' };
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#faf9f6', color: '#1c1d1f', padding: 64 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 26 }}><span>InspireAmbitions</span><span>AI Job Risk Calculator</span></div>
      <div style={{ display: 'flex', flexDirection: 'column' }}><div style={{ fontSize: 58, fontWeight: 700 }}>{data.jobTitle}</div><div style={{ display: 'flex', gap: 54, marginTop: 46 }}>{[['Risk', data.risk], ['Protection', data.protection], ['Leverage', data.leverage]].map(([label, value]) => <div key={label} style={{ display: 'flex', flexDirection: 'column' }}><span style={{ fontSize: 22 }}>{label}</span><span style={{ fontSize: 66, fontWeight: 800 }}>{value}%</span></div>)}</div></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 25 }}><span>Horizon: ~{data.year} ({data.earliest}-{data.latest})</span><span>AI replaces tasks, not jobs.</span></div>
    </div>,
    size,
  );
}
