import React, { useState, useEffect } from 'react';
import {
    CheckCircle, ChevronRight, Lock, LayoutDashboard, FileText,
    ClipboardCheck, Settings, Truck, Flag, Zap, Building2, Calculator, Clock,
    Plus, Trash2
} from 'lucide-react';
import { Lead } from '../../types';
import { updateLead } from '../../service/adminService';
import { useToast } from '../../contexts/ToastContext';

interface RooftopWorkflowSectionProps {
    lead: Lead;
    onUpdate: (updatedLead: Lead) => void;
}

const STEPS = [
    { id: 1, title: 'Site Survey', icon: ClipboardCheck },
    { id: 2, title: 'Quotation & Agreement', icon: FileText },
    { id: 3, title: 'Feasibility Approval', icon: CheckCircle },
    { id: 4, title: 'Material Dispatch', icon: Truck },
    { id: 5, title: 'Installation', icon: Settings },
    { id: 6, title: 'Net Metering', icon: Zap },
    { id: 7, title: 'Subsidy Claim', icon: Building2 },
    { id: 8, title: 'Commissioning (PCR)', icon: Flag },
];

const MATERIAL_LIST = [
    "INVERTER 3kWh", "INVERTER 4kWh", "INVERTER 5kWh", "INVERTER 6kWh",
    "1 PHASE ACDB", "3 phase AC DB", "1 PHASE DCDB", "3 PHASE DC DB",
    "PIPE (60*40) (10Fit)", "PIPE (40*40) (10Fit)",
    "DC WIRE (2.5 mm) (IN METRE)", "AC WIRE (1 mm) (IN METRE)",
    "AC WIRE (2.5 mm) (IN METRE)", "LA WIRE (16 sq mm) (IN METRE)",
    "POLYCAB PIPE", "FLEXIBLE PIPE", "BASE PLATE", "J HOOK",
    "PANEL DCR", "PANEL NON DCR", "EARTH ROD + L.A. ROD SET",
    "MC FOR CONNECTOR (IN BOX)", "EARTH RUSH",
    "1 PHASE METER", "3 PHASE METER"
];

export const RooftopWorkflowSection: React.FC<RooftopWorkflowSectionProps> = ({ lead, onUpdate }) => {
    const { addToast } = useToast();
    const [openStep, setOpenStep] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    // Manage local state for panel serials to allow adding multiple
    const [panelSerials, setPanelSerials] = useState<string[]>([]);

    useEffect(() => {
        if (lead.panelSerialNo) {
            setPanelSerials(lead.panelSerialNo.split(',').map(s => s.trim()).filter(s => s));
        } else {
            setPanelSerials(['']); // Start with one empty slot if none exist
        }
    }, [lead.id]); // Only reset on lead change, not local updates unless needed

    const updatePanelSerial = (index: number, value: string) => {
        const newSerials = [...panelSerials];
        newSerials[index] = value;
        setPanelSerials(newSerials);
    };

    const addPanelSerial = () => {
        setPanelSerials([...panelSerials, '']);
    };

    const removePanelSerial = (index: number) => {
        const newSerials = panelSerials.filter((_, i) => i !== index);
        setPanelSerials(newSerials);
        // Trigger save immediately on remove
        const joined = newSerials.filter(s => s.trim()).join(',');
        handleUpdate('panelSerialNo', joined);
    };

    const savePanelSerials = () => {
        const joined = panelSerials.filter(s => s.trim()).join(',');
        // Only update if it changed from prop to avoid loops/redundant calls
        if (joined !== lead.panelSerialNo) {
            handleUpdate('panelSerialNo', joined);
        }
    };

    // Helper to safely access custom fields
    const getField = (key: string) => lead.customFields?.[key];

    // --- Completion Logic ---
    const stepsStatus = {
        1: lead.surveyStatus === 'Completed',
        2: getField('quoteStatus') === 'Signed',
        3: getField('feasibilityStatus') === 'Approved',
        4: lead.workStatus === 'Material_Dispatched' || lead.workStatus === 'Installation_Complete' || lead.workStatus === 'Work_Complete',
        5: getField('installationStatus') === 'Completed' || lead.workStatus === 'Work_Complete',
        6: getField('netMeterStatus') === 'Installed',
        7: getField('subsidyStatus') === 'Applied' || getField('subsidyStatus') === 'Received',
        8: lead.workStatus === 'Work_Complete'
    };

    // Determine the first active/unlocked step to open initially
    useEffect(() => {
        let firstIncomplete = 1;
        for (let i = 1; i <= STEPS.length; i++) {
            // @ts-ignore
            if (!stepsStatus[i]) {
                firstIncomplete = i;
                break;
            }
        }
        setOpenStep(firstIncomplete);
    }, [lead.id]);

    const getStepState = (stepNum: number) => {
        // @ts-ignore
        if (stepsStatus[stepNum]) return 'completed';
        // Previous step must be complete to unlock
        // @ts-ignore
        if (stepNum === 1 || stepsStatus[stepNum - 1]) return 'active';
        return 'locked';
    };

    const handleUpdate = async (field: string, value: any, fileKey?: string, file?: File, isCustom: boolean = false) => {
        if (loading) return;
        setLoading(true);

        const previousLead = { ...lead };

        // Optimistic update
        // Safely parse customFields if it's a string
        const currentCustomFields = typeof lead.customFields === 'string' 
            ? JSON.parse(lead.customFields || '{}') 
            : (lead.customFields || {});

        const optimisticLead = { ...lead };
        if (isCustom) {
            optimisticLead.customFields = {
                ...currentCustomFields,
                [field]: value
            };
        } else {
            (optimisticLead as any)[field] = value;
        }
        
        onUpdate(optimisticLead);

        try {
            let updated;
            if (file && fileKey) {
                // For file uploads, we generally use FormData and send to updateLead
                // The backend handles the file and likely the field update if included
                const formData = new FormData();
                if (isCustom) {
                    // If it's a custom field update with a file, we might typically just send the file
                    // and let the backend store the URL.
                    // But for status updates + file, we might need to send the status field too.
                    // IMPORTANT: If backend doesn't support nested customFields in FormData, 
                    // we might need to rely on it mapping top-level keys to customFields or just accept top-level keys.
                    // Safest relies on standard lead fields where possible, or assumes backend handles arbitrary keys.
                    // Based on LeadDetailPage, it seems generic keys work.
                    formData.append(field, value);
                } else {
                    formData.append(field, value);
                }
                formData.append(fileKey, file);
                updated = await updateLead(lead.id, formData);
            } else {
                // For JSON updates
                if (isCustom) {
                    updated = await updateLead(lead.id, {
                        customFields: {
                            ...lead.customFields,
                            [field]: value
                        }
                    });
                } else {
                    updated = await updateLead(lead.id, { [field]: value });
                }
            }

            onUpdate(updated);
            addToast('Workflow updated successfully', 'success');
        } catch (error: any) {
            console.error("Update failed:", error);
            onUpdate(previousLead);
            addToast(error.message || 'Failed to update workflow', 'error');
        } finally {
            setLoading(false);
        }
    };

    const toggleMaterial = async (item: string) => {
        const currentChecklist = lead.customFields?.materialChecklist || {};
        const updatedChecklist = {
            ...currentChecklist,
            [item]: !currentChecklist[item]
        };
        // We update the 'materialChecklist' custom field directly
        await handleUpdate('materialChecklist', updatedChecklist, undefined, undefined, true);
    };

    const renderStepContent = (stepId: number) => {
        const inputClasses = "w-full p-2 sm:p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-green outline-none transition-all disabled:opacity-50 text-xs sm:text-sm";
        const btnBaseClasses = "w-full flex-1 py-2.5 sm:py-3 rounded-xl font-bold shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs sm:text-sm";
        const btnPrimaryClasses = `${btnBaseClasses} bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-green-500/30`;
        const btnSecondaryClasses = `${btnBaseClasses} bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700`;

        switch (stepId) {
            case 1: // Site Survey
                return (
                    <div className="space-y-4 animate-fade-in">
                        <div className="grid grid-cols-2 gap-3">
                            <button disabled={loading} onClick={() => handleUpdate('surveyStatus', 'Completed')} className={`p-4 rounded-xl border-2 transition-all ${lead.surveyStatus === 'Completed' ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'border-gray-200 dark:border-gray-700 hover:border-green-200'}`}>
                                <ClipboardCheck className="w-6 h-6 sm:w-8 sm:h-8 mb-2 mx-auto" />
                                <span className="block text-center font-semibold text-xs sm:text-sm">Survey Completed</span>
                            </button>
                            <button disabled={loading} onClick={() => handleUpdate('surveyStatus', 'Pending')} className={`p-4 rounded-xl border-2 transition-all ${lead.surveyStatus === 'Pending' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300' : 'border-gray-200 dark:border-gray-700 hover:border-yellow-200'}`}>
                                <Clock className="w-6 h-6 sm:w-8 sm:h-8 mb-2 mx-auto" />
                                <span className="block text-center font-semibold text-xs sm:text-sm">Pending Survey</span>
                            </button>
                        </div>
                        <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50">
                            <label className="block text-center cursor-pointer">
                                <span className="block text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Upload Survey Report/Photos</span>
                                <input type="file" disabled={loading} onChange={(e) => {
                                    if (e.target.files?.[0]) handleUpdate('surveyStatus', 'Completed', 'surveyDoc', e.target.files[0]);
                                }} className="block w-full text-xs text-gray-500 file:mr-2 sm:file:mr-4 file:py-1.5 file:px-3 sm:file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary-green file:text-white hover:file:bg-primary-green-hover disabled:opacity-50" />
                            </label>
                        </div>
                    </div>
                );
            case 2: // Quotation
                return (
                    <div className="space-y-4 animate-fade-in">
                        <div className="bg-gray-50 dark:bg-gray-800 p-3 sm:p-5 rounded-xl border border-gray-100 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-3">
                                <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">Quotation Status</label>
                                <span className={`px-2 py-1 rounded text-[10px] sm:text-xs font-bold ${getField('quoteStatus') === 'Signed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {getField('quoteStatus') || 'Pending'}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <button disabled={loading} onClick={() => handleUpdate('quoteStatus', 'Sent', undefined, undefined, true)} className="py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs sm:text-sm font-medium">Mark Sent</button>
                                <button disabled={loading} onClick={() => handleUpdate('quoteStatus', 'Signed', undefined, undefined, true)} className="py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 text-xs sm:text-sm font-medium">Mark Signed</button>
                            </div>
                        </div>
                        <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50">
                            <label className="block text-center cursor-pointer">
                                <span className="block text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Upload Signed Quote/Agreement</span>
                                <input type="file" disabled={loading} onChange={(e) => {
                                    if (e.target.files?.[0]) handleUpdate('quoteStatus', 'Signed', 'agreementDoc', e.target.files[0], true);
                                }} className="block w-full text-xs text-gray-500 file:mr-2 sm:file:mr-4 file:py-1.5 file:px-3 sm:file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary-green file:text-white hover:file:bg-primary-green-hover disabled:opacity-50" />
                            </label>
                        </div>
                    </div>
                );
            case 3: // Feasibility
                return (
                    <div className="space-y-4 animate-fade-in">
                        <div className="grid grid-cols-2 gap-3">
                            <button disabled={loading} onClick={() => handleUpdate('feasibilityStatus', 'Approved', undefined, undefined, true)} className={`p-4 rounded-xl border-2 transition-all ${getField('feasibilityStatus') === 'Approved' ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'border-gray-200 dark:border-gray-700 hover:border-green-200'}`}>
                                <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 mb-2 mx-auto" />
                                <span className="block text-center font-semibold text-xs sm:text-sm">Feasibility Approved</span>
                            </button>
                            <button disabled={loading} onClick={() => handleUpdate('feasibilityStatus', 'Pending', undefined, undefined, true)} className={`p-4 rounded-xl border-2 transition-all ${getField('feasibilityStatus') === 'Pending' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300' : 'border-gray-200 dark:border-gray-700 hover:border-yellow-200'}`}>
                                <Clock className="w-6 h-6 sm:w-8 sm:h-8 mb-2 mx-auto" />
                                <span className="block text-center font-semibold text-xs sm:text-sm">Pending Approval</span>
                            </button>
                        </div>
                        <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50">
                            <label className="block text-center cursor-pointer">
                                <span className="block text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Upload Feasibility Letter</span>
                                <input type="file" disabled={loading} onChange={(e) => {
                                    if (e.target.files?.[0]) handleUpdate('feasibilityStatus', 'Approved', 'feasibilityDoc', e.target.files[0], true);
                                }} className="block w-full text-xs text-gray-500 file:mr-2 sm:file:mr-4 file:py-1.5 file:px-3 sm:file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary-green file:text-white hover:file:bg-primary-green-hover disabled:opacity-50" />
                            </label>
                        </div>
                    </div>
                );
            case 4: // Material
                return (
                    <div className="space-y-4 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Inverter Serial No *</label>
                                <input type="text" disabled={loading} defaultValue={lead.meterSerialNo || ''} onBlur={(e) => handleUpdate('meterSerialNo', e.target.value)} className={inputClasses} placeholder="Enter Inverter No" />
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Solar Panel Serial No(s) *</label>
                                <div className="space-y-2">
                                    {panelSerials.map((serial, index) => (
                                        <div key={index} className="flex gap-2">
                                            <input
                                                type="text"
                                                disabled={loading}
                                                value={serial}
                                                onChange={(e) => updatePanelSerial(index, e.target.value)}
                                                onBlur={savePanelSerials}
                                                className={inputClasses}
                                                placeholder={`Panel ${index + 1} Serial No`}
                                            />
                                            {panelSerials.length > 1 && (
                                                <button
                                                    onClick={() => removePanelSerial(index)}
                                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    title="Remove Panel"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        onClick={addPanelSerial}
                                        className="text-xs sm:text-sm font-bold text-primary-green hover:underline flex items-center gap-1 mt-1"
                                    >
                                        <Plus className="w-3 h-3 sm:w-4 sm:h-4" /> Add Panel
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Material Checklist */}
                        <div className="mt-3 bg-gray-100 dark:bg-gray-800/50 p-3 sm:p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                            <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2 text-sm">
                                <ClipboardCheck className="w-4 h-4 text-primary-green" />
                                Material Checklist
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                {MATERIAL_LIST.map((item, idx) => {
                                    const isChecked = lead.customFields?.materialChecklist?.[item] || false;
                                    return (
                                        <label key={idx} className="flex items-center gap-2 p-1.5 bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-700 cursor-pointer hover:border-primary-green/50 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => toggleMaterial(item)}
                                                disabled={loading}
                                                className="w-3 h-3 text-primary-green rounded focus:ring-primary-green disabled:opacity-50"
                                            />
                                            <span className={`text-[10px] sm:text-xs ${isChecked ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                                                {item}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                            <p className="text-[9px] sm:text-xs text-gray-500 mt-1 text-right italic">Check items as they are prepared/dispatched.</p>
                        </div>

                        <button
                            disabled={loading || !lead.meterSerialNo || !lead.panelSerialNo}
                            title={(!lead.meterSerialNo || !lead.panelSerialNo) ? "Please enter Inverter and Panel serial numbers first" : "Mark Dispatched"}
                            onClick={() => handleUpdate('workStatus', 'Material_Dispatched')}
                            className={`${btnPrimaryClasses} mt-4`}
                        >
                            Mark Materials Dispatched
                        </button>
                    </div>
                );
            case 5: // Installation
                return (
                    <div className="space-y-4 animate-fade-in">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                            <h4 className="font-bold text-sm sm:text-lg mb-3 text-blue-900 dark:text-blue-100">Installation Progress</h4>
                            <div className="flex gap-3">
                                <button disabled={loading} onClick={() => handleUpdate('installationStatus', 'Completed', undefined, undefined, true)} className={`flex-1 py-2.5 sm:py-3 rounded-lg border-2 font-bold text-xs sm:text-sm transition-all ${getField('installationStatus') === 'Completed' ? 'bg-green-500 text-white border-green-500 shadow-md' : 'bg-white text-gray-700 border-gray-200 hover:border-green-300'}`}>
                                    Completed
                                </button>
                                <button disabled={loading} onClick={() => handleUpdate('installationStatus', 'In_Progress', undefined, undefined, true)} className={`flex-1 py-2.5 sm:py-3 rounded-lg border-2 font-bold text-xs sm:text-sm transition-all ${getField('installationStatus') === 'In_Progress' ? 'bg-yellow-500 text-white border-yellow-500 shadow-md' : 'bg-white text-gray-700 border-gray-200 hover:border-yellow-300'}`}>
                                    In Progress
                                </button>
                            </div>
                        </div>
                        <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50">
                            <label className="block text-center cursor-pointer">
                                <span className="block text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Upload Installation Photos</span>
                                <input type="file" disabled={loading} onChange={(e) => {
                                    if (e.target.files?.[0]) handleUpdate('installationStatus', 'Completed', 'installationPic', e.target.files[0], true);
                                }} className="block w-full text-xs text-gray-500 file:mr-2 sm:file:mr-4 file:py-1.5 file:px-3 sm:file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary-green file:text-white hover:file:bg-primary-green-hover disabled:opacity-50" />
                            </label>
                        </div>
                    </div>
                );
            case 6: // Net Metering
                return (
                    <div className="space-y-4 animate-fade-in">
                        <div className="grid grid-cols-2 gap-3">
                            <button disabled={loading} onClick={() => handleUpdate('netMeterStatus', 'Installed', undefined, undefined, true)} className={`p-4 rounded-xl border-2 transition-all ${getField('netMeterStatus') === 'Installed' ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'border-gray-200 dark:border-gray-700 hover:border-green-200'}`}>
                                <Zap className="w-6 h-6 sm:w-8 sm:h-8 mb-2 mx-auto" />
                                <span className="block text-center font-semibold text-xs sm:text-sm">Net Meter Installed</span>
                            </button>
                            <button disabled={loading} onClick={() => handleUpdate('netMeterStatus', 'Pending', undefined, undefined, true)} className={`p-4 rounded-xl border-2 transition-all ${getField('netMeterStatus') === 'Pending' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300' : 'border-gray-200 dark:border-gray-700 hover:border-yellow-200'}`}>
                                <Clock className="w-6 h-6 sm:w-8 sm:h-8 mb-2 mx-auto" />
                                <span className="block text-center font-semibold text-xs sm:text-sm">Pending</span>
                            </button>
                        </div>
                        <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50">
                            <label className="block text-center cursor-pointer">
                                <span className="block text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Upload Net Metering Report</span>
                                <input type="file" disabled={loading} onChange={(e) => {
                                    if (e.target.files?.[0]) handleUpdate('netMeterStatus', 'Installed', 'netMeterDoc', e.target.files[0], true);
                                }} className="block w-full text-xs text-gray-500 file:mr-2 sm:file:mr-4 file:py-1.5 file:px-3 sm:file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary-green file:text-white hover:file:bg-primary-green-hover disabled:opacity-50" />
                            </label>
                        </div>
                    </div>
                );
            case 7: // Subsidy
                return (
                    <div className="space-y-4 animate-fade-in">
                        <div className="bg-gray-50 dark:bg-gray-800 p-3 sm:p-5 rounded-xl border border-gray-100 dark:border-gray-700">
                            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Subsidy Status</label>
                            <select
                                disabled={loading}
                                value={getField('subsidyStatus') || ''}
                                aria-label="Subsidy Status"
                                title="Subsidy Status"
                                onChange={(e) => handleUpdate('subsidyStatus', e.target.value, undefined, undefined, true)}
                                className={inputClasses}
                            >
                                <option value="">Select Status</option>
                                <option value="Not_Applied">Not Applied</option>
                                <option value="Applied">Applied</option>
                                <option value="Received">Received</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>
                    </div>
                );
            case 8: // Commissioning
                return (
                    <div className="space-y-4 animate-fade-in">
                        <div className="bg-green-50 dark:bg-green-900/10 p-5 sm:p-8 rounded-2xl border border-green-100 dark:border-green-800 text-center">
                            <Flag className="w-12 h-12 sm:w-16 sm:h-16 text-green-500 mx-auto mb-3" />
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">Project Commissioning</h3>
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-6">Upload the PCR (Project Completion Report) to finish.</p>

                            <div className="mb-6 max-w-md mx-auto">
                                <input type="file" aria-label="Upload PCR" disabled={loading} onChange={(e) => {
                                    if (e.target.files?.[0]) handleUpdate('workStatus', 'Work_Complete', 'pcrDoc', e.target.files[0]);
                                }} className="block w-full text-xs text-gray-500 file:mr-2 sm:file:mr-4 file:py-1.5 file:px-3 sm:file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700 disabled:opacity-50" />
                            </div>

                            <button disabled={loading} onClick={() => handleUpdate('workStatus', 'Work_Complete')} className={`${btnPrimaryClasses} px-8 rounded-full`}>
                                Mark Project Complete
                            </button>
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white px-1">Rooftop Solar Workflow</h3>
                <span className="bg-blue-100 text-blue-800 text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-medium">Rooftop</span>
            </div>

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
