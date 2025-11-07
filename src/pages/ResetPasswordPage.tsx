import React, { useState, FormEvent, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as authService from '../service/authService';
import { Logo } from '../constants';
import LoadingSpinner from '../components/LoadingSpinner';
import CardParticles from '../components/CardParticles.tsx';

const ResetPasswordPage: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        document.documentElement.classList.add('dark');
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (!token) {
            setError("Invalid reset link. Please try again.");
            return;
        }
        setError('');
        setMessage('');
        setIsLoading(true);

        try {
            const response = await authService.resetPassword(token, password);
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
                                <h2 className="text-3xl font-bold text-text-primary mb-6">Create New Password</h2>
                                {message ? (
                                    <div className="text-center space-y-6">
                                        <p className="text-text-primary">{message}</p>
                                        <button onClick={() => navigate('/login')} className="w-full text-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-blue hover:bg-accent-blue-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue">
                                            Proceed to Login
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div>
                                            <label htmlFor="password" className="block text-sm font-medium text-text-secondary">New Password</label>
                                            <input
                                                type="password"
                                                id="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                className="mt-1 block w-full px-3 py-2 bg-night-sky/80 border border-glass-border rounded-md shadow-sm placeholder-gray-400 text-white focus:outline-none focus:ring-neon-cyan focus:border-neon-cyan"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-secondary">Confirm New Password</label>
                                            <input
                                                type="password"
                                                id="confirmPassword"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
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
                                                        Resetting...
                                                    </>
                                                ) : 'Reset Password'}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                        {/* Right Side: Message */}
                        <div className="hidden md:flex flex-col justify-center items-center text-center p-12 bg-transparent">
                            <div className="bg-deep-violet/40 backdrop-blur-sm p-8 rounded-xl">
                                <h3 className="text-3xl font-bold text-white text-glow">Secure Your Account</h3>
                                <p className="mt-2 text-text-secondary">A strong password is key to keeping your data safe.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;