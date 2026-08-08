import React, { useState, useEffect } from 'react';
import {
    CheckCircle, XCircle, ChevronRight, Lock, LayoutDashboard, CreditCard,
    Cpu, ClipboardCheck, Building2, FileText, Settings, Truck, Flag, Clock, ArrowLeft
} from 'lucide-react';
import { Lead, PipelineStage } from '../../types';
import { updateLead } from '../../service/adminService';
import { useToast } from '../../contexts/ToastContext';
import { PIPELINE_STAGES } from '../../constants';

interface LeadsWorkflowSectionProps {
    lead: Lead;
    onUpdate: (updatedLead: Lead) => void;
}

const STEPS = [
    { id: 1, title: 'Application Approval', icon: LayoutDashboard },
    { id: 2, title: 'Payment Status', icon: CreditCard },
    { id: 3, title: 'Allotment (Alloy)', icon: Cpu },
    { id: 4, title: 'Site Survey', icon: ClipboardCheck },
    { id: 5, title: 'Bank Account', icon: Building2 },
    { id: 6, title: 'Work Order (NTP)', icon: FileText },
    { id: 7, title: 'AIF Status', icon: Settings },
    { id: 8, title: 'CIF Status', icon: CheckCircle },
    { id: 9, title: 'Material Dispatch', icon: Truck },
    { id: 10, title: 'Work Completion', icon: Flag },
];

export const LeadsWorkflowSection: React.FC<LeadsWorkflowSectionProps> = ({ lead, onUpdate }) => {
    const { addToast } = useToast();
    const [openStep, setOpenStep] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    // --- Completion Logic ---
    const stepsStatus = {
        1: lead.approvalStatus === 'Approved',
        2: lead.paymentStatus === 'Complete',
        3: lead.allotmentStatus === 'Received',
        4: lead.surveyStatus === 'Completed',
        5: lead.bankAccountOpen === true,
        6: lead.ntpStatus === 'Received',
        7: lead.aifStatus === 'Done',
        8: lead.cifStatus === true,
        9: lead.workStatus === 'Material_Dispatched' || lead.workStatus === 'Work_Complete',
        10: lead.workStatus === 'Work_Complete'
    };

    // Determine the first active/unlocked step to open initially
    useEffect(() => {
        let firstIncomplete = 1;
        for (let i = 1; i <= 10; i++) {
            // @ts-ignore
            if (!stepsStatus[i]) {
                firstIncomplete = i;
                break;
            }
        }
        setOpenStep(firstIncomplete);
    }, [lead.id]);

    // Helper to determine step state
    const getStepState = (stepNum: number) => {
        // @ts-ignore
        if (stepsStatus[stepNum]) return 'completed';
        // Previous step must be complete to unlock
        // @ts-ignore
        if (stepNum === 1 || stepsStatus[stepNum - 1]) return 'active';
        return 'locked';
    };

    const checkAndAdvancePipeline = async (currentLeadVal: Lead, updatedField: string, value: any) => {
        let targetStage: PipelineStage | null = null;

        // Logic to auto-advance pipeline based on triggers
        if (updatedField === 'approvalStatus' && value === 'Approved') {
            targetStage = PipelineStage.NewLead;
        } else if (updatedField === 'surveyStatus' && value === 'Completed') {
            targetStage = PipelineStage.Survey;
        } else if (updatedField === 'ntpStatus' && value === 'Received') {
            targetStage = PipelineStage.CustomerApproved;
        }

        if (targetStage) {
            const currentIndex = PIPELINE_STAGES.indexOf(currentLeadVal.pipelineStage);
            const targetIndex = PIPELINE_STAGES.indexOf(targetStage);

            // Only move forward automatically
            if (targetIndex > currentIndex) {
                try {
                    const withStage = await updateLead(currentLeadVal.id, { pipelineStage: targetStage });
                    onUpdate(withStage); // Update parent again
                } catch (e) {
                    console.error("Auto-advance pipeline failed", e);
                }
            }
        }
    };


    const handleUpdate = async (field: string, value: any, fileKey?: string, file?: File) => {
        if (loading) return;
        setLoading(true);

        const previousLead = { ...lead };
        const optimisticLead = { ...lead, [field]: value };
        onUpdate(optimisticLead);

        try {
            const formData = new FormData();
            formData.append(field, value);
            if (file && fileKey) {
                formData.append(fileKey, file);
            }

            const updated = await updateLead(lead.id, formData);
            onUpdate(updated);

            // Check for pipeline auto-advance triggers
            await checkAndAdvancePipeline(updated, field, value);

            addToast('Workflow updated successfully', 'success');
        } catch (error: any) {
            console.error("Update failed:", error);
            onUpdate(previousLead);
            addToast(error.message || 'Failed to update workflow', 'error');
        } finally {
            setLoading(false);
        }
    };

    const renderStepContent = (stepId: number) => {
        const inputClasses = "w-full p-2 sm:p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-green outline-none transition-all disabled:opacity-50 text-xs sm:text-sm";
        const btnBaseClasses = "w-full flex-1 py-2.5 sm:py-3 rounded-xl font-bold shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs sm:text-sm";
        const btnPrimaryClasses = `${btnBaseClasses} bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-green-500/30`;
        const btnDangerClasses = `${btnBaseClasses} bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-red-500/30`;
        const btnSecondaryClasses = `${btnBaseClasses} bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700`;

        switch (stepId) {
            case 1:
                return (
                    <div className="space-y-4 animate-fade-in">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 sm:p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                            <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200">Current Status</p>
                            <p className="text-xl sm:text-2xl font-bold text-blue-900 dark:text-blue-100 mt-0.5">{lead.approvalStatus || 'Pending'}</p>
                        </div>
                        <div className="flex gap-3">
                            <button disabled={loading} onClick={() => handleUpdate('approvalStatus', 'Approved')} className={btnPrimaryClasses}>Approve Application</button>
                            <button disabled={loading} onClick={() => handleUpdate('approvalStatus', 'Rejected')} className={btnDangerClasses}>Reject Application</button>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-4 animate-fade-in">
                        <div className="bg-gray-50 dark:bg-gray-800 p-3 sm:p-5 rounded-xl border border-gray-100 dark:border-gray-700">
                            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Payment Status</label>
                            <select
                                aria-label="Payment Status"
                                disabled={loading}
                                value={lead.paymentStatus || ''}
                                onChange={(e) => handleUpdate('paymentStatus', e.target.value)}
                                className={inputClasses}
                            >
                                <option value="">Select Status</option>
                                <option value="Complete">Payment Complete</option>
                                <option value="Hold">Payment Hold</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 p-3 sm:p-5 rounded-xl border border-gray-100 dark:border-gray-700">
                            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Upload Payment Slip</label>
                            <div className="relative">
                                <input type="file" aria-label="Upload Payment Slip" disabled={loading} onChange={(e) => {
                                    if (e.target.files?.[0]) handleUpdate('paymentStatus', lead.paymentStatus || 'Complete', 'paymentSlip', e.target.files[0]);
                                }} className="block w-full text-xs text-gray-500 file:mr-2 sm:file:mr-4 file:py-1.5 file:px-3 sm:file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary-green file:text-white hover:file:bg-primary-green-hover disabled:opacity-50" />
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-4 animate-fade-in">
                        <div className="grid grid-cols-2 gap-3">
                            <button disabled={loading} onClick={() => handleUpdate('allotmentStatus', 'Received')} className={`p-4 rounded-xl border-2 transition-all ${lead.allotmentStatus === 'Received' ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'border-gray-200 dark:border-gray-700 hover:border-green-200'}`}>
                                <Cpu className="w-6 h-6 sm:w-8 sm:h-8 mb-2 mx-auto" />
                                <span className="block text-center font-semibold text-xs sm:text-sm">Received</span>
                            </button>
                            <button disabled={loading} onClick={() => handleUpdate('allotmentStatus', 'Pending')} className={`p-4 rounded-xl border-2 transition-all ${lead.allotmentStatus === 'Pending' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300' : 'border-gray-200 dark:border-gray-700 hover:border-yellow-200'}`}>
                                <Clock className="w-6 h-6 sm:w-8 sm:h-8 mb-2 mx-auto" />
                                <span className="block text-center font-semibold text-xs sm:text-sm">Pending</span>
                            </button>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-4 animate-fade-in">
                        <div className="grid grid-cols-2 gap-3">
                            <button disabled={loading} onClick={() => handleUpdate('surveyStatus', 'Completed')} className={`p-4 rounded-xl border-2 transition-all ${lead.surveyStatus === 'Completed' ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'border-gray-200 dark:border-gray-700 hover:border-green-200'}`}>
                                <ClipboardCheck className="w-6 h-6 sm:w-8 sm:h-8 mb-2 mx-auto" />
                                <span className="block text-center font-semibold text-xs sm:text-sm">Completed</span>
                            </button>
                            <button disabled={loading} onClick={() => handleUpdate('surveyStatus', 'Pending')} className={`p-4 rounded-xl border-2 transition-all ${lead.surveyStatus === 'Pending' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300' : 'border-gray-200 dark:border-gray-700 hover:border-yellow-200'}`}>
                                <Clock className="w-6 h-6 sm:w-8 sm:h-8 mb-2 mx-auto" />
                                <span className="block text-center font-semibold text-xs sm:text-sm">Pending</span>
                            </button>
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className="space-y-4 animate-fade-in">
                        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 rounded-xl">
                            <span className="font-semibold text-xs sm:text-sm text-gray-700 dark:text-gray-300">Bank Account Open?</span>
                            <div className="flex gap-2">
                                <button disabled={loading} onClick={() => handleUpdate('bankAccountOpen', true)} className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${lead.bankAccountOpen ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>Yes</button>
                                <button disabled={loading} onClick={() => handleUpdate('bankAccountOpen', false)} className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${lead.bankAccountOpen === false ? 'bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>No</button>
                            </div>
                        </div>
                        <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50">
                            <label className="block text-center cursor-pointer">
                                <span className="block text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Upload Passbook Copy</span>
                                <input type="file" aria-label="Upload Passbook" disabled={loading} onChange={(e) => {
                                    if (e.target.files?.[0]) handleUpdate('bankAccountOpen', lead.bankAccountOpen, 'passbook', e.target.files[0]);
                                }} className="block w-full text-xs text-gray-500 file:mr-2 sm:file:mr-4 file:py-1.5 file:px-3 sm:file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary-green file:text-white hover:file:bg-primary-green-hover disabled:opacity-50" />
                            </label>
                        </div>
                    </div>
                );
            case 6: // NTP
                return (
                    <div className="space-y-4 animate-fade-in">
                        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-4 sm:p-5 rounded-xl border border-blue-100 dark:border-blue-900">
                            <h4 className="font-bold text-sm sm:text-lg mb-3 text-gray-800 dark:text-gray-200">Work Order (NTP) Status</h4>
                            <div className="flex gap-3">
                                <button disabled={loading} onClick={() => handleUpdate('ntpStatus', 'Received')} className={`flex-1 py-3 rounded-xl border-2 font-bold text-xs sm:text-sm transition-all ${lead.ntpStatus === 'Received' ? 'border-green-500 bg-green-500 text-white shadow-lg' : 'border-gray-300 dark:border-gray-600 hover:border-green-400'}`}>
                                    Received
                                </button>
                                <button disabled={loading} onClick={() => handleUpdate('ntpStatus', 'Not_Received')} className={`flex-1 py-3 rounded-xl border-2 font-bold text-xs sm:text-sm transition-all ${lead.ntpStatus === 'Not_Received' ? 'border-red-500 bg-red-500 text-white shadow-lg' : 'border-gray-300 dark:border-gray-600 hover:border-red-400'}`}>
                                    Not Received
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case 7: // AIF
                return (
                    <div className="space-y-4 animate-fade-in">
                        <div className="grid grid-cols-2 gap-3">
                            <button disabled={loading} onClick={() => handleUpdate('aifStatus', 'Done')} className={`p-4 rounded-xl border-2 transition-all ${lead.aifStatus === 'Done' ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'border-gray-200 dark:border-gray-700 hover:border-green-200'}`}>
                                <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 mb-2 mx-auto" />
                                <span className="block text-center font-semibold text-xs sm:text-sm">Done</span>
                            </button>
                            <button disabled={loading} onClick={() => handleUpdate('aifStatus', 'Pending')} className={`p-4 rounded-xl border-2 transition-all ${lead.aifStatus === 'Pending' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300' : 'border-gray-200 dark:border-gray-700 hover:border-yellow-200'}`}>
                                <Clock className="w-6 h-6 sm:w-8 sm:h-8 mb-2 mx-auto" />
                                <span className="block text-center font-semibold text-xs sm:text-sm">Pending</span>
                            </button>
                        </div>
                    </div>
                );
            case 8: // CIF
                return (
                    <div className="space-y-4 animate-fade-in">
                        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 sm:p-5 rounded-xl border border-gray-100 dark:border-gray-700">
                            <span className="text-sm sm:text-lg font-semibold text-gray-700 dark:text-gray-300">Is CIF Approved?</span>
                            <div className="flex gap-2">
                                <button disabled={loading} onClick={() => handleUpdate('cifStatus', true)} className={`px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-bold text-xs sm:text-sm transition-all ${lead.cifStatus ? 'bg-green-500 text-white shadow-md' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>YES</button>
                                <button disabled={loading} onClick={() => handleUpdate('cifStatus', false)} className={`px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-bold text-xs sm:text-sm transition-all ${lead.cifStatus === false ? 'bg-red-500 text-white shadow-md' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>NO</button>
                            </div>
                        </div>
                    </div>
                );
            case 9: // Material
                return (
                    <div className="space-y-4 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Motor Serial No</label>
                                <input type="text" aria-label="Motor Serial Number" disabled={loading} defaultValue={lead.meterSerialNo || ''} onBlur={(e) => handleUpdate('meterSerialNo', e.target.value)} className={inputClasses} placeholder="Enter Motor No" />
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Panel Serial No</label>
                                <input type="text" aria-label="Panel Serial Number" disabled={loading} defaultValue={lead.panelSerialNo || ''} onBlur={(e) => handleUpdate('panelSerialNo', e.target.value)} className={inputClasses} placeholder="Enter Panel No" />
                            </div>
                        </div>
                        <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50">
                            <label className="block text-center cursor-pointer">
                                <span className="block text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Upload Structure Photo</span>
                                <input type="file" aria-label="Upload Structure Photo" disabled={loading} onChange={(e) => {
                                    if (e.target.files?.[0]) handleUpdate('workStatus', 'Material_Dispatched', 'structurePic', e.target.files[0]);
                                }} className="block w-full text-xs text-gray-500 file:mr-2 sm:file:mr-4 file:py-1.5 file:px-3 sm:file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 disabled:opacity-50" />
                            </label>
                        </div>
                        <button disabled={loading} onClick={() => handleUpdate('workStatus', 'Material_Dispatched')} className={btnPrimaryClasses}>Mark Materials Dispatched</button>
                    </div>
                );
            case 10: // Completion
                return (
                    <div className="space-y-4 animate-fade-in">
                        <div className="bg-green-50 dark:bg-green-900/10 p-5 sm:p-8 rounded-2xl border border-green-100 dark:border-green-800 text-center">
                            <Flag className="w-12 h-12 sm:w-16 sm:h-16 text-green-500 mx-auto mb-3" />
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1.5">Final Work Completion</h3>
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4 sm:mb-6">Upload the final photo with customer to complete the project.</p>

                            <div className="mb-4 sm:mb-6 max-w-md mx-auto">
                                <input type="file" aria-label="Upload Customer Project Photo" disabled={loading} onChange={(e) => {
                                    if (e.target.files?.[0]) handleUpdate('workStatus', 'Work_Complete', 'customerPic', e.target.files[0]);
                                }} className="block w-full text-xs text-gray-500 file:mr-2 sm:file:mr-4 file:py-1.5 file:px-3 sm:file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700 disabled:opacity-50" />
                            </div>

                            <button disabled={loading} onClick={() => handleUpdate('workStatus', 'Work_Complete')} className={`${btnPrimaryClasses} px-8 rounded-full`}>
                                Complete Project
                            </button>
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4 px-1">Workflow Steps</h3>

            {STEPS.map((step) => {
                const status = getStepState(step.id);
                const isActive = openStep === step.id;
                const StepIcon = step.icon;
                const isLocked = status === 'locked';
                const isCompleted = status === 'completed';

                return (
                    <div
                        key={step.id}
                        className={`
                            rounded-xl border transition-all duration-300 overflow-hidden
                            ${isActive
                                ? 'bg-white dark:bg-secondary-background border-blue-200 dark:border-blue-900 shadow-lg ring-1 ring-blue-500/20'
                                : 'bg-white dark:bg-secondary-background border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10'
                            }
                            ${isLocked ? 'opacity-60 bg-gray-50 dark:bg-black/20' : ''}
                        `}
                    >
                        {/* Header */}
                        <div
                            onClick={() => !isLocked && setOpenStep(isActive ? null : step.id)}
                            className={`
                                flex items-center p-3 sm:p-4 cursor-pointer select-none
                                ${isActive ? 'pb-3 sm:pb-4 border-b border-dashed border-gray-100 dark:border-white/5' : ''}
                            `}
                        >
                            <div className={`
                                w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mr-3 sm:mr-4 shadow-sm transition-colors
                                ${isCompleted ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' : ''}
                                ${isActive ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : ''}
                                ${!isActive && !isCompleted ? 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400' : ''}
                            `}>
                                {isCompleted ? <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" /> : <StepIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <h4 className={`text-sm sm:text-base font-bold ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                                        {step.title}
                                    </h4>
                                    {isLocked && <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />}
                                    {!isLocked && (
                                        <ChevronRight className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-400 transition-transform duration-300 ${isActive ? 'rotate-90' : ''}`} />
                                    )}
                                </div>
                                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5 uppercase tracking-wide">
                                    {status === 'active' ? 'In Progress' : status}
                                </p>
                            </div>
                        </div>

                        {/* Body - Only rendered if active */}
                        {isActive && (
                            <div className="p-3 sm:p-6 bg-gray-50/50 dark:bg-black/20 animate-fade-in">
                                {renderStepContent(step.id)}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
