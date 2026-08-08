import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, Plus, Search, Calendar, User as UserIcon, Trash2, Zap, IndianRupee, Building2 } from 'lucide-react';
import { getQuotations, deleteQuotation, getVendors, getQuotationById, updateQuotationStatus } from '../../service/adminService';
import { useAuth } from '../../contexts/AuthContext';
import { TableSkeleton } from '../../components/skeletons';
import LoadingSpinner from '../../components/LoadingSpinner';
import { User } from '../../types';

interface QuotationItem {
    id: string;
    quotationNo: string;
    leadId: string | null;
    clientName: string;
    clientPhone: string;
    clientEmail: string;
    systemSize: string;
    totalAmount: number;
    subsidy: number;
    netCost: number;
    version?: number;
    status?: string;
    validUntil?: string;
    createdAt: string;
    createdBy?: { id: string; name: string; email: string };
    lead?: { id: string; name: string; pipelineStage: string };
}

const QuotationsListPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [quotations, setQuotations] = useState<QuotationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [filters, setFilters] = useState({
        vendorId: 'all', search: '', startDate: '', endDate: ''
    });
    const [vendors, setVendors] = useState<User[]>([]);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    useEffect(() => {
        if (user?.role === 'Master') getVendors().then(setVendors).catch(() => {});
    }, [user]);

    const fetchQuotations = async () => {
        try {
            setLoading(true);
            const data = await getQuotations(filters);
            setQuotations(data);
        } catch (err) { setError('Failed to load quotations.'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchQuotations(); }, [filters]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleDelete = async (id: string, quoNo: string) => {
        if (!confirm(`Are you sure you want to delete quotation #${quoNo}?`)) return;
        try {
            await deleteQuotation(id);
            setQuotations(prev => prev.filter(q => q.id !== id));
        } catch (err) { alert('Failed to delete quotation.'); }
    };

    const handleDownload = async (item: QuotationItem) => {
        try {
            setDownloadingId(item.id);
            const fullDetails = await getQuotationById(item.id);
            if (fullDetails?.pdfData) {
                const link = document.createElement('a');
                link.href = fullDetails.pdfData;
                link.download = `Quotation_${item.quotationNo}_${item.clientName.replace(/\s+/g, '_')}.pdf`;
                document.body.appendChild(link); link.click(); document.body.removeChild(link);
            } else {
                navigate(`/admin/quotation/new/${item.leadId || ''}`);
            }
        } catch (err) {
            alert('Could not download stored PDF. Opening quotation generator.');
            navigate(`/admin/quotation/new/${item.leadId || ''}`);
        } finally {
            setDownloadingId(null);
        }
    };

    const totalCount = quotations.length;
    const totalValue = quotations.reduce((sum, q) => sum + (q.netCost || q.totalAmount || 0), 0);
    const avgValue = totalCount > 0 ? totalValue / totalCount : 0;

    const inputStyle = {
        backgroundColor: 'rgb(var(--surface-1))', border: '1px solid rgb(var(--border-default))',
        color: 'rgb(var(--text-0))', borderRadius: '8px', padding: '0.4rem 0.75rem', fontSize: '0.8125rem', outline: 'none',
    };

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-4 anim-fade-up">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <p className="text-xs font-500 mb-0.5" style={{ color: 'rgb(var(--text-2))' }}>Proposal Records</p>
                    <h1 className="text-2xl font-700" style={{ color: 'rgb(var(--text-0))' }}>Quotations Hub</h1>
                </div>
                <button onClick={() => navigate('/admin/quotation/new')} className="crm-btn-primary text-xs" style={{ padding: '0.45rem 0.875rem' }}>
                    <Plus size={14} /> Generate New Quotation
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                    { label: 'Total Quotations', value: totalCount, icon: FileText, color: 'rgb(139 92 246)', bg: 'rgb(139 92 246 / 0.1)' },
                    { label: 'Total Quoted Value', value: `₹${totalValue >= 10000000 ? (totalValue/10000000).toFixed(2)+'Cr' : totalValue >= 100000 ? (totalValue/100000).toFixed(2)+'L' : totalValue.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'rgb(16 185 129)', bg: 'rgb(16 185 129 / 0.1)' },
                    { label: 'Avg Proposal Deal', value: `₹${Math.round(avgValue).toLocaleString('en-IN')}`, icon: Zap, color: 'rgb(6 182 212)', bg: 'rgb(6 182 212 / 0.1)' },
                ].map((kpi, i) => (
                    <div key={i} className="crm-card p-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: kpi.bg, color: kpi.color }}>
                            <kpi.icon size={18} />
                        </div>
                        <div>
                            <p className="text-[11px] font-500" style={{ color: 'rgb(var(--text-2))' }}>{kpi.label}</p>
                            <p className="text-lg font-700 leading-tight" style={{ color: 'rgb(var(--text-0))' }}>{kpi.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="crm-card p-4 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgb(var(--text-3))' }} />
                    <input type="text" name="search" value={filters.search} onChange={handleFilterChange} placeholder="Search Customer, Quotation #..." className="crm-input pl-9 w-full" />
                </div>
                {user?.role === 'Master' && (
                    <select name="vendorId" value={filters.vendorId} onChange={handleFilterChange} style={inputStyle}>
                        <option value="all">All Vendors</option>
                        {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>
                )}
                <div className="flex gap-2 items-center">
                    <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} style={inputStyle} />
                    <span style={{ color: 'rgb(var(--text-3))' }}>-</span>
                    <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} style={inputStyle} />
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <TableSkeleton />
            ) : (
                <div className="crm-card overflow-visible">
                    <div>
                        <table className="crm-table mobile-card-list">
                        <thead>
                            <tr>
                                <th>Quotation</th>
                                <th>Customer</th>
                                <th>Size</th>
                                <th>Net Cost</th>
                                <th>Status</th>
                                <th>Generated</th>
                                <th>By</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {error ? (
                                <tr><td colSpan={8} className="text-center py-10" style={{ color: 'rgb(var(--color-danger))' }}>{error}</td></tr>
                            ) : quotations.length === 0 ? (
                                <tr><td colSpan={8} className="text-center py-12" style={{ color: 'rgb(var(--text-3))' }}>No quotations found.</td></tr>
                            ) : quotations.map(q => {
                                const handleStatusUpdate = async (newStatus: string) => {
                                    try {
                                        await updateQuotationStatus(q.id, { status: newStatus });
                                        fetchQuotations();
                                    } catch (err) { alert('Failed to update status.'); }
                                };
                                return (
                                    <tr key={q.id}>
                                        <td data-label="Quotation">
                                            <div className="font-600 text-sm" style={{ color: 'rgb(var(--accent))' }}>{q.quotationNo}</div>
                                            <div className="text-[10px]" style={{ color: 'rgb(var(--text-3))' }}>v{q.version || 1}.0</div>
                                        </td>
                                        <td data-label="Customer">
                                            <div className="font-500 text-sm" style={{ color: 'rgb(var(--text-0))' }}>{q.clientName}</div>
                                            <div className="text-xs" style={{ color: 'rgb(var(--text-3))' }}>{q.clientPhone}</div>
                                        </td>
                                        <td data-label="Size">
                                            <span className="text-xs font-500 px-2 py-0.5 rounded" style={{ backgroundColor: 'rgb(var(--color-info)/0.1)', color: 'rgb(var(--color-info))' }}>
                                                {q.systemSize || 'N/A'}
                                            </span>
                                        </td>
                                        <td data-label="Net Cost">
                                            <span className="font-600 text-sm" style={{ color: 'rgb(var(--color-success))' }}>
                                                ₹{(q.netCost || q.totalAmount).toLocaleString('en-IN')}
                                            </span>
                                        </td>
                                        <td data-label="Status">
                                            <select value={q.status || 'Sent'} onChange={e => handleStatusUpdate(e.target.value)} style={{ ...inputStyle, padding: '0.15rem 0.4rem', fontSize: '11px', fontWeight: 600 }}>
                                                <option value="Draft">Draft</option>
                                                <option value="Sent">Sent</option>
                                                <option value="Viewed">Viewed</option>
                                                <option value="Accepted">Accepted</option>
                                                <option value="Rejected">Rejected</option>
                                                <option value="Revision_Required">Revision Required</option>
                                                <option value="Converted">Converted</option>
                                            </select>
                                        </td>
                                        <td data-label="Generated">
                                            <div className="text-xs" style={{ color: 'rgb(var(--text-1))' }}>{new Date(q.createdAt).toLocaleDateString('en-IN')}</div>
                                            <div className="text-[10px]" style={{ color: 'rgb(var(--text-3))' }}>{new Date(q.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                                        </td>
                                        <td data-label="By">
                                            <div className="flex items-center gap-1.5 text-xs" style={{ color: 'rgb(var(--text-2))' }}>
                                                <Building2 size={12} /> {q.createdBy?.name || 'Admin'}
                                            </div>
                                        </td>
                                        <td data-label="Actions" style={{ textAlign: 'right' }}>
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleDownload(q)} disabled={downloadingId === q.id} className="crm-btn-secondary text-[11px]" style={{ padding: '0.25rem 0.5rem' }}>
                                                    {downloadingId === q.id ? <LoadingSpinner size="sm" /> : <Download size={13} />} PDF
                                                </button>
                                                {user?.role === 'Master' && (
                                                    <button onClick={() => handleDelete(q.id, q.quotationNo)} className="p-1.5 rounded-lg transition-colors" style={{ color: 'rgb(var(--color-danger))', backgroundColor: 'rgb(var(--color-danger)/0.1)' }}>
                                                        <Trash2 size={13} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            )}
        </div>
    );
};

export default QuotationsListPage;
