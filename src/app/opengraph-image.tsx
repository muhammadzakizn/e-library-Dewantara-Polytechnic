import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'E-Library Politeknik Dewantara';
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
    // Define the knowledge emojis for the background pattern
    const emojis = ['📚', '📖', '✏️', '🎓', '💡', '🏫', '📝', '🔬', '🧠', '💻'];

    // Increase density for full background coverage
    const patternElements = [];
    for (let i = 0; i < 200; i++) {
        patternElements.push(emojis[i % emojis.length]);
    }

    // Use the live domain for the logo
    const logoUrl = 'https://e-library.muhammadzakizn.com/logo-poltek.png';

    return new ImageResponse(
        (
            <div
                style={{
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'sans-serif',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Background Emoji Pattern - Full Coverage & Dense */}
                <div
                    style={{
                        position: 'absolute',
                        inset: -100, // Negative inset to cover edges during rotation
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        alignContent: 'center',
                        gap: '30px',
                        opacity: 0.12, // Slightly increased opacity for visibility "penuh di latar belakang"
                        transform: 'rotate(-12deg)',
                    }}
                >
                    {patternElements.map((emoji, i) => (
                        <div key={i} style={{ fontSize: '50px', width: '90px', textAlign: 'center' }}>
                            {emoji}
                        </div>
                    ))}
                </div>

                {/* Glass Container - Smaller Size */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(12px)',
                        borderRadius: '24px', // Reduced radius
                        padding: '40px 80px', // Reduced padding (was 60px 100px)
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        zIndex: 10,
                        marginTop: '-20px', // Slight visual centering adjustment considering the footer
                    }}
                >
                    {/* Logo Container - Smaller */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '110px', // Reduced from 140px
                            height: '110px',
                            backgroundColor: 'white',
                            borderRadius: '24px',
                            marginBottom: '24px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                            padding: '12px',
                        }}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={logoUrl}
                            alt="Logo"
                            width="86"
                            height="86"
                            style={{ objectFit: 'contain' }}
                        />
                    </div>

                    <h1
                        style={{
                            fontSize: '56px', // Reduced from 64px
                            fontWeight: 900,
                            color: 'white',
                            margin: '0 0 12px 0',
                            textAlign: 'center',
                            letterSpacing: '-0.02em',
                            textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                        }}
                    >
                        E-Library
                    </h1>
                    <p
                        style={{
                            fontSize: '28px', // Reduced from 32px
                            color: '#dbeafe',
                            margin: 0,
                            textAlign: 'center',
                            fontWeight: 500,
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                        }}
                    >
                        Politeknik Dewantara
                    </p>
                </div>

                {/* Footer Pill - Lowered & Spaced */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: '30px', // Moved down from 50px to 30px ("di bawahin dikit")
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        backgroundColor: 'rgba(0, 0, 0, 0.4)',
                        padding: '10px 24px',
                        borderRadius: '100px',
                        backdropFilter: 'blur(4px)',
                        zIndex: 10,
                    }}
                >
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#4ade80', boxShadow: '0 0 10px #4ade80' }} />
                    <span style={{ color: 'white', fontSize: '15px', fontWeight: 600 }}>Akses Koleksi Digital Online</span>
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
