import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { createManualLead, getVendors } from '../../service/adminService';
import { User } from '../../types';
import { UserPlus, Settings2, FileText, UploadCloud, FilePlus2 } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

interface FormDataState {
    name: string;
    fatherName: string;
    phone: string;
    district: string;
    tehsil: string;
    village: string;
    hp: string;
    connectionType: string;
    productType: string;
    assignedVendorId: string;
    meterSerialNo: string;
    panelSerialNo: string;
}

const ManualLeadEntryPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [vendors, setVendors] = useState<User[]>([]);
    const [basicProfileFile, setBasicProfileFile] = useState<File | null>(null);

    const [formData, setFormData] = useState<FormDataState>({
        name: '', fatherName: '', phone: '', district: '', tehsil: '',
        village: '', hp: '', connectionType: '', productType: 'pump',
        assignedVendorId: '', meterSerialNo: '', panelSerialNo: ''
    });

    useEffect(() => { if (user && user.role === 'Master') fetchVendors(); }, [user]);

    const fetchVendors = async () => {
        try { const data = await getVendors(); setVendors(data); }
        catch (error) { console.error(error); }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) setBasicProfileFile(e.target.files[0]);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const submitData = new FormData();
            Object.entries(formData).forEach(([key, value]) => { submitData.append(key, value); });
            if (basicProfileFile) submitData.append('basicProfile', basicProfileFile);
            await createManualLead(submitData);
            addToast('Offline case created successfully!', 'success');
            setTimeout(() => { navigate('/admin/leads'); }, 2000);
        } catch (error: any) {
            addToast(error.message || 'Failed to create case. Check mobile number uniqueness.', 'error');
        } finally { setIsLoading(false); }
    };

    const inputClasses = "w-full p-2.5 rounded-lg border text-sm focus:ring-2 focus:ring-[rgb(var(--accent))/0.5] focus:border-[rgb(var(--accent))] outline-none transition-all placeholder:text-[rgb(var(--text-3))]";
    const labelClasses = "block text-[11px] font-600 mb-1.5 uppercase tracking-wide";

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6 anim-fade-up">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs font-600" style={{ color: 'rgb(var(--accent))' }}>
                    <FilePlus2 size={14} /> Data Entry
                </div>
                <h1 className="text-3xl font-700 tracking-tight" style={{ color: 'rgb(var(--text-0))' }}>Offline <span style={{ color: 'rgb(var(--accent))' }}>Entry</span></h1>
                <p className="text-sm font-500" style={{ color: 'rgb(var(--text-2))' }}>Manually digitize offline cases and assign them to the pipeline.</p>
            </div>

            <form onSubmit={handleSubmit} className="crm-card p-6 sm:p-8 space-y-8">
                {/* Basic Info */}
                <section className="space-y-5">
                    <h2 className="text-lg font-700 flex items-center gap-2 pb-3 border-b" style={{ color: 'rgb(var(--text-0))', borderColor: 'rgb(var(--border-muted))' }}>
                        <UserPlus size={18} style={{ color: 'rgb(var(--accent))' }} /> Core Contact Details
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label className={labelClasses} style={{ color: 'rgb(var(--text-2))' }}>Customer Name *</label>
                            <input type="text" name="name" required value={formData.name} onChange={handleChange} className={inputClasses} style={{ backgroundColor: 'rgb(var(--surface-1))', borderColor: 'rgb(var(--border-default))', color: 'rgb(var(--text-0))' }} placeholder="Enter full name" />
                        </div>
                        <div>
                            <label className={labelClasses} style={{ color: 'rgb(var(--text-2))' }}>Father's Name</label>
                            <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} className={inputClasses} style={{ backgroundColor: 'rgb(var(--surface-1))', borderColor: 'rgb(var(--border-default))', color: 'rgb(var(--text-0))' }} placeholder="Father's name" />
                        </div>
                        <div>
                            <label className={labelClasses} style={{ color: 'rgb(var(--text-2))' }}>Mobile Number *</label>
                            <input type="tel" name="phone" required pattern="[0-9]{10}" title="10 digit mobile number" value={formData.phone} onChange={handleChange} className={inputClasses} style={{ backgroundColor: 'rgb(var(--surface-1))', borderColor: 'rgb(var(--border-default))', color: 'rgb(var(--text-0))' }} placeholder="10-digit number" />
                        </div>
                        <div>
                            <label className={labelClasses} style={{ color: 'rgb(var(--text-2))' }}>Horsepower (HP)</label>
                            <input type="text" name="hp" value={formData.hp} onChange={handleChange} className={inputClasses} style={{ backgroundColor: 'rgb(var(--surface-1))', borderColor: 'rgb(var(--border-default))', color: 'rgb(var(--text-0))' }} placeholder="e.g. 5HP, 7.5HP" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                        <div>
                            <label className={labelClasses} style={{ color: 'rgb(var(--text-2))' }}>District</label>
                            <input type="text" name="district" value={formData.district} onChange={handleChange} className={inputClasses} style={{ backgroundColor: 'rgb(var(--surface-1))', borderColor: 'rgb(var(--border-default))', color: 'rgb(var(--text-0))' }} placeholder="District" />
                        </div>
                        <div>
                            <label className={labelClasses} style={{ color: 'rgb(var(--text-2))' }}>Tehsil</label>
                            <input type="text" name="tehsil" value={formData.tehsil} onChange={handleChange} className={inputClasses} style={{ backgroundColor: 'rgb(var(--surface-1))', borderColor: 'rgb(var(--border-default))', color: 'rgb(var(--text-0))' }} placeholder="Tehsil" />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <label className={labelClasses} style={{ color: 'rgb(var(--text-2))' }}>Village</label>
                            <input type="text" name="village" value={formData.village} onChange={handleChange} className={inputClasses} style={{ backgroundColor: 'rgb(var(--surface-1))', borderColor: 'rgb(var(--border-default))', color: 'rgb(var(--text-0))' }} placeholder="Village" />
                        </div>
                    </div>
                </section>

                {/* Technical Specs */}
                <section className="space-y-5">
                    <h2 className="text-lg font-700 flex items-center gap-2 pb-3 border-b" style={{ color: 'rgb(var(--text-0))', borderColor: 'rgb(var(--border-muted))' }}>
                        <Settings2 size={18} style={{ color: 'rgb(var(--color-info))' }} /> Technical Specifications
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label htmlFor="connectionType" className={labelClasses} style={{ color: 'rgb(var(--text-2))' }}>Electric Connection Type</label>
                            <select id="connectionType" name="connectionType" value={formData.connectionType} onChange={handleChange} className={inputClasses} style={{ backgroundColor: 'rgb(var(--surface-1))', borderColor: 'rgb(var(--border-default))', color: 'rgb(var(--text-0))' }}>
                                <option value="">Select Connection Type</option>
                                <option value="Single Phase">Single Phase</option>
                                <option value="Three Phase">Three Phase</option>
                                <option value="None">None / New Connection</option>
                            </select>
                        </div>
                        <input type="hidden" name="productType" value="pump" />
                        {user && user.role === 'Master' && (
                            <div>
                                <label htmlFor="assignedVendorId" className={labelClasses} style={{ color: 'rgb(var(--text-2))' }}>Assign Vendor</label>
                                <select id="assignedVendorId" name="assignedVendorId" value={formData.assignedVendorId} onChange={handleChange} className={inputClasses} style={{ backgroundColor: 'rgb(var(--surface-1))', borderColor: 'rgb(var(--border-default))', color: 'rgb(var(--text-0))' }}>
                                    <option value="">Select Vendor (Optional)</option>
                                    {vendors.map(v => <option key={v.id} value={v.id}>{v.name} ({v.district})</option>)}
                                </select>
                            </div>
                        )}
                    </div>
                </section>

                {/* Document Upload */}
                <section className="space-y-5">
                    <h2 className="text-lg font-700 flex items-center gap-2 pb-3 border-b" style={{ color: 'rgb(var(--text-0))', borderColor: 'rgb(var(--border-muted))' }}>
                        <FileText size={18} style={{ color: 'rgb(var(--color-success))' }} /> Documentation
                    </h2>
                    <div className="p-8 border-2 border-dashed rounded-xl transition-all flex flex-col items-center justify-center text-center relative group" style={{ borderColor: 'rgb(var(--border-muted))', backgroundColor: 'rgb(var(--surface-1))' }}>
                        <label htmlFor="basicProfile" className="cursor-pointer flex flex-col items-center">
                            <div className="mb-4 p-4 rounded-full border transition-all" style={{ backgroundColor: 'rgb(var(--surface-2))', borderColor: 'rgb(var(--border-default))' }}>
                                <UploadCloud size={28} style={{ color: 'rgb(var(--text-2))' }} className="group-hover:text-[rgb(var(--accent))] transition-colors" />
                            </div>
                            <span className="block text-sm font-700 mb-1" style={{ color: 'rgb(var(--text-0))' }}>Upload Basic Profile PDF <span style={{ color: 'rgb(var(--color-danger))' }}>*</span></span>
                            <span className="block text-xs font-500 mb-4 max-w-xs" style={{ color: 'rgb(var(--text-2))' }}>Drag and drop your scanned NTP/Application Form here, or click to browse files.</span>
                            <input id="basicProfile" type="file" accept=".pdf,image/*" onChange={handleFileChange} className="block w-full max-w-xs text-xs file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-600 file:bg-[rgb(var(--accent))] file:text-white hover:file:bg-[rgb(var(--accent))/0.9] cursor-pointer" />
                        </label>
                    </div>
                </section>

                <div className="flex gap-4 pt-6 border-t" style={{ borderColor: 'rgb(var(--border-muted))' }}>
                    <button type="button" onClick={() => navigate('/admin/leads')} className="crm-btn-secondary flex-1 py-3 text-sm">Cancel</button>
                    <button type="submit" disabled={isLoading} className="crm-btn-primary flex-[2] py-3 text-sm">{isLoading ? <span className="flex items-center justify-center gap-2"><LoadingSpinner size="sm" /> Creating Case...</span> : 'Create Offline Case'}</button>
                </div>
            </form>
        </div>
    );
};

export default ManualLeadEntryPage;
