import React, { useState, useEffect, FormEvent, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Lead, LeadDocument, PipelineStage, FormField, User } from '../../types';
import { getLeadDetails, getFormSchema, getVendors, updateLead, addLeadNote, uploadDocument, deleteLead, deleteDocument, getLeadLifecycle } from '../../service/adminService';
import { PIPELINE_STAGES } from '../../constants';
import {
    Trash2, ClipboardCheck, Edit2, Save, X, ArrowLeft,
    User as UserIcon, Phone, Mail, Calendar, Activity, 
    ShieldCheck, Download, Plus, ChevronRight, Send, Eye, FileText
} from 'lucide-react';
import HorizontalPipelineTracker from '../../components/admin/HorizontalPipelineTracker';
import StageDetailDrawer from '../../components/admin/StageDetailDrawer';
import ImmutableActivityTimeline from '../../components/admin/ImmutableActivityTimeline';
import AssignSurveyModal from '../../components/admin/AssignSurveyModal';
import LeadFinanceTab from '../../components/admin/LeadFinanceTab';
import { useAuth } from '../../contexts/AuthContext';
import { useCrmUpdates } from '../../contexts/CrmUpdatesContext';
import DeleteConfirmationModal from '../../components/admin/DeleteConfirmationModal';
import { DocumentPreviewModal } from '../../components/ui/DocumentPreviewModal';
import { DetailSkeleton } from '../../components/skeletons';


const API_BASE_URL = import.meta.env.VITE_CRM_API_URL || 'http://localhost:3001';

const DetailItem: React.FC<{
    label: string, value: any, isImage?: boolean, onView?: (url: string) => void, onDelete?: (val: string) => void, canDelete?: boolean, onUpload?: (file: File) => void
}> = ({ label, value, isImage = false, onView, onDelete, canDelete = false, onUpload }) => (
    <div className="crm-card p-4 transition-all hover:border-[rgb(var(--accent))]">
        <dl>
            <dt className="text-[10px] font-700 uppercase tracking-widest mb-1" style={{ color: 'rgb(var(--text-2))' }}>{label}</dt>
            <dd className="text-sm font-600 flex items-center justify-between gap-2 flex-wrap" style={{ color: 'rgb(var(--text-0))' }}>
                {isImage ? (
                    value ? (
                        <div className="flex items-center gap-2">
                            <button onClick={() => onView?.(value.startsWith('http') ? value : `${API_BASE_URL}/files/${value}`)} className="crm-btn-primary text-xs" style={{ padding: '0.2rem 0.5rem' }}>
                                <ClipboardCheck size={14} /> View
                            </button>
                            {canDelete && onDelete && (
                                <button onClick={() => onDelete(value)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-all">
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    ) : (
                        onUpload ? (
                            <label className="cursor-pointer crm-btn-secondary text-xs flex items-center gap-2" style={{ padding: '0.2rem 0.5rem', borderStyle: 'dashed' }}>
                                <span>+ Upload</span>
                                <input type="file" className="hidden" onChange={(e) => { if (e.target.files?.[0]) onUpload(e.target.files[0]); }} />
                            </label>
                        ) : <span className="italic font-500" style={{ color: 'rgb(var(--text-3))' }}>No File</span>
                    )
                ) : (
                    <span className="truncate max-w-full">{String(value || 'N/A')}</span>
                )}
            </dd>
        </dl>
    </div>
);

const LeadDetailPage: React.FC = () => {
    const { leadId } = useParams<{ leadId: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { triggerUpdate } = useCrmUpdates();
    const [lead, setLead] = useState<Lead | null>(null);
    const [formSchema, setFormSchema] = useState<Map<string, string>>(new Map());
    const [vendors, setVendors] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newNote, setNewNote] = useState('');
    const [isSubmittingNote, setIsSubmittingNote] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<any>({});
    const [isSaving, setIsSaving] = useState(false);

    const openPreview = (url: string) => { setPreviewUrl(url); setIsPreviewOpen(true); };

    const handleEditClick = () => {
        setEditData({
            name: lead?.name, email: lead?.email, phone: lead?.phone, productType: lead?.productType, fatherName: lead?.fatherName, district: lead?.district, tehsil: lead?.tehsil, village: lead?.village, hp: lead?.hp, connectionType: lead?.connectionType, customFields: { ...(lead?.customFields || {}) }
        });
        setIsEditing(true);
    };

    const handleCancelEdit = () => { setIsEditing(false); setEditData({}); };

    const handleSaveEdit = async () => {
        if (!leadId) return;
        setIsSaving(true);
        try {
            const updatePayload = {
                name: editData.name, email: editData.email, phone: editData.phone, productType: editData.productType, fatherName: editData.fatherName, district: editData.district, tehsil: editData.tehsil, village: editData.village, hp: editData.hp, connectionType: editData.connectionType, customFields: editData.customFields
            };
            const updatedLead = await updateLead(leadId, updatePayload);
            setLead(updatedLead); setIsEditing(false); alert('Lead details updated successfully!');
        } catch (err) { alert('Failed to update lead details.'); }
        finally { setIsSaving(false); }
    };

    const handleEditChange = (field: string, value: any, isCustom: boolean = false) => {
        if (isCustom) {
            setEditData((prev: any) => ({ ...prev, customFields: { ...prev.customFields, [field]: value } }));
        } else {
            setEditData((prev: any) => ({ ...prev, [field]: value }));
        }
    };

    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchLeadDetails = async () => {
        if (!leadId) return;
        try {
            setLoading(true);
            const data = await getLeadDetails(leadId);
            setLead(data);
            if (data.productType && data.productType !== 'Contact Inquiry') {
                const schemaData: FormField[] = await getFormSchema(data.productType);
                const schemaMap = new Map();
                schemaData.forEach(field => schemaMap.set(field.name, field.type));
                setFormSchema(schemaMap);
            }
            if (user?.role === 'Master') { const vendorData = await getVendors(); setVendors(vendorData); }
        } catch (err) { setError('Failed to load lead details.'); }
        finally { setLoading(false); }
    };

    const [lifecycleData, setLifecycleData] = useState<any>(null);
    const [selectedStageForDrawer, setSelectedStageForDrawer] = useState<PipelineStage | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

    const fetchLifecycle = async () => {
        if (!leadId) return;
        try { const lc = await getLeadLifecycle(leadId); setLifecycleData(lc); } catch (err) { console.error(err); }
    };

    useEffect(() => { if (leadId) { fetchLeadDetails(); fetchLifecycle(); } }, [leadId, user]);

    useEffect(() => {
        if (lead) {
            setEditData({
                name: lead.name, email: lead.email, phone: lead.phone, productType: lead.productType, fatherName: lead.fatherName, district: lead.district, tehsil: lead.tehsil, village: lead.village, hp: lead.hp, connectionType: lead.connectionType, customFields: typeof lead.customFields === 'string' ? JSON.parse(lead.customFields || '{}') : (lead.customFields || {})
            });
        }
    }, [lead]);

    const refreshLead = async () => {
        if (!leadId) return;
        try { const data = await getLeadDetails(leadId); setLead(data); } catch (err) { console.error(err); }
    };

    const handleVendorAssign = async (vendorId: string) => {
        if (!leadId) return;
        try {
            const updatedLead = await updateLead(leadId, { assignedVendorId: vendorId });
            setLead(prev => prev ? { ...prev, ...updatedLead, documents: updatedLead.documents || prev.documents || [], notes: updatedLead.notes || prev.notes || [], activityLog: updatedLead.activityLog || prev.activityLog || [], assignedTo: updatedLead.assignedTo || prev.assignedTo } : updatedLead);
        } catch (err) { alert('Failed to assign vendor.'); await refreshLead(); }
    };

    const handleAddNote = async (e: FormEvent) => {
        e.preventDefault();
        if (!leadId || !newNote.trim()) return;
        setIsSubmittingNote(true);
        try { await addLeadNote(leadId, newNote); setNewNote(''); await refreshLead(); }
        catch (err) { alert('Failed to add note.'); }
        finally { setIsSubmittingNote(false); }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!leadId || !e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        try { await uploadDocument(leadId, file); await refreshLead(); alert('File uploaded successfully!'); }
        catch (err) { alert('Failed to upload file.'); }
        finally { if (fileInputRef.current) fileInputRef.current.value = ""; }
    };

    const handleSpecificFileUpload = async (key: string, file: File) => {
        if (!leadId) return;
        try {
            const formData = new FormData(); formData.append(key, file);
            await updateLead(leadId, formData); await refreshLead(); alert(`${key} uploaded successfully!`);
        } catch (err) { alert(`Failed to upload ${key}.`); }
    };

    const handleDeleteDocument = async (docId: string) => {
        if (!leadId || !confirm("Are you sure you want to delete this document?")) return;
        try { await deleteDocument(leadId, docId); fetchLeadDetails(); alert('Document deleted successfully.'); }
        catch (err) { alert('Failed to delete document.'); }
    };

    const handleDeleteConfirm = async () => {
        if (!leadId) return;
        try { await deleteLead(leadId); setIsDeleteModalOpen(false); triggerUpdate(); navigate('/admin/leads'); }
        catch (error) { throw error; }
    };

    const inputStyle = {
        backgroundColor: 'rgb(var(--surface-1))', border: '1px solid rgb(var(--border-default))',
        color: 'rgb(var(--text-0))', borderRadius: '8px', padding: '0.6rem 0.75rem', fontSize: '0.875rem', outline: 'none', width: '100%'
    };

    if (loading) return <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto"><DetailSkeleton /></div>;
    if (error) return <div className="text-center p-8" style={{ color: 'rgb(var(--color-danger))' }}>{error}</div>;
    if (!lead) return <div className="text-center p-8">Lead not found.</div>;

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto anim-fade-up space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <Link to="/admin/leads" className="flex items-center gap-2 text-xs font-600 transition-colors" style={{ color: 'rgb(var(--text-2))' }}>
                    <div className="p-1.5 rounded bg-white/5 border border-glass-border/30"><ArrowLeft size={14} /></div>
                    Back to Pipeline
                </Link>
                <div className="flex items-center gap-2">
                    <Link to={`/admin/quotation/${leadId}`} className="crm-btn-secondary text-xs flex items-center gap-2" style={{ padding: '0.45rem 0.875rem' }}>
                        <FileText size={14} style={{ color: 'rgb(var(--accent))' }} /> Create Quotation
                    </Link>
                    <button className="crm-btn-primary text-xs" style={{ padding: '0.45rem 0.875rem' }}>
                        Convert to Project
                    </button>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-8 space-y-6">
                    {/* Identity Card */}
                    <div className="crm-card p-6 flex flex-col md:flex-row justify-between items-start gap-6">
                        <div className="flex gap-4 items-center">
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: 'rgb(var(--accent))' }}>
                                <UserIcon size={28} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <h1 className="text-2xl font-700 tracking-tight" style={{ color: 'rgb(var(--text-0))' }}>{lead.name}</h1>
                                    <span className="px-2 py-0.5 text-[10px] font-700 uppercase rounded" style={{
                                        backgroundColor: lead.scoreStatus === 'Hot' ? 'rgb(var(--color-danger)/0.1)' : lead.scoreStatus === 'Warm' ? 'rgb(var(--color-warning)/0.1)' : 'rgb(var(--color-info)/0.1)',
                                        color: lead.scoreStatus === 'Hot' ? 'rgb(var(--color-danger))' : lead.scoreStatus === 'Warm' ? 'rgb(var(--color-warning))' : 'rgb(var(--color-info))'
                                    }}>
                                        {lead.scoreStatus} • {lead.score} Points
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-4 text-xs font-500" style={{ color: 'rgb(var(--text-1))' }}>
                                    <div className="flex items-center gap-1.5"><Mail size={14} style={{ color: 'rgb(var(--accent))' }} /> {lead.email}</div>
                                    <div className="flex items-center gap-1.5"><Phone size={14} style={{ color: 'rgb(var(--accent))' }} /> {lead.phone}</div>
                                    {lead.assignedVendorName && (
                                        <div className="flex items-center gap-1.5"><ShieldCheck size={14} style={{ color: 'rgb(var(--color-info))' }} /> {lead.assignedVendorName}</div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 text-right">
                            <div className="flex items-center gap-1.5 text-[10px] font-600 uppercase" style={{ color: 'rgb(var(--text-2))' }}>
                                <Calendar size={12} /> Created {new Date(lead.createdAt).toLocaleDateString()}
                            </div>
                            {user?.role === 'Master' && (
                                <button onClick={() => setIsDeleteModalOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-600 transition-colors" style={{ color: 'rgb(var(--color-danger))', backgroundColor: 'rgb(var(--color-danger)/0.1)' }}>
                                    <Trash2 size={12} /> Delete Lead
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Survey Details */}
                    {lead.surveys && lead.surveys.length > 0 && (
                        <div className="crm-card p-6 space-y-4 border-l-4" style={{ borderLeftColor: 'rgb(var(--accent))' }}>
                            {(() => {
                                const activeSurvey = lead.surveys[0];
                                const isApproved = activeSurvey.status === 'Approved';
                                const isPending = activeSurvey.status === 'Pending';
                                return (
                                    <div className="space-y-4">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b" style={{ borderColor: 'rgb(var(--border-muted))' }}>
                                            <div>
                                                <span className="text-[10px] font-700 uppercase tracking-widest block" style={{ color: 'rgb(var(--accent))' }}>Linked Survey #{activeSurvey.surveyNo}</span>
                                                <h3 className="text-lg font-700 flex items-center gap-2" style={{ color: 'rgb(var(--text-0))' }}>
                                                    <ClipboardCheck size={18} style={{ color: 'rgb(var(--accent))' }} /> Operations Summary
                                                </h3>
                                            </div>
                                            <span className="px-2.5 py-1 rounded-lg text-xs font-600 uppercase" style={{
                                                backgroundColor: isApproved ? 'rgb(var(--color-success)/0.1)' : isPending ? 'rgb(var(--color-warning)/0.1)' : 'rgb(var(--accent)/0.1)',
                                                color: isApproved ? 'rgb(var(--color-success))' : isPending ? 'rgb(var(--color-warning))' : 'rgb(var(--accent))'
                                            }}>
                                                Status: {activeSurvey.status}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-600">
                                            <div className="p-3 rounded-xl bg-white/5 border border-glass-border/20">
                                                <span className="text-[10px] font-600 block" style={{ color: 'rgb(var(--text-2))' }}>Assigned Engineer</span>
                                                <span className="flex items-center gap-1.5 mt-0.5" style={{ color: 'rgb(var(--text-0))' }}>
                                                    <UserIcon size={12} style={{ color: 'rgb(var(--accent))' }} /> {activeSurvey.assignedEngineer?.name || 'Unassigned'}
                                                </span>
                                            </div>
                                            <div className="p-3 rounded-xl bg-white/5 border border-glass-border/20">
                                                <span className="text-[10px] font-600 block" style={{ color: 'rgb(var(--text-2))' }}>Scheduled</span>
                                                <span className="flex items-center gap-1.5 mt-0.5" style={{ color: 'rgb(var(--text-0))' }}>
                                                    <Calendar size={12} style={{ color: 'rgb(var(--accent))' }} /> {activeSurvey.scheduledDate || 'Not Scheduled'}
                                                </span>
                                            </div>
                                            <div className="p-3 rounded-xl bg-white/5 border border-glass-border/20">
                                                <span className="text-[10px] font-600 block" style={{ color: 'rgb(var(--text-2))' }}>Priority</span>
                                                <span className="mt-0.5 block" style={{ color: 'rgb(var(--color-warning))' }}>{activeSurvey.priority}</span>
                                            </div>
                                            <div className="p-3 rounded-xl bg-white/5 border border-glass-border/20">
                                                <span className="text-[10px] font-600 block" style={{ color: 'rgb(var(--text-2))' }}>Progress</span>
                                                <span className="mt-0.5 block" style={{ color: 'rgb(var(--color-success))' }}>{activeSurvey.progressPercent || 25}% Complete</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                                            {isPending && user?.role === 'Master' && (
                                                <button onClick={() => setIsAssignModalOpen(true)} className="crm-btn-secondary text-xs" style={{ padding: '0.4rem 0.8rem' }}>
                                                    <Send size={14} /> Assign Engineer
                                                </button>
                                            )}
                                            <Link to={`/admin/surveys/${activeSurvey.id}`} className="crm-btn-primary text-xs" style={{ padding: '0.4rem 0.8rem' }}>
                                                <Eye size={14} /> Open Survey
                                            </Link>
                                        </div>

                                        {isAssignModalOpen && (
                                            <AssignSurveyModal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} surveyId={activeSurvey.id} surveyNo={activeSurvey.surveyNo} customerName={lead.name} currentEngineerId={activeSurvey.assignedEngineer?.id} onAssigned={() => refreshLead()} />
                                        )}
                                    </div>
                                );
                            })()}
                        </div>
                    )}

                    {/* Pipeline Tracker */}
                    <div className="crm-card p-4">
                        <HorizontalPipelineTracker currentStage={lead.pipelineStage} allStages={PIPELINE_STAGES} verifications={lifecycleData?.verifications || {}} onSelectStage={(stage) => { setSelectedStageForDrawer(stage); setIsDrawerOpen(true); }} />
                    </div>

                    {selectedStageForDrawer && (
                        <StageDetailDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} leadId={lead.id} stageName={selectedStageForDrawer} currentLeadStage={lead.pipelineStage} verificationRecord={lifecycleData?.verifications?.[selectedStageForDrawer]} existingMaterialChecklist={lifecycleData?.materialChecklist} onStageVerified={() => { refreshLead(); fetchLifecycle(); }} />
                    )}

                    {/* Application Details */}
                    <div className="crm-card p-6">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl" style={{ backgroundColor: 'rgb(var(--accent)/0.1)', color: 'rgb(var(--accent))' }}><FileText size={20} /></div>
                                <h3 className="text-lg font-700" style={{ color: 'rgb(var(--text-0))' }}>Application Details</h3>
                            </div>
                            {!isEditing ? (
                                <button onClick={handleEditClick} className="crm-btn-secondary text-xs" style={{ padding: '0.3rem 0.7rem' }}>
                                    <Edit2 size={14} /> Edit Details
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button onClick={handleSaveEdit} disabled={isSaving} className="crm-btn-primary text-xs" style={{ padding: '0.3rem 0.7rem' }}>
                                        <Save size={14} /> {isSaving ? 'Saving...' : 'Save'}
                                    </button>
                                    <button onClick={handleCancelEdit} disabled={isSaving} className="crm-btn-secondary text-xs" style={{ padding: '0.3rem 0.7rem' }}>
                                        <X size={14} /> Cancel
                                    </button>
                                </div>
                            )}
                        </div>

                        {!isEditing ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <DetailItem label="Full Name" value={lead.name} />
                                <DetailItem label="Email" value={lead.email} />
                                <DetailItem label="Phone" value={lead.phone} />
                                <DetailItem label="Product Type" value={lead.productType} />

                                {lead.source === 'Manual_Offline' && (
                                    <>
                                        <DetailItem label="Father Name" value={lead.fatherName} />
                                        <DetailItem label="District" value={lead.district} />
                                        <DetailItem label="Tehsil" value={lead.tehsil} />
                                        <DetailItem label="Village" value={lead.village} />
                                        <DetailItem label="HP" value={lead.hp} />
                                        <DetailItem label="Connection" value={lead.connectionType} />
                                    </>
                                )}
                                {lead.source !== 'Manual_Offline' && <DetailItem label="Location" value={lead.customFields?.district} />}

                                {(() => {
                                    const REQUIRED_IMAGE_FIELDS = ['customerPic', 'paymentSlip', 'structurePic', 'paymentProof', 'passbook'];
                                    let fieldsObj = typeof lead.customFields === 'string' ? JSON.parse(lead.customFields || '{}') : (lead.customFields || {});
                                    try { if (typeof fieldsObj === 'string') fieldsObj = JSON.parse(fieldsObj); } catch (e) { fieldsObj = {}; }
                                    const allFields = { ...fieldsObj };
                                    REQUIRED_IMAGE_FIELDS.forEach(field => { if (!(field in allFields)) allFields[field] = null; });
                                    return Object.entries(allFields).filter(([key]) => key !== 'district' && key !== 'basicProfile').map(([key, value]) => {
                                        const isImageField = REQUIRED_IMAGE_FIELDS.includes(key) || formSchema.get(key) === 'image' || String(value).startsWith('http');
                                        return <DetailItem key={key} label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} value={value} isImage={isImageField} onView={openPreview} onDelete={handleDeleteDocument} canDelete={user?.role === 'Master'} onUpload={isImageField && !value ? (file) => handleSpecificFileUpload(key, file) : undefined} />;
                                    });
                                })()}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {[{ label: 'Name', key: 'name', type: 'text' }, { label: 'Email', key: 'email', type: 'email' }, { label: 'Phone', key: 'phone', type: 'text' }, { label: 'Product Type', key: 'productType', type: 'text' }].map(f => (
                                    <div key={f.key} className="space-y-1">
                                        <label className="text-[10px] font-700 uppercase" style={{ color: 'rgb(var(--text-2))' }}>{f.label}</label>
                                        <input type={f.type} value={editData[f.key] || ''} onChange={(e) => handleEditChange(f.key, e.target.value)} style={inputStyle} />
                                    </div>
                                ))}

                                {lead.source === 'Manual_Offline' && ['fatherName', 'district', 'tehsil', 'village', 'hp', 'connectionType'].map(key => (
                                    <div key={key} className="space-y-1">
                                        <label className="text-[10px] font-700 uppercase" style={{ color: 'rgb(var(--text-2))' }}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</label>
                                        <input type="text" value={editData[key] || ''} onChange={(e) => handleEditChange(key, e.target.value)} style={inputStyle} />
                                    </div>
                                ))}

                                {Object.entries(editData.customFields || {}).filter(([key]) => key !== 'district' && key !== 'basicProfile').map(([key, value]) => {
                                    const isImageField = ['customerPic', 'paymentSlip', 'structurePic', 'paymentProof', 'passbook'].includes(key) || formSchema.get(key) === 'image' || (typeof value === 'string' && value.startsWith('http'));
                                    if (isImageField) return null;
                                    return (
                                        <div key={key} className="space-y-1">
                                            <label className="text-[10px] font-700 uppercase" style={{ color: 'rgb(var(--text-2))' }}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</label>
                                            <input type="text" value={value as string || ''} onChange={(e) => handleEditChange(key, e.target.value, true)} style={inputStyle} />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-6">
                    {/* Vendor Assignment */}
                    {user?.role === 'Master' && (
                        <div className="crm-card p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2.5 rounded-xl" style={{ backgroundColor: 'rgb(var(--color-info)/0.1)', color: 'rgb(var(--color-info))' }}><ShieldCheck size={20} /></div>
                                <h3 className="text-lg font-700" style={{ color: 'rgb(var(--text-0))' }}>Assign Vendor</h3>
                            </div>
                            <div className="relative">
                                <select value={lead.assignedVendorId || ''} onChange={(e) => handleVendorAssign(e.target.value)} style={{ ...inputStyle, cursor: 'pointer', appearance: 'none' }}>
                                    <option value="">Unassigned</option>
                                    {vendors.map(vendor => <option key={vendor.id} value={vendor.id}>{vendor.name} ({vendor.district})</option>)}
                                </select>
                                <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90" style={{ color: 'rgb(var(--text-3))', pointerEvents: 'none' }} />
                            </div>
                        </div>
                    )}

                    {/* Activity Log */}
                    <div className="crm-card p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 rounded-xl" style={{ backgroundColor: 'rgb(var(--color-warning)/0.1)', color: 'rgb(var(--color-warning))' }}><Activity size={20} /></div>
                            <h3 className="text-lg font-700" style={{ color: 'rgb(var(--text-0))' }}>Activity Log</h3>
                        </div>
                        <form onSubmit={handleAddNote} className="relative mb-6">
                            <textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Add a professional note..." style={{ ...inputStyle, minHeight: '100px', resize: 'none' }} />
                            <button type="submit" disabled={isSubmittingNote} className="absolute bottom-3 right-3 p-2 rounded-lg bg-[rgb(var(--accent))] text-white hover:opacity-90">
                                {isSubmittingNote ? <LoadingSpinner size="sm" /> : <Plus size={16} />}
                            </button>
                        </form>
                        <ImmutableActivityTimeline activities={lifecycleData?.activityLog || lead.activityLog || []} />
                    </div>

                    {/* Documents */}
                    <div className="crm-card p-6">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl" style={{ backgroundColor: 'rgb(var(--color-success)/0.1)', color: 'rgb(var(--color-success))' }}><FileText size={20} /></div>
                                <h3 className="text-lg font-700" style={{ color: 'rgb(var(--text-0))' }}>Documents</h3>
                            </div>
                            <span className="px-2 py-0.5 rounded bg-[rgb(var(--surface-2))] text-[10px] font-600">{lead.documents.length} Files</span>
                        </div>
                        <div className="space-y-2 mb-4">
                            {lead.documents.map((doc: LeadDocument) => (
                                <div key={doc.filename} className="flex justify-between items-center p-3 rounded-xl border transition-colors hover:border-[rgb(var(--accent))]" style={{ borderColor: 'rgb(var(--border-muted))', backgroundColor: 'rgb(var(--surface-1))' }}>
                                    <div className="flex items-center gap-2 min-w-0">
                                        <FileText size={14} style={{ color: 'rgb(var(--accent))' }} />
                                        <span className="text-xs font-500 truncate" style={{ color: 'rgb(var(--text-0))' }} title={doc.filename}>{doc.filename}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => openPreview(doc.filename.startsWith('http') ? doc.filename : `${API_BASE_URL}/files/${doc.id}`)} className="p-1.5 rounded hover:bg-[rgb(var(--surface-2))]"><ClipboardCheck size={14} style={{ color: 'rgb(var(--text-2))' }} /></button>
                                        <button onClick={() => handleDeleteDocument(doc.id)} className="p-1.5 rounded text-red-400 hover:bg-red-500/10"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                            ))}
                            {lead.documents.length === 0 && (
                                <div className="text-center py-6 border border-dashed rounded-xl" style={{ borderColor: 'rgb(var(--border-muted))' }}>
                                    <p className="text-xs italic" style={{ color: 'rgb(var(--text-3))' }}>No documents found</p>
                                </div>
                            )}
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                        <button onClick={() => fileInputRef.current?.click()} className="w-full crm-btn-secondary text-xs flex justify-center items-center gap-2" style={{ borderStyle: 'dashed' }}>
                            <Plus size={14} /> Add Document
                        </button>
                    </div>
                </div>
            </div>

            {/* Finance Section */}
            <div className="mt-6">
                <div className="crm-card overflow-hidden">
                    <div className="flex items-center gap-3 p-5 border-b" style={{ borderColor: 'rgb(var(--border-muted))' }}>
                        <div className="p-2.5 rounded-xl" style={{ backgroundColor: 'rgb(var(--color-success)/0.1)', color: 'rgb(var(--color-success))' }}><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
                        <div>
                            <h3 className="text-lg font-700" style={{ color: 'rgb(var(--text-0))' }}>Project Finance</h3>
                            <p className="text-xs mt-0.5" style={{ color: 'rgb(var(--text-2))' }}>Budget, expenses, and profit</p>
                        </div>
                    </div>
                    <div className="p-5">
                        <LeadFinanceTab leadId={lead.id} leadName={lead.name} />
                    </div>
                </div>
            </div>

            {isDeleteModalOpen && <DeleteConfirmationModal itemName={lead.name || 'this lead'} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDeleteConfirm} />}
            <DocumentPreviewModal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} fileUrl={previewUrl || ''} />
        </div>
    );
};

export default LeadDetailPage;
