import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTheme } from '../../../hooks/useTheme';

interface LeadSourceChartProps {
    data: { name: string; value: number }[];
}

const COLORS = ['#3b82f6', '#06b6d4', '#a78bfa', '#22c55e'];

const LeadSourceChart: React.FC<LeadSourceChartProps> = ({ data }) => {
    const isDarkMode = useTheme();

    const tooltipStyles = {
        background: isDarkMode ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(5px)',
        border: isDarkMode ? '1px solid rgba(107, 114, 128, 0.2)' : '1px solid #e5e7eb',
        borderRadius: '12px',
        color: isDarkMode ? '#f8fafc' : '#111827',
    };

    const legendStyle = {
        color: isDarkMode ? '#94a3b8' : '#6b7280',
        fontSize: '12px'
    };

    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={90}
                    innerRadius={60} // This creates the donut shape
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    paddingAngle={5}
                    cornerRadius={8}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip
                    contentStyle={tooltipStyles}
                    itemStyle={{ fontWeight: 'bold' }}
                />
                <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" wrapperStyle={legendStyle} />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default React.memo(LeadSourceChart);