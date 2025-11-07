import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../../hooks/useTheme';

interface MonthlyLeadsChartProps {
    data: { name: string; leads: number }[];
}

const MonthlyLeadsChart: React.FC<MonthlyLeadsChartProps> = ({ data }) => {
    const isDarkMode = useTheme();

    const axisColor = isDarkMode ? '#94a3b8' : '#6b7280'; // text-secondary vs text-gray-500
    const tooltipStyles = {
        background: isDarkMode ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(5px)',
        border: isDarkMode ? '1px solid rgba(107, 114, 128, 0.2)' : '1px solid #e5e7eb',
        borderRadius: '12px',
        boxShadow: isDarkMode ? '0 0 10px rgba(6, 182, 212, 0.2)' : '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    };
    const labelStyle = { color: isDarkMode ? '#f8fafc' : '#111827' };
    const itemStyle = { color: isDarkMode ? '#67e8f9' : '#06b6d4', fontWeight: 'bold' };

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <defs>
                    <linearGradient id="colorLeadsBar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.4} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "rgba(107, 114, 128, 0.2)" : "rgba(229, 231, 235, 0.5)"} />
                <XAxis dataKey="name" stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                    cursor={{ fill: 'rgba(6, 182, 212, 0.1)' }}
                    contentStyle={tooltipStyles}
                    labelStyle={labelStyle}
                    itemStyle={itemStyle}
                />
                <Bar
                    dataKey="leads"
                    fill="url(#colorLeadsBar)"
                    radius={[4, 4, 0, 0]}
                    isAnimationActive={true}
                    animationDuration={800}
                />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default React.memo(MonthlyLeadsChart);