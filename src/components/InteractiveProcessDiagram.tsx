import React, { useState } from 'react';

interface ProcessStep {
    id: number;
    title: string;
    description: string;
    icon: React.ReactNode;
}

interface InteractiveProcessDiagramProps {
    title: string;
    steps: ProcessStep[];
}

const InteractiveProcessDiagram: React.FC<InteractiveProcessDiagramProps> = ({ title, steps }) => {
    const [activeStepId, setActiveStepId] = useState(steps[0].id);

    const activeStep = steps.find(step => step.id === activeStepId);

    return (
        <div className="bg-gray-50 p-8 rounded-lg">
            <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-8">{title}</h2>
            <div className="flex flex-col md:flex-row gap-8 md:gap-12">
                <div className="w-full md:w-1/3 space-y-2">
                    {steps.map(step => (
                        <button
                            key={step.id}
                            onClick={() => setActiveStepId(step.id)}
                            className={`w-full text-left p-4 rounded-lg flex items-center space-x-4 transition-all duration-300 ${activeStepId === step.id ? 'bg-primary-green text-white shadow-lg' : 'bg-white hover:bg-green-50'}`}
                        >
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${activeStepId === step.id ? 'bg-white text-primary-green' : 'bg-green-100 text-primary-green'}`}>
                                {step.id}
                            </div>
                            <div>
                                <p className="font-bold">{step.title}</p>
                            </div>
                        </button>
                    ))}
                </div>
                <div className="w-full md:w-2/3">
                    {activeStep && (
                        <div key={activeStep.id} className="bg-white p-6 rounded-lg shadow-md animate-fade-in">
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 text-primary-green flex items-center justify-center">
                                    {activeStep.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800">{activeStep.title}</h3>
                            </div>
                            <p className="text-gray-600 leading-relaxed">
                                {activeStep.description}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InteractiveProcessDiagram;
