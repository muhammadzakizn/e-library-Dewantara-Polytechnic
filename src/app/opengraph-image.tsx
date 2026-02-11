import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'E-Library Politeknik Dewantara';
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
    // Font loader could be added here if needed, but system fonts often suffice for simple cards.
    // We'll use a clean, gradient background with the logo and title.

    // Since we can't easily load local images in edge function without fetch or base64, 
    // we'll try to use a fetch if the logo is hosted, or use a purely CSS/SVG approach
    // or a public URL if available. 
    // Given the constraints and local dev environment, a robust CSS design is safer 
    // than relying on local file fetching in edge functions which can be tricky without proper setup.
    // HOWEVER, for a brand logo, we really want the actual image.
    // Let's assume the production URL or a public placeholder for now, or just styled text if image fails.
    // Better yet, we can embed the logo if we can read it, but `fs` doesn't work in Edge.
    // A safe bet for a "Preview" without external dependencies is a high-quality CSS composition.
    // Let's try to construct a nice card.

    return new ImageResponse(
        (
            <div
                style={{
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'sans-serif',
                    position: 'relative',
                }}
            >
                {/* Background Pattern */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: 'radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.1) 2%, transparent 0%)',
                        backgroundSize: '50px 50px',
                    }}
                />

                {/* Content Container */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '24px',
                        padding: '40px 80px',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
                    }}
                >
                    {/* Logo Placeholder / Icon */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100px',
                            height: '100px',
                            backgroundColor: 'white',
                            borderRadius: '24px',
                            marginBottom: '24px',
                            boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                            fontSize: '48px',
                        }}
                    >
                        📚
                    </div>

                    <h1
                        style={{
                            fontSize: '60px',
                            fontWeight: 800,
                            color: 'white',
                            margin: '0 0 10px 0',
                            textAlign: 'center',
                            textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        }}
                    >
                        E-Library
                    </h1>
                    <p
                        style={{
                            fontSize: '30px',
                            color: '#bfdbfe',
                            margin: 0,
                            textAlign: 'center',
                            fontWeight: 500,
                        }}
                    >
                        Politeknik Dewantara
                    </p>
                </div>

                {/* Footer Badge */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                        padding: '10px 20px',
                        borderRadius: '50px',
                    }}
                >
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
                    <span style={{ color: 'white', fontSize: '16px', fontWeight: 500 }}>Akes Koleksi Digital Online</span>
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
