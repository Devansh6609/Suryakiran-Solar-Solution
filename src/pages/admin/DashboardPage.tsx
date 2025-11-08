import React, { useState, useEffect } from 'react';
import { Lead, User } from '../../types';
import { getVendors, getDashboardStats, getChartData } from '../../service/adminService';
import StatCard from '../../components/admin/StatCard.tsx';
import { useCrmUpdates } from '../../contexts/CrmUpdatesContext.tsx';
import Card from '../../components/admin/Card.tsx';
import MonthlyLeadsChart from '../../components/admin/charts/MonthlyLeadsChart.tsx';
import RevenueChart from '../../components/admin/charts/RevenueChart.tsx';
import LeadSourceChart from '../../components/admin/charts/LeadSourceChart.tsx';
import TaskWidget from '../../components/admin/TaskWidget.tsx';
import LoadingSpinner from '../../components/LoadingSpinner.tsx';
import { useAuth } from '../../contexts/AuthContext.tsx';

const kpiIcons = {
    totalLeads: { icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>, colorClass: 'bg-electric-blue/80 shadow-glow-sm shadow-electric-blue/50' },
    verifiedLeads: { icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, colorClass: 'bg-neon-cyan/80 shadow-glow-sm shadow-neon-cyan/50' },
    projectsWon: { icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>, colorClass: 'bg-status-green/80 shadow-glow-sm shadow-status-green/50' },
    pipelineValue: { icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>, colorClass: 'bg-status-yellow/80 shadow-glow-sm shadow-status-yellow/50' },
};

const GroupByFilter: React.FC<{ value: string, onChange: (value: string) => void }> = ({ value, onChange }) => {
    const options = ['day', 'week', 'month'];
    return (
        <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-text-secondary mb-1">Group By</label>
            <div className="flex bg-gray-100 dark:bg-primary-background border border-gray-300 dark:border-border-color rounded-lg p-1">
                {options.map(opt => (
                    <button
                        key={opt}
                        onClick={() => onChange(opt)}
                        className={`w-full text-center text-sm py-1.5 rounded-md capitalize transition-colors duration-200 ${value === opt ? 'bg-accent-blue text-white font-semibold shadow' : 'text-gray-500 dark:text-text-secondary hover:bg-gray-200 dark:hover:bg-white/5'}`}
                    >
                        {opt === 'day' ? 'daily' : `${opt}ly`}
                    </button>
                ))}
            </div>
        </div>
    );
};

const DashboardPage: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [chartData, setChartData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { lastUpdate } = useCrmUpdates();
    const { user } = useAuth();

    const [filters, setFilters] = useState({
        vendorId: 'all',
        startDate: '',
        endDate: '',
    });
    const [groupBy, setGroupBy] = useState('month');
    const [vendors, setVendors] = useState<User[]>([]);

    // Fetch vendors for master admin's filter dropdown
    useEffect(() => {
        if (user?.role === 'Master') {
            getVendors().then(setVendors).catch(err => setError('Could not load vendors.'));
        }
    }, [user]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [statsData, chartsData] = await Promise.all([
                    getDashboardStats(filters),
                    getChartData({ ...filters, groupBy })
                ]);
                setStats(statsData);
                setChartData(chartsData);
            } catch (err) {
                setError('Failed to load dashboard data.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [lastUpdate, filters, groupBy]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleResetFilters = () => {
        setFilters({
            vendorId: 'all',
            startDate: '',
            endDate: '',
        });
        setGroupBy('month');
    };

    if (loading && !stats) return (
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
            <LoadingSpinner size="lg" />
        </div>
    );
    if (error) return <div className="text-center p-8 text-error-red">{error}</div>;

    const formElementClasses = "w-full px-3 py-2 border rounded-lg bg-white dark:bg-primary-background border-gray-300 dark:border-border-color focus:ring-neon-cyan focus:border-neon-cyan text-sm text-gray-900 dark:text-text-primary";

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-text-primary mb-4 dark:text-glow">Dashboard</h2>

            <Card className="mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                    {user?.role === 'Master' && (
                        <div>
                            <label htmlFor="vendorId" className="block text-sm font-medium text-gray-600 dark:text-text-secondary mb-1">Filter by Vendor</label>
                            <select name="vendorId" id="vendorId" value={filters.vendorId} onChange={handleFilterChange} className={formElementClasses}>
                                <option value="all">All Vendors</option>
                                {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                            </select>
                        </div>
                    )}
                    <GroupByFilter value={groupBy} onChange={setGroupBy} />
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-600 dark:text-text-secondary mb-1">Start Date</label>
                        <input type="date" name="startDate" id="startDate" value={filters.startDate} onChange={handleFilterChange} className={formElementClasses} />
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-600 dark:text-text-secondary mb-1">End Date</label>
                        <input type="date" name="endDate" id="endDate" value={filters.endDate} onChange={handleFilterChange} className={formElementClasses} />
                    </div>
                    <div className="flex items-center">
                        <button onClick={handleResetFilters} className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">Reset</button>
                    </div>
                </div>
            </Card>

            {loading && stats && (
                <div className="flex justify-center my-4">
                    <div className="flex items-center space-x-2 bg-white dark:bg-glass-surface p-2 rounded-full">
                        <LoadingSpinner size="sm" /> <span className="text-xs text-gray-500 dark:text-text-secondary">Updating dashboard...</span>
                    </div>
                </div>)}

            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Total Leads" value={stats.totalLeads} {...kpiIcons.totalLeads} />
                    <StatCard title="Verified Leads" value={stats.verifiedLeads} {...kpiIcons.verifiedLeads} />
                    <StatCard title="Projects Won" value={stats.projectsWon} {...kpiIcons.projectsWon} />
                    <StatCard title="Pipeline Value" value={stats.pipelineValue} {...kpiIcons.pipelineValue} />
                </div>
            )}

            {chartData && stats && (
                <>
                    <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <Card className="lg:col-span-2">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-text-primary mb-2">Leads Over Time</h3>
                            <div className="h-64">
                                <MonthlyLeadsChart data={chartData.timeSeriesLeads} />
                            </div>
                        </Card>
                        <Card>
                            <h3 className="text-base font-semibold text-gray-900 dark:text-text-primary mb-2">Lead Sources</h3>
                            <div className="h-64">
                                <LeadSourceChart data={chartData.leadSources} />
                            </div>
                        </Card>
                    </div>

                    <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <Card className="lg:col-span-2">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-text-primary mb-2">Revenue Growth</h3>
                            <div className="h-64">
                                <RevenueChart data={chartData.timeSeriesRevenue} />
                            </div>
                        </Card>
                        <TaskWidget tasks={stats.tasks} />
                    </div>
                </>
            )}
        </div>
    );
};

export default DashboardPage;