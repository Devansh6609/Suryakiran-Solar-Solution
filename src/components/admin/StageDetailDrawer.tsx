import React, { useState, useEffect } from 'react';
import { PipelineStage, StageVerificationRecord, MaterialCheckItem } from '../../types';
import { 
    X, 
    CheckCircle2, 
    AlertTriangle, 
    Upload, 
    MapPin, 
    Camera, 
    ShieldCheck, 
    PackageCheck, 
    Sparkles, 
    IndianRupee,
    ExternalLink,
    Lock
} from 'lucide-react';
import { verifyLeadStage, overrideLeadStage } from '../../service/adminService';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../LoadingSpinner';
import { createPortal } from 'react-dom';

interface StageDetailDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    leadId: string;
    stageName: PipelineStage;
    currentLeadStage: PipelineStage;
    verificationRecord?: StageVerificationRecord;
    existingMaterialChecklist?: MaterialCheckItem[];
    onStageVerified: () => void;
}

const DEFAULT_13_MATERIALS: MaterialCheckItem[] = [
    { componentName: 'Solar Panel', requiredQty: '12', receivedQty: '12', condition: 'Good' },
    { componentName: 'Inverter', requiredQty: '1', receivedQty: '1', condition: 'Good' },
    { componentName: 'Structure', requiredQty: '1 Set', receivedQty: '1 Set', condition: 'Good' },
    { componentName: 'DC Cable', requiredQty: 'Yes', receivedQty: 'Yes', condition: 'Good' },
    { componentName: 'AC Cable', requiredQty: 'Yes', receivedQty: 'Yes', condition: 'Good' },
    { componentName: 'MC4 Connector', requiredQty: '24', receivedQty: '24', condition: 'Good' },
    { componentName: 'Earthing Kit', requiredQty: '2', receivedQty: '2', condition: 'Good' },
    { componentName: 'Lightning Arrestor', requiredQty: '1', receivedQty: '1', condition: 'Good' },
    { componentName: 'ACDB', requiredQty: '1', receivedQty: '1', condition: 'Good' },
    { componentName: 'DCDB', requiredQty: '1', receivedQty: '1', condition: 'Good' },
    { componentName: 'Conduit', requiredQty: 'Yes', receivedQty: 'Yes', condition: 'Good' },
    { componentName: 'Cable Tray', requiredQty: 'Yes', receivedQty: 'Yes', condition: 'Good' },
    { componentName: 'Fasteners', requiredQty: 'Yes', receivedQty: 'Yes', condition: 'Good' },
];

const StageDetailDrawer: React.FC<StageDetailDrawerProps> = ({
    isOpen,
    onClose,
    leadId,
    stageName,
    currentLeadStage,
    verificationRecord,
    existingMaterialChecklist,
    onStageVerified
}) => {
    const { user } = useAuth();
    const [submitting, setSubmitting] = useState(false);
    const [remarks, setRemarks] = useState('');
    const [assignedEmployee, setAssignedEmployee] = useState('');

    const [evidence, setEvidence] = useState<Record<string, any>>({});
    const [materialItems, setMaterialItems] = useState<MaterialCheckItem[]>(DEFAULT_13_MATERIALS);
    const [overrideReason, setOverrideReason] = useState('');
    const [showOverride, setShowOverride] = useState(false);

    useEffect(() => {
        if (verificationRecord) {
            setRemarks(verificationRecord.remarks || '');
            setAssignedEmployee(verificationRecord.assignedTo || '');
            setEvidence(verificationRecord.evidenceData || {});
        } else {
            setRemarks('');
            setAssignedEmployee(user?.name || '');
            setEvidence({
                roofPhotos: [],
                installationPhotos: [],
                photos: [],
                surveyDate: new Date().toISOString().split('T')[0],
                surveyEngineer: user?.name || '',
                latitude: '',
                longitude: '',
                paymentAmount: '',
                utrNumber: '',
                commMethod: 'WhatsApp'
            });
        }

        if (existingMaterialChecklist && existingMaterialChecklist.length > 0) {
            setMaterialItems(existingMaterialChecklist);
        } else {
            setMaterialItems(DEFAULT_13_MATERIALS);
        }
    }, [stageName, verificationRecord, existingMaterialChecklist, user]);

    if (!isOpen) return null;

    const isVerified = verificationRecord?.status === 'Completed';

    const handleFileUpload = (field: string, isArray: boolean = false) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,video/*,.pdf';
        input.onchange = (e: any) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
                const url = reader.result as string;
                if (isArray) {
                    setEvidence(prev => ({
                        ...prev,
                        [field]: [...(prev[field] || []), url]
                    }));
                } else {
                    setEvidence(prev => ({ ...prev, [field]: url }));
                }
            };
            reader.readAsDataURL(file);
        };
        input.click();
    };

    const validateStage = () => {
        if (isVerified) return true;
        if (stageName === PipelineStage.Survey) {
            const photos = evidence.roofPhotos || [];
            return photos.length >= 5 && evidence.latitude && evidence.longitude && evidence.meterPhoto && evidence.panelPhoto;
        }
        if (stageName === PipelineStage.CustomerApproved || stageName === PipelineStage.Completed) {
            return evidence.paymentAmount && evidence.utrNumber && evidence.paymentScreenshot;
        }
        if (stageName === PipelineStage.MaterialDispatched) {
            return materialItems.length >= 13;
        }
        if (stageName === PipelineStage.Installation) {
            const photos = evidence.installationPhotos || [];
            return photos.length >= 10 && evidence.customerSignature && evidence.engineerSignature;
        }
        return true;
    };

    const isValidated = validateStage();

    const handleVerifySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await verifyLeadStage(leadId, {
                targetStage: stageName,
                remarks,
                assignedEmployee,
                evidenceData: evidence,
                materialChecklistItems: stageName === PipelineStage.MaterialDispatched ? materialItems : undefined
            });
            onStageVerified();
            onClose();
        } catch (err: any) {
            alert(err.message || 'Failed to verify stage.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAdminOverride = async () => {
        if (!overrideReason.trim()) return alert('Please enter override reason.');
        try {
            setSubmitting(true);
            await overrideLeadStage(leadId, stageName, overrideReason);
            onStageVerified();
            onClose();
        } catch (err: any) {
            alert(err.message || 'Failed to override stage.');
        } finally {
            setSubmitting(false);
        }
    };

    const inputClasses = "w-full p-2.5 rounded-lg border text-sm focus:ring-2 focus:ring-[rgb(var(--accent))/0.5] focus:border-[rgb(var(--accent))] outline-none transition-all placeholder:text-[rgb(var(--text-3))]";
    const labelClasses = "block text-[11px] font-600 mb-1.5 uppercase tracking-wide";

    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm anim-fade-in">
            <div className="crm-card w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden relative shadow-2xl">
                
                {/* Header */}
                <button onClick={onClose} className="absolute top-5 right-5 p-1.5 rounded hover:bg-[rgb(var(--surface-2))]" style={{ color: 'rgb(var(--text-2))' }}>
                    <X size={20} />
                </button>
                <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: 'rgb(var(--border-muted))' }}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${isVerified ? 'bg-[rgb(var(--color-success))/0.1] text-[rgb(var(--color-success))]' : 'bg-[rgb(var(--accent))/0.1] text-[rgb(var(--accent))]'}`}>
                            {isVerified ? <CheckCircle2 size={24} /> : <Sparkles size={24} />}
                        </div>
                        <div>
                            <span className="text-[10px] font-700 uppercase tracking-widest" style={{ color: 'rgb(var(--text-2))' }}>
                                Stage Verification & Evidence
                            </span>
                            <h3 className="text-xl font-700" style={{ color: 'rgb(var(--text-0))' }}>{stageName}</h3>
                        </div>
                    </div>
                </div>

                {/* Scrollable Form Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                    {/* Status Alert */}
                    {isVerified ? (
                        <div className="p-4 rounded-xl flex items-center justify-between text-xs font-700" style={{ backgroundColor: 'rgb(var(--color-success)/0.1)', color: 'rgb(var(--color-success))', border: '1px solid rgb(var(--color-success)/0.3)' }}>
                            <div className="flex items-center gap-2">
                                <ShieldCheck size={18} />
                                <span>Verified by {verificationRecord?.verifiedBy || 'Admin'}</span>
                            </div>
                            <span>{new Date(verificationRecord?.createdAt || '').toLocaleString('en-IN')}</span>
                        </div>
                    ) : (
                        <div className="p-4 rounded-xl flex items-center gap-2 text-xs font-700" style={{ backgroundColor: 'rgb(var(--color-warning)/0.1)', color: 'rgb(var(--color-warning))', border: '1px solid rgb(var(--color-warning)/0.3)' }}>
                            <AlertTriangle size={18} />
                            <span>Mandatory Verification Required: Complete all required evidence fields below to verify.</span>
                        </div>
                    )}

                    {/* Employee & Date Meta */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClasses} style={{ color: 'rgb(var(--text-2))' }}>Assigned Engineer / Employee</label>
                            <input
                                type="text"
                                value={assignedEmployee}
                                onChange={(e) => setAssignedEmployee(e.target.value)}
                                disabled={isVerified}
                                placeholder="e.g. Rahul Patel"
                                className={inputClasses}
                                style={{ backgroundColor: 'rgb(var(--surface-1))', borderColor: 'rgb(var(--border-default))', color: 'rgb(var(--text-0))' }}
                            />
                        </div>

                        <div>
                            <label className={labelClasses} style={{ color: 'rgb(var(--text-2))' }}>Verification Remarks</label>
                            <input
                                type="text"
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                disabled={isVerified}
                                placeholder="Stage checklist verified cleanly."
                                className={inputClasses}
                                style={{ backgroundColor: 'rgb(var(--surface-1))', borderColor: 'rgb(var(--border-default))', color: 'rgb(var(--text-0))' }}
                            />
                        </div>
                    </div>

                    {/* STAGE-SPECIFIC EVIDENCE FORMS */}

                    {/* STAGE: Survey */}
                    {stageName === PipelineStage.Survey && (
                        <div className="space-y-4 p-5 rounded-2xl border" style={{ backgroundColor: 'rgb(var(--surface-1))', borderColor: 'rgb(var(--border-muted))' }}>
                            <h4 className="text-sm font-700 flex items-center gap-2" style={{ color: 'rgb(var(--accent))' }}>
                                <MapPin size={16} /> Physical Survey Verification Evidence
                            </h4>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={labelClasses} style={{ color: 'rgb(var(--text-2))' }}>GPS Latitude</label>
                                    <input
                                        type="text"
                                        value={evidence.latitude || ''}
                                        onChange={e => setEvidence(prev => ({ ...prev, latitude: e.target.value }))}
                                        placeholder="23.0225° N"
                                        disabled={isVerified}
                                        className={inputClasses}
                                        style={{ backgroundColor: 'rgb(var(--surface-2))', borderColor: 'rgb(var(--border-default))', color: 'rgb(var(--text-0))' }}
                                    />
                                </div>
                                <div>
                                    <label className={labelClasses} style={{ color: 'rgb(var(--text-2))' }}>GPS Longitude</label>
                                    <input
                                        type="text"
                                        value={evidence.longitude || ''}
                                        onChange={e => setEvidence(prev => ({ ...prev, longitude: e.target.value }))}
                                        placeholder="72.5714° E"
                                        disabled={isVerified}
                                        className={inputClasses}
                                        style={{ backgroundColor: 'rgb(var(--surface-2))', borderColor: 'rgb(var(--border-default))', color: 'rgb(var(--text-0))' }}
                                    />
                                </div>
                            </div>

                            {evidence.latitude && evidence.longitude && (
                                <a
                                    href={`https://maps.google.com/?q=${evidence.latitude},${evidence.longitude}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-3 rounded-xl border text-xs font-700 flex items-center justify-between transition-all"
                                    style={{ backgroundColor: 'rgb(var(--accent)/0.1)', borderColor: 'rgb(var(--accent)/0.2)', color: 'rgb(var(--accent))' }}
                                >
                                    <span>✓ Google Map Location Pin Verified</span>
                                    <ExternalLink size={14} />
                                </a>
                            )}

                            {/* Roof Photos Upload */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className={labelClasses} style={{ color: 'rgb(var(--text-2))', marginBottom: 0 }}>Roof Photos (Min 5 Required)</label>
                                    <span className="text-[10px] font-700" style={{ color: 'rgb(var(--accent))' }}>{(evidence.roofPhotos || []).length}/5 Photos</span>
                                </div>

                                <div className="grid grid-cols-4 gap-2 mb-2">
                                    {(evidence.roofPhotos || []).map((url: string, idx: number) => (
                                        <div key={idx} className="h-16 rounded-lg overflow-hidden border">
                                            <img src={url} alt="" className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                    {!isVerified && (
                                        <button
                                            type="button"
                                            onClick={() => handleFileUpload('roofPhotos', true)}
                                            className="h-16 rounded-lg border border-dashed flex flex-col items-center justify-center text-[10px] font-700 cursor-pointer"
                                            style={{ borderColor: 'rgb(var(--accent)/0.4)', color: 'rgb(var(--accent))' }}
                                        >
                                            <Camera size={16} className="mb-1" />
                                            + Add Photo
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Meter & Panel Photos */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={labelClasses} style={{ color: 'rgb(var(--text-2))' }}>Electric Meter Photo</label>
                                    {evidence.meterPhoto ? (
                                        <div className="h-20 rounded-lg overflow-hidden border mt-1">
                                            <img src={evidence.meterPhoto} alt="" className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => handleFileUpload('meterPhoto')}
                                            disabled={isVerified}
                                            className="w-full mt-1 p-3 rounded-xl border border-dashed text-xs font-700 flex items-center justify-center gap-2 cursor-pointer"
                                            style={{ backgroundColor: 'rgb(var(--surface-2))', borderColor: 'rgb(var(--border-muted))', color: 'rgb(var(--text-2))' }}
                                        >
                                            <Upload size={14} /> Meter Photo
                                        </button>
                                    )}
                                </div>

                                <div>
                                    <label className={labelClasses} style={{ color: 'rgb(var(--text-2))' }}>Main Panel Photo</label>
                                    {evidence.panelPhoto ? (
                                        <div className="h-20 rounded-lg overflow-hidden border mt-1">
                                            <img src={evidence.panelPhoto} alt="" className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => handleFileUpload('panelPhoto')}
                                            disabled={isVerified}
                                            className="w-full mt-1 p-3 rounded-xl border border-dashed text-xs font-700 flex items-center justify-center gap-2 cursor-pointer"
                                            style={{ backgroundColor: 'rgb(var(--surface-2))', borderColor: 'rgb(var(--border-muted))', color: 'rgb(var(--text-2))' }}
                                        >
                                            <Upload size={14} /> Panel Photo
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STAGE: Customer Approved & Completed Payments */}
                    {(stageName === PipelineStage.CustomerApproved || stageName === PipelineStage.Completed) && (
                        <div className="space-y-4 p-5 rounded-2xl border" style={{ backgroundColor: 'rgb(var(--surface-1))', borderColor: 'rgb(var(--border-muted))' }}>
                            <h4 className="text-sm font-700 flex items-center gap-2" style={{ color: 'rgb(var(--color-success))' }}>
                                <IndianRupee size={16} /> Finance Verification & Receipt Upload
                            </h4>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={labelClasses} style={{ color: 'rgb(var(--text-2))' }}>Payment Amount (₹)</label>
                                    <input
                                        type="number"
                                        value={evidence.paymentAmount || ''}
                                        onChange={e => setEvidence(prev => ({ ...prev, paymentAmount: e.target.value }))}
                                        placeholder="50000"
                                        disabled={isVerified}
                                        className={inputClasses}
                                        style={{ backgroundColor: 'rgb(var(--surface-2))', borderColor: 'rgb(var(--border-default))', color: 'rgb(var(--text-0))' }}
                                    />
                                </div>
                                <div>
                                    <label className={labelClasses} style={{ color: 'rgb(var(--text-2))' }}>UTR / Transaction #</label>
                                    <input
                                        type="text"
                                        value={evidence.utrNumber || ''}
                                        onChange={e => setEvidence(prev => ({ ...prev, utrNumber: e.target.value }))}
                                        placeholder="UTR123456789"
                                        disabled={isVerified}
                                        className={inputClasses}
                                        style={{ backgroundColor: 'rgb(var(--surface-2))', borderColor: 'rgb(var(--border-default))', color: 'rgb(var(--text-0))' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={labelClasses} style={{ color: 'rgb(var(--text-2))' }}>Payment Proof Screenshot</label>
                                {evidence.paymentScreenshot ? (
                                    <div className="h-32 rounded-xl overflow-hidden border mt-1">
                                        <img src={evidence.paymentScreenshot} alt="" className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => handleFileUpload('paymentScreenshot')}
                                        disabled={isVerified}
                                        className="w-full mt-1 p-4 rounded-xl border border-dashed text-xs font-700 flex items-center justify-center gap-2 cursor-pointer"
                                        style={{ backgroundColor: 'rgb(var(--surface-2))', borderColor: 'rgb(var(--border-muted))', color: 'rgb(var(--accent))' }}
                                    >
                                        <Upload size={16} /> Upload Payment Screenshot
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* STAGE: Material Dispatched - 13-Component Checklist */}
                    {stageName === PipelineStage.MaterialDispatched && (
                        <div className="space-y-4 p-5 rounded-2xl border" style={{ backgroundColor: 'rgb(var(--surface-1))', borderColor: 'rgb(var(--border-muted))' }}>
                            <h4 className="text-sm font-700 flex items-center gap-2" style={{ color: 'rgb(var(--accent))' }}>
                                <PackageCheck size={16} /> 13-Component Material Delivery Matrix
                            </h4>

                            <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'rgb(var(--border-muted))' }}>
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="text-[10px] uppercase font-700 border-b" style={{ backgroundColor: 'rgb(var(--surface-2))', color: 'rgb(var(--text-2))', borderColor: 'rgb(var(--border-muted))' }}>
                                            <th className="p-3">Component</th>
                                            <th className="p-3">Req</th>
                                            <th className="p-3">Recv</th>
                                            <th className="p-3">Condition</th>
                                            <th className="p-3">Photo</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y font-600" style={{ divideColor: 'rgb(var(--border-muted))' }}>
                                        {materialItems.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-[rgb(var(--surface-2))] transition-colors">
                                                <td className="p-3" style={{ color: 'rgb(var(--text-0))' }}>{item.componentName}</td>
                                                <td className="p-3" style={{ color: 'rgb(var(--text-2))' }}>{item.requiredQty}</td>
                                                <td className="p-3">
                                                    <input
                                                        type="text"
                                                        value={item.receivedQty}
                                                        onChange={e => {
                                                            const val = e.target.value;
                                                            setMaterialItems(prev => prev.map((m, i) => i === idx ? { ...m, receivedQty: val } : m));
                                                        }}
                                                        disabled={isVerified}
                                                        className="w-12 text-center rounded text-xs font-600 px-1 py-1 border"
                                                        style={{ backgroundColor: 'rgb(var(--surface-0))', borderColor: 'rgb(var(--border-default))', color: 'rgb(var(--text-0))' }}
                                                    />
                                                </td>
                                                <td className="p-3">
                                                    <select
                                                        value={item.condition}
                                                        onChange={e => {
                                                            const val = e.target.value as any;
                                                            setMaterialItems(prev => prev.map((m, i) => i === idx ? { ...m, condition: val } : m));
                                                        }}
                                                        disabled={isVerified}
                                                        className="rounded text-xs font-600 px-2 py-1 border"
                                                        style={{ backgroundColor: 'rgb(var(--surface-0))', borderColor: 'rgb(var(--border-default))', color: 'rgb(var(--text-0))' }}
                                                    >
                                                        <option value="Good">Good</option>
                                                        <option value="Damaged">Damaged</option>
                                                        <option value="Missing">Missing</option>
                                                    </select>
                                                </td>
                                                <td className="p-3">
                                                    {item.photoUrl ? (
                                                        <span className="text-[10px] font-700" style={{ color: 'rgb(var(--color-success))' }}>✓ Uploaded</span>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleFileUpload(`material_${idx}`)}
                                                            disabled={isVerified}
                                                            className="text-[10px] font-700 hover:underline"
                                                            style={{ color: 'rgb(var(--accent))' }}
                                                        >
                                                            + Photo
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* STAGE: Installation */}
                    {stageName === PipelineStage.Installation && (
                        <div className="space-y-4 p-5 rounded-2xl border" style={{ backgroundColor: 'rgb(var(--surface-1))', borderColor: 'rgb(var(--border-muted))' }}>
                            <h4 className="text-sm font-700 flex items-center gap-2" style={{ color: 'rgb(var(--accent))' }}>
                                <Camera size={16} /> Installation Completion Proof (Min 10 Photos)
                            </h4>

                            <div className="grid grid-cols-4 gap-2 mb-2">
                                {(evidence.installationPhotos || []).map((url: string, idx: number) => (
                                    <div key={idx} className="h-16 rounded-lg overflow-hidden border">
                                        <img src={url} alt="" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                                {!isVerified && (
                                    <button
                                        type="button"
                                        onClick={() => handleFileUpload('installationPhotos', true)}
                                        className="h-16 rounded-lg border border-dashed flex flex-col items-center justify-center text-[10px] font-700 cursor-pointer"
                                        style={{ borderColor: 'rgb(var(--accent)/0.4)', color: 'rgb(var(--accent))' }}
                                    >
                                        <Camera size={16} className="mb-1" />
                                        + Add Photo
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={labelClasses} style={{ color: 'rgb(var(--text-2))' }}>Customer Digital Signature</label>
                                    <input
                                        type="text"
                                        value={evidence.customerSignature || ''}
                                        onChange={e => setEvidence(prev => ({ ...prev, customerSignature: e.target.value }))}
                                        placeholder="Type or upload signature"
                                        disabled={isVerified}
                                        className={inputClasses}
                                        style={{ backgroundColor: 'rgb(var(--surface-2))', borderColor: 'rgb(var(--border-default))', color: 'rgb(var(--text-0))' }}
                                    />
                                </div>
                                <div>
                                    <label className={labelClasses} style={{ color: 'rgb(var(--text-2))' }}>Engineer Signature</label>
                                    <input
                                        type="text"
                                        value={evidence.engineerSignature || ''}
                                        onChange={e => setEvidence(prev => ({ ...prev, engineerSignature: e.target.value }))}
                                        placeholder="Engineer Name Sign"
                                        disabled={isVerified}
                                        className={inputClasses}
                                        style={{ backgroundColor: 'rgb(var(--surface-2))', borderColor: 'rgb(var(--border-default))', color: 'rgb(var(--text-0))' }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Master Admin Override Accordion */}
                    {user?.role === 'Master' && !isVerified && (
                        <div className="pt-4 border-t" style={{ borderColor: 'rgb(var(--border-muted))' }}>
                            <button
                                type="button"
                                onClick={() => setShowOverride(!showOverride)}
                                className="text-xs font-700 flex items-center gap-1.5 hover:underline"
                                style={{ color: 'rgb(var(--color-warning))' }}
                            >
                                <Lock size={12} />
                                <span>Master Admin Stage Override Option</span>
                            </button>

                            {showOverride && (
                                <div className="mt-3 p-4 rounded-xl border space-y-3" style={{ backgroundColor: 'rgb(var(--color-warning)/0.1)', borderColor: 'rgb(var(--color-warning)/0.3)' }}>
                                    <label className={labelClasses} style={{ color: 'rgb(var(--color-warning))' }}>Override Justification Reason</label>
                                    <input
                                        type="text"
                                        value={overrideReason}
                                        onChange={e => setOverrideReason(e.target.value)}
                                        placeholder="Manual site bypass approved by Admin"
                                        className={inputClasses}
                                        style={{ backgroundColor: 'rgb(var(--surface-0))', borderColor: 'rgb(var(--border-default))', color: 'rgb(var(--text-0))' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAdminOverride}
                                        disabled={submitting}
                                        className="w-full py-2.5 rounded-lg font-700 text-xs uppercase transition-all"
                                        style={{ backgroundColor: 'rgb(var(--color-warning))', color: 'white' }}
                                    >
                                        Force Mark Stage Complete
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                </div>

                {/* Footer Submit Bar */}
                <div className="p-6 border-t flex items-center justify-end gap-3" style={{ borderColor: 'rgb(var(--border-muted))', backgroundColor: 'rgb(var(--surface-0))' }}>
                    <button
                        type="button"
                        onClick={onClose}
                        className="crm-btn-secondary px-5 py-2 text-xs"
                    >
                        Close
                    </button>

                    {!isVerified && (
                        <button
                            onClick={handleVerifySubmit}
                            disabled={submitting || !isValidated}
                            className={`crm-btn-primary px-5 py-2 text-xs flex items-center gap-2 ${!isValidated ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {submitting ? <LoadingSpinner size="sm" /> : <ShieldCheck size={16} />}
                            <span>Complete & Verify Stage</span>
                        </button>
                    )}
                </div>

            </div>
        </div>,
        modalRoot
    );
};

export default StageDetailDrawer;
