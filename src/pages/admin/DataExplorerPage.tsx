import React, { useState, useEffect, useMemo } from 'react';
import { getAllLeadsData } from '../../service/adminService';
import { Lead, CalculatorType, PipelineStage } from '../../types';
import Pagination from '../../components/admin/Pagination';
import { PIPELINE_STAGES } from '../../constants';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/admin/Card.tsx';
import ImportLeadsModal from '../../components/admin/ImportLeadsModal.tsx';
import { useCrmUpdates } from '../../contexts/CrmUpdatesContext.tsx';


const API_BASE_URL = 'http://localhost:3001';

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Hot': return 'bg-error-red/20 text-error-red';
        case 'Warm': return 'bg-warning-yellow/20 text-warning-yellow';
        case 'Cold': return 'bg-accent-blue/20 text-accent-blue';
        default: return 'bg-gray-500/20 text-text-muted';
    }
};

const getStageColor = (stage: string) => {
    if (stage.includes('Won')) return 'bg-success-green/20 text-success-green';
    if (stage.includes('Lost')) return 'bg-error-red/20 text-error-red';
    if (stage.includes('Proposal') || stage.includes('Negotiation')) return 'bg-secondary-cyan/20 text-secondary-cyan';
    return 'bg-gray-500/20 text-text-muted';
};

const SortIcon: React.FC<{ direction?: 'ascending' | 'descending' }> = ({ direction }) => {
    if (!direction) return <span className="text-gray-500">↕</span>;
    return direction === 'ascending' ? <span className="text-gray-800 dark:text-text-light">↑</span> : <span className="text-gray-800 dark:text-text-light">↓</span>;
};

// FIX: Updated SkeletonLoader to correctly use Card component with children.
const SkeletonLoader: React.FC = () => (
    <div className="animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-secondary-background rounded w-1/4 mb-6"></div>
        <Card className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="h-10 bg-gray-100 dark:bg-primary-background rounded-lg" />
                <div className="h-10 bg-gray-100 dark:bg-primary-background rounded-lg" />
                <div className="h-10 bg-gray-100 dark:bg-primary-background rounded-lg" />
                <div className="h-10 bg-gray-100 dark:bg-primary-background rounded-lg" />
            </div>
        </Card>
        <Card>
            <div className="space-y-2">
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="h-10 bg-gray-100 dark:bg-primary-background rounded"></div>
                ))}
            </div>
        </Card>
    </div>
);


const DataExplorerPage: React.FC = () => {
    const { user } = useAuth();
    const { lastUpdate, triggerUpdate } = useCrmUpdates();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ productType: 'all', pipelineStage: 'all' });
    const [sortConfig, setSortConfig] = useState<{ key: keyof Lead; direction: 'ascending' | 'descending' }>({ key: 'createdAt', direction: 'descending' });
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 15;

    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    useEffect(() => {
        getAllLeadsData()
            .then(data => setLeads(data))
            .catch(() => setError('Failed to load leads data.'))
            .finally(() => setLoading(false));
    }, [lastUpdate]);

    const filteredAndSortedLeads = useMemo(() => {
        let filtered = [...leads];

        if (searchTerm) {
            filtered = filtered.filter(lead =>
                lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lead.phone.includes(searchTerm)
            );
        }

        if (filters.productType !== 'all') {
            filtered = filtered.filter(lead => lead.productType === filters.productType);
        }

        if (filters.pipelineStage !== 'all') {
            filtered = filtered.filter(lead => lead.pipelineStage === filters.pipelineStage);
        }

        if (sortConfig.key) {
            filtered.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];
                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }

        return filtered;
    }, [leads, searchTerm, filters, sortConfig]);

    const paginatedLeads = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredAndSortedLeads.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredAndSortedLeads, currentPage]);

    const handleSort = (key: keyof Lead) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setCurrentPage(1);
    };

    const handleImportComplete = () => {
        setIsImportModalOpen(false);
        triggerUpdate(); // Refresh the data
    }

    const handleExport = () => {
        const headers = ['ID', 'Name', 'Email', 'Phone', 'Product', 'Stage', 'Score', 'Created At'];
        if (user?.role === 'Master') headers.push('Assigned Vendor');

        const rows = filteredAndSortedLeads.map(lead => {
            const row = [lead.id, lead.name, lead.email, lead.phone, lead.productType, lead.pipelineStage, lead.score, new Date(lead.createdAt).toLocaleString()];
            if (user?.role === 'Master') row.push(lead.assignedVendorName || 'Unassigned');
            return row.join(',');
        });

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "leads_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <SkeletonLoader />;
    if (error) return <div className="text-center p-8 text-error-red">{error}</div>;

    const inputBaseClass = "px-3 py-2 border rounded-lg bg-white dark:bg-primary-background border-gray-300 dark:border-border-color focus:ring-accent-blue focus:border-accent-blue";

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-text-light mb-6">Data Explorer</h2>
            <Card className="mb-6">
                <div className="flex flex-wrap items-center gap-4">
                    <input
                        type="text"
                        placeholder="Search by name, email, phone..."
                        value={searchTerm}
                        onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className={`flex-grow min-w-[200px] ${inputBaseClass}`}
                    />
                    <select name="productType" value={filters.productType} onChange={handleFilterChange} className={`flex-grow min-w-[150px] ${inputBaseClass}`}>
                        <option value="all">All Products</option>
                        <option value={CalculatorType.Rooftop}>Rooftop Solar</option>
                        <option value={CalculatorType.Pump}>Solar Pump</option>
                        <option value="Contact Inquiry">Contact Inquiry</option>
                    </select>
                    <select name="pipelineStage" value={filters.pipelineStage} onChange={handleFilterChange} className={`flex-grow min-w-[150px] ${inputBaseClass}`}>
                        <option value="all">All Stages</option>
                        {PIPELINE_STAGES.map(stage => <option key={stage} value={stage}>{stage}</option>)}
                    </select>
                    <button onClick={handleExport} className="bg-secondary-cyan/80 text-white font-bold py-2 px-4 rounded-lg hover:bg-secondary-cyan transition-colors">
                        Export CSV
                    </button>
                    {user?.role === 'Master' && (
                        <button onClick={() => setIsImportModalOpen(true)} className="bg-accent-blue text-white font-bold py-2 px-4 rounded-lg hover:bg-accent-blue-hover transition-colors">
                            Import from CSV
                        </button>
                    )}
                </div>
            </Card>

            <Card className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-border-color">
                    <thead className="bg-gray-50 dark:bg-secondary-background/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-text-muted uppercase tracking-wider cursor-pointer" onClick={() => handleSort('name')}>
                                Name <SortIcon direction={sortConfig.key === 'name' ? sortConfig.direction : undefined} />
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-text-muted uppercase tracking-wider">Product</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-text-muted uppercase tracking-wider">Stage</th>
                            {user?.role === 'Master' && (
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-text-muted uppercase tracking-wider">Assigned Vendor</th>
                            )}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-text-muted uppercase tracking-wider cursor-pointer" onClick={() => handleSort('score')}>
                                Score <SortIcon direction={sortConfig.key === 'score' ? sortConfig.direction : undefined} />
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-text-muted uppercase tracking-wider cursor-pointer" onClick={() => handleSort('createdAt')}>
                                Date <SortIcon direction={sortConfig.key === 'createdAt' ? sortConfig.direction : undefined} />
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-secondary-background divide-y divide-gray-200 dark:divide-border-color">
                        {paginatedLeads.map(lead => (
                            <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-primary-background">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900 dark:text-text-light">{lead.name}</div>
                                    <div className="text-sm text-gray-500 dark:text-text-muted">{lead.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-text-muted">{lead.productType}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStageColor(lead.pipelineStage)}`}>
                                        {lead.pipelineStage}
                                    </span>
                                </td>
                                {user?.role === 'Master' && (
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-text-muted">{lead.assignedVendorName}</td>
                                )}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(lead.scoreStatus)}`}>
                                        {lead.scoreStatus} ({lead.score})
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-text-muted">{new Date(lead.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>

            <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(filteredAndSortedLeads.length / ITEMS_PER_PAGE)}
                onPageChange={setCurrentPage}
            />

            {isImportModalOpen && (
                <ImportLeadsModal
                    onClose={() => setIsImportModalOpen(false)}
                    onImportComplete={handleImportComplete}
                />
            )}
        </div>
    );
};

export default DataExplorerPage;