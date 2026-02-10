'use client';

import { useEffect, useState, useRef, ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    label: string;
    value: number;
    icon: ReactNode;
    delay?: number;
}

export default function StatCard({ label, value, icon, delay = 0 }: StatCardProps) {
    const [count, setCount] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );

        if (elementRef.current) {
            observer.observe(elementRef.current);
        }

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isVisible) return;

        let startTime: number;
        const duration = 2000;
        const startValue = 0;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / duration, 1);

            // Ease out quart
            const ease = 1 - Math.pow(1 - percentage, 4);

            setCount(Math.floor(startValue + (value - startValue) * ease));

            if (percentage < 1) {
                requestAnimationFrame(animate);
            }
        };

        const timer = setTimeout(() => {
            requestAnimationFrame(animate);
        }, delay * 1000);

        return () => clearTimeout(timer);
    }, [isVisible, value, delay]);

    return (
        <div
            ref={elementRef}
            className="bg-white/70 dark:bg-white/10 backdrop-blur-sm rounded-xl p-5 text-center hover:bg-white/90 dark:hover:bg-white/20 transition-colors shadow-lg dark:shadow-none border border-primary-100 dark:border-white/10 group"
        >
            <div className="mb-3 inline-flex p-3 rounded-full bg-primary-50 dark:bg-white/5 group-hover:scale-110 transition-transform duration-300">
                {icon}
            </div>
            <p className="text-3xl font-bold text-primary-900 dark:text-white mb-1 tab-num">
                {count.toLocaleString('id-ID')}
            </p>
            <p className="text-sm font-medium text-primary-600/70 dark:text-white/70">
                {label}
            </p>
        </div>
    );
}
