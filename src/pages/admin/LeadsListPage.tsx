import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lead, PipelineStage, User } from '../../types';
import { getLeads, getVendors, updateLead, performBulkLeadAction } from '../../service/adminService';
import { PIPELINE_STAGES, PIPELINE_STAGE_LABELS, PIPELINE_STAGE_COLORS } from '../../constants';
import { useCrmUpdates } from '../../contexts/CrmUpdatesContext';
import {
    Search, Download, ChevronRight, ArrowUpDown,
    Phone, Check, X, ChevronDown, Filter, Plus, Zap
} from 'lucide-react';
import { TableSkeleton } from '../../components/skeletons';
import { useAuth } from '../../contexts/AuthContext';

const API_BASE_URL = import.meta.env.VITE_CRM_API_URL || 'http://localhost:3001';
const ALL_STAGE_TAB = '__ALL__';

/* ---- Stage Badge ---- */
const STAGE_STYLE: Record<string, { bg: string; color: string }> = {
    'New_Lead':            { bg: 'rgb(100 116 139 / 0.12)', color: 'rgb(100 116 139)' },
    'Survey':              { bg: 'rgb(245 158 11 / 0.12)',  color: 'rgb(180 110 0)' },
    'Quotation_Sent':      { bg: 'rgb(59 130 246 / 0.12)',  color: 'rgb(37 99 235)' },
    'Customer_Approved':   { bg: 'rgb(139 92 246 / 0.12)', color: 'rgb(109 40 217)' },
    'Material_Dispatched': { bg: 'rgb(249 115 22 / 0.12)', color: 'rgb(194 65 12)' },
    'Installation':        { bg: 'rgb(6 182 212 / 0.12)',  color: 'rgb(8 145 178)' },
    'Completed':           { bg: 'rgb(16 185 129 / 0.12)', color: 'rgb(5 150 105)' },
    'Lost':                { bg: 'rgb(239 68 68 / 0.12)',   color: 'rgb(185 28 28)' },
};

const StageBadge = ({ stage }: { stage: string }) => {
    const s = STAGE_STYLE[stage] || { bg: 'rgb(100 116 139 / 0.12)', color: 'rgb(100 116 139)' };
    const safeStage = stage || 'Unknown';
    const label = (PIPELINE_STAGE_LABELS[safeStage] || safeStage).replace(/[^\w\s]/g, '').trim();
    return (
        <span className="crm-badge" style={{ backgroundColor: s.bg, color: s.color }}>
            {label}
        </span>
    );
};

const ScoreBadge = ({ status }: { status: string }) => {
    const map: Record<string, { bg: string; color: string }> = {
        Hot:  { bg: 'rgb(239 68 68 / 0.1)', color: 'rgb(185 28 28)' },
        Warm: { bg: 'rgb(249 115 22 / 0.1)', color: 'rgb(194 65 12)' },
        Cold: { bg: 'rgb(100 116 139 / 0.1)', color: 'rgb(71 85 105)' },
    };
    const s = map[status] || map.Cold;
    return <span className="crm-badge" style={{ backgroundColor: s.bg, color: s.color }}>{status || 'Cold'}</span>;
};


/* ---- Main Component ---- */
const LeadsListPage: React.FC = () => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { lastUpdate, triggerUpdate } = useCrmUpdates();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [activeStage, setActiveStage] = useState<string>(ALL_STAGE_TAB);
    const [search, setSearch] = useState('');
    const [vendorFilter, setVendorFilter] = useState('all');
    const [vendors, setVendors] = useState<User[]>([]);
    const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
    const [bulkStageVal, setBulkStageVal] = useState('');
    const [sortKey, setSortKey] = useState<'createdAt' | 'name' | 'pipelineStage'>('createdAt');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    const [stageMenuLeadId, setStageMenuLeadId] = useState<string | null>(null);
    const headerCheckRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user?.role === 'Master') getVendors().then(setVendors).catch(() => {});
    }, [user]);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const filters: Record<string, string> = {};
                if (vendorFilter !== 'all') filters.assignedVendorId = vendorFilter;
                const data = await getLeads(filters);
                setLeads(data);
            } catch { setError('Failed to load leads.'); }
            finally { setLoading(false); }
        };
        load();
    }, [lastUpdate, vendorFilter]);

    const stageCounts = useMemo(() => {
        const counts: Record<string, number> = { [ALL_STAGE_TAB]: leads.length };
        PIPELINE_STAGES.forEach(s => { counts[s] = 0; });
        leads.forEach(l => {
            const s = l.pipelineStage as string;
            counts[s] = (counts[s] || 0) + 1;
        });
        return counts;
    }, [leads]);

    const filteredLeads = useMemo(() => {
        let result = activeStage === ALL_STAGE_TAB ? leads : leads.filter(l => (l.pipelineStage as string) === activeStage);
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(l =>
                l.name?.toLowerCase().includes(q) || l.phone?.includes(q) ||
                l.email?.toLowerCase().includes(q) || l.district?.toLowerCase().includes(q)
            );
        }
        return [...result].sort((a, b) => {
            const av: any = a[sortKey], bv: any = b[sortKey];
            if (!av) return 1; if (!bv) return -1;
            return (av < bv ? -1 : av > bv ? 1 : 0) * (sortDir === 'asc' ? 1 : -1);
        });
    }, [leads, activeStage, search, sortKey, sortDir]);

    const toggleSort = (key: typeof sortKey) => {
        if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortKey(key); setSortDir('asc'); }
    };

    const handleStageChange = async (leadId: string, newStage: string) => {
        setStageMenuLeadId(null);
        try { await updateLead(leadId, { pipelineStage: newStage }); triggerUpdate(); }
        catch { setError('Failed to update stage.'); }
    };

    const handleBulkAction = async () => {
        if (!selectedLeads.length || !bulkStageVal) return;
        try {
            await performBulkLeadAction('changeStage', bulkStageVal, selectedLeads);
            triggerUpdate(); setSelectedLeads([]); setBulkStageVal('');
        } catch { setError('Bulk action failed.'); }
    };

    const allSelected = filteredLeads.length > 0 && filteredLeads.every(l => selectedLeads.includes(l.id));
    const someSelected = filteredLeads.some(l => selectedLeads.includes(l.id));
    useEffect(() => {
        if (headerCheckRef.current) headerCheckRef.current.indeterminate = someSelected && !allSelected;
    }, [someSelected, allSelected]);

    const tabStages = [ALL_STAGE_TAB, ...PIPELINE_STAGES];

    const inputStyle = {
        backgroundColor: 'rgb(var(--surface-1))',
        border: '1px solid rgb(var(--border-default))',
        color: 'rgb(var(--text-0))',
        borderRadius: '8px',
        padding: '0.4rem 0.75rem',
        fontSize: '0.8125rem',
        outline: 'none',
    };

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-4 anim-fade-up">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <p className="text-xs font-500 mb-0.5" style={{ color: 'rgb(var(--text-2))' }}>Sales Pipeline</p>
                    <h1 className="text-2xl font-700" style={{ color: 'rgb(var(--text-0))' }}>Leads</h1>
                </div>
                <div className="flex items-center gap-2">
                    <a href={`${API_BASE_URL}/api/admin/leads/export`} target="_blank" rel="noreferrer"
                        className="crm-btn-secondary text-xs" style={{ padding: '0.45rem 0.875rem' }}>
                        <Download size={14} /> Export
                    </a>
                    <button onClick={() => navigate('/admin/leads/manual')} className="crm-btn-primary text-xs"
                        style={{ padding: '0.45rem 0.875rem' }}>
                        <Plus size={14} /> Add Lead
                    </button>
                </div>
            </div>

            {/* Stage Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 hide-scrollbar">
                {tabStages.map(stage => {
                    const label = stage === ALL_STAGE_TAB ? 'All' : (PIPELINE_STAGE_LABELS[stage] || stage).replace(/[^\w\s]/g, '').trim();
                    const count = stageCounts[stage] || 0;
                    const isActive = activeStage === stage;
                    const stageStyle = stage !== ALL_STAGE_TAB ? STAGE_STYLE[stage] : null;
                    return (
                        <button key={stage} onClick={() => { setActiveStage(stage); setSelectedLeads([]); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-500 whitespace-nowrap transition-all"
                            style={{
                                backgroundColor: isActive
                                    ? (stageStyle ? stageStyle.bg : 'rgb(var(--accent) / 0.1)')
                                    : 'transparent',
                                color: isActive
                                    ? (stageStyle ? stageStyle.color : 'rgb(var(--accent))')
                                    : 'rgb(var(--text-2))',
                                border: isActive
                                    ? `1px solid ${stageStyle ? stageStyle.color + '40' : 'rgb(var(--accent) / 0.3)'}`
                                    : '1px solid transparent',
                            }}>
                            {label}
                            {count > 0 && (
                                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-600"
                                    style={{ backgroundColor: 'rgb(var(--surface-2))', color: 'rgb(var(--text-2))' }}>
                                    {count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1 max-w-xs">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgb(var(--text-3))' }} />
                    <input type="text" placeholder="Search name, phone, email…" value={search}
                        onChange={e => setSearch(e.target.value)} className="crm-input pl-9" />
                </div>
                {user?.role === 'Master' && (
                    <select value={vendorFilter} onChange={e => setVendorFilter(e.target.value)} style={inputStyle}>
                        <option value="all">All Vendors</option>
                        {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>
                )}
                <button onClick={() => { const k = ['createdAt', 'name', 'pipelineStage'] as const; toggleSort(k[(k.indexOf(sortKey) + 1) % k.length]); }}
                    title="Toggle sort" className="crm-btn-secondary px-3">
                    <ArrowUpDown size={14} />
                </button>
            </div>

            {/* Bulk Action Bar */}
            {selectedLeads.length > 0 && (
                <div className="flex flex-wrap items-center gap-3 px-4 py-2.5 rounded-xl border anim-fade-in"
                    style={{ backgroundColor: 'rgb(var(--accent) / 0.08)', borderColor: 'rgb(var(--accent) / 0.25)', color: 'rgb(var(--accent))' }}>
                    <Zap size={14} />
                    <span className="text-sm font-600">{selectedLeads.length} selected</span>
                    <div className="flex items-center gap-2 ml-auto">
                        <select value={bulkStageVal} onChange={e => setBulkStageVal(e.target.value)} style={{ ...inputStyle, minWidth: '160px' }}>
                            <option value="">Move to stage…</option>
                            {PIPELINE_STAGES.map(s => <option key={s} value={s}>{(PIPELINE_STAGE_LABELS[s] || s).replace(/[^\w\s]/g, '').trim()}</option>)}
                        </select>
                        <button onClick={handleBulkAction} disabled={!bulkStageVal} className="crm-btn-primary text-xs disabled:opacity-40">Apply</button>
                        <button onClick={() => setSelectedLeads([])} className="p-1.5 rounded-lg transition-colors"
                            style={{ color: 'rgb(var(--text-2))' }}>
                            <X size={14} />
                        </button>
                    </div>
                </div>
            )}

            {/* Table */}
            {loading ? (
                <TableSkeleton />
            ) : (
                <div className="crm-card overflow-visible">
                    <div>
                        <table className="crm-table mobile-card-list">
                            <thead>
                                <tr>
                                    <th style={{ width: 44 }}>
                                        <input ref={headerCheckRef} type="checkbox" checked={allSelected}
                                            onChange={e => setSelectedLeads(e.target.checked ? filteredLeads.map(l => l.id) : [])}
                                            className="rounded" style={{ accentColor: 'rgb(var(--accent))' }} />
                                    </th>
                                    <th onClick={() => toggleSort('name')} className="cursor-pointer select-none">
                                        <span className="flex items-center gap-1">Customer <ArrowUpDown size={11} /></span>
                                    </th>
                                    <th>Phone</th>
                                    <th onClick={() => toggleSort('pipelineStage')} className="cursor-pointer select-none">Stage</th>
                                    <th>Vendor</th>
                                    <th>Score</th>
                                    <th style={{ width: 50 }} />
                                </tr>
                            </thead>
                            <tbody>
                                {error ? (
                                    <tr><td colSpan={7} className="text-center py-10" style={{ color: 'rgb(var(--color-danger))' }}>{error}</td></tr>
                                ) : filteredLeads.length === 0 ? (
                                    <tr><td colSpan={7} className="text-center py-16" style={{ color: 'rgb(var(--text-3))' }}>No leads found</td></tr>
                                ) : filteredLeads.map(lead => (
                                    <tr key={lead.id} className={selectedLeads.includes(lead.id) ? '' : ''}
                                        style={selectedLeads.includes(lead.id) ? { backgroundColor: 'rgb(var(--accent) / 0.04)' } : {}}>
                                        <td data-label="" onClick={e => e.stopPropagation()}>
                                            <input type="checkbox" checked={selectedLeads.includes(lead.id)}
                                                onChange={e => setSelectedLeads(prev => e.target.checked ? [...prev, lead.id] : prev.filter(id => id !== lead.id))}
                                                className="rounded" style={{ accentColor: 'rgb(var(--accent))' }} />
                                        </td>
                                        <td data-label="Customer" onClick={() => navigate(`/admin/leads/${lead.id}`)}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-600 flex-shrink-0"
                                                    style={{ backgroundColor: 'rgb(var(--accent) / 0.1)', color: 'rgb(var(--accent))' }}>
                                                    {lead.name?.charAt(0)?.toUpperCase() || '?'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-500 leading-tight" style={{ color: 'rgb(var(--text-0))' }}>{lead.name || 'Unknown'}</p>
                                                    <p className="text-xs" style={{ color: 'rgb(var(--text-3))' }}>{lead.district || lead.email || '—'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td data-label="Phone">
                                            <span className="flex items-center gap-1.5 text-sm" style={{ color: 'rgb(var(--text-1))' }}>
                                                <Phone size={12} style={{ color: 'rgb(var(--text-3))' }} />
                                                {lead.phone || '—'}
                                            </span>
                                        </td>
                                        <td data-label="Stage" onClick={e => e.stopPropagation()}>
                                            <div className="relative">
                                                <button onClick={() => setStageMenuLeadId(stageMenuLeadId === lead.id ? null : lead.id)}
                                                    className="flex items-center gap-1 hover:opacity-80 transition-opacity">
                                                    <StageBadge stage={lead.pipelineStage} />
                                                    <ChevronDown size={11} style={{ color: 'rgb(var(--text-3))' }} />
                                                </button>
                                                {stageMenuLeadId === lead.id && (
                                                    <div className="absolute left-0 top-7 z-50 w-52 rounded-xl border py-1 shadow-xl"
                                                        style={{ backgroundColor: 'rgb(var(--surface-1))', borderColor: 'rgb(var(--border-strong))', boxShadow: 'var(--shadow-lg)' }}>
                                                        {PIPELINE_STAGES.map(s => (
                                                            <button key={s} onClick={() => handleStageChange(lead.id, s)}
                                                                className="w-full text-left px-3 py-2 text-xs font-500 flex items-center justify-between transition-colors"
                                                                style={{ color: (lead.pipelineStage as string) === s ? 'rgb(var(--accent))' : 'rgb(var(--text-1))' }}
                                                                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgb(var(--surface-2))'}
                                                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                                                {(PIPELINE_STAGE_LABELS[s] || s).replace(/[^\w\s]/g, '').trim()}
                                                                {(lead.pipelineStage as string) === s && <Check size={12} />}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td data-label="Vendor" onClick={() => navigate(`/admin/leads/${lead.id}`)}>
                                            <span className="text-sm" style={{ color: 'rgb(var(--text-2))' }}>
                                                {lead.assignedVendorName || <span style={{ color: 'rgb(var(--text-3))' }}>Unassigned</span>}
                                            </span>
                                        </td>
                                        <td data-label="Score" onClick={() => navigate(`/admin/leads/${lead.id}`)}>
                                            <ScoreBadge status={lead.scoreStatus} />
                                        </td>
                                        <td>
                                            <button onClick={() => navigate(`/admin/leads/${lead.id}`)}
                                                className="p-1.5 rounded-lg transition-colors"
                                                style={{ color: 'rgb(var(--text-3))' }}
                                                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgb(var(--surface-2))'; e.currentTarget.style.color = 'rgb(var(--text-0))'; }}
                                                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'rgb(var(--text-3))'; }}>
                                                <ChevronRight size={15} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Footer */}
                    <div className="px-4 py-3 border-t flex items-center justify-between"
                        style={{ borderColor: 'rgb(var(--border-muted))', backgroundColor: 'rgb(var(--surface-2))' }}>
                        <span className="text-xs font-500" style={{ color: 'rgb(var(--text-3))' }}>
                            {filteredLeads.length} of {leads.length} leads
                        </span>
                    </div>
                </div>
            )}

            {/* Overlay to close stage dropdown */}
            {stageMenuLeadId && <div className="fixed inset-0 z-40" onClick={() => setStageMenuLeadId(null)} />}
        </div>
    );
};

export default LeadsListPage;