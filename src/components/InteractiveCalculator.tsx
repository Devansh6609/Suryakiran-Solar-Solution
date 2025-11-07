import React, { useState, useMemo } from 'react';
import { CalculatorType } from '../types';

interface InteractiveCalculatorProps {
    type: CalculatorType;
    onProceed: (value: number) => void;
}

const ResultCard: React.FC<{ label: string; value: string; isPrimary?: boolean }> = ({ label, value, isPrimary = false }) => (
    <div className={`p-4 rounded-lg ${isPrimary ? 'bg-primary-green/20' : 'bg-white/5'}`}>
        <p className="text-sm text-text-secondary">{label}</p>
        <p className={`text-2xl font-bold ${isPrimary ? 'text-primary-green' : 'text-white'}`}>{value}</p>
    </div>
);

const InteractiveCalculator: React.FC<InteractiveCalculatorProps> = ({ type, onProceed }) => {
    const isRooftop = type === CalculatorType.Rooftop;
    const config = isRooftop ? {
        label: "Average Monthly Electricity Bill",
        min: 500, max: 20000, step: 100, defaultValue: 3000, unit: "₹"
    } : {
        label: "Current Seasonal Energy Cost (Diesel)",
        min: 2000, max: 50000, step: 500, defaultValue: 10000, unit: "₹"
    };

    const [value, setValue] = useState(config.defaultValue);

    const results = useMemo(() => {
        if (isRooftop) {
            const bill = value;
            const systemSize = parseFloat((bill / 750).toFixed(1));
            const subsidy = Math.min(78000, systemSize * 22000);
            const annualSavings = bill * 12;
            const costPerKw = 60000;
            const totalSystemCost = systemSize * costPerKw;
            const netSystemCost = totalSystemCost - subsidy;
            const paybackPeriodValue = (netSystemCost > 0 && annualSavings > 0)
                ? (netSystemCost / annualSavings).toFixed(1)
                : 'N/A';

            return {
                primary: { label: "Est. Annual Savings", value: `₹ ${annualSavings.toLocaleString('en-IN')}` },
                secondary: [
                    { label: "Recommended System", value: `${systemSize} kW` },
                    { label: "Govt. Subsidy", value: `≈ ₹ ${Math.round(subsidy).toLocaleString('en-IN')}` },
                    { label: "Payback Period", value: paybackPeriodValue !== 'N/A' ? `~${paybackPeriodValue} Years` : 'N/A' }
                ]
            };
        } else {
            const energyCost = value;
            const annualSavings = energyCost * 4;
            const pumpSystemCost = 180000;
            const subsidyPercentage = 0.60;
            const netCost = pumpSystemCost * (1 - subsidyPercentage);
            const paybackPeriodValue = (netCost > 0 && annualSavings > 0)
                ? (netCost / annualSavings).toFixed(1)
                : 'N/A';

            return {
                primary: { label: "Est. Annual Diesel Savings", value: `₹ ${annualSavings.toLocaleString('en-IN')}` },
                secondary: [
                    { label: "Recommended Pump", value: "5-7.5 HP" },
                    { label: "PM-KUSUM Subsidy", value: "Up to 60%" },
                    { label: "Payback Period", value: paybackPeriodValue !== 'N/A' ? `~${paybackPeriodValue} Years` : 'N/A' }
                ]
            };
        }
    }, [value, isRooftop]);

    return (
        <div className="bg-glass-surface backdrop-blur-md border border-glass-border p-8 rounded-lg shadow-2xl max-w-3xl mx-auto text-white">
            <div className="text-center">
                <label htmlFor="calculator-slider" className="block text-lg font-medium text-text-secondary">{config.label}</label>
                <p className="text-4xl font-extrabold text-accent-orange my-2">{config.unit} {value.toLocaleString('en-IN')}</p>
            </div>

            <input
                id="calculator-slider"
                type="range"
                min={config.min}
                max={config.max}
                step={config.step}
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                className="w-full h-3 bg-white/10 rounded-lg appearance-none cursor-pointer range-lg accent-accent-orange"
            />
            <div className="flex justify-between text-xs text-text-secondary px-1">
                <span>{config.unit} {config.min.toLocaleString('en-IN')}</span>
                <span>{config.unit} {config.max.toLocaleString('en-IN')}</span>
            </div>

            <div className="mt-8 border-t border-glass-border pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <ResultCard label={results.primary.label} value={results.primary.value} isPrimary />
                    </div>
                    {results.secondary.map(res => (
                        <ResultCard key={res.label} label={res.label} value={res.value} />
                    ))}
                </div>
            </div>

            <div className="mt-8 text-center">
                <button
                    onClick={() => onProceed(value)}
                    className="w-full md:w-auto font-bold bg-accent-orange text-white py-3 px-12 rounded-lg shadow-lg hover:bg-accent-orange-hover transition-colors duration-300 text-lg"
                >
                    Proceed to Get Verified Quote
                </button>
                <p className="text-xs text-text-secondary mt-2">No commitment required. Your data is secure.</p>
            </div>
        </div>
    );
};

export default InteractiveCalculator;
