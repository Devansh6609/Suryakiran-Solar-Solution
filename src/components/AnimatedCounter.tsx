import React, { useState, useEffect, useRef } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

interface AnimatedCounterProps {
    target: number;
    duration?: number;
    className?: string;
    suffix?: string;
    prefix?: string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
    target,
    duration = 2000,
    className = '',
    suffix = '',
    prefix = ''
}) => {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const isVisible = useIntersectionObserver(ref, { threshold: 0.5, triggerOnce: true });

    useEffect(() => {
        if (isVisible) {
            let startTime: number | null = null;
            const animate = (timestamp: number) => {
                if (!startTime) startTime = timestamp;
                const progress = timestamp - startTime;
                const current = Math.min(Math.floor((progress / duration) * target), target);
                setCount(current);
                if (progress < duration) {
                    requestAnimationFrame(animate);
                } else {
                    setCount(target); // Ensure it ends on the exact target
                }
            };
            requestAnimationFrame(animate);
        }
    }, [isVisible, target, duration]);

    return (
        <span ref={ref} className={className}>
            {prefix}{count.toLocaleString('en-IN')}{suffix}
        </span>
    );
};

export default AnimatedCounter;