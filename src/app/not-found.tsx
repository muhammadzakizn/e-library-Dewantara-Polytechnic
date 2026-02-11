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
            <div className="relative z-10 pt-24 pb-20">
                <div className="max-w-2xl mx-auto px-4 text-center">

                    {/* 404 Header */}
                    {/* 404 Header & Game Trigger */}
                    {!showGame ? (
                        <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
                            <div className="relative group cursor-pointer mb-8" onClick={() => setShowGame(true)}>
                                <div className="flex items-center justify-center text-[150px] md:text-[220px] font-black leading-none tracking-tighter select-none">
                                    <span className="bg-gradient-to-br from-gray-300 to-gray-500 dark:from-gray-700 dark:to-gray-500 bg-clip-text text-transparent transform group-hover:-translate-x-4 transition-transform duration-500">4</span>

                                    {/* The Interactive Zero */}
                                    <div className="relative mx-2 md:mx-4 transform group-hover:scale-110 transition-all duration-500 ease-out z-10">
                                        <span className="bg-gradient-to-br from-primary-500 to-blue-600 bg-clip-text text-transparent">0</span>
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className="w-20 h-20 md:w-32 md:h-32 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg animate-pulse">
                                                <div className="w-0 h-0 border-t-[15px] border-t-transparent border-l-[30px] border-l-white border-b-[15px] border-b-transparent ml-2"></div>
                                            </div>
                                        </div>
                                        {/* Glow effect */}
                                        <div className="absolute inset-0 bg-primary-500/30 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
                                    </div>

                                    <span className="bg-gradient-to-br from-gray-300 to-gray-500 dark:from-gray-700 dark:to-gray-500 bg-clip-text text-transparent transform group-hover:translate-x-4 transition-transform duration-500">4</span>
                                </div>
                                <p className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-sm font-medium text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                                    Klik "0" untuk Main Game! 🎮
                                </p>
                            </div>

                            <div className="space-y-4 max-w-lg mx-auto text-center">
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                                    Halaman Tidak Ditemukan
                                </h2>
                                <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed">
                                    Maaf, halaman yang Anda cari tidak dapat ditemukan. Mungkin sudah dihapus atau alamatnya salah.
                                </p>
                            </div>

                            <div className="mt-12">
                                <Link
                                    href="/"
                                    className="btn-primary px-8 py-3 text-lg rounded-2xl shadow-xl shadow-primary-500/20 hover:shadow-2xl hover:scale-105 transition-all"
                                >
                                    Kembali ke Beranda
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-scale-in">
                            <div className="mb-8 flex items-center justify-between">
                                <button
                                    onClick={() => setShowGame(false)}
                                    className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white flex items-center gap-2 transition-colors"
                                >
                                    <RotateCcw className="w-4 h-4" /> Kembali
                                </button>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Book Catcher</h2>
                                <div className="w-20"></div> {/* Spacer */}
                            </div>

                            {/* Game Area */}
                            <div className="mb-8">
                                <div
                                    ref={gameAreaRef}
                                    onPointerMove={handlePointerMove}
                                    className="relative w-full aspect-[4/3] max-w-lg mx-auto bg-gradient-to-b from-blue-100/50 to-primary-100/50 dark:from-gray-800/50 dark:to-gray-800/30 rounded-2xl border-2 border-dashed border-primary-200 dark:border-gray-700 overflow-hidden cursor-none select-none touch-none"
                                >
                                    {/* Game HUD */}
                                    {(gameStarted || gameOver) && (
                                        <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-20">
                                            <div className="flex items-center gap-1 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
                                                <BookOpen className="w-4 h-4 text-primary-500" />
                                                <span className="text-sm font-bold text-gray-900 dark:text-white">{score}</span>
                                            </div>
                                            <div className="flex items-center gap-0.5 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
                                                {Array.from({ length: 3 }).map((_, i) => (
                                                    <Heart key={i} className={`w-4 h-4 transition-all ${i < lives ? 'text-red-500 fill-red-500 scale-100' : 'text-gray-300 dark:text-gray-600 scale-75'}`} />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Not started state */}
                                    {!gameStarted && !gameOver && countdown === null && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                                            <div className="text-6xl mb-4 animate-bounce">📚</div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Book Catcher!</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[240px] mb-4">Gerakkan keranjang untuk menangkap buku yang jatuh. Hindari bom! 💣</p>
                                            {highScore > 0 && (
                                                <div className="flex items-center gap-1.5 text-xs text-yellow-600 dark:text-yellow-400 mb-3 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1.5 rounded-full">
                                                    <Trophy className="w-3.5 h-3.5" />
                                                    High Score: {highScore}
                                                </div>
                                            )}
                                            <button
                                                onClick={startGame}
                                                className="bg-primary-600 hover:bg-primary-500 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg shadow-primary-600/25 hover:shadow-xl hover:scale-105 transition-all text-sm"
                                            >
                                                🎮 Mulai Main
                                            </button>
                                        </div>
                                    )}

                                    {/* Countdown */}
                                    {countdown !== null && (
                                        <div className="absolute inset-0 flex items-center justify-center z-20">
                                            <span className="text-7xl font-black text-primary-600 dark:text-primary-400 animate-ping" style={{ animationDuration: '0.7s' }}>
                                                {countdown}
                                            </span>
                                        </div>
                                    )}

                                    {/* Game Over */}
                                    {gameOver && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/30 backdrop-blur-sm rounded-2xl">
                                            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-2xl text-center mx-4">
                                                <div className="text-5xl mb-3">{score > highScore - 1 && score > 0 ? '🏆' : '📖'}</div>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Game Over!</h3>
                                                <p className="text-3xl font-black text-primary-600 dark:text-primary-400 mb-1">{score}</p>
                                                <p className="text-sm text-gray-500 mb-1">buku tertangkap</p>
                                                {score >= highScore && score > 0 && (
                                                    <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium flex items-center justify-center gap-1 mb-3">
                                                        <Sparkles className="w-3.5 h-3.5" /> High Score Baru!
                                                    </p>
                                                )}
                                                <button
                                                    onClick={startGame}
                                                    className="bg-primary-600 hover:bg-primary-500 text-white font-semibold px-5 py-2 rounded-xl shadow-lg hover:scale-105 transition-all text-sm mt-2"
                                                >
                                                    🔄 Main Lagi
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Falling books */}
                                    {books.map(book => (
                                        <span
                                            key={book.id}
                                            className="absolute text-2xl md:text-3xl select-none pointer-events-none transition-none"
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
                                            className="absolute pointer-events-none animate-ping"
                                            style={{ left: `${catchFlash.x}%`, top: `${catchFlash.y}%`, transform: 'translate(-50%, -50%)' }}
                                        >
                                            <span className="text-2xl">+1</span>
                                        </div>
                                    )}

                                    {/* Basket */}
                                    {gameStarted && (
                                        <div
                                            className="absolute bottom-[6%] transition-[left] duration-75 ease-out pointer-events-none"
                                            style={{ left: `${basketX}%`, transform: 'translateX(-50%)' }}
                                        >
                                            <div className="text-4xl md:text-5xl">🧺</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
                                <Link
                                    href="/"
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-primary-600/20 hover:shadow-xl hover:scale-[1.02] transition-all"
                                >
                                    <Home className="w-5 h-5" />
                                    Kembali ke Beranda
                                </Link>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-[1.02] transition-all shadow-sm"
                                >
                                    <RotateCcw className="w-5 h-5" />
                                    Coba Lagi
                                </button>
                            </div>


                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
