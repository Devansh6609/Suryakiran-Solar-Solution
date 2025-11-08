import React, { useState, useEffect, FormEvent, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Lead, LeadActivity, LeadDocument, PipelineStage, FormField, User } from '../../types';
import { getLeadDetails, getFormSchema, getVendors, updateLead, addLeadNote, generateLeadSummary, uploadDocument, deleteLead } from '../../service/adminService';
import { PIPELINE_STAGES } from '../../constants';
import PipelineTracker from '../../components/admin/PipelineTracker.tsx';
import { useAuth } from '../../contexts/AuthContext.tsx';
import Card from '../../components/admin/Card.tsx';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useCrmUpdates } from '../../contexts/CrmUpdatesContext.tsx';
import DeleteConfirmationModal from '../../components/admin/DeleteConfirmationModal.tsx';


const API_BASE_URL = import.meta.env.VITE_CRM_API_URL || 'http://localhost:3001';

const DetailItem: React.FC<{ label: string, value: any, isImage?: boolean }> = ({ label, value, isImage = false }) => (
    <div>
        <dt className="text-sm font-medium text-gray-500 dark:text-text-muted">{label}</dt>
        <dd className="mt-1 text-sm text-gray-900 dark:text-text-light">
            {isImage && value ? (
                <a href={`${API_BASE_URL}/files/${value}`} target="_blank" rel="noopener noreferrer" className="text-accent-blue hover:underline font-medium">
                    View Document
                </a>
            ) : (
                String(value || 'N/A')
            )}
        </dd>
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

    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const [summary, setSummary] = useState<string | null>(null);
    const [summaryError, setSummaryError] = useState<string | null>(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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
            if (user?.role === 'Master') {
                const vendorData = await getVendors();
                setVendors(vendorData);
            }
        } catch (err) {
            setError('Failed to load lead details.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (leadId) {
            fetchLeadDetails();
        }
    }, [leadId, user]);

    const handleStageChange = async (newStage: PipelineStage) => {
        if (!leadId || !lead) return;
        try {
            const updatedLead = await updateLead(leadId, { pipelineStage: newStage });
            setLead(updatedLead);
        } catch (err) {
            alert('Failed to update stage. Please try again.');
        }
    };

    const handleVendorAssign = async (vendorId: string) => {
        if (!leadId) return;
        try {
            const updatedLead = await updateLead(leadId, { assignedVendorId: vendorId });
            setLead(updatedLead);
        } catch (err) {
            alert('Failed to assign vendor.');
        }
    };

    const handleAddNote = async (e: FormEvent) => {
        e.preventDefault();
        if (!leadId || !newNote.trim()) return;
        setIsSubmittingNote(true);
        try {
            const updatedLead = await addLeadNote(leadId, newNote);
            setLead(updatedLead);
            setNewNote('');
        } catch (err) {
            alert('Failed to add note.');
        } finally {
            setIsSubmittingNote(false);
        }
    };

    const handleGenerateSummary = async () => {
        if (!leadId) return;
        setIsGeneratingSummary(true);
        setSummaryError(null);
        try {
            const result = await generateLeadSummary(leadId);
            setSummary(result.summary);
        } catch (err: any) {
            setSummaryError(err.message || "Failed to generate summary. Ensure API key is set in Settings.");
        } finally {
            setIsGeneratingSummary(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!leadId || !e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        try {
            const updatedLead = await uploadDocument(leadId, file);
            setLead(updatedLead);
            alert('File uploaded successfully!');
        } catch (err) {
            alert('Failed to upload file.');
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleDeleteConfirm = async () => {
        if (!leadId) return;
        try {
            await deleteLead(leadId);
            setIsDeleteModalOpen(false);
            triggerUpdate();
            navigate('/admin/leads');
        } catch (error) {
            // Re-throw to be caught by the modal's error handling
            throw error;
        }
    };


    if (loading) return (
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
            <LoadingSpinner size="lg" />
        </div>
    );
    if (error) return <div className="text-center p-8 text-error-red">{error}</div>;
    if (!lead) return <div className="text-center p-8">Lead not found.</div>;

    return (
        <div>
            <div className="mb-6">
                <Link to="/admin/leads" className="text-accent-blue hover:underline">&larr; Back to Pipeline</Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-text-light">{lead.name}</h2>
                                <p className="text-gray-500 dark:text-text-muted">{lead.email} | {lead.phone}</p>
                                {user?.role === 'Master' && (
                                    <p className="text-sm text-gray-500 dark:text-text-muted mt-2">
                                        Assigned to: <span className="font-semibold text-gray-800 dark:text-text-light">{lead.assignedVendorName || 'Unassigned'}</span>
                                    </p>
                                )}
                            </div>
                            <div className="text-right flex-shrink-0">
                                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${lead.scoreStatus === 'Hot' ? 'bg-error-red/20 text-error-red' : lead.scoreStatus === 'Warm' ? 'bg-warning-yellow/20 text-warning-yellow' : 'bg-accent-blue/20 text-accent-blue'}`}>
                                    {lead.scoreStatus} ({lead.score})
                                </span>
                                <p className="text-xs text-gray-500 dark:text-text-muted mt-1">Created: {new Date(lead.createdAt).toLocaleDateString()}</p>
                                {user?.role === 'Master' && (
                                    <button
                                        onClick={() => setIsDeleteModalOpen(true)}
                                        className="mt-4 text-xs text-error-red hover:underline flex items-center gap-1 justify-end ml-auto"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                                        Delete Lead
                                    </button>
                                )}
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-text-light mb-4">Sales Pipeline</h3>
                        <PipelineTracker currentStage={lead.pipelineStage} allStages={PIPELINE_STAGES} onStageChange={handleStageChange} />
                    </Card>

                    <Card>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-text-light mb-4">Application Details</h3>
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                            <DetailItem label="Name" value={lead.name} />
                            <DetailItem label="Email" value={lead.email} />
                            <DetailItem label="Phone" value={lead.phone} />
                            <DetailItem label="Product Type" value={lead.productType} />
                            {/* FIX: The 'location' property does not exist on the Lead type. Use customFields.district instead. */}
                            <DetailItem label="Location (District)" value={lead.customFields?.district} />
                            {Object.entries(lead.customFields).filter(([key]) => key !== 'district').map(([key, value]) => (
                                <DetailItem
                                    key={key}
                                    label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                    value={value}
                                    isImage={formSchema.get(key) === 'image'}
                                />
                            ))}
                        </dl>
                    </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {user?.role === 'Master' && (
                        <Card>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-text-light mb-4">Assign Vendor</h3>
                            <select
                                value={lead.assignedVendorId || ''}
                                onChange={(e) => handleVendorAssign(e.target.value)}
                                className="w-full p-2 border rounded-md bg-white dark:bg-secondary-background border-gray-300 dark:border-border-color focus:ring-accent-blue focus:border-accent-blue text-gray-900 dark:text-text-light"
                            >
                                <option value="">Unassigned</option>
                                {vendors.map(vendor => (
                                    <option key={vendor.id} value={vendor.id}>
                                        {vendor.name} ({vendor.district}, {vendor.state})
                                    </option>
                                ))}
                            </select>
                        </Card>
                    )}

                    <Card>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-text-light mb-4">AI-Powered Summary</h3>
                        <button onClick={handleGenerateSummary} disabled={isGeneratingSummary} className="w-full flex items-center justify-center bg-accent-blue text-white font-bold py-2 px-4 rounded-lg hover:bg-accent-blue-hover transition-colors disabled:bg-gray-500">
                            {isGeneratingSummary ? (
                                <>
                                    <LoadingSpinner size="sm" className="mr-2 !text-white" />
                                    Generating...
                                </>
                            ) : '✨ Generate Lead Summary'}
                        </button>
                        {summaryError && <p className="mt-2 text-sm text-error-red">{summaryError}</p>}
                        {summary && (
                            <div className="mt-4 p-4 bg-gray-50 dark:bg-primary-background rounded-md border border-gray-200 dark:border-border-color text-sm text-gray-600 dark:text-text-muted whitespace-pre-wrap">
                                {summary}
                            </div>
                        )}
                    </Card>

                    <Card>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-text-light mb-4">Activity & Notes</h3>
                        <form onSubmit={handleAddNote} className="mb-4">
                            <textarea
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                placeholder="Add a note..."
                                className="w-full p-2 border rounded-md bg-white dark:bg-secondary-background border-gray-300 dark:border-border-color focus:ring-accent-blue focus:border-accent-blue"
                                rows={3}
                            ></textarea>
                            <button type="submit" disabled={isSubmittingNote} className="mt-2 w-full flex items-center justify-center bg-gray-200 text-gray-700 font-semibold py-2 rounded-md hover:bg-gray-300 disabled:bg-gray-100 dark:bg-gray-700 dark:text-text-light dark:hover:bg-gray-600 dark:disabled:bg-gray-800">
                                {isSubmittingNote ? (
                                    <>
                                        <LoadingSpinner size="sm" className="mr-2" />
                                        Saving...
                                    </>
                                ) : 'Add Note'}
                            </button>
                        </form>
                        <div className="space-y-4 max-h-60 overflow-y-auto">
                            {lead.activityLog.slice().reverse().map((activity: LeadActivity, index) => (
                                <div key={activity.timestamp + index} className="text-sm border-l-2 border-gray-300 dark:border-border-color pl-3">
                                    <p className="font-semibold text-gray-800 dark:text-text-light">{activity.action}</p>
                                    {activity.notes && <p className="text-gray-600 dark:text-text-muted bg-gray-100 dark:bg-primary-background p-2 rounded-md mt-1">{activity.notes}</p>}
                                    <p className="text-xs text-gray-500 dark:text-text-muted mt-1">{new Date(activity.timestamp).toLocaleString()} by {activity.user}</p>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-text-light mb-4">Documents</h3>
                        <div className="space-y-2 mb-4">
                            {lead.documents.map((doc: LeadDocument) => (
                                <div key={doc.filename} className="flex justify-between items-center bg-gray-100 dark:bg-primary-background p-2 rounded-md">
                                    <span className="text-sm truncate pr-2 text-gray-700 dark:text-text-primary" title={doc.filename}>{doc.filename}</span>
                                    <a href={`${API_BASE_URL}/files/${doc.filename}`} target="_blank" rel="noopener noreferrer" className="text-xs text-accent-blue hover:underline">View</a>
                                </div>
                            ))}
                            {lead.documents.length === 0 && <p className="text-sm text-gray-500 dark:text-text-muted">No documents uploaded.</p>}
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                        <button onClick={() => fileInputRef.current?.click()} className="w-full bg-secondary-cyan/10 text-secondary-cyan font-semibold py-2 rounded-md hover:bg-secondary-cyan/20 dark:bg-secondary-cyan/20 dark:hover:bg-secondary-cyan/30">
                            + Upload Document
                        </button>
                    </Card>
                </div>
            </div>

            {isDeleteModalOpen && (
                <DeleteConfirmationModal
                    itemName={lead.name || 'this lead'}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleDeleteConfirm}
                />
            )}
        </div>
    );
};

export default LeadDetailPage;