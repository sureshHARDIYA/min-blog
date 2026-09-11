import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  const portraitUrl = 'https://www.skmukhiya.com.np/suresh-portrait.png';

  return new ImageResponse(
    (
      <div
        style={{
          alignItems: 'center',
          background: 'linear-gradient(135deg, #0c0c0c 0%, #153d2b 100%)',
          color: '#f5f5f5',
          display: 'flex',
          height: '100%',
          justifyContent: 'space-between',
          padding: '72px 78px 72px 88px',
          position: 'relative',
          width: '100%',
        }}
      >
        <div
          style={{
            background: '#42d392',
            bottom: 0,
            display: 'flex',
            left: 0,
            position: 'absolute',
            top: 0,
            width: 18,
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', width: 660 }}>
          <div style={{ color: '#42d392', fontSize: 29, fontWeight: 700, letterSpacing: 2 }}>
            TECH LEAD · SOFTWARE ARCHITECT
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', fontSize: 72, fontWeight: 800, lineHeight: 1.12, marginTop: 35 }}>
            <span>Suresh Kumar</span>
            <span>Mukhiya, PhD</span>
          </div>
          <div style={{ color: '#d1d5db', display: 'flex', flexDirection: 'column', fontSize: 28, lineHeight: 1.55, marginTop: 30 }}>
            <span>Software architecture · Application security</span>
            <span>Cloud systems · AI · Engineering leadership</span>
          </div>
          <div style={{ color: '#42d392', fontSize: 25, fontWeight: 700, marginTop: 55 }}>
            skmukhiya.com.np
          </div>
        </div>
        <div
          style={{
            alignItems: 'center',
            border: '5px solid #42d392',
            borderRadius: '50%',
            display: 'flex',
            height: 460,
            justifyContent: 'center',
            overflow: 'hidden',
            width: 460,
          }}
        >
          <img
            alt="Suresh Kumar Mukhiya"
            height="448"
            src={portraitUrl}
            style={{ objectFit: 'cover' }}
            width="448"
          />
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    },
  );
}
