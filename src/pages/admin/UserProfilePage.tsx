import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import EditProfileModal from '../../components/admin/EditProfileModal';
import { updateProfile } from '../../service/adminService';
import { User, Mail, ShieldCheck, MapPin, Edit3 } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_CRM_API_URL || 'http://localhost:3001';

const UserProfilePage: React.FC = () => {
    const { user, updateUser } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!user) {
        return (
            <div className="p-6 max-w-3xl mx-auto">
                <div className="crm-card p-12 text-center text-[rgb(var(--text-3))]">
                    User not found.
                </div>
            </div>
        );
    }

    const handleSaveProfile = async (updatedData: { name: string; profileImage?: File }) => {
        try {
            const updatedUser = await updateProfile(updatedData);
            updateUser(updatedUser);
            setIsModalOpen(false);
        } catch (error) {
            console.error("Failed to update profile", error);
            alert("Failed to update profile.");
        }
    };

    return (
        <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6 anim-fade-up">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2 text-xs font-600 mb-0.5" style={{ color: 'rgb(var(--accent))' }}>
                        <User size={14} /> Account Settings
                    </div>
                    <h1 className="text-2xl font-700" style={{ color: 'rgb(var(--text-0))' }}>User Profile</h1>
                </div>
            </div>

            <div className="crm-card overflow-hidden">
                <div className="p-6 md:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b" style={{ borderColor: 'rgb(var(--border-muted))' }}>
                    {user.profileImage ? (
                        <img
                            className="h-28 w-28 rounded-2xl object-cover shadow-md flex-shrink-0"
                            src={`${API_BASE_URL}/files/${user.profileImage}`}
                            alt="User Avatar"
                        />
                    ) : (
                        <div className="h-28 w-28 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0" style={{ backgroundColor: 'rgb(var(--surface-2))', color: 'rgb(var(--text-3))' }}>
                            <User size={48} />
                        </div>
                    )}
                    <div className="text-center sm:text-left flex-1 mt-2 sm:mt-0">
                        <h2 className="text-2xl font-700 mb-1" style={{ color: 'rgb(var(--text-0))' }}>{user.name}</h2>
                        <p className="text-sm font-500 mb-3 flex items-center justify-center sm:justify-start gap-2" style={{ color: 'rgb(var(--text-2))' }}>
                            <Mail size={14} /> {user.email}
                        </p>
                        <span className="crm-badge" style={{ backgroundColor: 'rgb(var(--accent)/0.1)', color: 'rgb(var(--accent))' }}>
                            <ShieldCheck size={12} className="mr-1" />
                            {user.role}
                        </span>
                    </div>
                    <div className="mt-4 sm:mt-0">
                        <button onClick={() => setIsModalOpen(true)} className="crm-btn-secondary text-xs">
                            <Edit3 size={14} /> Edit Profile
                        </button>
                    </div>
                </div>

                <div className="p-6 md:p-8 bg-[rgb(var(--surface-0))]">
                    <h3 className="text-xs font-700 uppercase tracking-widest mb-6" style={{ color: 'rgb(var(--text-3))' }}>Account Details</h3>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
                        <div className="crm-card p-4">
                            <dt className="text-xs font-600 uppercase" style={{ color: 'rgb(var(--text-3))' }}>Full Name</dt>
                            <dd className="mt-1 text-sm font-600" style={{ color: 'rgb(var(--text-0))' }}>{user.name}</dd>
                        </div>
                        <div className="crm-card p-4">
                            <dt className="text-xs font-600 uppercase" style={{ color: 'rgb(var(--text-3))' }}>Email Address</dt>
                            <dd className="mt-1 text-sm font-600" style={{ color: 'rgb(var(--text-0))' }}>{user.email}</dd>
                        </div>
                        <div className="crm-card p-4">
                            <dt className="text-xs font-600 uppercase" style={{ color: 'rgb(var(--text-3))' }}>System Role</dt>
                            <dd className="mt-1 text-sm font-600" style={{ color: 'rgb(var(--text-0))' }}>{user.role}</dd>
                        </div>
                        {user.state && (
                            <div className="crm-card p-4">
                                <dt className="text-xs font-600 uppercase flex items-center gap-1" style={{ color: 'rgb(var(--text-3))' }}>
                                    <MapPin size={12} /> Assigned Location
                                </dt>
                                <dd className="mt-1 text-sm font-600" style={{ color: 'rgb(var(--text-0))' }}>{user.district}, {user.state}</dd>
                            </div>
                        )}
                    </dl>
                </div>
            </div>

            {isModalOpen && (
                <EditProfileModal
                    user={user}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveProfile}
                />
            )}
        </div>
    );
};

export default UserProfilePage;