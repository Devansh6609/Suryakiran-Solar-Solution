import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Lead, LeadScoreStatus, PipelineStage, User } from '../../types';
import * as adminService from '../../service/adminService';
import { PIPELINE_STAGES } from '../../constants';
import { useCrmUpdates } from '../../contexts/CrmUpdatesContext.tsx';
import { useAuth } from '../../contexts/AuthContext.tsx';
import Card from '../../components/admin/Card.tsx';
import LoadingSpinner from '../../components/LoadingSpinner.tsx';

type LeadsByStage = { [key in PipelineStage]: Lead[] };

const getStatusColor = (status: LeadScoreStatus) => {
    switch (status) {
        case 'Hot': return 'bg-status-red/20 text-status-red';
        case 'Warm': return 'bg-status-yellow/20 text-status-yellow';
        case 'Cold': return 'bg-electric-blue/20 text-electric-blue';
        default: return 'bg-gray-500/20 text-text-muted';
    }
}

const SortIcon: React.FC<{ direction?: 'ascending' | 'descending' }> = ({ direction }) => {
    if (!direction) return <span className="text-gray-400 dark:text-gray-500 inline-block w-4 h-4 text-center">↕</span>;
    return direction === 'ascending' ? <span className="text-gray-900 dark:text-text-primary">↑</span> : <span className="text-gray-900 dark:text-text-primary">↓</span>;
};

const LeadsListPage: React.FC = () => {
    const [leadsByStage, setLeadsByStage] = useState<LeadsByStage | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { lastUpdate, triggerUpdate } = useCrmUpdates();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [selectedStage, setSelectedStage] = useState<PipelineStage>(PipelineStage.NewLead);
    const [sortConfig, setSortConfig] = useState<{ key: keyof Lead; direction: 'ascending' | 'descending' }>({ key: 'createdAt', direction: 'descending' });

    const [filters, setFilters] = useState({
        assignedVendorId: 'all',
        state: 'all',
        district: 'all',
    });
    const [vendors, setVendors] = useState<User[]>([]);
    const [states, setStates] = useState<string[]>([]);
    const [districts, setDistricts] = useState<string[]>([]);

    const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
    const [bulkStage, setBulkStage] = useState('');
    const [bulkVendor, setBulkVendor] = useState('');
    const headerCheckboxRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user?.role === 'Master') {
            adminService.getVendors().then(setVendors);
            adminService.getStates().then(setStates);
        }
    }, [user]);

    useEffect(() => {
        if (filters.state && filters.state !== 'all') {
            adminService.getDistricts(filters.state).then(setDistricts);
        } else {
            setDistricts([]);
        }
    }, [filters.state]);

    useEffect(() => {
        const fetchLeads = async () => {
            try {
                setLoading(true);

                const activeFilters: Record<string, string> = {};
                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== 'all' && value !== '') activeFilters[key] = value;
                });

                const allLeads = await adminService.getLeads(activeFilters);

                const initialColumns: LeadsByStage = PIPELINE_STAGES.reduce((acc, stage) => ({ ...acc, [stage]: [] }), {} as LeadsByStage);

                const groupedLeads = allLeads.reduce((acc, lead) => {
                    if (acc[lead.pipelineStage]) acc[lead.pipelineStage].push(lead);
                    return acc;
                }, initialColumns);

                setLeadsByStage(groupedLeads);

            } catch (err) { setError('Failed to load leads.'); }
            finally { setLoading(false); }
        };
        fetchLeads();
    }, [lastUpdate, filters]);

    const sortedLeads = useMemo(() => {
        if (!leadsByStage || !leadsByStage[selectedStage]) return [];
        const leadsToSort = [...leadsByStage[selectedStage]];

        leadsToSort.sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];
            if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        });
        return leadsToSort;

    }, [leadsByStage, selectedStage, sortConfig]);

    useEffect(() => {
        if (headerCheckboxRef.current) {
            const numSelected = selectedLeads.length;
            const numSorted = sortedLeads.length;
            headerCheckboxRef.current.checked = numSelected === numSorted && numSorted > 0;
            headerCheckboxRef.current.indeterminate = numSelected > 0 && numSelected < numSorted;
        }
    }, [selectedLeads, sortedLeads]);

    const onDragEnd = async (result: DropResult) => {
        const { source, destination, draggableId } = result;
        if (!destination || !leadsByStage) return;

        const startStage = selectedStage;
        const endStageId = destination.droppableId;

        // Prevent dropping onto the list itself or back onto the same stage
        if (endStageId.startsWith('lead-list') || startStage === endStageId) return;

        const endStage = endStageId as PipelineStage;
        const originalState = { ...leadsByStage };

        const sourceLeads = Array.from(leadsByStage[startStage]);
        const movedLeadIndex = sourceLeads.findIndex(l => l.id === draggableId);
        if (movedLeadIndex < 0) return;
        const [movedLead] = sourceLeads.splice(movedLeadIndex, 1);

        const destLeads = Array.from(leadsByStage[endStage]);
        destLeads.splice(destination.index, 0, movedLead);

        setLeadsByStage({ ...leadsByStage, [startStage]: sourceLeads, [endStage]: destLeads });

        try {
            await adminService.updateLead(draggableId, { pipelineStage: endStage });
        } catch (error) {
            setError("Failed to update lead stage. Reverting change.");
            setLeadsByStage(originalState);
        }
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => {
            const newFilters = { ...prev, [name]: value };
            if (name === 'state') newFilters.district = 'all';
            return newFilters;
        });
    };

    const handleSort = (key: keyof Lead) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedLeads(sortedLeads.map(l => l.id));
        } else {
            setSelectedLeads([]);
        }
    };

    const handleSelectOne = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
        if (e.target.checked) {
            setSelectedLeads(prev => [...prev, id]);
        } else {
            setSelectedLeads(prev => prev.filter(leadId => leadId !== id));
        }
    };

    const handleBulkAction = async (action: 'changeStage' | 'assignVendor', value: string) => {
        if (!value || selectedLeads.length === 0) return;
        try {
            await adminService.performBulkLeadAction(action, value, selectedLeads);
            setSelectedLeads([]);
            setBulkStage('');
            setBulkVendor('');
            triggerUpdate(); // Force a refetch
        } catch (err) {
            setError('Failed to perform bulk action.');
        }
    };

    const formElementClasses = "px-3 py-2 border rounded-lg bg-white dark:bg-primary-background border-gray-300 dark:border-border-color focus:ring-neon-cyan focus:border-neon-cyan text-sm text-gray-900 dark:text-text-primary";

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-text-primary">Leads Pipeline</h2>
            </div>

            {user?.role === 'Master' && (
                <div className="mb-6 bg-white dark:bg-glass-surface p-4 rounded-xl border border-gray-200 dark:border-glass-border">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <select name="assignedVendorId" value={filters.assignedVendorId} onChange={handleFilterChange} className={formElementClasses}>
                            <option value="all">All Vendors</option>
                            {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                        </select>
                        <select name="state" value={filters.state} onChange={handleFilterChange} className={formElementClasses}>
                            <option value="all">All States</option>
                            {states.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <select name="district" value={filters.district} onChange={handleFilterChange} disabled={filters.state === 'all'} className={`${formElementClasses} disabled:opacity-50`}>
                            <option value="all">All Districts</option>
                            {districts.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center h-96">
                    <LoadingSpinner size="lg" />
                </div>
            )
                : error ? (<div className="text-center p-8 text-status-red">{error}</div>)
                    : leadsByStage && (
                        <DragDropContext onDragEnd={onDragEnd}>
                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
                                {PIPELINE_STAGES.map(stage => (
                                    <Droppable droppableId={stage} key={stage}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                onClick={() => { setSelectedStage(stage); setSelectedLeads([]) }}
                                                className={`p-3 rounded-lg cursor-pointer border-2 transition-all duration-300
                                            ${selectedStage === stage ? 'border-primary-green dark:border-neon-cyan bg-primary-green/10 dark:bg-neon-cyan/20 scale-105' : 'border-gray-200 dark:border-glass-border bg-gray-50 dark:bg-glass-surface hover:bg-gray-100 dark:hover:bg-white/5'}
                                            ${snapshot.isDraggingOver ? 'bg-primary-green/20 ring-2 ring-primary-green dark:bg-neon-cyan/30 dark:ring-neon-cyan' : ''}`}
                                            >
                                                <p className={`text-xs font-semibold truncate ${selectedStage === stage ? 'text-primary-green dark:text-neon-cyan' : 'text-gray-500 dark:text-text-secondary'}`}>{stage}</p>
                                                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-text-primary mt-1">{leadsByStage[stage]?.length || 0}</p>
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                ))}
                            </div>

                            <Card>
                                {selectedLeads.length > 0 && (
                                    <div className="p-4 bg-electric-blue/10 dark:bg-electric-blue/20 border-b border-electric-blue/30 flex flex-wrap items-center gap-4">
                                        <span className="text-sm font-semibold text-electric-blue dark:text-text-accent">{selectedLeads.length} selected</span>
                                        <div className="flex items-center gap-2">
                                            <select value={bulkStage} onChange={e => setBulkStage(e.target.value)} className={`${formElementClasses} py-1`}>
                                                <option value="">Change Stage...</option>
                                                {PIPELINE_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                            <button onClick={() => handleBulkAction('changeStage', bulkStage)} disabled={!bulkStage} className="px-3 py-1 text-xs font-semibold text-white bg-electric-blue rounded-md hover:bg-electric-blue-hover disabled:bg-gray-500">Apply</button>
                                        </div>
                                        {user?.role === 'Master' && (
                                            <div className="flex items-center gap-2">
                                                <select value={bulkVendor} onChange={e => setBulkVendor(e.target.value)} className={`${formElementClasses} py-1`}>
                                                    <option value="">Assign Vendor...</option>
                                                    <option value="unassigned">Unassigned</option>
                                                    {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                                </select>
                                                <button onClick={() => handleBulkAction('assignVendor', bulkVendor)} disabled={!bulkVendor} className="px-3 py-1 text-xs font-semibold text-white bg-electric-blue rounded-md hover:bg-electric-blue-hover disabled:bg-gray-500">Apply</button>
                                            </div>
                                        )}
                                        <button onClick={() => setSelectedLeads([])} className="ml-auto text-xs text-gray-600 dark:text-text-secondary hover:underline">Clear</button>
                                    </div>
                                )}

                                {/* Desktop Table View */}
                                <div className="overflow-x-auto hidden md:block">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-border-color">
                                        <thead className="bg-gray-50 dark:bg-secondary-background/50">
                                            <tr>
                                                <th className="px-4 py-3 text-left"><input type="checkbox" ref={headerCheckboxRef} onChange={handleSelectAll} className="rounded border-gray-300 dark:border-gray-600 text-electric-blue focus:ring-electric-blue dark:bg-gray-700" /></th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-text-secondary uppercase tracking-wider cursor-pointer" onClick={() => handleSort('name')}>Name <SortIcon direction={sortConfig.key === 'name' ? sortConfig.direction : undefined} /></th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-text-secondary uppercase tracking-wider">Product</th>
                                                {user?.role === 'Master' && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-text-secondary uppercase tracking-wider">Assigned To</th>}
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-text-secondary uppercase tracking-wider cursor-pointer" onClick={() => handleSort('score')}>Score <SortIcon direction={sortConfig.key === 'score' ? sortConfig.direction : undefined} /></th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-text-secondary uppercase tracking-wider cursor-pointer" onClick={() => handleSort('createdAt')}>Date <SortIcon direction={sortConfig.key === 'createdAt' ? sortConfig.direction : undefined} /></th>
                                            </tr>
                                        </thead>
                                        <Droppable droppableId="lead-list-desktop">
                                            {(provided) => (
                                                <tbody ref={provided.innerRef} {...provided.droppableProps} className="bg-white dark:bg-secondary-background divide-y divide-gray-200 dark:divide-border-color">
                                                    {sortedLeads.length > 0 ? sortedLeads.map((lead, index) => (
                                                        <Draggable key={lead.id} draggableId={lead.id} index={index}>
                                                            {(provided, snapshot) => (
                                                                <tr ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className={`cursor-grab ${snapshot.isDragging ? 'bg-electric-blue/20' : ''} ${selectedLeads.includes(lead.id) ? 'bg-electric-blue/10' : 'hover:bg-gray-50 dark:hover:bg-primary-background'}`}>
                                                                    <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={selectedLeads.includes(lead.id)} onChange={(e) => handleSelectOne(e, lead.id)} className="rounded border-gray-300 dark:border-gray-600 text-electric-blue focus:ring-electric-blue dark:bg-gray-700" /></td>
                                                                    <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => navigate(`/admin/leads/${lead.id}`)}><div className="text-sm font-medium text-gray-900 dark:text-text-primary">{lead.name || 'N/A'}</div><div className="text-sm text-gray-500 dark:text-text-secondary">{lead.email}</div></td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-text-secondary cursor-pointer" onClick={() => navigate(`/admin/leads/${lead.id}`)}>{lead.productType}</td>
                                                                    {user?.role === 'Master' && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-text-secondary cursor-pointer" onClick={() => navigate(`/admin/leads/${lead.id}`)}>{lead.assignedVendorName || 'Unassigned'}</td>}
                                                                    <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => navigate(`/admin/leads/${lead.id}`)}><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(lead.scoreStatus)}`}>{lead.scoreStatus} ({lead.score})</span></td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-text-secondary cursor-pointer" onClick={() => navigate(`/admin/leads/${lead.id}`)}>{new Date(lead.createdAt).toLocaleDateString()}</td>
                                                                </tr>
                                                            )}
                                                        </Draggable>
                                                    )) : (<tr><td colSpan={user?.role === 'Master' ? 6 : 5} className="text-center py-8 text-gray-500 dark:text-text-secondary">No leads in this stage.</td></tr>)}
                                                    {provided.placeholder}
                                                </tbody>
                                            )}
                                        </Droppable>
                                    </table>
                                </div>

                                {/* Mobile Card View */}
                                <div className="md:hidden">
                                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-border-color">
                                        <span className="text-xs font-semibold text-gray-500 dark:text-text-secondary uppercase">Sort by:</span>
                                        <div className="flex gap-2">
                                            {(['name', 'score', 'createdAt'] as const).map(key => (
                                                <button key={key} onClick={() => handleSort(key)} className={`px-2 py-1 text-xs rounded-md flex items-center gap-1 ${sortConfig.key === key ? 'bg-electric-blue/20 text-electric-blue' : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-text-secondary'}`}>
                                                    {key.replace('At', '')} {sortConfig.key === key && <SortIcon direction={sortConfig.direction} />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <Droppable droppableId="lead-list-mobile">
                                        {(provided) => (
                                            <div ref={provided.innerRef} {...provided.droppableProps}>
                                                {sortedLeads.length > 0 ? sortedLeads.map((lead, index) => (
                                                    <Draggable key={lead.id} draggableId={lead.id} index={index}>
                                                        {(provided, snapshot) => (
                                                            <div ref={provided.innerRef} {...provided.draggableProps} className={`border-b border-gray-200 dark:border-border-color ${snapshot.isDragging ? 'bg-electric-blue/20 shadow-lg' : ''} ${selectedLeads.includes(lead.id) ? 'bg-electric-blue/10' : ''}`}>
                                                                <div className="flex items-start gap-3 p-4">
                                                                    <div onClick={(e) => e.stopPropagation()} className="pt-1"><input type="checkbox" checked={selectedLeads.includes(lead.id)} onChange={(e) => handleSelectOne(e, lead.id)} className="rounded border-gray-300 dark:border-gray-600 text-electric-blue focus:ring-electric-blue dark:bg-gray-700" /></div>
                                                                    <div className="flex-grow" onClick={() => navigate(`/admin/leads/${lead.id}`)}>
                                                                        <div className="flex justify-between items-start">
                                                                            <div>
                                                                                <p className="font-bold text-gray-900 dark:text-text-primary">{lead.name}</p>
                                                                                <p className="text-xs text-gray-500 dark:text-text-secondary">{lead.email}</p>
                                                                            </div>
                                                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(lead.scoreStatus)}`}>{lead.scoreStatus} ({lead.score})</span>
                                                                        </div>
                                                                        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                                                                            <div><p className="text-gray-500 dark:text-text-muted">Product</p><p className="font-medium text-gray-800 dark:text-text-light">{lead.productType}</p></div>
                                                                            <div><p className="text-gray-500 dark:text-text-muted">Date</p><p className="font-medium text-gray-800 dark:text-text-light">{new Date(lead.createdAt).toLocaleDateString()}</p></div>
                                                                            {user?.role === 'Master' && (<div><p className="text-gray-500 dark:text-text-muted">Assigned</p><p className="font-medium text-gray-800 dark:text-text-light truncate">{lead.assignedVendorName || 'Unassigned'}</p></div>)}
                                                                        </div>
                                                                    </div>
                                                                    <div {...provided.dragHandleProps} className="pt-1 text-gray-400 dark:text-gray-500 cursor-grab"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg></div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                )) : (<div className="text-center py-8 text-sm text-gray-500 dark:text-text-secondary">No leads in this stage.</div>)}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </div>

                            </Card>
                        </DragDropContext>
                    )}
        </div>
    );
};

export default LeadsListPage;