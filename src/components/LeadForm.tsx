import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import * as crmService from '../service/crmService';
import LoadingSpinner from './LoadingSpinner';
import AnimatedSection from './AnimatedSection';
import { UserPlus, MapPin, Phone, User, CheckCircle2, TrendingUp, Zap, Droplets, FileText } from 'lucide-react';
import { CalculationResults } from '../utils/calculatorUtils';
import { FormSchema } from '../types';

const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

interface LeadFormProps {
    productType: 'rooftop' | 'pump';
    calculatorValue?: number;
    calculatorResults?: CalculationResults | null;
}

const LeadForm: React.FC<LeadFormProps> = ({ productType, calculatorValue, calculatorResults }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        fatherName: '',
        state: '',
        district: '',
        tehsil: '',
        village: '',
        hp: '',
        connectionType: '',
        consent: false
    });
    const [files, setFiles] = useState<Record<string, File>>({});
    const [formSchema, setFormSchema] = useState<FormSchema>([]);

    useEffect(() => {
        const fetchSchema = async () => {
            try {
                const schema = await crmService.getFormSchema(productType === 'rooftop' ? 'rooftop' : 'pump');
                setFormSchema(schema);
            } catch (err) {
                console.error("Failed to load form schema", err);
            }
        };
        fetchSchema();
    }, [productType]);

    // Update HP/Connection Type if calculator results change
    useEffect(() => {
        if (calculatorResults) {
            if (productType === 'pump') {
                // If it's a pump, calculation often suggests 5-7.5HP
                setFormData(prev => ({ ...prev, hp: '7.5HP' }));
            } else {
                // Default connection type for rooftop
                setFormData(prev => ({ ...prev, connectionType: 'Single Phase' }));
            }
        }
    }, [productType, calculatorResults]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, files: targetFiles } = e.target;
        if (targetFiles && targetFiles.length > 0) {
            setFiles(prev => ({ ...prev, [name]: targetFiles[0] }));
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!formData.consent) {
            setError('Please agree to be contacted to proceed.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Prepare Custom Fields with Calculator Data
            const customFields: Record<string, any> = { ...formData };
            if (calculatorValue) {
                customFields.monthlyBill = calculatorValue;
                customFields.seasonalDieselCost = calculatorValue;
            }
            if (calculatorResults) {
                customFields.estimatedAnnualSavings = calculatorResults.annualSavings;
                customFields.recommendedSystemSize = calculatorResults.recommendedSize;
                customFields.subsidyEstimate = calculatorResults.subsidy;
                customFields.paybackPeriod = calculatorResults.paybackPeriod;
            }

            const newLead = await crmService.createLead({
                ...formData,
                productType: productType === 'rooftop' ? 'Rooftop Solar' : 'Solar Pump',
                source: 'Public_Website',
                customFields
            });

            // Upload files sequentially
            for (const [fieldName, file] of Object.entries(files)) {
                try {
                    await crmService.uploadLeadFile(newLead.id, fieldName, file);
                } catch (err) {
                    console.error(`Failed to upload ${fieldName}`, err);
                }
            }

            setIsSubmitted(true);
        } catch (err: any) {
            console.error("Submission error:", err);
            setError(err.message || 'Failed to submit form. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <AnimatedSection className="max-w-3xl mx-auto my-12">
                <div className="bg-glass-surface/40 backdrop-blur-xl border border-glass-border/30 rounded-3xl p-12 text-center shadow-glow-sm shadow-neon-cyan/10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-neon-cyan/20 border border-neon-cyan/30 text-neon-cyan mb-6">
                        <CheckCircle2 size={40} />
                    </div>
                    <h2 className="text-3xl font-black text-white mb-4">Application Received!</h2>
                    <p className="text-text-secondary text-lg font-medium max-w-md mx-auto">
                        Thank you for your interest in Varcas Energy. Our solar experts will review your details and contact you within 24-48 hours.
                    </p>
                    <button 
                        onClick={() => setIsSubmitted(false)}
                        className="mt-8 px-8 py-3 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan font-bold hover:bg-neon-cyan hover:text-night-sky transition-all"
                    >
                        Submit Another Request
                    </button>
                </div>
            </AnimatedSection>
        );
    }

    const inputClasses = "w-full p-3 rounded-xl border border-glass-border/30 bg-night-sky/50 text-text-primary text-sm focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan outline-none transition-all placeholder:text-text-secondary/40 shadow-inner shadow-black/20";
    const labelClasses = "block text-[10px] font-black text-text-secondary/80 mb-2 uppercase tracking-widest";

    return (
        <AnimatedSection className="max-w-4xl mx-auto my-16 px-4">
            <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                    {calculatorResults ? 'Claim Your Savings' : `Apply for ${productType === 'rooftop' ? 'Rooftop Solar' : 'Solar Pump'}`}
                </h2>
                <p className="text-text-secondary font-bold max-w-2xl mx-auto">
                    {calculatorResults 
                        ? "Great! Based on your bill, you can save massive energy costs. Complete your registration to secure this estimate."
                        : `Fill out the form below to register your interest and secure your government subsidy.`
                    }
                    <span className="text-neon-cyan block mt-2 text-sm">NO OTP VERIFICATION REQUIRED</span>
                </p>
            </div>

            {/* Savings Bar - Hidden if no calculator results */}
            {calculatorResults && (
                <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in-up">
                    <div className="bg-primary-green/10 border border-primary-green/20 rounded-2xl p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary-green/20 flex items-center justify-center text-primary-green">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Annual Savings</p>
                            <p className="text-lg font-black text-white">₹ {calculatorResults.annualSavings.toLocaleString('en-IN')}</p>
                        </div>
                    </div>
                    <div className="bg-neon-cyan/10 border border-neon-cyan/20 rounded-2xl p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-neon-cyan/20 flex items-center justify-center text-neon-cyan">
                            <Zap size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">System Size</p>
                            <p className="text-lg font-black text-white">{calculatorResults.recommendedSize}</p>
                        </div>
                    </div>
                    <div className="bg-electric-blue/10 border border-electric-blue/20 rounded-2xl p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-electric-blue/20 flex items-center justify-center text-electric-blue">
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Payback</p>
                            <p className="text-lg font-black text-white">{calculatorResults.paybackPeriod}</p>
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-glass-surface/40 backdrop-blur-3xl rounded-3xl border border-glass-border/30 shadow-glow-sm shadow-neon-cyan/5 p-6 sm:p-10 space-y-8 relative overflow-hidden">
                {/* Decorative glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-neon-cyan/5 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
                
                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-bold text-center">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Info */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-black text-text-primary flex items-center gap-2 mb-2">
                            <User size={16} className="text-neon-cyan" /> BASIC INFORMATION
                        </h3>
                        <div>
                            <label className={labelClasses}>Full Name *</label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className={inputClasses}
                                placeholder="Enter your full name"
                            />
                        </div>
                        <div>
                            <label className={labelClasses}>Father's Name</label>
                            <input
                                type="text"
                                name="fatherName"
                                value={formData.fatherName}
                                onChange={handleChange}
                                className={inputClasses}
                                placeholder="Father's name"
                            />
                        </div>
                        <div>
                            <label className={labelClasses}>Mobile Number *</label>
                            <input
                                type="tel"
                                name="phone"
                                required
                                pattern="[0-9]{10}"
                                value={formData.phone}
                                onChange={handleChange}
                                className={inputClasses}
                                placeholder="10-digit mobile number"
                            />
                        </div>
                        <div>
                            <label className={labelClasses}>Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={inputClasses}
                                placeholder="Email address (optional)"
                            />
                        </div>
                    </div>

                    {/* Technical/Location Info */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-black text-text-primary flex items-center gap-2 mb-2">
                            <MapPin size={16} className="text-neon-cyan" /> LOCATION & TECHNICAL
                        </h3>
                            <div>
                                <label className={labelClasses}>State</label>
                                <select
                                    name="state"
                                    value={formData.state || ''}
                                    onChange={handleChange}
                                    className={inputClasses}
                                >
                                    <option value="">Select State</option>
                                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelClasses}>District</label>
                                <input
                                    type="text"
                                    name="district"
                                    value={formData.district}
                                    onChange={handleChange}
                                    className={inputClasses}
                                    placeholder="District"
                                />
                            </div>
                            <div className="col-span-2 md:col-span-1">
                                <label className={labelClasses}>Tehsil</label>
                                <input
                                    type="text"
                                    name="tehsil"
                                    value={formData.tehsil}
                                    onChange={handleChange}
                                    className={inputClasses}
                                    placeholder="Tehsil"
                                />
                            </div>
                        <div>
                            <label className={labelClasses}>Village</label>
                            <input
                                type="text"
                                name="village"
                                value={formData.village}
                                onChange={handleChange}
                                className={inputClasses}
                                placeholder="Village name"
                            />
                        </div>
                        
                        {productType === 'pump' ? (
                            <div>
                                <label className={labelClasses}>Pump Capacity (HP)</label>
                                <select
                                    name="hp"
                                    title="Pump Capacity in HP"
                                    value={formData.hp}
                                    onChange={handleChange}
                                    className={inputClasses}
                                >
                                    <option value="">Select HP</option>
                                    <option value="3HP">3 HP</option>
                                    <option value="5HP">5 HP</option>
                                    <option value="7.5HP">7.5 HP</option>
                                    <option value="10HP">10 HP</option>
                                </select>
                            </div>
                        ) : (
                            <div>
                                <label className={labelClasses}>Connection Type</label>
                                <select
                                    name="connectionType"
                                    title="Electrical Connection Type"
                                    value={formData.connectionType}
                                    onChange={handleChange}
                                    className={inputClasses}
                                >
                                    <option value="">Select Phase</option>
                                    <option value="Single Phase">Single Phase</option>
                                    <option value="Three Phase">Three Phase</option>
                                    <option value="No Connection">New Connection</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Dynamic Custom Fields from FormBuilder */}
                    {formSchema.filter(field => !field.visibleInStates || field.visibleInStates.length === 0 || field.visibleInStates.includes(formData.state)).length > 0 && (
                        <div className="space-y-6 md:col-span-2 pt-6 border-t border-glass-border/20">
                            <h3 className="text-sm font-black text-text-primary flex items-center gap-2 mb-2">
                                <FileText size={16} className="text-neon-cyan" /> CUSTOM REQUIREMENTS
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {formSchema.filter(field => !field.visibleInStates || field.visibleInStates.length === 0 || field.visibleInStates.includes(formData.state)).map(field => {
                                    if (field.type === 'select') {
                                        return (
                                            <div key={field.id}>
                                                <label className={labelClasses}>{field.label} {field.required && '*'}</label>
                                                <select
                                                    name={field.name}
                                                    required={field.required}
                                                    value={(formData as Record<string, any>)[field.name] || ''}
                                                    onChange={handleChange}
                                                    className={inputClasses}
                                                >
                                                    <option value="">Select Option</option>
                                                    {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                </select>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div key={field.id}>
                                            <label className={labelClasses}>{field.label} {field.required && '*'}</label>
                                            <input
                                                type={field.type === 'image' ? 'file' : field.type}
                                                name={field.name}
                                                required={field.required}
                                                value={field.type === 'image' ? undefined : ((formData as Record<string, any>)[field.name] || '')}
                                                onChange={field.type === 'image' ? handleFileChange : handleChange}
                                                className={inputClasses}
                                                placeholder={field.placeholder}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <div className="pt-6 border-t border-glass-border/20">
                    <div className="flex items-start mb-6">
                        <input 
                            id="consent" 
                            name="consent" 
                            type="checkbox" 
                            required 
                            checked={formData.consent} 
                            onChange={handleChange} 
                            className="h-5 w-5 mt-1 rounded bg-night-sky/50 border-glass-border border checked:bg-neon-cyan checked:border-neon-cyan transition-all cursor-pointer" 
                        />
                        <label htmlFor="consent" className="ml-3 text-xs text-text-secondary leading-relaxed font-medium">
                            By submitting this form, I agree to be contacted by Varcas Energy regarding solar services. 
                            I understand that my information will be stored securely and processed according to the <a href="#/privacy" className="text-neon-cyan hover:underline">Privacy Policy</a>.
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-4 rounded-2xl bg-gradient-to-r from-neon-cyan to-electric-blue text-night-sky font-black tracking-widest shadow-glow-sm shadow-neon-cyan/20 transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-3 uppercase text-sm ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
                    >
                        {isLoading ? (
                            <>
                                <LoadingSpinner size="sm" className="!text-night-sky" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <UserPlus size={18} />
                                {calculatorResults ? 'Claim My Estimate' : 'Submit Application'}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </AnimatedSection>
    );
};

export default LeadForm;
