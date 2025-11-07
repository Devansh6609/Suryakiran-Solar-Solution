import React, { useState, FormEvent, useEffect, Fragment } from 'react';
import { CalculatorType, FormField, FormFieldType } from '../types.ts';
import * as crmService from '../service/crmService.ts';
import * as adminService from '../service/adminService.ts';
import LoadingSpinner from './LoadingSpinner.tsx';

interface CalculatorFormProps {
    type: CalculatorType;
    initialValue?: number | null;
}

const InputField: React.FC<{
    label: string;
    name: string;
    type: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
    placeholder?: string;
    error?: string;
}> = ({ label, name, type, value, onChange, required = true, placeholder = '', error }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-text-secondary">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            type={type}
            name={name}
            id={name}
            value={value}
            onChange={onChange}
            required={required}
            placeholder={placeholder}
            className={`mt-1 block w-full px-3 py-2 bg-night-sky/80 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-accent-orange focus:border-accent-orange sm:text-sm text-white ${error ? 'border-red-500' : 'border-glass-border'}`}
            aria-invalid={!!error}
            aria-describedby={error ? `${name}-error` : undefined}
        />
        {error && <p id={`${name}-error`} className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
);

const SelectField: React.FC<{
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: string[];
    required?: boolean;
    disabled?: boolean;
    error?: string;
}> = ({ label, name, value, onChange, options, required = true, disabled = false, error }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-text-secondary">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <select
            name={name}
            id={name}
            value={value}
            onChange={onChange}
            required={required}
            disabled={disabled}
            className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border rounded-md shadow-sm focus:outline-none focus:ring-accent-orange focus:border-accent-orange sm:text-sm bg-night-sky/80 text-white ${error ? 'border-red-500' : 'border-glass-border'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-invalid={!!error}
            aria-describedby={error ? `${name}-error` : undefined}
        >
            <option value="" disabled>Select an option</option>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        {error && <p id={`${name}-error`} className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
);

const FileInputField: React.FC<{
    label: string;
    name: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
    error?: string;
    fileName?: string;
}> = ({ label, name, onChange, required = true, error, fileName }) => (
    <div>
        <label className="block text-sm font-medium text-text-secondary">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${error ? 'border-red-500' : 'border-glass-border'} border-dashed rounded-md`}>
            <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-text-secondary" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex text-sm text-gray-400">
                    <label htmlFor={name} className="relative cursor-pointer bg-night-sky rounded-md font-medium text-accent-orange hover:text-accent-orange-hover focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-accent-orange">
                        <span>Upload a file</span>
                        <input id={name} name={name} type="file" className="sr-only" onChange={onChange} accept="image/*,.pdf" />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                </div>
                {fileName ? (
                    <p className="text-xs text-green-400">{fileName}</p>
                ) : (
                    <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                )}
            </div>
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
);

const CalculatorForm: React.FC<CalculatorFormProps> = ({ type, initialValue }) => {
    const [step, setStep] = useState(1);
    const [formSchema, setFormSchema] = useState<FormField[]>([]);
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [fileData, setFileData] = useState<Record<string, File | null>>({});

    const [otp, setOtp] = useState('');
    const [leadId, setLeadId] = useState<string | null>(null);
    const [results, setResults] = useState<Record<string, string> | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    const [states, setStates] = useState<string[]>([]);
    const [districts, setDistricts] = useState<string[]>([]);

    useEffect(() => {
        const fetchSchemaAndLocations = async () => {
            try {
                const schema = await crmService.getFormSchema(type);
                const fetchedStates = await adminService.getStates();
                setStates(fetchedStates);

                const stateField = schema.find((f: FormField) => f.name === 'state');
                if (stateField) {
                    stateField.options = fetchedStates;
                }

                setFormSchema(schema);
                const initialFormData: Record<string, string> = {};
                schema.forEach((field: FormField) => {
                    initialFormData[field.name] = '';
                });

                if (initialValue !== null && initialValue !== undefined) {
                    const initialFieldName = type === CalculatorType.Rooftop ? 'bill' : 'energyCost';
                    initialFormData[initialFieldName] = String(initialValue);
                }

                setFormData(initialFormData);
            } catch (err) {
                setApiError("Failed to load calculator configuration. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchSchemaAndLocations();
    }, [type, initialValue]);

    useEffect(() => {
        if (formData.state) {
            adminService.getDistricts(formData.state)
                .then(setDistricts)
                .catch(() => setApiError("Failed to load districts for the selected state."));
        } else {
            setDistricts([]);
        }
    }, [formData.state]);

    const validate = (currentStep: number): boolean => {
        const newErrors: Record<string, string> = {};
        let fieldsToValidate: string[] = [];

        if (currentStep === 1) {
            fieldsToValidate = formSchema.map(f => f.name);
        } else if (currentStep === 2) {
            fieldsToValidate = ['name', 'email', 'phone'];
        }

        fieldsToValidate.forEach(fieldName => {
            const fieldSchema = formSchema.find(f => f.name === fieldName);
            const value = formData[fieldName];
            const file = fileData[fieldName];

            // Required field check
            if ((fieldSchema?.required || ['name', 'email', 'phone'].includes(fieldName)) && !value && !file) {
                newErrors[fieldName] = "This field is required.";
                return;
            }

            // Type-specific validation
            const fieldType = fieldSchema?.type;
            if (value) {
                if (fieldType === 'email' || fieldName === 'email') {
                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                        newErrors[fieldName] = "Please enter a valid email address.";
                    }
                } else if (fieldType === 'tel' || fieldName === 'phone') {
                    if (!/^\d{10}$/.test(value)) {
                        newErrors[fieldName] = "Please enter a valid 10-digit phone number.";
                    }
                } else if (fieldName === 'pincode' && !/^\d{6}$/.test(value)) {
                    newErrors[fieldName] = "Please enter a valid 6-digit pincode.";
                } else if (fieldType === 'number' && isNaN(Number(value))) {
                    newErrors[fieldName] = "Please enter a valid number.";
                }
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, files } = e.target;
        if (files && files.length > 0) {
            setFileData(prev => ({ ...prev, [name]: files[0] }));
            if (errors[name]) {
                setErrors(prev => ({ ...prev, [name]: '' }));
            }
        }
    };

    const handleNextStep = async (e: FormEvent) => {
        e.preventDefault();
        setApiError(null);
        if (!validate(1)) return;

        setIsSubmitting(true);
        try {
            const leadPayload = {
                productType: type,
                customFields: { ...formData }
            };
            const newLead = await crmService.createLead(leadPayload);

            // Upload files if any
            const fileUploadPromises = Object.entries(fileData).map(([fieldName, file]) => {
                if (file) {
                    return crmService.uploadLeadFile(newLead.id, fieldName, file);
                }
                return Promise.resolve();
            });
            await Promise.all(fileUploadPromises);

            setLeadId(newLead.id);
            setStep(2);
        } catch (err: any) {
            setApiError(err.message || 'An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const triggerOtp = async (e: FormEvent) => {
        e.preventDefault();
        setApiError(null);
        if (!validate(2)) return;
        if (!leadId) {
            setApiError("Lead ID is missing. Please start over.");
            return;
        }

        setIsSubmitting(true);
        try {
            await crmService.sendOtp(leadId, {
                name: formData.name,
                email: formData.email,
                phone: formData.phone
            });
            setStep(3);
        } catch (err: any) {
            setApiError(err.message || 'Failed to send OTP. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOtpSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setApiError(null);
        if (!otp || otp.length !== 4) {
            setErrors({ otp: "Please enter a valid 4-digit OTP." });
            return;
        }
        if (!leadId) {
            setApiError("Lead ID is missing. Please start over.");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await crmService.verifyOtp(leadId, otp);
            setResults(response.results);
            setStep(4);
        } catch (err: any) {
            setApiError(err.message || 'Invalid OTP. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderField = (field: FormField) => {
        let options: string[] = field.options || [];
        if (field.name === 'district') {
            options = districts;
        }

        switch (field.type) {
            case 'select':
                return <SelectField key={field.id} {...field} value={formData[field.name]} onChange={handleInputChange} options={options} error={errors[field.name]} disabled={field.name === 'district' && !formData.state} />;
            case 'image':
                return <FileInputField key={field.id} {...field} onChange={handleFileChange} error={errors[field.name]} fileName={fileData[field.name]?.name} />;
            default:
                return <InputField key={field.id} {...field} type={field.type} value={formData[field.name]} onChange={handleInputChange} error={errors[field.name]} />;
        }
    };

    const StepIndicator = () => {
        const steps = ["Details", "Contact", "Verify", "Results"];
        return (
            <div className="flex items-center mb-12">
                {steps.map((name, index) => {
                    const stepNum = index + 1;
                    const isCompleted = step > stepNum;
                    const isCurrent = step === stepNum;

                    return (
                        <Fragment key={name}>
                            <div className="flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-500
                                    ${isCompleted ? 'bg-primary-green text-white' : ''}
                                    ${isCurrent ? 'bg-accent-orange text-white scale-110' : ''}
                                    ${!isCompleted && !isCurrent ? 'bg-night-sky text-text-secondary border-2 border-glass-border' : ''}
                                `}>
                                    {isCompleted ? '✓' : stepNum}
                                </div>
                                <p className={`mt-2 text-xs font-medium transition-colors duration-500 ${isCurrent ? 'text-accent-orange' : 'text-text-secondary'}`}>{name}</p>
                            </div>
                            {index < steps.length - 1 && (
                                <div className="flex-1 h-1 mx-2 relative bg-glass-border rounded-full overflow-hidden">
                                    <div className="absolute top-0 left-0 h-full bg-accent-orange rounded-full transition-all duration-700 ease-out" style={{ width: step > stepNum ? '100%' : '0%' }}></div>
                                </div>
                            )}
                        </Fragment>
                    );
                })}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="bg-glass-surface backdrop-blur-md border border-glass-border p-8 rounded-lg shadow-2xl max-w-2xl mx-auto flex justify-center items-center h-96">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="bg-glass-surface backdrop-blur-md border border-glass-border p-8 rounded-lg shadow-2xl max-w-2xl mx-auto">
            <StepIndicator />
            {apiError && <p className="mb-4 text-center text-red-500 bg-red-500/10 p-3 rounded-md">{apiError}</p>}

            {step === 1 && (
                <form onSubmit={handleNextStep} className="space-y-4 animate-fade-in">
                    {formSchema.map(field => renderField(field))}
                    <button type="submit" disabled={isSubmitting} className="w-full font-bold bg-accent-orange text-white py-3 px-4 rounded-lg shadow-lg hover:bg-accent-orange-hover transition-colors duration-300 flex justify-center items-center disabled:bg-gray-500">
                        {isSubmitting ? <LoadingSpinner size="sm" className="mr-2 !text-white" /> : 'Next'}
                    </button>
                </form>
            )}

            {step === 2 && (
                <form onSubmit={triggerOtp} className="space-y-4 animate-fade-in">
                    <h3 className="text-xl font-bold text-center text-white">Step 2: Your Contact Information</h3>
                    <InputField label="Full Name" name="name" type="text" value={formData.name} onChange={handleInputChange} error={errors.name} />
                    <InputField label="Email Address" name="email" type="email" value={formData.email} onChange={handleInputChange} error={errors.email} />
                    <InputField label="Phone Number" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} error={errors.phone} />
                    <button type="submit" disabled={isSubmitting} className="w-full font-bold bg-accent-orange text-white py-3 px-4 rounded-lg shadow-lg hover:bg-accent-orange-hover transition-colors duration-300 flex justify-center items-center disabled:bg-gray-500">
                        {isSubmitting ? <LoadingSpinner size="sm" className="mr-2 !text-white" /> : 'Get OTP to View Results'}
                    </button>
                </form>
            )}

            {step === 3 && (
                <form onSubmit={handleOtpSubmit} className="space-y-4 animate-fade-in">
                    <h3 className="text-xl font-bold text-center text-white">Step 3: Verify Your Number</h3>
                    <p className="text-center text-text-secondary">Enter the 4-digit OTP sent to {formData.phone}. (Hint: 1234)</p>
                    <InputField label="OTP Code" name="otp" type="text" value={otp} onChange={(e) => { setOtp(e.target.value); setErrors(prev => ({ ...prev, otp: '' })) }} placeholder="XXXX" error={errors.otp} />
                    <button type="submit" disabled={isSubmitting} className="w-full font-bold bg-accent-orange text-white py-3 px-4 rounded-lg shadow-lg hover:bg-accent-orange-hover transition-colors duration-300 flex justify-center items-center disabled:bg-gray-500">
                        {isSubmitting ? <LoadingSpinner size="sm" className="mr-2 !text-white" /> : 'Verify & See My Estimate'}
                    </button>
                </form>
            )}

            {step === 4 && results && (
                <div className="text-center animate-fade-in">
                    <h3 className="text-2xl font-bold text-primary-green">Thank You, {formData.name}!</h3>
                    <p className="mt-2 text-text-secondary">Here is your personalized estimate:</p>
                    <div className="mt-6 border-t border-b border-glass-border divide-y divide-glass-border">
                        {Object.entries(results).map(([key, value]) => (
                            <div key={key} className="py-4 flex justify-between text-lg">
                                <dt className="font-medium text-text-secondary">{key}:</dt>
                                <dd className="font-bold text-white">{value}</dd>
                            </div>
                        ))}
                    </div>
                    <p className="mt-6 text-base bg-primary-green/20 text-green-300 p-4 rounded-md">
                        A specialist is now reviewing your results and will call you within 24 hours to guide your subsidy application.
                    </p>
                </div>
            )}
        </div>
    );
};

export default CalculatorForm;