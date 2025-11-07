import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.tsx';
import Card from '../../components/admin/Card.tsx';
import EditProfileModal from '../../components/admin/EditProfileModal.tsx';
import * as adminService from '../../service/adminService';

const API_BASE_URL = 'http://localhost:3001';

const UserProfilePage: React.FC = () => {
    const { user, updateUser } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!user) {
        return (
            <Card>
                <p className="text-center text-gray-500 dark:text-text-muted">User not found.</p>
            </Card>
        );
    }

    const handleSaveProfile = async (updatedData: { name: string; profileImage?: File }) => {
        try {
            const updatedUser = await adminService.updateProfile(updatedData);
            updateUser(updatedUser); // Update context
            setIsModalOpen(false); // Close modal on success
        } catch (error) {
            console.error("Failed to update profile", error);
            // In a real app, you would show an error message in the modal
            alert("Failed to update profile.");
        }
    };

    const DefaultAvatar = () => (
        <span className="inline-block h-32 w-32 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 shadow-lg">
            <svg className="h-full w-full text-gray-300 dark:text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        </span>
    );

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-text-light mb-6">User Profile</h2>
            <Card className="max-w-3xl mx-auto">
                <div className="flex flex-col sm:flex-row items-center text-center sm:text-left">
                    {user.profileImage ? (
                        <img
                            className="h-32 w-32 rounded-full object-cover shadow-lg flex-shrink-0"
                            src={`${API_BASE_URL}/files/${user.profileImage}`}
                            alt="User Avatar"
                        />
                    ) : (
                        <DefaultAvatar />
                    )}
                    <div className="mt-4 sm:mt-0 sm:ml-6">
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-text-light">{user.name}</h3>
                        <p className="mt-1 text-md text-gray-500 dark:text-text-muted">{user.email}</p>
                        <span className="mt-2 inline-block bg-secondary-cyan/20 text-secondary-cyan text-xs font-semibold px-3 py-1 rounded-full">
                            {user.role}
                        </span>
                    </div>
                </div>

                <div className="mt-8 border-t border-gray-200 dark:border-border-color pt-6">
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-8">
                        <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-text-muted">Full Name</dt>
                            <dd className="mt-1 text-lg text-gray-900 dark:text-text-light">{user.name}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-text-muted">Email address</dt>
                            <dd className="mt-1 text-lg text-gray-900 dark:text-text-light">{user.email}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-text-muted">Role</dt>
                            <dd className="mt-1 text-lg text-gray-900 dark:text-text-light">{user.role}</dd>
                        </div>
                        {user.state && (
                            <div>
                                <dt className="text-sm font-medium text-gray-500 dark:text-text-muted">Assigned Location</dt>
                                <dd className="mt-1 text-lg text-gray-900 dark:text-text-light">{user.district}, {user.state}</dd>
                            </div>
                        )}
                    </dl>
                </div>
                <div className="mt-8 text-center sm:text-right">
                    <button onClick={() => setIsModalOpen(true)} className="font-bold bg-accent-blue text-white py-2 px-6 rounded-lg shadow-lg hover:bg-accent-blue-hover transition-colors duration-300">
                        Edit Profile
                    </button>
                </div>
            </Card>
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