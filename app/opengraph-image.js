import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'AI Job Risk Calculator - Will AI Take Your Job?';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a1628',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '200px',
            height: '200px',
            borderRadius: '100px',
            border: '8px solid #3b82f6',
            backgroundColor: '#0d1b2a',
            marginRight: '60px',
          }}
        >
          <span
            style={{
              fontSize: '72px',
              fontWeight: 800,
              color: '#ffffff',
            }}
          >
            47
          </span>
          <span
            style={{
              fontSize: '32px',
              fontWeight: 700,
              color: '#93c5fd',
              marginLeft: '2px',
            }}
          >
            %
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              fontSize: '52px',
              fontWeight: 800,
              color: '#60a5fa',
              lineHeight: 1.1,
            }}
          >
            AI Job Risk
          </div>
          <div
            style={{
              fontSize: '52px',
              fontWeight: 800,
              color: '#f97316',
              lineHeight: 1.1,
              marginBottom: '12px',
            }}
          >
            Calculator
          </div>
          <div
            style={{
              fontSize: '26px',
              fontWeight: 500,
              color: '#cbd5e1',
            }}
          >
            Will AI Take Your Job?
          </div>
          <div
            style={{
              fontSize: '16px',
              fontWeight: 400,
              color: '#64748b',
              marginTop: '12px',
            }}
          >
            InspireAmbitions.com
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
