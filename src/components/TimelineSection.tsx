/// <reference types="react" />
import React from 'react';
import AnimatedSection from './AnimatedSection.tsx';

// Define props based on what SubsidiesPage provides
interface ProcessStep {
    id: number;
    title: string;
    description: string;
    // FIX: Changed icon type to React.ReactElement to ensure it's a clonable element and provide proper type safety for React.cloneElement.
    // FIX: Made the type of `icon` more specific to include `className` to resolve the `cloneElement` error.
    icon: React.ReactElement<{ className?: string }>;
}

interface TimelineSectionProps {
    title: string;
    steps: ProcessStep[];
}

const TimelineSection: React.FC<TimelineSectionProps> = ({ title, steps }) => {
    return (
        <div className="relative max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
                <h2 className="text-3xl font-extrabold text-white text-center mb-16">{title}</h2>
            </AnimatedSection>

            <div className="relative wrap overflow-hidden p-0 sm:p-10 h-full">
                {/* Center line */}
                <div className="absolute border-opacity-20 border-gray-400 h-full border hidden sm:block" style={{ left: '50%' }}></div>

                {steps.map((step, index) => {
                    const isEven = index % 2 === 0;

                    const FlexContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
                        <div className={`mb-8 flex justify-between items-center w-full ${isEven ? 'sm:flex-row-reverse' : ''}`}>
                            {children}
                        </div>
                    );

                    const OrderContainer = () => <div className="order-1 w-5/12 hidden sm:block"></div>;

                    const TimelineNode = () => (
                        <div className="z-20 flex items-center order-1 bg-primary-green shadow-xl w-14 h-14 rounded-full">
                            <div className="mx-auto text-white">
                                {React.cloneElement(step.icon, { className: "h-7 w-7" })}
                            </div>
                        </div>
                    );

                    return (
                        <AnimatedSection key={step.id}>
                            <FlexContainer>
                                <OrderContainer />
                                <TimelineNode />
                                <div className="order-1 w-full sm:w-5/12 px-1 py-4">
                                    <div className={`p-6 rounded-lg shadow-lg bg-glass-surface backdrop-blur-md border border-glass-border`}>
                                        <h3 className="font-bold text-accent-yellow text-xl">{step.title}</h3>
                                        <p className="mt-2 text-text-secondary leading-snug tracking-wide">{step.description}</p>
                                    </div>
                                </div>
                            </FlexContainer>
                        </AnimatedSection>
                    );
                })}
            </div>
        </div>
    );
};

export default TimelineSection;