'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Home, RotateCcw, BookOpen, Trophy, Heart, Sparkles } from 'lucide-react';

// Falling book item
interface FallingBook {
    id: number;
    x: number;
    y: number;
    speed: number;
    emoji: string;
    rotation: number;
    rotSpeed: number;
}

// Floating particle for background
interface Particle {
    id: number;
    x: number;
    y: number;
    size: number;
    opacity: number;
    speed: number;
    char: string;
}

export default function NotFound() {
    const [gameStarted, setGameStarted] = useState(false);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [highScore, setHighScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [basketX, setBasketX] = useState(50);
    const [books, setBooks] = useState<FallingBook[]>([]);
    const [particles, setParticles] = useState<Particle[]>([]);
    const [catchFlash, setCatchFlash] = useState<{ x: number; y: number } | null>(null);
    const [countdown, setCountdown] = useState<number | null>(null);
    const gameAreaRef = useRef<HTMLDivElement>(null);
    const animFrameRef = useRef<number>(0);
    const lastSpawnRef = useRef(0);
    const gameLoopRef = useRef<boolean>(false);
    const booksRef = useRef<FallingBook[]>([]);
    const livesRef = useRef(3);
    const scoreRef = useRef(0);

    const basketXRef = useRef(50);
    const [showGame, setShowGame] = useState(false);

    const bookEmojis = ['📕', '📗', '📘', '📙', '📓', '📔', '📒', '📖', '📚', '🎓'];
    const badEmojis = ['💣', '🕷️', '👻'];

    // Background particles
    useEffect(() => {
        const chars = ['📖', '✨', '📝', '🔖', '📑', '✦', '◆', '○'];
        const pts: Particle[] = Array.from({ length: 20 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 16 + 8,
            opacity: Math.random() * 0.15 + 0.05,
            speed: Math.random() * 0.3 + 0.1,
            char: chars[Math.floor(Math.random() * chars.length)],
        }));
        setParticles(pts);
    }, []);

    // Animate background particles
    useEffect(() => {
        const interval = setInterval(() => {
            setParticles(prev => prev.map(p => ({
                ...p,
                y: (p.y - p.speed + 100) % 100,
                x: p.x + Math.sin(Date.now() / 3000 + p.id) * 0.1,
            })));
        }, 50);
        return () => clearInterval(interval);
    }, []);

    // Load high score
    useEffect(() => {
        const saved = localStorage.getItem('404_book_catch_highscore');
        if (saved) setHighScore(parseInt(saved));
    }, []);

    const startGame = useCallback(() => {
        setCountdown(3);
        setScore(0);
        setLives(3);
        setGameOver(false);
        setBooks([]);
        scoreRef.current = 0;
        livesRef.current = 3;
        booksRef.current = [];

        // Countdown
        let c = 3;
        const cdInterval = setInterval(() => {
            c--;
            if (c > 0) {
                setCountdown(c);
            } else {
                setCountdown(null);
                setGameStarted(true);
                gameLoopRef.current = true;
                lastSpawnRef.current = Date.now();
                clearInterval(cdInterval);
                requestAnimationFrame(gameLoop);
            }
        }, 700);
    }, []);

    const gameLoop = useCallback(() => {
        if (!gameLoopRef.current) return;

        const now = Date.now();
        const spawnInterval = Math.max(500, 1500 - scoreRef.current * 20);

        // Spawn new books
        if (now - lastSpawnRef.current > spawnInterval) {
            const isBad = Math.random() < 0.15;
            const newBook: FallingBook = {
                id: now + Math.random(),
                x: Math.random() * 80 + 10,
                y: -5,
                speed: Math.random() * 0.4 + 0.3 + scoreRef.current * 0.015,
                emoji: isBad ? badEmojis[Math.floor(Math.random() * badEmojis.length)] : bookEmojis[Math.floor(Math.random() * bookEmojis.length)],
                rotation: Math.random() * 360,
                rotSpeed: (Math.random() - 0.5) * 4,
            };
            booksRef.current = [...booksRef.current, newBook];
            lastSpawnRef.current = now;
        }

        // Update book positions
        let newLives = livesRef.current;
        let newScore = scoreRef.current;
        const bx = basketXRef.current;

        const updatedBooks = booksRef.current
            .map(b => ({
                ...b,
                y: b.y + b.speed,
                rotation: b.rotation + b.rotSpeed,
            }))
            .filter(b => {
                // Check if caught
                if (b.y >= 82 && b.y <= 92 && Math.abs(b.x - bx) < 10) {
                    const isBad = badEmojis.includes(b.emoji);
                    if (isBad) {
                        newLives--;
                    } else {
                        newScore++;
                        setCatchFlash({ x: b.x, y: b.y });
                        setTimeout(() => setCatchFlash(null), 300);
                    }
                    return false;
                }
                // Check if missed (fell off screen)
                if (b.y > 105) {
                    const isBad = badEmojis.includes(b.emoji);
                    if (!isBad) newLives--; // Only lose life for missing good books
                    return false;
                }
                return true;
            });

        booksRef.current = updatedBooks;
        livesRef.current = newLives;
        scoreRef.current = newScore;

        setBooks([...updatedBooks]);
        setLives(newLives);
        setScore(newScore);

        if (newLives <= 0) {
            gameLoopRef.current = false;
            setGameOver(true);
            setGameStarted(false);
            if (newScore > highScore) {
                setHighScore(newScore);
                localStorage.setItem('404_book_catch_highscore', newScore.toString());
            }
            return;
        }

        animFrameRef.current = requestAnimationFrame(gameLoop);
    }, [highScore]);

    // Mouse / touch movement
    const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        if (!gameAreaRef.current || !gameLoopRef.current) return;
        const rect = gameAreaRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const clampedX = Math.max(5, Math.min(95, x));
        basketXRef.current = clampedX;
        setBasketX(clampedX);
    }, []);

    // Cleanup
    useEffect(() => {
        return () => {
            gameLoopRef.current = false;
            cancelAnimationFrame(animFrameRef.current);
        };
    }, []);

    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-primary-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
            {/* Floating background particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {particles.map(p => (
                    <span
                        key={p.id}
                        className="absolute select-none transition-transform duration-1000 ease-linear"
                        style={{
                            left: `${p.x}%`,
                            top: `${p.y}%`,
                            fontSize: `${p.size}px`,
                            opacity: p.opacity,
                            transform: `rotate(${p.id * 30}deg)`,
                        }}
                    >
                        {p.char}
                    </span>
                ))}
            </div>

            {/* Main content */}
            <div className="relative z-10 w-full min-h-screen flex flex-col items-center justify-center overflow-hidden">

                {/* 404 Content Layer - Explodes outward */}
                <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)] ${showGame ? 'pointer-events-none' : 'z-20'}`}>

                    {/* The Big 404 */}
                    <div className="relative group cursor-pointer mb-12" onClick={() => setShowGame(true)}>
                        <div className="flex items-center justify-center text-[150px] md:text-[240px] font-black leading-none tracking-tighter select-none">
                            {/* Left 4 */}
                            <span className={`transform transition-all duration-1000 ease-in-out bg-gradient-to-br from-gray-300 to-gray-500 dark:from-gray-700 dark:to-gray-500 bg-clip-text text-transparent ${showGame ? '-translate-x-[100vw] -translate-y-[100vh] rotate-[-45deg] opacity-0 scale-50' : 'translate-0'}`}>
                                4
                            </span>

                            {/* Center 0 (Trigger) */}
                            <div className={`relative mx-2 md:mx-6 transform transition-all duration-700 ease-out z-10 ${showGame ? 'scale-[5] opacity-0 rotate-[180deg] blur-xl' : 'scale-100 group-hover:scale-110'}`}>
                                <span className="inline-block bg-gradient-to-br from-primary-500 to-blue-600 bg-clip-text text-transparent animate-bounce drop-shadow-2xl">0</span>
                                {/* Hover Play Icon */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-white/20">
                                        <div className="w-0 h-0 border-t-[20px] border-t-transparent border-l-[35px] border-l-white border-b-[20px] border-b-transparent ml-2"></div>
                                    </div>
                                </div>
                                <div className="absolute inset-0 bg-primary-500/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
                            </div>

                            {/* Right 4 */}
                            <span className={`transform transition-all duration-1000 ease-in-out bg-gradient-to-br from-gray-300 to-gray-500 dark:from-gray-700 dark:to-gray-500 bg-clip-text text-transparent ${showGame ? 'translate-x-[100vw] -translate-y-[100vh] rotate-[45deg] opacity-0 scale-50' : 'translate-0'}`}>
                                4
                            </span>
                        </div>

                        {/* Detaching Frame/Shockwave Effect */}
                        <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] border-4 border-primary-500/50 rounded-full transition-all duration-700 ease-out pointer-events-none ${showGame ? 'scale-[2.5] opacity-0' : 'scale-0 opacity-0'}`}></div>
                    </div>

                    {/* Description Text */}
                    <div className={`text-center max-w-lg mx-auto px-4 transition-all duration-1000 delay-100 ${showGame ? 'translate-y-[100vh] opacity-0 scale-50' : 'translate-0 opacity-100'}`}>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Halaman Tidak Ditemukan
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed mb-8">
                            Maaf, halaman yang Anda cari tidak dapat ditemukan. Mungkin sudah dihapus atau alamatnya salah.
                        </p>
                        <Link
                            href="/"
                            className="btn-primary px-8 py-3 text-lg rounded-2xl shadow-xl shadow-primary-500/20 hover:shadow-2xl hover:scale-105 transition-all inline-flex items-center gap-2"
                        >
                            <Home className="w-5 h-5" />
                            Kembali ke Beranda
                        </Link>
                    </div>
                </div>

                {/* Game Layer - Fades in from center */}
                <div className={`absolute inset-0 flex flex-col items-center justify-center z-30 transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)] ${showGame ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-75 pointer-events-none translate-y-20 blur-sm'}`}>
                    <div className="w-full max-w-2xl px-4">
                        <div className="mb-6 flex items-center justify-between">
                            <button
                                onClick={() => setShowGame(false)}
                                className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                            >
                                <div className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/50 transition-colors">
                                    <RotateCcw className="w-4 h-4" />
                                </div>
                                <span className="font-medium">Kembali</span>
                            </button>

                            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-blue-600 bg-clip-text text-transparent">
                                Book Catcher
                            </h2>

                            <div className="w-24"></div> {/* Spacer for alignment */}
                        </div>

                        {/* Game Board */}
                        <div className="relative w-full aspect-[4/3] bg-gradient-to-b from-blue-50/80 to-primary-50/80 dark:from-gray-800/80 dark:to-gray-900/80 backdrop-blur-xl rounded-3xl border border-white/50 dark:border-gray-700/50 shadow-2xl overflow-hidden cursor-none select-none touch-none ring-4 ring-white/20 dark:ring-black/20">

                            {/* Background Pattern */}
                            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
                                style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                            </div>

                            <div
                                ref={gameAreaRef}
                                onPointerMove={handlePointerMove}
                                className="absolute inset-0"
                            >
                                {/* Game HUD */}
                                {(gameStarted || gameOver) && (
                                    <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20">
                                        <div className="flex items-center gap-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur px-4 py-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                                            <BookOpen className="w-5 h-5 text-primary-500" />
                                            <span className="text-lg font-bold text-gray-900 dark:text-white">{score}</span>
                                        </div>
                                        <div className="flex items-center gap-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur px-4 py-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                                            {Array.from({ length: 3 }).map((_, i) => (
                                                <Heart key={i} className={`w-5 h-5 transition-all duration-300 ${i < lives ? 'text-red-500 fill-red-500 scale-100' : 'text-gray-300 dark:text-gray-600 scale-75'}`} />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Not started state */}
                                {!gameStarted && !gameOver && countdown === null && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 animate-fade-in">
                                        <div className="text-7xl mb-6 animate-bounce drop-shadow-xl">📚</div>
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Siap Bermain?</h3>
                                        <p className="text-gray-500 dark:text-gray-400 max-w-[280px] text-center mb-8 leading-relaxed">
                                            Gerakkan keranjang untuk menangkap buku. Awas bom! 💣
                                        </p>

                                        {highScore > 0 && (
                                            <div className="flex items-center gap-2 text-sm text-yellow-700 dark:text-yellow-400 mb-6 bg-yellow-50 dark:bg-yellow-900/30 px-4 py-2 rounded-full border border-yellow-100 dark:border-yellow-900/50">
                                                <Trophy className="w-4 h-4" />
                                                <span className="font-semibold">Best: {highScore}</span>
                                            </div>
                                        )}

                                        <button
                                            onClick={startGame}
                                            className="group relative overflow-hidden bg-primary-600 hover:bg-primary-500 text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg shadow-primary-600/30 hover:shadow-xl hover:scale-105 transition-all duration-300"
                                        >
                                            <span className="relative z-10 flex items-center gap-2">
                                                <span>Mulai Game</span>
                                                <span className="group-hover:translate-x-1 transition-transform">🚀</span>
                                            </span>
                                        </button>
                                    </div>
                                )}

                                {/* Countdown */}
                                {countdown !== null && (
                                    <div className="absolute inset-0 flex items-center justify-center z-20 bg-white/20 dark:bg-black/20 backdrop-blur-sm">
                                        <span className="text-9xl font-black text-primary-600 dark:text-primary-400 animate-ping" style={{ animationDuration: '0.7s' }}>
                                            {countdown}
                                        </span>
                                    </div>
                                )}

                                {/* Game Over */}
                                {gameOver && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-white/80 dark:bg-gray-900/90 backdrop-blur-md transition-all duration-500 animate-fade-in">
                                        <div className="text-center p-8">
                                            <div className="text-6xl mb-4 animate-bounce">
                                                {score > highScore - 1 && score > 0 ? '🏆' : '😅'}
                                            </div>
                                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Permainan Selesai!</h3>

                                            <div className="my-6">
                                                <p className="text-sm text-gray-500 uppercase tracking-wider font-medium mb-1">Skor Kamu</p>
                                                <p className="text-5xl font-black text-primary-600 dark:text-primary-400 tabular-nums">{score}</p>
                                            </div>

                                            {score >= highScore && score > 0 && (
                                                <div className="inline-flex items-center gap-2 text-sm font-bold text-yellow-600 dark:text-yellow-400 mb-8 bg-yellow-50 dark:bg-yellow-900/20 px-4 py-2 rounded-xl border border-yellow-100 dark:border-yellow-900/30 animate-pulse">
                                                    <Sparkles className="w-4 h-4" /> Rekor Baru!
                                                </div>
                                            )}

                                            <div className="flex gap-3 justify-center">
                                                <button
                                                    onClick={() => setShowGame(false)}
                                                    className="px-6 py-3 rounded-xl font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                >
                                                    Keluar
                                                </button>
                                                <button
                                                    onClick={startGame}
                                                    className="px-6 py-3 rounded-xl font-bold text-white bg-primary-600 hover:bg-primary-500 shadow-lg hover:shadow-primary-500/25 transition-all hover:scale-105"
                                                >
                                                    Main Lagi ↺
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Falling books */}
                                {books.map(book => (
                                    <span
                                        key={book.id}
                                        className="absolute text-3xl select-none pointer-events-none transition-none filter drop-shadow-md"
                                        style={{
                                            left: `${book.x}%`,
                                            top: `${book.y}%`,
                                            transform: `translate(-50%, -50%) rotate(${book.rotation}deg)`,
                                        }}
                                    >
                                        {book.emoji}
                                    </span>
                                ))}

                                {/* Catch flash */}
                                {catchFlash && (
                                    <div
                                        className="absolute pointer-events-none animate-ping font-bold text-green-500"
                                        style={{ left: `${catchFlash.x}%`, top: `${catchFlash.y}%`, transform: 'translate(-50%, -50%)' }}
                                    >
                                        <span className="text-3xl">+1</span>
                                    </div>
                                )}

                                {/* Basket */}
                                {gameStarted && (
                                    <div
                                        className="absolute bottom-[8%] transition-[left] duration-75 ease-out pointer-events-none will-change-[left]"
                                        style={{ left: `${basketX}%`, transform: 'translateX(-50%)' }}
                                    >
                                        <div className="text-5xl drop-shadow-xl filter">🧺</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer Hints */}
                        <div className="mt-6 text-center text-sm text-gray-400 dark:text-gray-500 font-medium animate-fade-in delay-500">
                            Gunakan mouse atau sentuh layar untuk menggerakkan keranjang
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
