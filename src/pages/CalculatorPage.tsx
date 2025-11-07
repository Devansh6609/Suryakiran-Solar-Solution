import React, { useState } from 'react';
// FIX: Changed to named import to resolve module export errors.
import { useParams } from 'react-router-dom';
import CalculatorForm from '../components/CalculatorForm.tsx';
import InteractiveCalculator from '../components/InteractiveCalculator.tsx';
import { CalculatorType } from '../types.ts';

const CalculatorPage: React.FC = () => {
    const { type } = useParams<{ type: string }>();
    const [showForm, setShowForm] = useState(false);
    const [initialValue, setInitialValue] = useState<number | null>(null);

    const isRooftop = type === CalculatorType.Rooftop;
    const isPump = type === CalculatorType.Pump;

    if (!isRooftop && !isPump) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center p-8">
                    <h1 className="text-2xl font-bold text-red-600">Invalid Calculator Type</h1>
                    <p className="text-gray-600 mt-2">Please select either the Rooftop or Pump calculator.</p>
                </div>
            </div>
        );
    }

    const handleProceed = (value: number) => {
        setInitialValue(value);
        setShowForm(true);
    };

    const pageConfig = {
        [CalculatorType.Rooftop]: {
            title: 'Rooftop Savings Calculator',
            subtitle: 'Use the slider to get a quick estimate, then proceed for a detailed quote.',
        },
        [CalculatorType.Pump]: {
            title: 'Pump ROI Calculator',
            subtitle: 'Instantly see your diesel savings, then get your verified subsidy estimate.',
        },
    };

    const config = isRooftop ? pageConfig.rooftop : pageConfig.pump;
    const currentType = isRooftop ? CalculatorType.Rooftop : CalculatorType.Pump;

    return (
        <div className="min-h-[calc(100vh-99px)] flex items-center justify-center p-4">
            <div className="relative z-10 w-full max-w-4xl">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-white">{config.title}</h1>
                    <p className="mt-2 text-lg text-gray-200">{config.subtitle}</p>
                </div>
                {showForm ? (
                    <CalculatorForm type={currentType} initialValue={initialValue} />
                ) : (
                    <InteractiveCalculator type={currentType} onProceed={handleProceed} />
                )}
            </div>
        </div>
    );
};

export default CalculatorPage;