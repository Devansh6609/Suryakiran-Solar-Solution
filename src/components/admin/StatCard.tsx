import React from 'react';
import AnimatedCounter from '../AnimatedCounter';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    colorClass: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, colorClass }) => {
    const isNumeric = typeof value === 'number';
    const numericValue = isNumeric ? value : parseFloat(value.replace(/[^0-9.]/g, ''));

    return (
        <div className="bg-white dark:bg-glass-surface dark:backdrop-blur-lg p-4 rounded-xl shadow-lg dark:shadow-black/20 transition-all duration-300 hover:shadow-xl dark:hover:shadow-glow-sm dark:hover:shadow-black/30 hover:-translate-y-1 border border-gray-200 dark:border-glass-border dark:hover:border-glow-cyan/50">
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="text-xs font-medium text-gray-500 dark:text-text-secondary uppercase tracking-wider">{title}</h4>
                    <div className="mt-1 text-3xl font-bold text-gray-900 dark:text-text-primary font-mono">
                        {isNumeric ? (
                            <AnimatedCounter target={numericValue} />
                        ) : (
                            value
                        )}
                    </div>
                </div>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-lg shadow-black/30 ${colorClass}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
};

export default StatCard;
