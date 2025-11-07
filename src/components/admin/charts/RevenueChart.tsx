import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../../hooks/useTheme';

interface RevenueChartProps {
    data: { name: string; revenue: number }[];
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
    const isDarkMode = useTheme();

    const axisColor = isDarkMode ? '#94a3b8' : '#6b7280';
    const tooltipStyles = {
        background: isDarkMode ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(5px)',
        border: isDarkMode ? '1px solid rgba(107, 114, 128, 0.2)' : '1px solid #e5e7eb',
        borderRadius: '12px',
        boxShadow: isDarkMode ? '0 0 10px rgba(34, 197, 94, 0.2)' : '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    };
    const labelStyle = { color: isDarkMode ? '#f8fafc' : '#111827' };

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <defs>
                    <linearGradient id="colorRevenueLine" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#22c55e" />
                        <stop offset="100%" stopColor="#a78bfa" />
                    </linearGradient>
                    <linearGradient id="colorRevenueArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "rgba(107, 114, 128, 0.2)" : "rgba(229, 231, 235, 0.5)"} />
                <XAxis dataKey="name" stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${Number(value) / 1000}k`} />
                <Tooltip
                    cursor={{ stroke: isDarkMode ? 'rgba(107, 114, 128, 0.2)' : 'rgba(209, 213, 219, 0.5)', strokeWidth: 1 }}
                    contentStyle={tooltipStyles}
                    labelStyle={labelStyle}
                    formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                />
                <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="url(#colorRevenueLine)"
                    strokeWidth={2}
                    fill="url(#colorRevenueArea)"
                    activeDot={{ r: 6, style: { fill: '#a78bfa', stroke: '#fff' } }}
                    dot={{ r: 3, fill: '#22c55e', stroke: isDarkMode ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)', strokeWidth: 1 }}
                    isAnimationActive={true}
                    animationDuration={800}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
};

export default React.memo(RevenueChart);