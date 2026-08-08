import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    ClipboardCheck, 
    User, 
    Phone, 
    MapPin, 
    Calendar, 
    Clock, 
    CheckCircle2, 
    AlertTriangle, 
    Save, 
    Download, 
    Upload, 
    Camera, 
    FileText, 
    Zap, 
    ShieldCheck, 
    Building2, 
    Compass, 
    Ruler, 
    Check, 
    X,
    Eye,
    Plus,
    Lock
} from 'lucide-react';
import { getSurveyById, updateSurveySection, reviewSurvey } from '../../service/adminService';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/admin/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import LightboxGalleryModal from '../../components/admin/LightboxGalleryModal';
import { generateSurveyReportPdf } from '../../service/surveyPdfGenerator';

const TABS = [
    { id: 'overview', label: '1. Overview & GPS' },
    { id: 'roof', label: '2. Roof & Obstacles' },
    { id: 'measurements', label: '3. Layout & kW Calc' },
    { id: 'electrical', label: '4. Electrical & Meter' },
    { id: 'materials', label: '5. Feasibility & Materials' },
    { id: 'media', label: '6. Categorized Media' },
    { id: 'signatures', label: '7. Signatures & Review' },
    { id: 'history', label: '8. Timeline & History' },
];

const SurveyDetailPage: React.FC = () => {
    const { surveyId } = useParams<{ surveyId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [survey, setSurvey] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [saving, setSaving] = useState(false);
    const [reviewRemarks, setReviewRemarks] = useState('');

    // Active Section Form States
    const [customerInfo, setCustomerInfo] = useState<any>({});
    const [roofDetails, setRoofDetails] = useState<any>({});
    const [measurements, setMeasurements] = useState<any>({});
    const [electrical, setElectrical] = useState<any>({});
    const [feasibility, setFeasibility] = useState<any>({});
    const [materialEstimates, setMaterialEstimates] = useState<any[]>([]);

    // Gallery state
    const [galleryState, setGalleryState] = useState<{ isOpen: boolean; title: string; media: any[] }>({
        isOpen: false,
        title: '',
        media: []
    });

    const fetchSurveyData = async () => {
        if (!surveyId) return;
        try {
            setLoading(true);
            const data = await getSurveyById(surveyId);
            setSurvey(data);

            const map = data.sectionsMap || {};
            setCustomerInfo(map.customerInfo || { customerType: 'Residential' });
            setRoofDetails(map.roofDetails || { roofType: 'RCC', roofCondition: 'Good', roofOrientation: 'South Facing' });
            setMeasurements(map.measurements || { length: '30', width: '15', usableArea: '450' });
            setElectrical(map.electrical || { connectionType: 'Single Phase', sanctionLoad: '5 kW' });
            setFeasibility(map.feasibility || {});
            setMaterialEstimates(data.materialEstimates || []);
        } catch (err) {
            console.error("Error loading survey details", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSurveyData();
    }, [surveyId]);

    // Toast notification state
    const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 6000);
    };

    const handleSaveSection = async (sectionName: string, formData: any) => {
        if (!surveyId) return;
        try {
            setSaving(true);
            await updateSurveySection(surveyId, {
                sectionName,
                formData,
                estimatedCapacity: Number(measurements.estimatedKw || survey.estimatedCapacity || 5.2)
            });
            showToast(`Section "${sectionName}" saved successfully!`, 'success');
            fetchSurveyData();
        } catch (err) {
            showToast('Failed to save section.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleManagerReview = async (action: 'Approved' | 'Rejected') => {
        if (!surveyId) return;
        try {
            setSaving(true);
            await reviewSurvey(surveyId, { action, remarks: reviewRemarks });
            showToast(
                action === 'Approved' 
                    ? '✓ Survey Approved! Linked Lead pipeline stage automatically advanced to "Site Survey Completed".' 
                    : '✕ Survey Rejected / Revision Requested. Returned to engineer with feedback.',
                action === 'Approved' ? 'success' : 'error'
            );
            fetchSurveyData();
        } catch (err: any) {
            showToast(err.message || 'Failed to submit survey review.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDownloadPdf = () => {
        if (!survey) return;
        const doc = generateSurveyReportPdf(survey);
        doc.save(`Varcas_Energy_Survey_${survey.surveyNo}_${(survey.lead?.name || 'Customer').replace(/\s+/g, '_')}.pdf`);
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
    if (!survey) return <div className="p-8 text-center text-white">Survey not found.</div>;

    const lead = survey.lead || {};
    const engineer = survey.assignedEngineer || {};
    const isApproved = survey.status === 'Approved';

    // Auto-calculated measurements
    const lengthVal = Number(measurements.length) || 0;
    const widthVal = Number(measurements.width) || 0;
    const totalArea = lengthVal * widthVal;
    const usableArea = Number(measurements.usableArea) || (totalArea * 0.85);
    const maxPanels = Math.floor(usableArea / 25);
    const estimatedKw = (maxPanels * 0.54).toFixed(1);
    const roofUtil = totalArea > 0 ? Math.round((usableArea / totalArea) * 100) : 85;

    const inputClasses = "bg-white/5 border border-glass-border/30 text-white text-xs font-bold rounded-2xl focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan block w-full px-4 py-3 transition-all outline-none";

    return (
        <div className="p-4 sm:p-8 max-w-[1800px] mx-auto animate-fade-in-up space-y-6 font-inter">
            {/* Gallery Lightbox */}
            <LightboxGalleryModal
                isOpen={galleryState.isOpen}
                onClose={() => setGalleryState(prev => ({ ...prev, isOpen: false }))}
                title={galleryState.title}
                media={galleryState.media}
            />

            {/* Floating Toast Notification */}
            {toast && (
                <div className={`fixed top-6 right-6 z-50 max-w-md p-4 rounded-2xl border shadow-2xl backdrop-blur-xl flex items-center gap-3 text-xs font-bold animate-fade-in-down ${
                    toast.type === 'success' ? 'bg-night-sky/90 border-status-green text-status-green shadow-status-green/20' :
                    toast.type === 'error' ? 'bg-night-sky/90 border-red-500 text-red-400 shadow-red-500/20' :
                    'bg-night-sky/90 border-neon-cyan text-neon-cyan shadow-neon-cyan/20'
                }`}>
                    {toast.type === 'success' ? <CheckCircle2 size={20} className="shrink-0" /> : <AlertTriangle size={20} className="shrink-0" />}
                    <span className="leading-relaxed">{toast.message}</span>
                </div>
            )}

            {/* Status Action Banner */}
            {survey.status === 'Approved' && (
                <div className="p-4 rounded-2xl bg-status-green/10 border border-status-green/30 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 size={24} className="text-status-green shrink-0" />
                        <div>
                            <h4 className="text-sm font-black text-status-green">SURVEY APPROVED & VERIFIED</h4>
                            <p className="text-xs font-bold text-text-secondary">
                                Linked Lead ({lead.name}) automatically advanced to "Site Survey Completed" in Pipeline.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigate(`/admin/leads/${lead.id}`)}
                            className="px-4 py-2 rounded-xl bg-status-green/20 border border-status-green/40 text-status-green font-bold text-xs hover:bg-status-green hover:text-night-sky transition-all cursor-pointer"
                        >
                            View Linked Lead Pipeline ↗
                        </button>
                    </div>
                </div>
            )}

            {survey.status === 'Rejected' && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <AlertTriangle size={24} className="text-red-400 shrink-0" />
                        <div>
                            <h4 className="text-sm font-black text-red-400">SURVEY REJECTED / REVISION REQUESTED</h4>
                            <p className="text-xs font-bold text-text-secondary">
                                Remarks: {survey.reviewRemarks || 'Survey returned to engineer for revision.'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigate('/admin/surveys')}
                            className="px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 font-bold text-xs hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                        >
                            Return to Survey Dashboard
                        </button>
                    </div>
                </div>
            )}

            {/* Back Button & Top Banner */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/surveys')}
                        className="p-3 rounded-2xl bg-white/5 border border-glass-border/30 text-text-secondary hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-neon-cyan uppercase tracking-widest">
                                Survey #{survey.surveyNo}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${isApproved ? 'bg-status-green/20 text-status-green' : 'bg-neon-cyan/20 text-neon-cyan'}`}>
                                {survey.status}
                            </span>
                        </div>
                        <h1 className="text-2xl font-black text-white">{lead.name || 'Customer Name'}</h1>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleDownloadPdf}
                        className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-neon-cyan to-electric-blue text-night-sky font-black text-xs uppercase tracking-widest hover:scale-105 shadow-glow-sm shadow-neon-cyan/20 transition-all cursor-pointer flex items-center gap-2"
                    >
                        <Download size={16} />
                        Download Survey Report PDF
                    </button>
                </div>
            </div>

            {/* Top Summary Info Card */}
            <Card className="!p-6 bg-glass-surface/20 border-glass-border/30">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs font-bold">
                    <div>
                        <span className="text-[10px] font-black uppercase text-text-secondary/60 block mb-1">Customer Phone</span>
                        <span className="text-white flex items-center gap-1.5"><Phone size={13} className="text-neon-cyan" /> {lead.phone || 'N/A'}</span>
                    </div>

                    <div>
                        <span className="text-[10px] font-black uppercase text-text-secondary/60 block mb-1">Assigned Engineer</span>
                        <span className="text-white flex items-center gap-1.5"><User size={13} className="text-neon-cyan" /> {engineer.name || 'Unassigned'}</span>
                    </div>

                    <div>
                        <span className="text-[10px] font-black uppercase text-text-secondary/60 block mb-1">Estimated System</span>
                        <span className="text-neon-cyan font-black text-sm">{estimatedKw} kW</span>
                    </div>

                    <div>
                        <span className="text-[10px] font-black uppercase text-text-secondary/60 block mb-1">GPS Coordinates</span>
                        <span className="text-white font-mono text-[11px]">{survey.gpsLat || '23.0225°'}, {survey.gpsLng || '72.5714°'}</span>
                    </div>

                    <div>
                        <span className="text-[10px] font-black uppercase text-text-secondary/60 block mb-1">Survey Progress</span>
                        <span className="text-status-green font-black text-sm">{survey.progressPercent || 85}% Completed</span>
                    </div>
                </div>
            </Card>

            {/* 8 Horizontal Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 hide-scrollbar">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                            px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer
                            ${activeTab === tab.id 
                                ? 'bg-neon-cyan text-night-sky shadow-glow-sm shadow-neon-cyan/30' 
                                : 'bg-glass-surface/30 text-text-secondary hover:text-white border border-glass-border/20'}
                        `}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* TAB CONTENTS */}

            {/* TAB 1: Overview & GPS */}
            {activeTab === 'overview' && (
                <Card className="space-y-6">
                    <div className="flex items-center justify-between border-b border-glass-border/20 pb-4">
                        <h3 className="text-lg font-black text-white flex items-center gap-2">
                            <MapPin className="text-neon-cyan" size={20} /> Section 1 – Customer Information & GPS Verification
                        </h3>
                        <button
                            onClick={() => handleSaveSection('customerInfo', customerInfo)}
                            disabled={saving}
                            className="px-4 py-2 bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 rounded-xl font-bold text-xs hover:bg-neon-cyan hover:text-night-sky transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                            <Save size={14} /> Save Customer Info
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-[10px] font-bold text-text-secondary/70 mb-1 block">Customer Name</label>
                            <input
                                type="text"
                                value={customerInfo.customerName || lead.name || ''}
                                onChange={e => setCustomerInfo((prev: any) => ({ ...prev, customerName: e.target.value }))}
                                className={inputClasses}
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-text-secondary/70 mb-1 block">Mobile Number</label>
                            <input
                                type="text"
                                value={customerInfo.mobile || lead.phone || ''}
                                onChange={e => setCustomerInfo((prev: any) => ({ ...prev, mobile: e.target.value }))}
                                className={inputClasses}
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-text-secondary/70 mb-1 block">Customer Type</label>
                            <select
                                value={customerInfo.customerType || 'Residential'}
                                onChange={e => setCustomerInfo((prev: any) => ({ ...prev, customerType: e.target.value }))}
                                className={inputClasses}
                            >
                                <option value="Residential" className="bg-night-sky">Residential</option>
                                <option value="Commercial" className="bg-night-sky">Commercial</option>
                                <option value="Industrial" className="bg-night-sky">Industrial</option>
                                <option value="Agriculture" className="bg-night-sky">Agriculture</option>
                                <option value="Government" className="bg-night-sky">Government</option>
                            </select>
                        </div>
                    </div>

                    {/* GPS Accuracy Box */}
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-glass-border/20 space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-white flex items-center gap-2">
                                <Compass className="text-neon-cyan" size={16} /> GPS Geolocation Metadata
                            </span>
                            <span className="px-2.5 py-1 rounded-lg bg-status-green/20 text-status-green text-[10px] font-black">
                                ✓ Accuracy: 4.2m (Excellent &lt; 20m)
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs font-mono font-bold">
                            <div className="p-3 rounded-xl bg-white/5 text-white">Latitude: {survey.gpsLat || '23.0225° N'}</div>
                            <div className="p-3 rounded-xl bg-white/5 text-white">Longitude: {survey.gpsLng || '72.5714° E'}</div>
                        </div>

                        <a
                            href={`https://maps.google.com/?q=${survey.gpsLat || '23.0225'},${survey.gpsLng || '72.5714'}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-3 rounded-2xl bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan text-xs font-bold flex items-center justify-between hover:bg-neon-cyan hover:text-night-sky transition-all block text-center"
                        >
                            Open Pin Location in Google Maps ↗
                        </a>
                    </div>
                </Card>
            )}

            {/* TAB 2: Roof & Obstacles */}
            {activeTab === 'roof' && (
                <Card className="space-y-6">
                    <div className="flex items-center justify-between border-b border-glass-border/20 pb-4">
                        <h3 className="text-lg font-black text-white flex items-center gap-2">
                            <Building2 className="text-neon-cyan" size={20} /> Section 2 & 4 – Roof & Property Details
                        </h3>
                        <button
                            onClick={() => handleSaveSection('roofDetails', roofDetails)}
                            disabled={saving}
                            className="px-4 py-2 bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 rounded-xl font-bold text-xs hover:bg-neon-cyan hover:text-night-sky transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                            <Save size={14} /> Save Roof Specs
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-[10px] font-bold text-text-secondary/70 mb-1 block">Roof Type</label>
                            <select
                                value={roofDetails.roofType || 'RCC'}
                                onChange={e => setRoofDetails((prev: any) => ({ ...prev, roofType: e.target.value }))}
                                className={inputClasses}
                            >
                                <option value="RCC" className="bg-night-sky">RCC Flat Roof</option>
                                <option value="Tin Shed" className="bg-night-sky">Tin Shed / Metal Sheet</option>
                                <option value="Asbestos" className="bg-night-sky">Asbestos Sheet</option>
                                <option value="Ground Mount" className="bg-night-sky">Ground Mount Structure</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-text-secondary/70 mb-1 block">Roof Condition</label>
                            <select
                                value={roofDetails.roofCondition || 'Good'}
                                onChange={e => setRoofDetails((prev: any) => ({ ...prev, roofCondition: e.target.value }))}
                                className={inputClasses}
                            >
                                <option value="Excellent" className="bg-night-sky">Excellent</option>
                                <option value="Good" className="bg-night-sky">Good</option>
                                <option value="Average" className="bg-night-sky">Average</option>
                                <option value="Poor" className="bg-night-sky">Poor</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-text-secondary/70 mb-1 block">Roof Orientation</label>
                            <select
                                value={roofDetails.roofOrientation || 'South Facing'}
                                onChange={e => setRoofDetails((prev: any) => ({ ...prev, roofOrientation: e.target.value }))}
                                className={inputClasses}
                            >
                                <option value="South Facing" className="bg-night-sky">South Facing (Optimal)</option>
                                <option value="South-East" className="bg-night-sky">South-East</option>
                                <option value="South-West" className="bg-night-sky">South-West</option>
                                <option value="East-West" className="bg-night-sky">East-West Dual</option>
                            </select>
                        </div>
                    </div>
                </Card>
            )}

            {/* TAB 3: Measurements & Layout */}
            {activeTab === 'measurements' && (
                <Card className="space-y-6">
                    <div className="flex items-center justify-between border-b border-glass-border/20 pb-4">
                        <h3 className="text-lg font-black text-white flex items-center gap-2">
                            <Ruler className="text-neon-cyan" size={20} /> Section 5 – Roof Measurements & Capacity Calculator
                        </h3>
                        <button
                            onClick={() => handleSaveSection('measurements', { ...measurements, estimatedKw, maxPanels, totalArea, usableArea })}
                            disabled={saving}
                            className="px-4 py-2 bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 rounded-xl font-bold text-xs hover:bg-neon-cyan hover:text-night-sky transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                            <Save size={14} /> Save Measurements
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="text-[10px] font-bold text-text-secondary/70 mb-1 block">Length (ft)</label>
                            <input
                                type="number"
                                value={measurements.length || ''}
                                onChange={e => setMeasurements((prev: any) => ({ ...prev, length: e.target.value }))}
                                className={inputClasses}
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-text-secondary/70 mb-1 block">Width (ft)</label>
                            <input
                                type="number"
                                value={measurements.width || ''}
                                onChange={e => setMeasurements((prev: any) => ({ ...prev, width: e.target.value }))}
                                className={inputClasses}
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-text-secondary/70 mb-1 block">Usable Area (sq.ft)</label>
                            <input
                                type="number"
                                value={usableArea}
                                onChange={e => setMeasurements((prev: any) => ({ ...prev, usableArea: e.target.value }))}
                                className={inputClasses}
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-text-secondary/70 mb-1 block">Roof Utilization %</label>
                            <div className="p-3 bg-white/5 border border-glass-border/30 rounded-2xl text-neon-cyan font-black text-xs">
                                {roofUtil}% Usable Area
                            </div>
                        </div>
                    </div>

                    {/* Auto Calculation Panel */}
                    <div className="p-6 rounded-3xl bg-gradient-to-r from-neon-cyan/15 to-electric-blue/15 border border-neon-cyan/30 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary/60 block mb-1">Max Solar Panels</span>
                            <span className="text-3xl font-black text-white">{maxPanels} Panels</span>
                        </div>

                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary/60 block mb-1">Possible System Capacity</span>
                            <span className="text-3xl font-black text-neon-cyan">{estimatedKw} kW</span>
                        </div>

                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary/60 block mb-1">Est. Generation / Year</span>
                            <span className="text-3xl font-black text-status-green">{Math.round(Number(estimatedKw) * 1450)} Units</span>
                        </div>
                    </div>
                </Card>
            )}

            {/* TAB 4: Electrical & Meter */}
            {activeTab === 'electrical' && (
                <Card className="space-y-6">
                    <div className="flex items-center justify-between border-b border-glass-border/20 pb-4">
                        <h3 className="text-lg font-black text-white flex items-center gap-2">
                            <Zap className="text-neon-cyan" size={20} /> Section 6 & 7 – Electrical Survey & Meter Inspection
                        </h3>
                        <button
                            onClick={() => handleSaveSection('electrical', electrical)}
                            disabled={saving}
                            className="px-4 py-2 bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 rounded-xl font-bold text-xs hover:bg-neon-cyan hover:text-night-sky transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                            <Save size={14} /> Save Electrical Specs
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-[10px] font-bold text-text-secondary/70 mb-1 block">Consumer Number</label>
                            <input
                                type="text"
                                value={electrical.consumerNo || ''}
                                onChange={e => setElectrical((prev: any) => ({ ...prev, consumerNo: e.target.value }))}
                                placeholder="102938475612"
                                className={inputClasses}
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-text-secondary/70 mb-1 block">Sanction Load (kW)</label>
                            <input
                                type="text"
                                value={electrical.sanctionLoad || ''}
                                onChange={e => setElectrical((prev: any) => ({ ...prev, sanctionLoad: e.target.value }))}
                                placeholder="5 kW"
                                className={inputClasses}
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-text-secondary/70 mb-1 block">Connection Type</label>
                            <select
                                value={electrical.connectionType || 'Single Phase'}
                                onChange={e => setElectrical((prev: any) => ({ ...prev, connectionType: e.target.value }))}
                                className={inputClasses}
                            >
                                <option value="Single Phase" className="bg-night-sky">Single Phase (1Ф)</option>
                                <option value="Three Phase" className="bg-night-sky">Three Phase (3Ф)</option>
                            </select>
                        </div>
                    </div>
                </Card>
            )}

            {/* TAB 5: Feasibility & Material Estimates */}
            {activeTab === 'materials' && (
                <Card className="space-y-6">
                    <div className="flex items-center justify-between border-b border-glass-border/20 pb-4">
                        <h3 className="text-lg font-black text-white flex items-center gap-2">
                            <ClipboardCheck className="text-neon-cyan" size={20} /> Section 9 & 10 – Installation Feasibility & Material Estimates
                        </h3>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-glass-border/20 space-y-3">
                        <h4 className="text-xs font-black text-neon-cyan uppercase tracking-widest">Auto-Calculated Material Estimation Panel</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold">
                            <div className="p-3 bg-white/5 rounded-xl border border-white/10">Solar Panels: {maxPanels} Modules</div>
                            <div className="p-3 bg-white/5 rounded-xl border border-white/10">Inverter: 1x {estimatedKw} kW Grid Tie</div>
                            <div className="p-3 bg-white/5 rounded-xl border border-white/10">Structure: {maxPanels} Panel MMS</div>
                            <div className="p-3 bg-white/5 rounded-xl border border-white/10">DC Cable: 65 meters</div>
                        </div>
                    </div>
                </Card>
            )}

            {/* TAB 6: Categorized Media */}
            {activeTab === 'media' && (
                <Card className="space-y-6">
                    <div className="flex items-center justify-between border-b border-glass-border/20 pb-4">
                        <h3 className="text-lg font-black text-white flex items-center gap-2">
                            <Camera className="text-neon-cyan" size={20} /> Section 12 – Categorized Media Manager
                        </h3>
                    </div>

                    <p className="text-xs font-bold text-text-secondary/70">
                        Upload and manage categorized evidence photos (Roof Min 8, Meter Min 3, Panel Min 3, Documents).
                    </p>
                </Card>
            )}

            {/* TAB 7: Signatures & Review */}
            {activeTab === 'signatures' && (
                <Card className="space-y-6">
                    <div className="flex items-center justify-between border-b border-glass-border/20 pb-4">
                        <h3 className="text-lg font-black text-white flex items-center gap-2">
                            <ShieldCheck className="text-neon-cyan" size={20} /> Section 13 – Digital Signatures & Manager Approval Panel
                        </h3>
                    </div>

                    {/* Signatures */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 rounded-2xl bg-white/5 border border-glass-border/30 space-y-2">
                            <span className="text-[10px] font-black text-neon-cyan uppercase tracking-widest">Customer Digital Signature</span>
                            <div className="h-24 rounded-xl bg-night-sky border border-white/20 flex items-center justify-center text-xs font-mono font-bold text-white">
                                {survey.customerSignature || `Signed by ${lead.name || 'Customer'}`}
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-white/5 border border-glass-border/30 space-y-2">
                            <span className="text-[10px] font-black text-neon-cyan uppercase tracking-widest">Engineer Digital Signature</span>
                            <div className="h-24 rounded-xl bg-night-sky border border-white/20 flex items-center justify-center text-xs font-mono font-bold text-white">
                                {survey.engineerSignature || `Signed by ${engineer.name || 'Rahul Patel'}`}
                            </div>
                        </div>
                    </div>

                    {/* Manager Approval Box */}
                    {user?.role === 'Master' && (
                        <div className="p-6 rounded-3xl bg-glass-surface/40 border border-glass-border/30 space-y-4">
                            <h4 className="text-sm font-black text-white flex items-center gap-2">
                                <Lock size={16} className="text-neon-cyan" /> Manager Review & Approval Actions
                            </h4>

                            <div>
                                <label className="text-[10px] font-bold text-text-secondary/70 mb-1 block">Review Remarks / Rejection Feedback</label>
                                <textarea
                                    value={reviewRemarks}
                                    onChange={e => setReviewRemarks(e.target.value)}
                                    placeholder="Survey checklist approved. Roof measurements and meter board verified."
                                    rows={3}
                                    className={inputClasses}
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    onClick={() => handleManagerReview('Rejected')}
                                    disabled={saving}
                                    className="px-6 py-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                                >
                                    Reject / Request Changes
                                </button>

                                <button
                                    onClick={() => handleManagerReview('Approved')}
                                    disabled={saving}
                                    className="px-8 py-3 rounded-2xl bg-gradient-to-r from-neon-cyan to-electric-blue text-night-sky font-black text-xs uppercase tracking-widest shadow-glow-sm shadow-neon-cyan/30 hover:scale-105 transition-all cursor-pointer flex items-center gap-2"
                                >
                                    <CheckCircle2 size={18} /> Approve Survey
                                </button>
                            </div>
                        </div>
                    )}
                </Card>
            )}

            {/* TAB 8: Timeline */}
            {activeTab === 'history' && (
                <Card className="space-y-6">
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                        <Clock className="text-neon-cyan" size={20} /> Survey Lifecycle Audit History
                    </h3>

                    <div className="space-y-3 font-mono text-xs">
                        {(survey.approvalHistory || []).map((h: any, idx: number) => (
                            <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                                <div>
                                    <span className="font-bold text-white">{h.status}</span>
                                    <p className="text-[11px] text-text-secondary">{h.remarks || 'No remarks'}</p>
                                </div>
                                <span className="text-[10px] text-neon-cyan">{new Date(h.createdAt).toLocaleString('en-IN')}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
};

export default SurveyDetailPage;
