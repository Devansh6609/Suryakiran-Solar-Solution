import React, { useState, FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { createMasterAdmin } from '../../service/adminService.ts';
import LoadingSpinner from '../LoadingSpinner';

interface CreateAdminModalProps {
    onClose: () => void;
    onAdminCreated: () => void;
}

const CreateAdminModal: React.FC<CreateAdminModalProps> = ({ onClose, onAdminCreated }) => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmationPassword: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);
        try {
            await createMasterAdmin(formData);
            onAdminCreated();
        } catch (err: any) {
            setError(err.message || 'Failed to create admin.');
        } finally {
            setIsSaving(false);
        }
    };

    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return null;

    const modalInputClass = "w-full p-2 border rounded-lg bg-gray-50 text-gray-900 border-gray-300 focus:ring-neon-cyan focus:border-neon-cyan dark:bg-night-sky dark:text-text-primary dark:border-glass-border";

    return createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-4 pt-24 pb-12 overflow-y-auto animate-fade-in">
            <div className="bg-white dark:bg-glass-surface border border-gray-200 dark:border-glass-border p-8 rounded-xl shadow-2xl w-full max-w-lg">
                <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-text-primary">Create New Master Admin</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-1">Full Name</label>
                        <input type="text" name="name" placeholder="Enter full name" value={formData.name} onChange={handleInputChange} required className={modalInputClass} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-1">Email Address</label>
                        <input type="email" name="email" placeholder="Enter email address" value={formData.email} onChange={handleInputChange} required className={modalInputClass} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-1">Initial Password</label>
                        <input type="password" name="password" placeholder="Create a strong password" value={formData.password} onChange={handleInputChange} required className={modalInputClass} />
                    </div>

                    <div className="!mt-8 border-t border-gray-200 dark:border-glass-border pt-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-1">Your Password (for confirmation)</label>
                        <input type="password" name="confirmationPassword" placeholder="Enter your current password to confirm" value={formData.confirmationPassword} onChange={handleInputChange} required className={modalInputClass} />
                        <p className="text-xs text-gray-500 dark:text-text-muted mt-1">For security, please confirm your identity by entering your password.</p>
                    </div>

                    {error && <p className="text-error-red text-sm bg-error-red/10 p-3 rounded-md">{error}</p>}

                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-text-primary dark:hover:bg-gray-500 transition-colors">Cancel</button>
                        <button type="submit" disabled={isSaving || !formData.confirmationPassword} className="py-2 px-4 w-36 flex items-center justify-center bg-accent-blue text-white font-semibold rounded-lg hover:bg-accent-blue-hover transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
                            {isSaving ? (
                                <>
                                    <LoadingSpinner size="sm" className="mr-2 !text-white" />
                                    Saving...
                                </>
                            ) : 'Create Admin'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        modalRoot
    );
};

export default CreateAdminModal;