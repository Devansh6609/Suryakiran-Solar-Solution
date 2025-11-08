import React, { useState, useEffect } from 'react';
import { getMasterAdmins } from '../../service/adminService.ts';
import { User } from '../../types';
import Card from '../../components/admin/Card.tsx';
import LoadingSpinner from '../../components/LoadingSpinner.tsx';
import CreateAdminModal from '../../components/admin/CreateAdminModal.tsx';
import DeleteUserConfirmationModal from '../../components/admin/DeleteUserConfirmationModal.tsx';
import { useAuth } from '../../contexts/AuthContext.tsx';

const AdminManagementPage: React.FC = () => {
    const { user: currentUser } = useAuth();
    const [admins, setAdmins] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    const fetchAdmins = async () => {
        try {
            setLoading(true);
            const data = await getMasterAdmins();
            setAdmins(data);
        } catch (err) {
            setError('Failed to load admin accounts.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    const handleAdminCreated = () => {
        setIsCreateModalOpen(false);
        fetchAdmins(); // Refresh the list after creation
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-text-light">Admin Management</h2>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-accent-blue text-white font-bold py-2 px-4 rounded-lg hover:bg-accent-blue-hover transition-colors w-full sm:w-auto"
                >
                    + Add New Master Admin
                </button>
            </div>

            <Card>
                {loading && (
                    <div className="flex justify-center p-8">
                        <LoadingSpinner />
                    </div>
                )}
                {!loading && !error && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-border-color">
                            <thead className="bg-gray-50 dark:bg-secondary-background/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-text-muted uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-text-muted uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-text-muted uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-text-muted uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-secondary-background divide-y divide-gray-200 dark:divide-border-color">
                                {admins.map(admin => (
                                    <tr key={admin.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-text-light">{admin.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-text-muted">{admin.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-text-muted">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-secondary-cyan/20 text-secondary-cyan">
                                                {admin.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => setUserToDelete(admin)}
                                                className="text-error-red hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                                                disabled={admin.id === currentUser?.id}
                                                title={admin.id === currentUser?.id ? "You cannot delete your own account." : "Delete this admin"}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {error && !loading && <p className="text-red-500 p-4 text-center">{error}</p>}
            </Card>

            {isCreateModalOpen && (
                <CreateAdminModal
                    onClose={() => setIsCreateModalOpen(false)}
                    onAdminCreated={handleAdminCreated}
                />
            )}

            {userToDelete && (
                <DeleteUserConfirmationModal
                    userToDelete={userToDelete}
                    onClose={() => setUserToDelete(null)}
                    onDeleteSuccess={() => {
                        setUserToDelete(null);
                        fetchAdmins(); // Refresh list
                    }}
                />
            )}
        </div>
    );
};

export default AdminManagementPage;