import React, { useState, useEffect, useCallback } from 'react';
import { TESTIMONIALS } from '../constants';
import { StorySegment } from '../types';

// Enhanced colors for better visibility on dark backgrounds
const segmentColors = {
    [StorySegment.Residential]: 'bg-blue-500/30 text-blue-200 ring-1 ring-blue-400/50',
    [StorySegment.Agricultural]: 'bg-green-500/30 text-green-200 ring-1 ring-green-400/50',
    [StorySegment.Commercial]: 'bg-gray-500/30 text-gray-200 ring-1 ring-gray-400/50',
};

const QuoteIcon = () => (
    <svg className="absolute top-4 left-4 w-16 h-16 text-white/10" width="45" height="34" viewBox="0 0 45 34" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M44.5 0.5H29.9375L22.6562 12.875V33.5H44.5V0.5Z" fill="currentColor" />
        <path d="M21.8438 0.5H7.28125L0 12.875V33.5H21.8438V0.5Z" fill="currentColor" />
    </svg>
);

const CarouselButton: React.FC<{ onClick: () => void; children: React.ReactNode; 'aria-label': string; className?: string }> = ({ onClick, children, 'aria-label': ariaLabel, className = '' }) => (
    <button
        onClick={onClick}
        aria-label={ariaLabel}
        className={`absolute top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100 ${className}`}
    >
        {children}
    </button>
);

const TestimonialCarousel: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFading, setIsFading] = useState(false);

    const handleNavigation = useCallback((newIndex: number) => {
        if (isFading || newIndex === currentIndex) return;

        setIsFading(true);
        setTimeout(() => {
            setCurrentIndex(newIndex);
            setIsFading(false);
        }, 300); // Corresponds to fade-out duration
    }, [isFading, currentIndex]);

    const nextTestimonial = useCallback(() => {
        handleNavigation((currentIndex + 1) % TESTIMONIALS.length);
    }, [currentIndex, handleNavigation]);

    const prevTestimonial = () => {
        handleNavigation((currentIndex - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
    };

    useEffect(() => {
        const timer = setInterval(nextTestimonial, 5000);
        return () => clearInterval(timer);
    }, [nextTestimonial]);

    const currentTestimonial = TESTIMONIALS[currentIndex];

    return (
        <div className="w-full max-w-3xl mx-auto bg-slate-800/50 p-8 rounded-xl relative overflow-hidden group">
            <QuoteIcon />

            <div className={`transition-opacity duration-300 ease-in-out ${isFading ? 'opacity-0' : 'opacity-100'}`}>
                <div className="flex flex-col items-center text-center min-h-[280px] justify-center relative z-10">
                    <img
                        key={currentTestimonial.name} // Force re-render on change
                        className="w-24 h-24 rounded-full mb-4 object-cover ring-2 ring-white/20"
                        src={currentTestimonial.image}
                        alt={currentTestimonial.name}
                    />
                    <p className="text-lg italic text-gray-200">"{currentTestimonial.quote}"</p>
                    <div className="mt-4">
                        <p className="font-bold text-white">{currentTestimonial.name}</p>
                        <span className={`inline-block px-3 py-1 mt-1 text-sm font-semibold rounded-full ${segmentColors[currentTestimonial.segment]}`}>
                            {currentTestimonial.segment} Customer
                        </span>
                    </div>
                </div>
            </div>

            <CarouselButton onClick={prevTestimonial} aria-label="Previous testimonial" className="left-4 z-20">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            </CarouselButton>

            <CarouselButton onClick={nextTestimonial} aria-label="Next testimonial" className="right-4 z-20">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </CarouselButton>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3 z-20">
                {TESTIMONIALS.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => handleNavigation(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${currentIndex === index ? 'bg-white scale-125' : 'bg-white/30 hover:bg-white/50'}`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default TestimonialCarousel;