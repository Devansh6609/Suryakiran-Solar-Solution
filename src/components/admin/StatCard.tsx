import React from 'react';
import AnimatedCounter from '../AnimatedCounter';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    colorClass?: string;   // legacy prop - kept for compat
    accent?: string;       // e.g. 'amber' | 'green' | 'blue' | 'red' | 'violet'
    trend?: { value: number; isPositive: boolean; };
}

const ACCENT_MAP: Record<string, { bg: string; icon: string; badge: string }> = {
    amber:  { bg: 'rgb(245 158 11 / 0.1)', icon: 'rgb(245 158 11)', badge: 'rgb(245 158 11 / 0.15)' },
    green:  { bg: 'rgb(16 185 129 / 0.1)', icon: 'rgb(16 185 129)', badge: 'rgb(16 185 129 / 0.15)' },
    blue:   { bg: 'rgb(59 130 246 / 0.1)', icon: 'rgb(59 130 246)', badge: 'rgb(59 130 246 / 0.15)' },
    red:    { bg: 'rgb(239 68 68 / 0.1)',  icon: 'rgb(239 68 68)',  badge: 'rgb(239 68 68 / 0.15)' },
    violet: { bg: 'rgb(139 92 246 / 0.1)', icon: 'rgb(139 92 246)', badge: 'rgb(139 92 246 / 0.15)' },
    cyan:   { bg: 'rgb(6 182 212 / 0.1)',  icon: 'rgb(6 182 212)',  badge: 'rgb(6 182 212 / 0.15)' },
    orange: { bg: 'rgb(249 115 22 / 0.1)', icon: 'rgb(249 115 22)', badge: 'rgb(249 115 22 / 0.15)' },
};

// Map legacy colorClass values to new accent
const legacyToAccent = (cls: string): string => {
    if (cls?.includes('neon-cyan') || cls?.includes('cyan'))   return 'cyan';
    if (cls?.includes('electric-blue') || cls?.includes('blue')) return 'blue';
    if (cls?.includes('violet') || cls?.includes('bright'))    return 'violet';
    if (cls?.includes('status-green') || cls?.includes('green')) return 'green';
    if (cls?.includes('error-red') || cls?.includes('red'))    return 'red';
    if (cls?.includes('amber') || cls?.includes('warning'))    return 'amber';
    if (cls?.includes('orange'))  return 'orange';
    return 'amber';
};

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, colorClass, accent, trend }) => {
    const key = accent || (colorClass ? legacyToAccent(colorClass) : 'amber');
    const colors = ACCENT_MAP[key] || ACCENT_MAP.amber;
    const isNumeric = typeof value === 'number';
    const numericValue = isNumeric ? value : parseFloat(String(value).replace(/[^0-9.]/g, ''));

    return (
        <div className="crm-card p-5 flex items-start justify-between group transition-all duration-200 cursor-default"
            style={{ borderRadius: '12px' }}>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-500 mb-1 uppercase tracking-wide truncate"
                    style={{ color: 'rgb(var(--text-2))' }}>
                    {title}
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-700 leading-none" style={{ color: 'rgb(var(--text-0))' }}>
                        {isNumeric
                            ? <AnimatedCounter target={numericValue} />
                            : value
                        }
                    </span>
                    {trend && (
                        <span className="flex items-center gap-0.5 text-[11px] font-600 px-1.5 py-0.5 rounded-full"
                            style={{
                                color: trend.isPositive ? 'rgb(var(--color-success))' : 'rgb(var(--color-danger))',
                                backgroundColor: trend.isPositive
                                    ? 'rgb(var(--color-success) / 0.1)'
                                    : 'rgb(var(--color-danger) / 0.1)',
                            }}>
                            {trend.isPositive
                                ? <TrendingUp size={11} />
                                : <TrendingDown size={11} />
                            }
                            {trend.value}%
                        </span>
                    )}
                </div>
            </div>

            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ml-3 transition-transform duration-200 group-hover:scale-110"
                style={{ backgroundColor: colors.bg, color: colors.icon }}>
                <div className="w-5 h-5">{icon}</div>
            </div>
        </div>
    );
};

export default StatCard;
