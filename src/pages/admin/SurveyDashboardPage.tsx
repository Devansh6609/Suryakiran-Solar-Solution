import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSurveys } from '../../service/adminService';
import { generateSurveyReportPdf } from '../../service/surveyPdfGenerator';
import { useAuth } from '../../contexts/AuthContext';
import AssignSurveyModal from '../../components/admin/AssignSurveyModal';
import ReviewSurveyModal from '../../components/admin/ReviewSurveyModal';
import {
    ClipboardCheck, Search, Download, ChevronRight,
    Clock, CheckCircle2, AlertCircle, Send, MapPin
} from 'lucide-react';

type SurveyItem = any;

/* ---- Macro status mapper ---- */
const getMacroStatus = (status: string): string => {
    if (!status || ['Pending', 'Assigned'].includes(status)) return 'pending';
    if (['Engineer Accepted', 'Travelling', 'Arrived at Site', 'Started', 'Paused'].includes(status)) return 'in-progress';
    if (['Submitted', 'Under Review'].includes(status)) return 'review';
    if (status === 'Approved') return 'approved';
    if (status === 'Rejected') return 'rejected';
    return 'pending';
};

const MACRO_STYLE: Record<string, { bg: string; color: string; label: string }> = {
    'pending':     { bg: 'rgb(245 158 11 / 0.1)',  color: 'rgb(180 110 0)',   label: 'Pending' },
    'in-progress': { bg: 'rgb(59 130 246 / 0.1)',  color: 'rgb(37 99 235)',   label: 'In Progress' },
    'review':      { bg: 'rgb(139 92 246 / 0.1)',  color: 'rgb(109 40 217)',  label: 'Under Review' },
    'approved':    { bg: 'rgb(16 185 129 / 0.1)',  color: 'rgb(5 150 105)',   label: 'Approved' },
    'rejected':    { bg: 'rgb(239 68 68 / 0.1)',   color: 'rgb(185 28 28)',   label: 'Rejected' },
};

const PRIORITY_COLOR: Record<string, string> = {
    Urgent: 'rgb(239 68 68)',
    High:   'rgb(249 115 22)',
    Medium: 'rgb(245 158 11)',
    Low:    'rgb(100 116 139)',
};

const STATUS_TABS = [
    { id: 'all',         label: 'All',          macro: null },
    { id: 'pending',     label: 'Pending',       macro: 'pending' },
    { id: 'in-progress', label: 'In Progress',   macro: 'in-progress' },
    { id: 'review',      label: 'Under Review',  macro: 'review' },
    { id: 'approved',    label: 'Approved',      macro: 'approved' },
    { id: 'rejected',    label: 'Rejected',      macro: 'rejected' },
];

/* ---- Skeleton row ---- */
const SkeletonRow = () => (
    <tr>
        {[...Array(6)].map((_, i) => (
            <td key={i} className="px-4 py-3"><div className="crm-skeleton h-4 rounded" style={{ width: `${40 + (i * 12) % 55}%` }} /></td>
        ))}
    </tr>
);

/* ---- Main Component ---- */
const SurveyDashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [surveys, setSurveys] = useState<SurveyItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [search, setSearch] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [assignModal, setAssignModal] = useState<{ isOpen: boolean; survey?: SurveyItem }>({ isOpen: false });
    const [reviewModal, setReviewModal] = useState<{ isOpen: boolean; survey?: SurveyItem }>({ isOpen: false });

    const fetchSurveys = async () => {
        try {
            setLoading(true);
            const data = await getSurveys({ status: 'all', priority: priorityFilter, search });
            setSurveys(data);
        } catch { console.error('Failed to load surveys'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchSurveys(); }, [priorityFilter, search]);

    const tabCounts = useMemo(() => {
        const counts: Record<string, number> = { all: surveys.length };
        surveys.forEach(s => {
            const macro = getMacroStatus(s.status);
            counts[macro] = (counts[macro] || 0) + 1;
        });
        return counts;
    }, [surveys]);

    const filteredSurveys = useMemo(() => {
        if (activeTab === 'all') return surveys;
        return surveys.filter(s => getMacroStatus(s.status) === activeTab);
    }, [surveys, activeTab]);

    const handleDownloadPdf = (item: SurveyItem) => {
        const doc = generateSurveyReportPdf(item);
        doc.save(`Varcas_Survey_${item.surveyNo}_${(item.lead?.name || 'Customer').replace(/\s+/g, '_')}.pdf`);
    };

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
                    <p className="text-xs font-500 mb-0.5" style={{ color: 'rgb(var(--text-2))' }}>Field Operations</p>
                    <h1 className="text-2xl font-700" style={{ color: 'rgb(var(--text-0))' }}>Surveys</h1>
                </div>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: 'Total',        value: surveys.length,                icon: ClipboardCheck, color: 'rgb(6 182 212)',   bg: 'rgb(6 182 212 / 0.1)' },
                    { label: 'Pending',      value: tabCounts['pending'] || 0,     icon: Clock,          color: 'rgb(245 158 11)', bg: 'rgb(245 158 11 / 0.1)' },
                    { label: 'Under Review', value: tabCounts['review'] || 0,      icon: AlertCircle,    color: 'rgb(139 92 246)', bg: 'rgb(139 92 246 / 0.1)' },
                    { label: 'Approved',     value: tabCounts['approved'] || 0,    icon: CheckCircle2,   color: 'rgb(16 185 129)', bg: 'rgb(16 185 129 / 0.1)' },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                    <div key={label} className="crm-card p-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: bg, color }}>
                            <Icon size={18} />
                        </div>
                        <div>
                            <p className="text-[11px] font-500" style={{ color: 'rgb(var(--text-2))' }}>{label}</p>
                            <p className="text-xl font-700" style={{ color: 'rgb(var(--text-0))' }}>{value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 hide-scrollbar">
                {STATUS_TABS.map(tab => {
                    const count = tab.macro ? (tabCounts[tab.macro] || 0) : surveys.length;
                    const isActive = activeTab === tab.id;
                    const style = tab.macro ? MACRO_STYLE[tab.macro] : null;
                    return (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-500 whitespace-nowrap transition-all"
                            style={{
                                backgroundColor: isActive ? (style ? style.bg : 'rgb(var(--accent) / 0.1)') : 'transparent',
                                color: isActive ? (style ? style.color : 'rgb(var(--accent))') : 'rgb(var(--text-2))',
                                border: isActive ? `1px solid ${style ? style.color + '30' : 'rgb(var(--accent) / 0.3)'}` : '1px solid transparent',
                            }}>
                            {tab.label}
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

            {/* Search + Priority filter */}
            <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1 max-w-xs">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgb(var(--text-3))' }} />
                    <input type="text" placeholder="Search customer, survey #…" value={search}
                        onChange={e => setSearch(e.target.value)} className="crm-input pl-9" />
                </div>
                <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} style={inputStyle}>
                    <option value="all">All Priorities</option>
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                </select>
            </div>

            {/* Table */}
            <div className="crm-card overflow-visible">
                <div>
                    <table className="crm-table mobile-card-list">
                        <thead>
                            <tr>
                                <th>Customer / Survey</th>
                                <th>Engineer</th>
                                <th>Status</th>
                                <th>Priority</th>
                                <th>Scheduled</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(4)].map((_, i) => <SkeletonRow key={i} />)
                            ) : filteredSurveys.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-16">
                                        <ClipboardCheck size={32} className="mx-auto mb-3" style={{ color: 'rgb(var(--text-3))' }} />
                                        <p className="text-sm" style={{ color: 'rgb(var(--text-3))' }}>No surveys found</p>
                                    </td>
                                </tr>
                            ) : filteredSurveys.map(s => {
                                const macro = getMacroStatus(s.status);
                                const statusStyle = MACRO_STYLE[macro];
                                const isPending = macro === 'pending';
                                const isApproved = macro === 'approved';

                                return (
                                    <tr key={s.id}>
                                        {/* Customer */}
                                        <td data-label="Customer" onClick={() => navigate(`/admin/surveys/${s.id}`)} className="cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-600 flex-shrink-0"
                                                    style={{ backgroundColor: 'rgb(var(--accent) / 0.1)', color: 'rgb(var(--accent))' }}>
                                                    {s.lead?.name?.charAt(0)?.toUpperCase() || 'S'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-500" style={{ color: 'rgb(var(--text-0))' }}>
                                                        {s.lead?.name || 'Unknown'}
                                                    </p>
                                                    <p className="text-xs flex items-center gap-1" style={{ color: 'rgb(var(--text-3))' }}>
                                                        <span className="font-mono">{s.surveyNo}</span>
                                                        {s.lead?.district && <><MapPin size={10} />{s.lead.district}</>}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Engineer */}
                                        <td data-label="Engineer">
                                            {s.assignedEngineer ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-600"
                                                        style={{ backgroundColor: 'rgb(var(--color-info) / 0.1)', color: 'rgb(var(--color-info))' }}>
                                                        {s.assignedEngineer.name.charAt(0)}
                                                    </div>
                                                    <span className="text-xs" style={{ color: 'rgb(var(--text-1))' }}>{s.assignedEngineer.name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs italic" style={{ color: 'rgb(var(--text-3))' }}>Not assigned</span>
                                            )}
                                        </td>

                                        {/* Status */}
                                        <td data-label="Status">
                                            <span className="crm-badge" style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                                                {statusStyle.label}
                                            </span>
                                        </td>

                                        {/* Priority */}
                                        <td data-label="Priority">
                                            <span className="text-xs font-600"
                                                style={{ color: PRIORITY_COLOR[s.priority] || 'rgb(var(--text-3))' }}>
                                                {s.priority}
                                            </span>
                                        </td>

                                        {/* Scheduled */}
                                        <td data-label="Scheduled">
                                            {s.scheduledDate ? (
                                                <div>
                                                    <p className="text-xs font-500" style={{ color: 'rgb(var(--text-1))' }}>
                                                        {new Date(s.scheduledDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                                    </p>
                                                    {s.scheduledTime && <p className="text-[11px]" style={{ color: 'rgb(var(--text-3))' }}>{s.scheduledTime}</p>}
                                                </div>
                                            ) : (
                                                <span className="text-xs italic" style={{ color: 'rgb(var(--text-3))' }}>Not set</span>
                                            )}
                                        </td>

                                        {/* Actions */}
                                        <td data-label="Actions" style={{ textAlign: 'right' }}>
                                            <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                                                {isPending && user?.role === 'Master' && (
                                                    <button onClick={() => setAssignModal({ isOpen: true, survey: s })}
                                                        className="crm-btn-secondary text-[11px]" style={{ padding: '0.25rem 0.6rem' }}>
                                                        <Send size={12} /> Assign
                                                    </button>
                                                )}
                                                {!isApproved && (
                                                    <button onClick={() => setReviewModal({ isOpen: true, survey: s })}
                                                        className="p-1.5 rounded-lg transition-colors"
                                                        style={{ color: 'rgb(var(--color-violet))', backgroundColor: 'rgb(var(--color-violet) / 0.08)' }}
                                                        title="Review & Approve">
                                                        <CheckCircle2 size={15} />
                                                    </button>
                                                )}
                                                <button onClick={() => handleDownloadPdf(s)}
                                                    className="p-1.5 rounded-lg transition-colors"
                                                    style={{ color: 'rgb(var(--text-2))', backgroundColor: 'rgb(var(--surface-2))' }}
                                                    title="Download PDF">
                                                    <Download size={15} />
                                                </button>
                                                <button onClick={() => navigate(`/admin/surveys/${s.id}`)}
                                                    className="p-1.5 rounded-lg transition-colors"
                                                    style={{ color: 'rgb(var(--text-2))' }}
                                                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgb(var(--surface-2))'; e.currentTarget.style.color = 'rgb(var(--text-0))'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'rgb(var(--text-2))'; }}
                                                    title="View Survey">
                                                    <ChevronRight size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="px-4 py-3 border-t" style={{ borderColor: 'rgb(var(--border-muted))', backgroundColor: 'rgb(var(--surface-2))' }}>
                    <span className="text-xs font-500" style={{ color: 'rgb(var(--text-3))' }}>
                        {filteredSurveys.length} of {surveys.length} surveys
                    </span>
                </div>
            </div>

            {/* Modals */}
            {assignModal.isOpen && assignModal.survey && (
                <AssignSurveyModal
                    isOpen={assignModal.isOpen}
                    onClose={() => setAssignModal({ isOpen: false })}
                    surveyId={assignModal.survey.id}
                    surveyNo={assignModal.survey.surveyNo}
                    customerName={assignModal.survey.lead?.name || 'Customer'}
                    currentEngineerId={assignModal.survey.assignedEngineer?.id}
                    onAssigned={fetchSurveys}
                />
            )}
            {reviewModal.isOpen && reviewModal.survey && (
                <ReviewSurveyModal
                    isOpen={reviewModal.isOpen}
                    onClose={() => setReviewModal({ isOpen: false })}
                    surveyId={reviewModal.survey.id}
                    surveyNo={reviewModal.survey.surveyNo}
                    customerName={reviewModal.survey.lead?.name || 'Customer'}
                    onReviewed={fetchSurveys}
                />
            )}
        </div>
    );
};

export default SurveyDashboardPage;
