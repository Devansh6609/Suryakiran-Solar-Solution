import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, Clock, User, AlertTriangle, Send } from 'lucide-react';
import { getVendors, assignSurvey } from '../../service/adminService';
import LoadingSpinner from '../LoadingSpinner';
import { User as UserType } from '../../types';

interface AssignSurveyModalProps {
    isOpen: boolean;
    onClose: () => void;
    surveyId: string;
    surveyNo: string;
    customerName: string;
    currentEngineerId?: string;
    onAssigned: () => void;
}

const AssignSurveyModal: React.FC<AssignSurveyModalProps> = ({
    isOpen,
    onClose,
    surveyId,
    surveyNo,
    customerName,
    currentEngineerId,
    onAssigned
}) => {
    const [engineers, setEngineers] = useState<UserType[]>([]);
    const [selectedEngineerId, setSelectedEngineerId] = useState(currentEngineerId || '');
    const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
    const [scheduledTime, setScheduledTime] = useState('10:00 AM');
    const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('High');
    const [remarks, setRemarks] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        getVendors().then(setEngineers).catch(err => console.error(err));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEngineerId) return alert('Please select a Field Engineer.');
        try {
            setSubmitting(true);
            await assignSurvey(surveyId, {
                assignedEngineerId: selectedEngineerId,
                scheduledDate,
                scheduledTime,
                priority,
                remarks
            });
            alert(`Survey #${surveyNo} assigned successfully!`);
            onAssigned();
            onClose();
        } catch (err: any) {
            alert(err.message || 'Failed to assign survey.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;
    
    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return null;

    const inputClasses = "w-full p-2.5 rounded-lg border text-sm focus:ring-2 focus:ring-[rgb(var(--accent))/0.5] focus:border-[rgb(var(--accent))] outline-none transition-all placeholder:text-[rgb(var(--text-3))]";
    const labelClasses = "block text-[11px] font-600 mb-1.5 uppercase tracking-wide text-[rgb(var(--text-2))]";

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm anim-fade-in">
            <div className="crm-card w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden relative shadow-2xl">
                
                {/* Header */}
                <button onClick={onClose} className="absolute top-5 right-5 p-1.5 rounded hover:bg-[rgb(var(--surface-2))]" style={{ color: 'rgb(var(--text-2))' }}>
                    <X size={20} />
                </button>
                <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: 'rgb(var(--border-muted))' }}>
                    <div>
                        <span className="text-[10px] font-700 uppercase tracking-widest" style={{ color: 'rgb(var(--accent))' }}>Survey Assignment</span>
                        <h3 className="text-xl font-700 mt-1" style={{ color: 'rgb(var(--text-0))' }}>Assign Survey #{surveyNo}</h3>
                        <p className="text-xs font-600 mt-1" style={{ color: 'rgb(var(--text-2))' }}>Customer: {customerName}</p>
                    </div>
                </div>

                {/* Form Body */}
                <div className="p-6 space-y-4 flex-1 overflow-y-auto">
                    <form id="assign-survey-form" onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className={labelClasses}>Field Engineer</label>
                            <select
                                value={selectedEngineerId}
                                onChange={e => setSelectedEngineerId(e.target.value)}
                                required
                                className={inputClasses}
                                style={{ backgroundColor: 'rgb(var(--surface-1))', borderColor: 'rgb(var(--border-default))', color: 'rgb(var(--text-0))' }}
                            >
                                <option value="" disabled>Select Field Engineer</option>
                                {engineers.map(e => (
                                    <option key={e.id} value={e.id}>{e.name} ({e.email})</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={labelClasses}>Scheduled Date</label>
                                <input
                                    type="date"
                                    value={scheduledDate}
                                    onChange={e => setScheduledDate(e.target.value)}
                                    required
                                    className={inputClasses}
                                    style={{ backgroundColor: 'rgb(var(--surface-1))', borderColor: 'rgb(var(--border-default))', color: 'rgb(var(--text-0))' }}
                                />
                            </div>

                            <div>
                                <label className={labelClasses}>Scheduled Time</label>
                                <input
                                    type="text"
                                    value={scheduledTime}
                                    onChange={e => setScheduledTime(e.target.value)}
                                    placeholder="10:00 AM"
                                    required
                                    className={inputClasses}
                                    style={{ backgroundColor: 'rgb(var(--surface-1))', borderColor: 'rgb(var(--border-default))', color: 'rgb(var(--text-0))' }}
                                />
                            </div>
                        </div>

                        <div>
                            <label className={labelClasses}>Priority Level</label>
                            <select
                                value={priority}
                                onChange={e => setPriority(e.target.value as any)}
                                className={inputClasses}
                                style={{ backgroundColor: 'rgb(var(--surface-1))', borderColor: 'rgb(var(--border-default))', color: 'rgb(var(--text-0))' }}
                            >
                                <option value="Low">Low Priority</option>
                                <option value="Medium">Medium Priority</option>
                                <option value="High">High Priority</option>
                                <option value="Urgent">Urgent Priority</option>
                            </select>
                        </div>

                        <div>
                            <label className={labelClasses}>Assignment Instructions & Remarks</label>
                            <textarea
                                value={remarks}
                                onChange={e => setRemarks(e.target.value)}
                                placeholder="Check RCC roof thickness and main breaker rating..."
                                rows={3}
                                className={inputClasses}
                                style={{ backgroundColor: 'rgb(var(--surface-1))', borderColor: 'rgb(var(--border-default))', color: 'rgb(var(--text-0))' }}
                            />
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="p-6 border-t flex items-center justify-end gap-3" style={{ borderColor: 'rgb(var(--border-muted))', backgroundColor: 'rgb(var(--surface-0))' }}>
                    <button
                        type="button"
                        onClick={onClose}
                        className="crm-btn-secondary px-5 py-2.5 text-xs"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        form="assign-survey-form"
                        disabled={submitting}
                        className="crm-btn-primary px-6 py-2.5 text-xs flex items-center gap-2"
                    >
                        {submitting ? <LoadingSpinner size="sm" /> : <Send size={16} />}
                        <span>Confirm Assignment</span>
                    </button>
                </div>
            </div>
        </div>,
        modalRoot
    );
};

export default AssignSurveyModal;
