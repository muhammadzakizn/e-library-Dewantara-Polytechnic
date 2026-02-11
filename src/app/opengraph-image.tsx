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

    // Generate a pattern of emojis
    // We'll create a simple grid or scattered look using standard CSS/Flex since SVG patterns can be tricky in Satori (ImageResponse engine)
    const patternElements = [];
    for (let i = 0; i < 80; i++) {
        patternElements.push(emojis[i % emojis.length]);
    }

    // Use the live domain for the logo to ensure accessibility in the Edge runtime
    // Fallback to a placeholder if it fails to load (though in production/preview it should work)
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
                {/* Background Emoji Pattern */}
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                        alignContent: 'space-between',
                        gap: '20px',
                        padding: '20px',
                        opacity: 0.1,
                        transform: 'scale(1.1) rotate(-5deg)',
                    }}
                >
                    {patternElements.map((emoji, i) => (
                        <div key={i} style={{ fontSize: '40px', width: '60px', textAlign: 'center' }}>
                            {emoji}
                        </div>
                    ))}
                </div>

                {/* Glass Container */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(12px)',
                        borderRadius: '32px',
                        padding: '60px 100px',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        zIndex: 10,
                    }}
                >
                    {/* Logo */}
                    {/* We use a white container for the logo to ensure it pops against any background */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '140px',
                            height: '140px',
                            backgroundColor: 'white',
                            borderRadius: '30px',
                            marginBottom: '32px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                            padding: '15px',
                        }}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={logoUrl}
                            alt="Logo"
                            width="110"
                            height="110"
                            style={{ objectFit: 'contain' }}
                        />
                    </div>

                    <h1
                        style={{
                            fontSize: '64px',
                            fontWeight: 900,
                            color: 'white',
                            margin: '0 0 16px 0',
                            textAlign: 'center',
                            letterSpacing: '-0.02em',
                            textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                        }}
                    >
                        E-Library
                    </h1>
                    <p
                        style={{
                            fontSize: '32px',
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

                {/* Footer Pill */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: '50px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        padding: '12px 24px',
                        borderRadius: '100px',
                        backdropFilter: 'blur(4px)',
                        zIndex: 10,
                    }}
                >
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#4ade80', boxShadow: '0 0 10px #4ade80' }} />
                    <span style={{ color: 'white', fontSize: '18px', fontWeight: 600 }}>Akses Koleksi Digital Online</span>
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
