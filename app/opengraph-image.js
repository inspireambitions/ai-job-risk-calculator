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
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a1628 0%, #0d2847 40%, #0f3060 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background grid pattern */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(100,180,255,0.08) 1px, transparent 0)',
            backgroundSize: '40px 40px',
            display: 'flex',
          }}
        />

        {/* Glow effect */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '25%',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
          }}
        />

        {/* Score Circle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '220px',
            height: '220px',
            borderRadius: '50%',
            border: '8px solid rgba(59,130,246,0.6)',
            background: 'rgba(10,22,40,0.8)',
            marginRight: '60px',
            position: 'relative',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                fontSize: '72px',
                fontWeight: 800,
                color: '#ffffff',
                lineHeight: 1,
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
        </div>

        {/* Text */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}
        >
          <div
            style={{
              fontSize: '52px',
              fontWeight: 800,
              color: '#60a5fa',
              lineHeight: 1.1,
              marginBottom: '4px',
              display: 'flex',
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
              marginBottom: '16px',
              display: 'flex',
            }}
          >
            Calculator
          </div>
          <div
            style={{
              fontSize: '26px',
              fontWeight: 500,
              color: '#cbd5e1',
              display: 'flex',
            }}
          >
            Will AI Take Your Job?
          </div>
          <div
            style={{
              fontSize: '16px',
              fontWeight: 400,
              color: '#64748b',
              marginTop: '16px',
              display: 'flex',
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
