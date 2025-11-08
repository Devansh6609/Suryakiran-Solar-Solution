import React, { useState, FormEvent } from 'react';
import * as crmService from '../service/crmService';
import LoadingSpinner from '../components/LoadingSpinner';

const ContactPage: React.FC = () => {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
    const [consent, setConsent] = useState(false);
    const [leadId, setLeadId] = useState<string | null>(null);
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleGetOtp = async (e: FormEvent) => {
        e.preventDefault();
        if (!consent) {
            setError('You must agree to the terms to proceed.');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const leadPayload = {
                productType: 'Contact Inquiry',
                location: 'N/A', // Or geolocate later
                customFields: { message: formData.message }
            };
            const newLead = await crmService.createLead(leadPayload);
            setLeadId(newLead.id);
            await crmService.sendOtp(newLead.id, {
                name: formData.name,
                email: formData.email,
                phone: formData.phone
            });
            setIsOtpSent(true);
        } catch (err: any) {
            if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
                setError('Network Error: Could not connect to the server. Please ensure the backend service is running.');
            } else {
                setError(err.message || 'Failed to send OTP. Please check your details and try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!otp || otp.length !== 4) {
            setError("Please enter a valid 4-digit OTP.");
            return;
        }
        if (!leadId) {
            setError("Lead ID not found. Please try again.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            await crmService.verifyOtp(leadId, otp);
            setIsSubmitted(true);
        } catch (err: any) {
            setError(err.message || 'Invalid OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="bg-transparent min-h-[60vh] flex items-center justify-center">
                <div className="max-w-2xl mx-auto text-center py-20 px-4">
                    <h2 className="text-3xl font-bold text-primary-green">Thank You!</h2>
                    <p className="mt-4 text-lg text-text-secondary">Your request has been received. Our team will contact you shortly.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-transparent text-text-primary">
            <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-16">
                <div>
                    <h1 className="text-4xl font-extrabold text-white sm:text-5xl">
                        Get in Touch
                    </h1>
                    <p className="mt-4 text-xl text-text-secondary">
                        Have a question or ready to start your solar journey? Fill out the form, and our experts will get back to you.
                    </p>
                    <div className="mt-8 space-y-4 text-lg">
                        <p className="flex items-center"><svg className="w-6 h-6 mr-3 text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg> +91 12345 67890</p>
                        <p className="flex items-center"><svg className="w-6 h-6 mr-3 text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg> contact@suryakiran.com</p>
                        <p className="flex items-center"><svg className="w-6 h-6 mr-3 text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg> 123 Solar Marg, Green City, India</p>
                    </div>
                </div>
                <div className="bg-glass-surface backdrop-blur-md border border-glass-border p-8 rounded-lg shadow-xl">
                    <form onSubmit={isOtpSent ? handleSubmit : handleGetOtp} className="space-y-6">
                        <h2 className="text-2xl font-bold text-center text-white">Request a Quote</h2>
                        {error && <p className="text-red-500 text-center bg-red-50/10 p-3 rounded-md">{error}</p>}
                        <input type="text" name="name" placeholder="Full Name" required value={formData.name} onChange={handleInputChange} disabled={isOtpSent} className="w-full px-3 py-2 border border-glass-border rounded-md disabled:bg-night-sky/50 bg-night-sky/80 text-white placeholder-gray-400" />
                        <input type="email" name="email" placeholder="Email Address" required value={formData.email} onChange={handleInputChange} disabled={isOtpSent} className="w-full px-3 py-2 border border-glass-border rounded-md disabled:bg-night-sky/50 bg-night-sky/80 text-white placeholder-gray-400" />
                        <input type="tel" name="phone" placeholder="Phone Number" required value={formData.phone} onChange={handleInputChange} disabled={isOtpSent} className="w-full px-3 py-2 border border-glass-border rounded-md disabled:bg-night-sky/50 bg-night-sky/80 text-white placeholder-gray-400" />
                        <textarea name="message" placeholder="Your Message (Optional)" rows={4} value={formData.message} onChange={handleInputChange} disabled={isOtpSent} className="w-full px-3 py-2 border border-glass-border rounded-md disabled:bg-night-sky/50 bg-night-sky/80 text-white placeholder-gray-400"></textarea>

                        {!isOtpSent && (
                            <>
                                <div className="flex items-start">
                                    <input id="consent" name="consent" type="checkbox" required checked={consent} onChange={(e) => setConsent(e.target.checked)} className="h-4 w-4 text-accent-orange bg-gray-700 border-gray-600 rounded focus:ring-accent-orange mt-1" />
                                    <label htmlFor="consent" className="ml-3 block text-sm text-text-secondary">
                                        By checking this box, I provide my Prior Express Written Consent to be contacted by SuryaKiran Solar Solutions via phone, SMS, or email. See our <a href="#" className="font-medium text-accent-orange hover:underline">Privacy Policy</a>.
                                    </label>
                                </div>
                                <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center font-bold bg-accent-orange text-white py-3 px-4 rounded-lg shadow-lg hover:bg-accent-orange-hover transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed">
                                    {isLoading ? (
                                        <>
                                            <LoadingSpinner size="sm" className="mr-2 !text-white" />
                                            Sending...
                                        </>
                                    ) : 'Get OTP to Submit'}
                                </button>
                            </>
                        )}

                        {isOtpSent && (
                            <>
                                <div className="text-center">
                                    <p className="text-sm text-text-secondary">Enter the 4-digit OTP sent to {formData.phone}.</p>
                                </div>
                                <input type="text" name="otp" placeholder="Enter 4-Digit OTP" required value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full px-3 py-2 border border-glass-border rounded-md bg-night-sky/80 text-white placeholder-gray-400" />
                                <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center font-bold bg-primary-green text-white py-3 px-4 rounded-lg shadow-lg hover:bg-green-800 transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed">
                                    {isLoading ? (
                                        <>
                                            <LoadingSpinner size="sm" className="mr-2 !text-white" />
                                            Verifying...
                                        </>
                                    ) : 'Verify & Submit Request'}
                                </button>
                            </>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;