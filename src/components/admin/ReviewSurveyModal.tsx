import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, AlertTriangle } from 'lucide-react';
import { reviewSurvey } from '../../service/adminService';
import LoadingSpinner from '../LoadingSpinner';

interface ReviewSurveyModalProps {
    isOpen: boolean;
    onClose: () => void;
    surveyId: string;
    surveyNo: string;
    customerName: string;
    onReviewed: () => void;
}

const ReviewSurveyModal: React.FC<ReviewSurveyModalProps> = ({
    isOpen,
    onClose,
    surveyId,
    surveyNo,
    customerName,
    onReviewed
}) => {
    const [remarks, setRemarks] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return null;

    const handleAction = async (action: 'Approved' | 'Rejected') => {
        try {
            setSubmitting(true);
            await reviewSurvey(surveyId, { action, remarks });
            onReviewed();
            onClose();
        } catch (err: any) {
            alert(err.message || 'Failed to submit review.');
        } finally {
            setSubmitting(false);
        }
    };

    const inputClasses = "w-full p-2.5 rounded-lg border text-sm focus:ring-2 focus:ring-[rgb(var(--accent))/0.5] focus:border-[rgb(var(--accent))] outline-none transition-all placeholder:text-[rgb(var(--text-3))]";

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm anim-fade-in">
            <div className="crm-card w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden relative shadow-2xl">
                
                {/* Header */}
                <button onClick={onClose} className="absolute top-5 right-5 p-1.5 rounded hover:bg-[rgb(var(--surface-2))]" style={{ color: 'rgb(var(--text-2))' }}>
                    <X size={20} />
                </button>
                <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: 'rgb(var(--border-muted))' }}>
                    <div>
                        <span className="text-[10px] font-700 uppercase tracking-widest" style={{ color: 'rgb(var(--accent))' }}>Manager Review Action</span>
                        <h3 className="text-xl font-700 mt-1" style={{ color: 'rgb(var(--text-0))' }}>Review Survey #{surveyNo}</h3>
                        <p className="text-xs font-600 mt-1" style={{ color: 'rgb(var(--text-2))' }}>Customer: {customerName}</p>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4 flex-1 overflow-y-auto">
                    <div>
                        <label className="block text-[11px] font-600 mb-1.5 uppercase tracking-wide" style={{ color: 'rgb(var(--text-2))' }}>Review Remarks / Rejection Feedback</label>
                        <textarea
                            value={remarks}
                            onChange={e => setRemarks(e.target.value)}
                            placeholder="Enter approval notes or rejection reason..."
                            rows={4}
                            className={inputClasses}
                            style={{ backgroundColor: 'rgb(var(--surface-1))', borderColor: 'rgb(var(--border-default))', color: 'rgb(var(--text-0))' }}
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="p-6 border-t flex items-center justify-between gap-3" style={{ borderColor: 'rgb(var(--border-muted))', backgroundColor: 'rgb(var(--surface-0))' }}>
                    <button
                        type="button"
                        disabled={submitting}
                        onClick={() => handleAction('Rejected')}
                        className="px-5 py-2.5 rounded-lg border font-700 text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1.5"
                        style={{ backgroundColor: 'rgb(var(--color-error)/0.1)', borderColor: 'rgb(var(--color-error)/0.3)', color: 'rgb(var(--color-error))' }}
                    >
                        <AlertTriangle size={16} />
                        <span>Reject</span>
                    </button>

                    <button
                        type="button"
                        disabled={submitting}
                        onClick={() => handleAction('Approved')}
                        className="crm-btn-primary px-6 py-2.5 text-xs flex items-center gap-2"
                    >
                        {submitting ? <LoadingSpinner size="sm" /> : <CheckCircle2 size={16} />}
                        <span>Approve Survey</span>
                    </button>
                </div>
            </div>
        </div>,
        modalRoot
    );
};

export default ReviewSurveyModal;
