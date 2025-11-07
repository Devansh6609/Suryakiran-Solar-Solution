import React, { useState, useRef, FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { User } from '../../types';
import LoadingSpinner from '../LoadingSpinner.tsx';

interface EditProfileModalProps {
    user: User;
    onClose: () => void;
    onSave: (data: { name: string; profileImage?: File }) => Promise<void>;
}

const API_BASE_URL = 'http://localhost:3001';

const DefaultAvatar: React.FC<{ className?: string }> = ({ className = 'h-32 w-32' }) => (
    <span className={`inline-block rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 shadow-lg ${className}`}>
        <svg className="h-full w-full text-gray-300 dark:text-gray-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
    </span>
);

const EditProfileModal: React.FC<EditProfileModalProps> = ({ user, onClose, onSave }) => {
    const [name, setName] = useState(user.name);
    const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProfileImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        await onSave({ name, profileImage: profileImageFile || undefined });
        setIsSaving(false);
    };

    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return null;

    const currentImageUrl = user.profileImage ? `${API_BASE_URL}/files/${user.profileImage}` : null;

    return createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-glass-surface border border-glass-border p-8 rounded-xl shadow-2xl w-full max-w-md">
                <h3 className="text-xl font-bold mb-6 text-text-primary">Edit Profile</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="relative">
                            {previewUrl ? (
                                <img src={previewUrl} className="h-32 w-32 rounded-full object-cover shadow-lg" alt="New profile preview" />
                            ) : currentImageUrl ? (
                                <img src={currentImageUrl} className="h-32 w-32 rounded-full object-cover shadow-lg" alt="Current profile" />
                            ) : (
                                <DefaultAvatar />
                            )}
                        </div>
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm text-accent-blue hover:underline">Change Photo</button>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg" className="hidden" />
                    </div>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-1">Full Name</label>
                        <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full p-2 border rounded-lg bg-night-sky text-text-primary border-glass-border focus:ring-neon-cyan focus:border-neon-cyan" />
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-600 text-text-primary font-semibold rounded-lg hover:bg-gray-500 transition-colors">Cancel</button>
                        <button type="submit" disabled={isSaving} className="py-2 px-4 w-36 flex items-center justify-center bg-accent-blue text-white font-semibold rounded-lg hover:bg-accent-blue-hover transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
                            {isSaving ? (
                                <>
                                    <LoadingSpinner size="sm" className="mr-2 !text-white" />
                                    Saving...
                                </>
                            ) : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        modalRoot
    );
};
export default EditProfileModal;
