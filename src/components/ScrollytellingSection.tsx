import React, { useState, useRef, useEffect } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver.ts';

interface ProcessStep {
    id: number;
    title: string;
    description: string;
    icon: React.ReactNode;
}

interface ScrollytellingSectionProps {
    title: string;
    steps: ProcessStep[];
    image?: string;
}

const StepContent: React.FC<{ step: ProcessStep; setActiveStepId: (id: number) => void }> = ({ step, setActiveStepId }) => {
    const ref = useRef<HTMLDivElement>(null);
    const isVisible = useIntersectionObserver(ref, { threshold: 0.6, triggerOnce: false });

    useEffect(() => {
        if (isVisible) {
            setActiveStepId(step.id);
        }
    }, [isVisible, setActiveStepId, step.id]);

    return (
        <div ref={ref} className="min-h-[60vh] py-10">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">{step.title}</h3>
            <p className="text-gray-600 leading-relaxed">{step.description}</p>
        </div>
    );
};


const ScrollytellingSection: React.FC<ScrollytellingSectionProps> = ({ title, steps, image }) => {
    const [activeStepId, setActiveStepId] = useState(steps[0].id);

    return (
        <div className="bg-gray-50 p-8 rounded-lg">
            <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">{title}</h2>
            <div className="flex flex-col md:flex-row gap-8 md:gap-16">

                {/* Left Sticky Column */}
                <div className="w-full md:w-1/3">
                    <div className="sticky top-32 space-y-4">
                        {image && (
                            <div className="mb-8 overflow-hidden rounded-lg shadow-lg">
                                <img src={image} alt={title} className="w-full h-auto object-cover" />
                            </div>
                        )}
                        {steps.map(step => (
                            <div
                                key={step.id}
                                className={`p-4 rounded-lg flex items-center space-x-4 transition-all duration-300 ${activeStepId === step.id ? 'bg-primary-green text-white scale-105 shadow-lg' : 'bg-white'}`}
                            >
                                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300 ${activeStepId === step.id ? 'bg-white text-primary-green' : 'bg-green-100 text-primary-green'}`}>
                                    {step.icon}
                                </div>
                                <div>
                                    <p className="font-bold">{step.title}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Scrollable Column */}
                <div className="w-full md:w-2/3">
                    {steps.map(step => (
                        <StepContent key={step.id} step={step} setActiveStepId={setActiveStepId} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ScrollytellingSection;
