import React, { useState, FormEvent, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as authService from '../service/authService';
import { Logo } from '../constants';
import LoadingSpinner from '../components/LoadingSpinner';
import CardParticles from '../components/CardParticles.tsx';

const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Apply dark theme for auth pages
        document.documentElement.classList.add('dark');
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsLoading(true);

        try {
            const response = await authService.requestPasswordReset(email);
            setMessage(response.message);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center p-4">
            <div className="relative w-full max-w-4xl rounded-2xl shadow-2xl p-[1px] overflow-hidden">
                <div className="absolute inset-[-1000%] animate-border-spin bg-[conic-gradient(from_90deg_at_50%_50%,#a78bfa_0%,#06b6d4_50%,#3b82f6_100%)]" />
                <div className="relative z-10 w-full h-full bg-night-sky rounded-[19px] overflow-hidden">
                    <CardParticles />
                    <div className="relative z-10 w-full h-full md:grid md:grid-cols-2">
                        {/* Left Side: Form */}
                        <div className="p-8 md:p-12 flex flex-col justify-center bg-night-sky">
                            <div className="w-full">
                                <div className="mb-8">
                                    <Logo />
                                </div>
                                <h2 className="text-3xl font-bold text-text-primary mb-6">Reset Password</h2>
                                {message ? (
                                    <div className="text-center space-y-6">
                                        <p className="text-text-primary">{message}</p>
                                        <Link to="/login" className="inline-block w-full text-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-blue hover:bg-accent-blue-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue">
                                            Back to Login
                                        </Link>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <p className="text-sm text-center text-text-secondary">
                                            Enter your email address and we'll send you instructions to reset your password.
                                        </p>
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-text-secondary">Email Address</label>
                                            <input
                                                type="email"
                                                id="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                className="mt-1 block w-full px-3 py-2 bg-night-sky/80 border border-glass-border rounded-md shadow-sm placeholder-gray-400 text-white focus:outline-none focus:ring-neon-cyan focus:border-neon-cyan"
                                            />
                                        </div>

                                        {error && <p className="text-sm text-error-red bg-error-red/10 p-3 rounded-md">{error}</p>}

                                        <div>
                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-blue hover:bg-accent-blue-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <LoadingSpinner size="sm" className="mr-2 !text-white" />
                                                        Sending...
                                                    </>
                                                ) : 'Send Reset Link'}
                                            </button>
                                        </div>
                                        <div className="text-center">
                                            <Link to="/login" className="text-sm font-medium text-accent-blue hover:text-accent-blue-hover">
                                                Back to Login
                                            </Link>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                        {/* Right Side: Message */}
                        <div className="hidden md:flex flex-col justify-center items-center text-center p-12 bg-transparent">
                            <div className="bg-deep-violet/40 backdrop-blur-sm p-8 rounded-xl">
                                <h3 className="text-3xl font-bold text-white text-glow">Secure Your Account</h3>
                                <p className="mt-2 text-text-secondary">Follow the steps to regain access and continue your work.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;