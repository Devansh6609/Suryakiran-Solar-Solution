import React, { useState, FormEvent } from 'react';
import { CalculatorType } from '../types';
import * as crmService from '../service/crmService';
import LoadingSpinner from './LoadingSpinner';
import AnimatedSection from './AnimatedSection';
import { 
    User, 
    MapPin, 
    Phone, 
    CheckCircle2, 
    TrendingUp, 
    Zap, 
    ArrowRight, 
    FileText,
    ShieldCheck,
    CloudLightning
} from 'lucide-react';
import { CalculationResults } from '../utils/calculatorUtils';
import { FormSchema } from '../types';

const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

interface CalculatorFormProps {
    type: CalculatorType;
    initialValue?: number | null;
    calculatorResults?: CalculationResults | null;
}

const InputField: React.FC<{
    label: string;
    name: string;
    type: string;
    value?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
    placeholder?: string;
    error?: string;
    icon?: React.ReactNode;
}> = ({ label, name, type, value, onChange, required = true, placeholder = '', error, icon }) => (
    <div className="space-y-1.5">
        <label htmlFor={name} className="block text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">
            {label} {required && <span className="text-neon-cyan">*</span>}
        </label>
        <div className="relative group">
            {icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-neon-cyan transition-colors">
                    {icon}
                </div>
            )}
            <input
                type={type}
                name={name}
                id={name}
                value={value !== undefined ? value : ''}
                onChange={onChange}
                required={required}
                placeholder={placeholder}
                className={`w-full ${icon ? 'pl-10' : 'px-4'} py-3.5 bg-night-sky/40 border rounded-xl shadow-inner shadow-black/20 text-white placeholder:text-text-secondary/40 focus:outline-none focus:ring-2 focus:ring-neon-cyan/30 focus:border-neon-cyan transition-all duration-300 ${error ? 'border-red-500/50' : 'border-glass-border/30 group-hover:border-glass-border/50'}`}
                aria-invalid={error ? true : false}
            />
            {error && <p className="mt-1 text-[10px] text-red-500 font-bold ml-1 uppercase">{error}</p>}
        </div>
    </div>
);

const SelectField: React.FC<{
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: string[];
    required?: boolean;
    error?: string;
    icon?: React.ReactNode;
}> = ({ label, name, value, onChange, options, required = true, error, icon }) => (
    <div className="space-y-1.5">
        <label htmlFor={name} className="block text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">
            {label} {required && <span className="text-neon-cyan">*</span>}
        </label>
        <div className="relative group">
            {icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-neon-cyan transition-colors pointer-events-none">
                    {icon}
                </div>
            )}
            <select
                name={name}
                id={name}
                value={value}
                onChange={onChange}
                required={required}
                className={`w-full ${icon ? 'pl-10' : 'px-4'} py-3.5 bg-night-sky/40 border rounded-xl border-glass-border/30 text-white focus:outline-none focus:ring-2 focus:ring-neon-cyan/30 focus:border-neon-cyan transition-all cursor-pointer appearance-none ${error ? 'border-red-500/50' : 'group-hover:border-glass-border/50'}`}
            >
                <option value="" disabled className="bg-night-sky text-text-secondary">Select Option</option>
                {options.map(opt => <option key={opt} value={opt} className="bg-night-sky text-white">{opt}</option>)}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
            </div>
            {error && <p className="mt-1 text-[10px] text-red-500 font-bold ml-1 uppercase">{error}</p>}
        </div>
    </div>
);

const SavingsBar: React.FC<{ results: CalculationResults }> = ({ results }) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-8 bg-black/20 p-2 rounded-2xl border border-glass-border/10">
        <div className="bg-primary-green/10 border border-primary-green/20 rounded-xl p-3 flex flex-col justify-center text-center">
            <p className="text-[8px] font-black text-primary-green uppercase tracking-tighter">Est. Savings</p>
            <p className="text-sm font-black text-white">₹{results.annualSavings.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-neon-cyan/10 border border-neon-cyan/20 rounded-xl p-3 flex flex-col justify-center text-center">
            <p className="text-[8px] font-black text-neon-cyan uppercase tracking-tighter">System Size</p>
            <p className="text-sm font-black text-white">{results.recommendedSize}</p>
        </div>
        <div className="bg-electric-blue/10 border border-electric-blue/20 rounded-xl p-3 flex flex-col justify-center text-center">
            <p className="text-[8px] font-black text-electric-blue uppercase tracking-tighter">Subsidy</p>
            <p className="text-sm font-black text-white">{results.subsidy}</p>
        </div>
        <div className="bg-accent-orange/10 border border-accent-orange/20 rounded-xl p-3 flex flex-col justify-center text-center">
            <p className="text-[8px] font-black text-accent-orange uppercase tracking-tighter">Payback</p>
            <p className="text-sm font-black text-white">{results.paybackPeriod}</p>
        </div>
    </div>
);

const CalculatorForm: React.FC<CalculatorFormProps> = ({ type, initialValue, calculatorResults }) => {
    const [step, setStep] = useState(1);
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
        connectionType: type === 'rooftop' ? 'Single Phase' : '5HP',
        consent: false,
        bill: initialValue ? initialValue.toString() : ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    const [files, setFiles] = useState<Record<string, File>>({});
    const [formSchema, setFormSchema] = useState<FormSchema>([]);

    React.useEffect(() => {
        const fetchSchema = async () => {
            try {
                const schema = await crmService.getFormSchema(type === 'rooftop' ? 'rooftop' : 'pump');
                setFormSchema(schema);
            } catch (err) {
                console.error("Failed to load form schema", err);
            }
        };
        fetchSchema();
    }, [type]);

    const validateStep = (currentStep: number): boolean => {
        const newErrors: Record<string, string> = {};
        if (currentStep === 1) {
            if (!formData.state) newErrors.state = "State required";
            if (!formData.district) newErrors.district = "District required";
            if (!formData.tehsil) newErrors.tehsil = "Tehsil required";
            if (!formData.village) newErrors.village = "Village required";
        } else if (currentStep === 2) {
            if (!formData.name) newErrors.name = "Full name required";
            if (!formData.phone || !/^\d{10}$/.test(formData.phone)) newErrors.phone = "10-digit mobile required";
            if (!formData.consent) newErrors.consent = "Agreement required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = (e: FormEvent) => {
        e.preventDefault();
        setApiError(null);
        if (validateStep(1)) {
            setStep(2);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setApiError(null);
        if (!validateStep(2)) return;

        setIsLoading(true);
        try {
            const customFields: Record<string, any> = { ...formData };
            if (initialValue) customFields.calculatorInput = initialValue;
            if (calculatorResults) {
                customFields.estimatedAnnualSavings = calculatorResults.annualSavings;
                customFields.recommendedSystemSize = calculatorResults.recommendedSize;
                customFields.subsidyEstimate = calculatorResults.subsidy;
            }

            const newLead = await crmService.createLead({
                ...formData,
                productType: type === 'rooftop' ? 'Rooftop Solar' : 'Solar Pump',
                source: 'Calculator_Form',
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

            setStep(3);
        } catch (err: any) {
            setApiError(err.message || 'Submission failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type: fieldType } = e.target as HTMLInputElement;
        const val = fieldType === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, files: targetFiles } = e.target;
        if (targetFiles && targetFiles.length > 0) {
            setFiles(prev => ({ ...prev, [name]: targetFiles[0] }));
        }
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const StepIndicator = () => {
        const steps = ["Details", "Contact", "Success"];
        return (
            <div className="flex items-center justify-between mb-12 px-2 relative">
                <div className="absolute top-5 left-10 right-10 h-0.5 bg-glass-border/30 -z-10"></div>
                {steps.map((name, index) => {
                    const stepNum = index + 1;
                    const isCompleted = step > stepNum;
                    const isCurrent = step === stepNum;

                    return (
                        <div key={name} className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black transition-all duration-500 shadow-lg
                                ${isCompleted ? 'bg-primary-green text-night-sky border-transparent' : ''}
                                ${isCurrent ? 'bg-neon-cyan text-night-sky ring-4 ring-neon-cyan/20 scale-110' : ''}
                                ${!isCompleted && !isCurrent ? 'bg-night-sky border-2 border-glass-border/50 text-text-secondary' : ''}
                            `}>
                                {isCompleted ? '✓' : stepNum}
                            </div>
                            <p className={`mt-3 text-[10px] font-black uppercase tracking-widest transition-colors duration-500 ${isCurrent ? 'text-neon-cyan' : 'text-text-secondary/60'}`}>{name}</p>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="relative">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-neon-cyan/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-electric-blue/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="bg-glass-surface/40 backdrop-blur-3xl border border-glass-border/30 p-8 sm:p-10 rounded-3xl shadow-glow-sm shadow-neon-cyan/5 max-w-2xl mx-auto overflow-hidden">
                <StepIndicator />
                {apiError && <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-xs font-bold text-center uppercase tracking-widest">{apiError}</div>}

                {calculatorResults && step < 3 && <SavingsBar results={calculatorResults} />}

                {step === 1 && (
                    <AnimatedSection className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2 flex items-center gap-2 mb-2 pb-2 border-b border-glass-border/20">
                                <CloudLightning size={18} className="text-neon-cyan" />
                                <h3 className="text-sm font-black text-text-primary tracking-widest">TECHNICAL DETAILS</h3>
                            </div>
                            
                            {type === 'rooftop' ? (
                                <SelectField label="Connection" name="connectionType" value={formData.connectionType} onChange={handleInputChange} icon={<Zap size={16} />} options={["Single Phase", "Three Phase", "No Connection"]} error={errors.connectionType} />
                            ) : (
                                <SelectField label="Pump Capacity" name="hp" value={formData.hp} onChange={handleInputChange} icon={<CloudLightning size={16} />} options={["3HP", "5HP", "7.5HP", "10HP"]} error={errors.hp} />
                            )}
                            
                            <InputField label={type === 'rooftop' ? "Avg. Monthly Bill" : "Seasonal Diesel Cost"} name="bill" type="number" value={formData.bill} onChange={handleInputChange} icon={<TrendingUp size={16} />} placeholder="Enter amount" />

                            <div className="md:col-span-2 flex items-center gap-2 mt-4 mb-2 pb-2 border-b border-glass-border/20">
                                <MapPin size={18} className="text-neon-cyan" />
                                <h3 className="text-sm font-black text-text-primary tracking-widest uppercase text-xs">Location Details</h3>
                            </div>

                            <SelectField label="State" name="state" value={formData.state} onChange={handleInputChange} icon={<MapPin size={16} />} options={INDIAN_STATES} error={errors.state} />
                            <InputField label="District" name="district" type="text" value={formData.district} onChange={handleInputChange} icon={<MapPin size={16} />} placeholder="Village district" error={errors.district} />
                            <InputField label="Tehsil" name="tehsil" type="text" value={formData.tehsil} onChange={handleInputChange} icon={<MapPin size={16} />} placeholder="Your tehsil" error={errors.tehsil} />
                            <div className="md:col-span-2">
                                <InputField label="Village / Area" name="village" type="text" value={formData.village} onChange={handleInputChange} icon={<MapPin size={16} />} placeholder="Village name" error={errors.village} />
                            </div>
                        </div>

                        <button onClick={handleNext} className="w-full mt-8 py-4 px-6 rounded-2xl bg-neon-cyan text-night-sky font-black tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 uppercase text-xs shadow-glow-sm shadow-neon-cyan/20">
                            Proceed to Contact Information <ArrowRight size={18} />
                        </button>
                    </AnimatedSection>
                )}

                {step === 2 && (
                    <AnimatedSection className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2 flex items-center gap-2 mb-2 pb-2 border-b border-glass-border/20">
                                <User size={18} className="text-neon-cyan" />
                                <h3 className="text-sm font-black text-text-primary tracking-widest uppercase text-xs">Personal Details</h3>
                            </div>

                            <InputField label="Full Name" name="name" type="text" value={formData.name} onChange={handleInputChange} icon={<User size={16} />} placeholder="Enter your name" error={errors.name} />
                            <InputField label="Father's Name" name="fatherName" type="text" value={formData.fatherName} onChange={handleInputChange} icon={<User size={16} />} placeholder="Father's name" error={errors.fatherName} />
                            
                            <div className="md:col-span-2">
                                <InputField label="Mobile Number" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} icon={<Phone size={16} />} placeholder="10-digit number" error={errors.phone} />
                            </div>
                            <div className="md:col-span-2">
                                <InputField label="Email Address" name="email" type="email" value={formData.email} onChange={handleInputChange} icon={<FileText size={16} />} required={false} placeholder="Email (optional)" />
                            </div>
                        </div>

                        {/* Dynamic Custom Fields from FormBuilder */}
                        {formSchema.filter(field => !field.visibleInStates || field.visibleInStates.length === 0 || field.visibleInStates.includes(formData.state)).length > 0 && (
                            <div className="pt-6 border-t border-glass-border/20">
                                <h3 className="text-sm font-black text-text-primary tracking-widest uppercase text-xs mb-4 flex items-center gap-2">
                                    <FileText size={18} className="text-neon-cyan" />
                                    Custom Requirements
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {formSchema.filter(field => !field.visibleInStates || field.visibleInStates.length === 0 || field.visibleInStates.includes(formData.state)).map(field => {
                                        if (field.type === 'select') {
                                            return <SelectField key={field.id} label={field.label} name={field.name} value={(formData as Record<string, any>)[field.name] || ''} onChange={handleInputChange} options={field.options || []} required={field.required} />;
                                        }
                                        return (
                                            <InputField
                                                key={field.id}
                                                label={field.label}
                                                name={field.name}
                                                type={field.type === 'image' ? 'file' : field.type}
                                                value={field.type === 'image' ? undefined : ((formData as Record<string, any>)[field.name] || '')}
                                                onChange={field.type === 'image' ? handleFileChange : handleInputChange}
                                                required={field.required}
                                                placeholder={field.placeholder}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="pt-6 border-t border-glass-border/20">
                            <div className="flex items-start mb-6">
                                <input id="consent" name="consent" type="checkbox" required checked={formData.consent} onChange={handleInputChange} className="h-5 w-5 mt-1 rounded bg-night-sky/50 border-glass-border border checked:bg-neon-cyan checked:border-neon-cyan transition-all cursor-pointer" />
                                <label htmlFor="consent" className="ml-3 text-[10px] text-text-secondary leading-relaxed font-bold uppercase tracking-wider">
                                    I agree to be contacted for solar services. My data is secure and will be processed as per Privacy Policy.
                                </label>
                            </div>

                            <button onClick={handleSubmit} disabled={isLoading} className={`w-full py-4 rounded-2xl bg-gradient-to-r from-neon-cyan to-electric-blue text-night-sky font-black tracking-widest shadow-glow-sm shadow-neon-cyan/20 transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-3 uppercase text-xs ${isLoading ? 'opacity-70 cursor-wait' : ''}`}>
                                {isLoading ? <><LoadingSpinner size="sm" className="!text-night-sky" /> Validating Application...</> : <><ShieldCheck size={18} /> Submit & Get Verified Quote</>}
                            </button>
                            <button onClick={() => setStep(1)} className="w-full mt-4 text-[10px] font-black text-text-secondary uppercase tracking-widest hover:text-neon-cyan transition-colors">← Edit Details</button>
                        </div>
                    </AnimatedSection>
                )}

                {step === 3 && (
                    <div className="text-center py-8 animate-fade-in">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-green/20 border border-primary-green/30 text-primary-green mb-8 shadow-glow-sm shadow-primary-green/10">
                            <CheckCircle2 size={40} />
                        </div>
                        <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tight">Application <span className="text-primary-green">Verified!</span></h2>
                        <p className="text-text-secondary font-bold max-w-md mx-auto mb-10">
                            Thank you, {formData.name}! Your application is registered. Our experts will contact you within 24 hours to guide your subsidy process.
                        </p>
                        
                        {calculatorResults && (
                            <div className="bg-night-sky/60 border border-glass-border/30 rounded-3xl p-8 space-y-6">
                                <h3 className="text-xs font-black text-neon-cyan uppercase tracking-[0.2em] mb-4">Final Summary</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                        <p className="text-[10px] font-black text-text-secondary uppercase mb-1">Savings / Year</p>
                                        <p className="text-xl font-bold text-white">₹{calculatorResults.annualSavings.toLocaleString('en-IN')}</p>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                        <p className="text-[10px] font-black text-text-secondary uppercase mb-1">System Capacity</p>
                                        <p className="text-xl font-bold text-white">{calculatorResults.recommendedSize}</p>
                                    </div>
                                </div>
                                <div className="p-6 bg-gradient-to-r from-primary-green/20 to-neon-cyan/20 rounded-2xl border border-white/10">
                                    <p className="text-[10px] font-black text-text-secondary uppercase mb-1">Govt. Subsidy Estimate</p>
                                    <p className="text-2xl font-black text-white ml-2">{calculatorResults.subsidy}</p>
                                </div>
                            </div>
                        )}
                        
                        <button onClick={() => window.location.href = '#/'} className="mt-12 text-sm font-black text-text-secondary hover:text-neon-cyan transition-colors uppercase tracking-[0.3em]">Return to Home</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CalculatorForm;