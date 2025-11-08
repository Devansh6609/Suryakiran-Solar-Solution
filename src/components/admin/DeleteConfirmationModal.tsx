import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import LoadingSpinner from '../LoadingSpinner';

interface DeleteConfirmationModalProps {
    itemName: string;
    onClose: () => void;
    onConfirm: () => Promise<void>;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ itemName, onClose, onConfirm }) => {
    const [confirmationText, setConfirmationText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState('');

    const isConfirmationMatch = confirmationText === 'Confirm';

    const handleConfirm = async () => {
        if (!isConfirmationMatch) return;
        setIsDeleting(true);
        setError('');
        try {
            await onConfirm();
            // onClose will be called by the parent component on success
        } catch (err: any) {
            setError(err.message || 'Failed to delete. Please try again.');
            setIsDeleting(false);
        }
    };

    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return null;

    return createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white dark:bg-glass-surface border border-gray-200 dark:border-glass-border p-8 rounded-xl shadow-2xl w-full max-w-md">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-text-primary">Confirm Deletion</h3>
                <p className="text-sm text-gray-600 dark:text-text-secondary mb-4">
                    This action is irreversible. To proceed, please type <strong className="text-error-red">Confirm</strong> in the box below.
                </p>
                <p className="text-sm text-gray-600 dark:text-text-secondary mb-4">
                    You are about to delete the lead for: <strong>{itemName}</strong>.
                </p>

                <div>
                    <label htmlFor="confirmationText" className="sr-only">Confirmation Text</label>
                    <input
                        id="confirmationText"
                        type="text"
                        value={confirmationText}
                        onChange={(e) => setConfirmationText(e.target.value)}
                        placeholder='Type "Confirm"'
                        className="w-full p-2 border rounded-lg bg-gray-50 text-gray-900 border-gray-300 focus:ring-error-red focus:border-error-red dark:bg-night-sky dark:text-text-primary dark:border-glass-border"
                    />
                </div>

                {error && <p className="text-error-red text-sm mt-4">{error}</p>}

                <div className="flex justify-end space-x-4 mt-6">
                    <button type="button" onClick={onClose} disabled={isDeleting} className="py-2 px-4 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-text-primary dark:hover:bg-gray-500 transition-colors disabled:opacity-50">
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={!isConfirmationMatch || isDeleting}
                        className="py-2 px-4 w-36 flex items-center justify-center bg-error-red text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                    >
                        {isDeleting ? (
                            <LoadingSpinner size="sm" className="mr-2 !text-white" />
                        ) : 'Delete'}
                    </button>
                </div>
            </div>
        </div>,
        modalRoot
    );
};

export default DeleteConfirmationModal;
