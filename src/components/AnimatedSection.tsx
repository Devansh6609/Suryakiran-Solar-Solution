import React, { useRef, ReactNode } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver.ts';

interface AnimatedSectionProps {
    children: ReactNode;
    className?: string;
    delay?: string; // e.g., 'delay-300'
}

const AnimatedSection: React.FC<AnimatedSectionProps> = ({ children, className = '', delay = '' }) => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const isVisible = useIntersectionObserver(sectionRef, { threshold: 0.2, triggerOnce: true });

    return (
        <div
            ref={sectionRef}
            className={`transition-all duration-700 ${delay} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'} ${className}`}
        >
            {children}
        </div>
    );
};

export default AnimatedSection;
