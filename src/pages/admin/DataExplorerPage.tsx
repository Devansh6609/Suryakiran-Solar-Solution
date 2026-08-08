import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllLeadsData } from '../../service/adminService';
import { Lead, CalculatorType } from '../../types';
import Pagination from '../../components/admin/Pagination';
import { PIPELINE_STAGES } from '../../constants';
import { useAuth } from '../../contexts/AuthContext';
import ImportLeadsModal from '../../components/admin/ImportLeadsModal';
import { useCrmUpdates } from '../../contexts/CrmUpdatesContext';
import { Database, Search, Download, Upload, ChevronUp, ChevronDown } from 'lucide-react';
import { TableSkeleton } from '../../components/skeletons';

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Hot': return { bg: 'rgb(var(--color-danger)/0.1)', color: 'rgb(var(--color-danger))' };
        case 'Warm': return { bg: 'rgb(var(--color-warning)/0.1)', color: 'rgb(var(--color-warning))' };
        case 'Cold': return { bg: 'rgb(var(--color-info)/0.1)', color: 'rgb(var(--color-info))' };
        default: return { bg: 'rgb(var(--surface-2))', color: 'rgb(var(--text-2))' };
    }
};

const getStageColor = (stage: string) => {
    if (stage.includes('Won') || stage.includes('Completed')) return { bg: 'rgb(var(--color-success)/0.1)', color: 'rgb(var(--color-success))' };
    if (stage.includes('Lost')) return { bg: 'rgb(var(--color-danger)/0.1)', color: 'rgb(var(--color-danger))' };
    if (stage.includes('Quotation')) return { bg: 'rgb(var(--color-info)/0.1)', color: 'rgb(var(--color-info))' };
    return { bg: 'rgb(var(--surface-2))', color: 'rgb(var(--text-2))' };
};

const SortIcon: React.FC<{ direction?: 'ascending' | 'descending' }> = ({ direction }) => {
    if (!direction) return <span className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 text-[10px]">↕</span>;
    return direction === 'ascending' ? <ChevronUp size={12} className="ml-1 inline-block" /> : <ChevronDown size={12} className="ml-1 inline-block" />;
};



const DataExplorerPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
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
                lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lead.phone?.includes(searchTerm)
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

                if (aValue === bValue) return 0;
                if (aValue === null || aValue === undefined) return 1;
                if (bValue === null || bValue === undefined) return -1;

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
        triggerUpdate();
    }

    const handleExport = () => {
        const headers = ['Name', 'Email', 'Phone', 'Product', 'Vendor', 'Stage', 'Amount'];
        const rows = filteredAndSortedLeads.map(lead => {
            const amount = lead.customFields?.bill || lead.customFields?.energyCost || '-';
            const vendor = lead.assignedVendorName || 'Unassigned';
            return [
                `"${lead.name}"`, `"${lead.email}"`, `"${lead.phone}"`,
                `"${lead.productType}"`, `"${vendor}"`, `"${lead.pipelineStage}"`, `"${amount}"`
            ].join(',');
        });
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <div className="p-4 md:p-6 max-w-7xl mx-auto"><TableSkeleton /></div>;
    if (error) return <div className="text-center p-8 font-600" style={{ color: 'rgb(var(--color-danger))' }}>{error}</div>;

    const inputClasses = "w-full pl-9 pr-4 py-2 bg-[rgb(var(--surface-1))] border border-[rgb(var(--border-default))] rounded-lg text-sm text-[rgb(var(--text-0))] focus:border-[rgb(var(--accent))] outline-none";
    const selectClasses = "w-full pl-3 pr-8 py-2 bg-[rgb(var(--surface-1))] border border-[rgb(var(--border-default))] rounded-lg text-sm text-[rgb(var(--text-0))] focus:border-[rgb(var(--accent))] outline-none appearance-none cursor-pointer";

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-4 anim-fade-up">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 text-xs font-600 mb-0.5" style={{ color: 'rgb(var(--color-info))' }}>
                        <Database size={14} /> Data Center
                    </div>
                    <h1 className="text-2xl font-700" style={{ color: 'rgb(var(--text-0))' }}>Data Explorer</h1>
                </div>
            </div>

            {/* Filter Controls */}
            <div className="crm-card p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    <div className="relative lg:col-span-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={14} style={{ color: 'rgb(var(--text-3))' }} />
                        <input type="text" placeholder="Search name, email, phone..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} className={inputClasses} />
                    </div>

                    <div className="relative">
                        <select name="productType" value={filters.productType} onChange={handleFilterChange} className={selectClasses}>
                            <option value="all">All Products</option>
                            <option value={CalculatorType.Rooftop}>Rooftop Solar</option>
                            <option value={CalculatorType.Pump}>Solar Pump</option>
                            <option value="Contact Inquiry">Contact Inquiry</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" size={14} style={{ color: 'rgb(var(--text-3))' }} />
                    </div>

                    <div className="relative">
                        <select name="pipelineStage" value={filters.pipelineStage} onChange={handleFilterChange} className={selectClasses}>
                            <option value="all">All Stages</option>
                            {PIPELINE_STAGES.map(stage => <option key={stage} value={stage}>{stage}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" size={14} style={{ color: 'rgb(var(--text-3))' }} />
                    </div>

                    <div className="flex gap-2">
                        <button onClick={handleExport} className="crm-btn-secondary flex-1 py-2 justify-center text-xs">
                            <Download size={14} /> EXPORT
                        </button>
                        {user?.role === 'Master' && (
                            <button onClick={() => setIsImportModalOpen(true)} className="crm-btn-primary flex-1 py-2 justify-center text-xs">
                                <Upload size={14} /> IMPORT
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="crm-card overflow-visible">
                <div>
                    <table className="crm-table mobile-card-list">
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('name')} className="cursor-pointer group select-none">
                                    <div className="flex items-center">Name <SortIcon direction={sortConfig.key === 'name' ? sortConfig.direction : undefined} /></div>
                                </th>
                                <th>Product</th>
                                <th>Stage</th>
                                {user?.role === 'Master' && <th>Vendor</th>}
                                <th onClick={() => handleSort('score')} className="cursor-pointer group select-none">
                                    <div className="flex items-center">Score <SortIcon direction={sortConfig.key === 'score' ? sortConfig.direction : undefined} /></div>
                                </th>
                                <th onClick={() => handleSort('createdAt')} className="cursor-pointer group select-none">
                                    <div className="flex items-center">Date <SortIcon direction={sortConfig.key === 'createdAt' ? sortConfig.direction : undefined} /></div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedLeads.map(lead => {
                                const stStyle = getStageColor(lead.pipelineStage as string);
                                const scStyle = getStatusColor(lead.scoreStatus);
                                return (
                                <tr key={lead.id} onClick={() => navigate(`/admin/leads/${lead.id}`)}>
                                    <td data-label="Name">
                                        <div className="font-600" style={{ color: 'rgb(var(--text-0))' }}>{lead.name}</div>
                                        <div className="text-xs" style={{ color: 'rgb(var(--text-3))' }}>{lead.email}</div>
                                    </td>
                                    <td data-label="Product" className="text-sm font-600" style={{ color: 'rgb(var(--text-1))' }}>
                                        {lead.productType}
                                    </td>
                                    <td data-label="Stage">
                                        <span className="crm-badge" style={{ backgroundColor: stStyle.bg, color: stStyle.color }}>
                                            {lead.pipelineStage}
                                        </span>
                                    </td>
                                    {user?.role === 'Master' && (
                                        <td data-label="Vendor">
                                            {lead.assignedVendorName ? (
                                                <span className="text-sm font-500" style={{ color: 'rgb(var(--text-1))' }}>{lead.assignedVendorName}</span>
                                            ) : (
                                                <span className="text-xs italic" style={{ color: 'rgb(var(--text-3))' }}>Unassigned</span>
                                            )}
                                        </td>
                                    )}
                                    <td data-label="Score">
                                        <span className="crm-badge" style={{ backgroundColor: scStyle.bg, color: scStyle.color }}>
                                            {lead.scoreStatus} ({lead.score})
                                        </span>
                                    </td>
                                    <td data-label="Date">
                                        <span className="text-sm" style={{ color: 'rgb(var(--text-2))' }}>
                                            {new Date(lead.createdAt).toLocaleDateString()}
                                        </span>
                                    </td>
                                </tr>
                            )})}
                            {paginatedLeads.length === 0 && (
                                <tr>
                                    <td colSpan={user?.role === 'Master' ? 6 : 5} className="py-12 text-center">
                                        <Database size={32} className="mx-auto mb-3 opacity-30" style={{ color: 'rgb(var(--text-3))' }} />
                                        <p className="text-sm font-500" style={{ color: 'rgb(var(--text-2))' }}>No leads found matching your criteria.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {filteredAndSortedLeads.length > ITEMS_PER_PAGE && (
                <div className="flex justify-center mt-4">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={Math.ceil(filteredAndSortedLeads.length / ITEMS_PER_PAGE)}
                        onPageChange={setCurrentPage}
                    />
                </div>
            )}

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