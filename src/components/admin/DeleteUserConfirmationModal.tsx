import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { User } from '../../types';
import { requestUserDeletionOtp, deleteUserWithOtp } from '../../service/adminService';
import LoadingSpinner from '../LoadingSpinner';

interface DeleteUserConfirmationModalProps {
    userToDelete: User;
    onClose: () => void;
    onDeleteSuccess: () => void;
}

const DeleteUserConfirmationModal: React.FC<DeleteUserConfirmationModalProps> = ({ userToDelete, onClose, onDeleteSuccess }) => {
    const [step, setStep] = useState(1);
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSendCode = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await requestUserDeletionOtp(userToDelete.id);
            setStep(2);
        } catch (err: any) {
            setError(err.message || 'Failed to send deletion code.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmDeletion = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await deleteUserWithOtp(userToDelete.id, otp);
            onDeleteSuccess();
        } catch (err: any) {
            setError(err.message || 'Failed to delete user.');
        } finally {
            setIsLoading(false);
        }
    };

    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return null;

    const modalInputClass = "w-full p-2 border rounded-lg bg-gray-50 text-gray-900 border-gray-300 focus:ring-neon-cyan focus:border-neon-cyan dark:bg-night-sky dark:text-text-primary dark:border-glass-border";

    return createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white dark:bg-glass-surface border border-gray-200 dark:border-glass-border p-8 rounded-xl shadow-2xl w-full max-w-md">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-text-primary">Delete User Account</h3>
                <p className="text-sm text-gray-600 dark:text-text-secondary mb-4">
                    You are about to permanently delete the account for: <strong>{userToDelete.name} ({userToDelete.email})</strong>. This action is irreversible.
                </p>

                {error && <p className="text-error-red text-sm bg-error-red/10 p-3 rounded-md mb-4">{error}</p>}

                {step === 1 && (
                    <>
                        <p className="text-sm text-gray-600 dark:text-text-secondary mb-6">
                            For security, a 6-digit confirmation code will be sent to your administrator email address.
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button onClick={onClose} disabled={isLoading} className="py-2 px-4 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-text-primary dark:hover:bg-gray-500 transition-colors disabled:opacity-50">Cancel</button>
                            <button onClick={handleSendCode} disabled={isLoading} className="py-2 px-4 w-48 flex items-center justify-center bg-accent-blue text-white font-semibold rounded-lg hover:bg-accent-blue-hover transition-colors disabled:bg-gray-500">
                                {isLoading ? <LoadingSpinner size="sm" className="mr-2 !text-white" /> : 'Send Deletion Code'}
                            </button>
                        </div>
                    </>
                )}

                {step === 2 && (
                    <div className="space-y-4">
                        <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-text-secondary">Enter Deletion Code</label>
                        <input id="otp" type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter 6-digit code" required className={modalInputClass} />
                        <div className="flex justify-end space-x-4 pt-4">
                            <button onClick={onClose} disabled={isLoading} className="py-2 px-4 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-text-primary dark:hover:bg-gray-500 transition-colors disabled:opacity-50">Cancel</button>
                            <button onClick={handleConfirmDeletion} disabled={isLoading || otp.length < 6} className="py-2 px-4 w-48 flex items-center justify-center bg-error-red text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
                                {isLoading ? <LoadingSpinner size="sm" className="mr-2 !text-white" /> : 'Confirm & Delete'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>,
        modalRoot
    );
};

export default DeleteUserConfirmationModal;