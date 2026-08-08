import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User } from '../../types';
import { getVendors, getDashboardStats, getChartData, getFinanceDashboardSummary } from '../../service/adminService';
import StatCard from '../../components/admin/StatCard';
import { useCrmUpdates } from '../../contexts/CrmUpdatesContext';
import Card from '../../components/admin/Card';
import MonthlyLeadsChart from '../../components/admin/charts/MonthlyLeadsChart';
import RevenueChart from '../../components/admin/charts/RevenueChart';
import TaskWidget from '../../components/admin/TaskWidget';
import { useAuth } from '../../contexts/AuthContext';
import {
    Users, UserCheck, Trophy, IndianRupee, Activity,
    Zap, Calendar, Filter, ChevronRight, TrendingUp,
    Package, ClipboardCheck, GitBranch, FileText
} from 'lucide-react';
import { DashboardSkeleton } from '../../components/skeletons';


/* ---- Group By Toggle ---- */
const GroupByToggle: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => (
    <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: 'rgb(var(--border-default))' }}>
        {['day', 'week', 'month'].map(opt => (
            <button
                key={opt}
                onClick={() => onChange(opt)}
                className="px-4 py-1.5 text-xs font-600 capitalize transition-all"
                style={{
                    backgroundColor: value === opt ? 'rgb(var(--accent))' : 'rgb(var(--surface-1))',
                    color: value === opt ? '#fff' : 'rgb(var(--text-2))',
                }}
            >
                {opt}
            </button>
        ))}
    </div>
);

/* ---- Quick Actions ---- */
const QUICK_LINKS = [
    { label: 'New Lead',      path: '/admin/leads/manual', icon: Users,         accent: 'amber' },
    { label: 'New Survey',    path: '/admin/surveys',      icon: ClipboardCheck, accent: 'blue' },
    { label: 'New Quotation', path: '/admin/quotations',   icon: FileText,       accent: 'violet' },
    { label: 'Inventory',     path: '/admin/inventory',    icon: Package,        accent: 'green' },
];

/* ---- Main Component ---- */
const DashboardPage: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [chartData, setChartData] = useState<any>(null);
    const [financeSummary, setFinanceSummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { lastUpdate } = useCrmUpdates();
    const { user } = useAuth();

    const [filters, setFilters] = useState({ vendorId: 'all', startDate: '', endDate: '' });
    const [groupBy, setGroupBy] = useState('month');
    const [vendors, setVendors] = useState<User[]>([]);

    useEffect(() => {
        if (user?.role === 'Master') getVendors().then(setVendors).catch(() => {});
    }, [user]);

    useEffect(() => {
        const fetch = async () => {
            try {
                setLoading(true);
                const [statsData, chartsData, financeData] = await Promise.all([
                    getDashboardStats(filters),
                    getChartData({ ...filters, groupBy }),
                    getFinanceDashboardSummary(filters)
                ]);
                setStats(statsData);
                setChartData(chartsData);
                setFinanceSummary(financeData?.summary || null);
            } catch (e) {
                setError('Failed to load dashboard data.');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [filters, groupBy, lastUpdate]);

    const fmtCurrency = (val: number) => {
        if (!val || val === 0) return '₹0';
        if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
        if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
        return `₹${val.toLocaleString('en-IN')}`;
    };

    const inputStyle = {
        backgroundColor: 'rgb(var(--surface-2))',
        border: '1px solid rgb(var(--border-default))',
        color: 'rgb(var(--text-0))',
        borderRadius: '8px',
        padding: '0.4rem 0.75rem',
        fontSize: '0.8125rem',
        outline: 'none',
    };

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 anim-fade-up">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <p className="text-xs font-500 mb-1" style={{ color: 'rgb(var(--text-2))' }}>
                        Welcome back, <span style={{ color: 'rgb(var(--accent))' }}>{user?.name}</span>
                    </p>
                    <h1 className="text-2xl font-700 tracking-tight" style={{ color: 'rgb(var(--text-0))' }}>
                        Dashboard Overview
                    </h1>
                </div>

                {/* Quick actions */}
                <div className="flex items-center gap-2 flex-wrap">
                    {QUICK_LINKS.map(q => {
                        const Icon = q.icon;
                        return (
                            <Link key={q.path} to={q.path}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-600 transition-all border"
                                style={{
                                    backgroundColor: 'rgb(var(--surface-1))',
                                    borderColor: 'rgb(var(--border-default))',
                                    color: 'rgb(var(--text-1))',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.borderColor = 'rgb(var(--accent))';
                                    e.currentTarget.style.color = 'rgb(var(--accent))';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.borderColor = 'rgb(var(--border-default))';
                                    e.currentTarget.style.color = 'rgb(var(--text-1))';
                                }}
                            >
                                <Icon size={13} />
                                {q.label}
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Filters row */}
            {user?.role === 'Master' && (
                <div className="crm-card p-4 flex flex-wrap items-center gap-3">
                    <Filter size={15} style={{ color: 'rgb(var(--text-2))' }} />
                    <select
                        value={filters.vendorId}
                        onChange={e => setFilters(p => ({ ...p, vendorId: e.target.value }))}
                        style={{ ...inputStyle, minWidth: '160px' }}
                    >
                        <option value="all">All Vendors</option>
                        {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>
                    <div className="flex items-center gap-2">
                        <Calendar size={14} style={{ color: 'rgb(var(--text-2))' }} />
                        <input type="date" value={filters.startDate}
                            onChange={e => setFilters(p => ({ ...p, startDate: e.target.value }))}
                            style={inputStyle} />
                        <span style={{ color: 'rgb(var(--text-2))' }}>–</span>
                        <input type="date" value={filters.endDate}
                            onChange={e => setFilters(p => ({ ...p, endDate: e.target.value }))}
                            style={inputStyle} />
                    </div>
                    <div className="ml-auto">
                        <GroupByToggle value={groupBy} onChange={setGroupBy} />
                    </div>
                </div>
            )}

            {loading ? (
                <DashboardSkeleton />
            ) : error ? (
                <div className="crm-card p-8 text-center" style={{ color: 'rgb(var(--color-danger))' }}>
                    {error}
                </div>
            ) : (
                <div className="space-y-6">

                    {/* Pipeline KPIs */}
                    <div>
                        <p className="text-xs font-600 uppercase tracking-wider mb-3"
                            style={{ color: 'rgb(var(--text-2))' }}>Pipeline Overview</p>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 anim-stagger">
                            <StatCard title="Total Leads"        value={stats?.totalLeads ?? 0}    icon={<Users size={20} />}        accent="cyan"   trend={stats?.totalLeadsTrend} />
                            <StatCard title="Verified"           value={stats?.verifiedLeads ?? 0} icon={<UserCheck size={20} />}    accent="blue"   trend={stats?.verifiedLeadsTrend} />
                            <StatCard title="Projects Completed" value={stats?.projectsWon ?? 0}   icon={<Trophy size={20} />}       accent="violet" trend={stats?.projectsWonTrend} />
                            <StatCard title="Pipeline Value"     value={fmtCurrency(stats?.pipelineValue ?? 0)} icon={<IndianRupee size={20} />} accent="amber" trend={stats?.pipelineValueTrend} />
                        </div>
                    </div>

                    {/* Financial KPIs */}
                    <div>
                        <p className="text-xs font-600 uppercase tracking-wider mb-3"
                            style={{ color: 'rgb(var(--text-2))' }}>Financial Summary</p>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 anim-stagger">
                            <StatCard title="Total Revenue"    value={fmtCurrency(financeSummary?.totalRevenue || 0)}    icon={<IndianRupee size={20} />} accent="amber" />
                            <StatCard title="Net Profit"       value={fmtCurrency(financeSummary?.totalProfit || 0)}     icon={<TrendingUp size={20} />}  accent="green" />
                            <StatCard title="Material Costs"   value={fmtCurrency(financeSummary?.totalMaterialCost || 0)} icon={<Package size={20} />}  accent="red" />
                            <StatCard title="Avg Margin"       value={`${financeSummary?.avgMargin || 0}%`}              icon={<Zap size={20} />}         accent="violet" />
                        </div>
                    </div>

                    {/* Charts row */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                        <Card className="p-5 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-600" style={{ color: 'rgb(var(--text-0))' }}>Leads Performance</p>
                                    <p className="text-xs mt-0.5" style={{ color: 'rgb(var(--text-2))' }}>Monthly acquisition velocity</p>
                                </div>
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: 'rgb(var(--color-cyan) / 0.1)', color: 'rgb(var(--color-cyan))' }}>
                                    <Activity size={16} />
                                </div>
                            </div>
                            <div className="h-56">
                                <MonthlyLeadsChart data={chartData?.timeSeriesLeads ?? []} />
                            </div>
                        </Card>

                        <Card className="p-5 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-600" style={{ color: 'rgb(var(--text-0))' }}>Revenue Trajectory</p>
                                    <p className="text-xs mt-0.5" style={{ color: 'rgb(var(--text-2))' }}>Monthly financial growth</p>
                                </div>
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: 'rgb(var(--color-info) / 0.1)', color: 'rgb(var(--color-info))' }}>
                                    <IndianRupee size={16} />
                                </div>
                            </div>
                            <div className="h-56">
                                <RevenueChart data={chartData?.timeSeriesRevenue ?? []} />
                            </div>
                        </Card>
                    </div>

                    {/* Action Center */}
                    <Card className="overflow-hidden">
                        <div className="p-5 flex items-center justify-between border-b" style={{ borderColor: 'rgb(var(--border-muted))' }}>
                            <div>
                                <p className="text-sm font-600" style={{ color: 'rgb(var(--text-0))' }}>Action Center</p>
                                <p className="text-xs mt-0.5" style={{ color: 'rgb(var(--text-2))' }}>Pending tasks requiring attention</p>
                            </div>
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        </div>
                        <TaskWidget tasks={stats?.tasks} />
                    </Card>

                </div>
            )}
        </div>
    );
};

export default DashboardPage;
