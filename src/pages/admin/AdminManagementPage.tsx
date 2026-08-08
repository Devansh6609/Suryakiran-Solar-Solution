import React, { useState, useEffect } from 'react';
import { getMasterAdmins } from '../../service/adminService';
import { User } from '../../types';
import { TableSkeleton } from '../../components/skeletons';
import CreateAdminModal from '../../components/admin/CreateAdminModal';
import DeleteUserConfirmationModal from '../../components/admin/DeleteUserConfirmationModal';
import { useAuth } from '../../contexts/AuthContext';
import { ShieldAlert, UserCog, Mail, ShieldCheck, Trash2, Plus } from 'lucide-react';

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

    useEffect(() => { fetchAdmins(); }, []);

    const handleAdminCreated = () => {
        setIsCreateModalOpen(false);
        fetchAdmins();
    };

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-4 anim-fade-up">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2 text-xs font-600 mb-0.5" style={{ color: 'rgb(var(--color-danger))' }}>
                        <ShieldAlert size={14} /> System Access
                    </div>
                    <h1 className="text-2xl font-700" style={{ color: 'rgb(var(--text-0))' }}>Admin Management</h1>
                </div>

                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="crm-btn-primary text-xs" style={{ padding: '0.45rem 0.875rem' }}
                >
                    <Plus size={14} /> ADD ADMIN
                </button>
            </div>

            <div className="crm-card overflow-visible">
                {loading ? (
                    <TableSkeleton />
                ) : error ? (
                    <p className="text-sm font-600 p-6 text-center" style={{ color: 'rgb(var(--color-danger))' }}>{error}</p>
                ) : (
                    <div>
                        <table className="crm-table mobile-card-list">
                            <thead>
                                <tr>
                                    <th>Administrator</th>
                                    <th>Contact</th>
                                    <th>Role Level</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {admins.map(admin => (
                                    <tr key={admin.id}>
                                        <td data-label="Administrator">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-600 flex-shrink-0"
                                                    style={{ backgroundColor: 'rgb(var(--accent) / 0.1)', color: 'rgb(var(--accent))' }}>
                                                    {admin.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-600" style={{ color: 'rgb(var(--text-0))' }}>{admin.name}</div>
                                                    {admin.id === currentUser?.id && (
                                                        <div className="text-[10px] font-700 uppercase" style={{ color: 'rgb(var(--accent))' }}>You</div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td data-label="Contact">
                                            <div className="flex items-center gap-2 text-sm font-500" style={{ color: 'rgb(var(--text-1))' }}>
                                                <Mail size={14} style={{ color: 'rgb(var(--text-3))' }} />
                                                {admin.email}
                                            </div>
                                        </td>
                                        <td data-label="Role Level">
                                            <span className="crm-badge" style={{ backgroundColor: 'rgb(var(--accent) / 0.1)', color: 'rgb(var(--accent))' }}>
                                                <ShieldCheck size={12} className="mr-1" />
                                                {admin.role}
                                            </span>
                                        </td>
                                        <td data-label="Actions" style={{ textAlign: 'right' }}>
                                            <button
                                                onClick={() => setUserToDelete(admin)}
                                                disabled={admin.id === currentUser?.id}
                                                title={admin.id === currentUser?.id ? "You cannot delete your own account." : "Delete this admin"}
                                                className="p-1.5 rounded-lg transition-colors"
                                                style={{ color: admin.id === currentUser?.id ? 'rgb(var(--text-3))' : 'rgb(var(--color-danger))' }}
                                                onMouseEnter={e => { if (admin.id !== currentUser?.id) { e.currentTarget.style.backgroundColor = 'rgb(var(--color-danger) / 0.1)'; } }}
                                                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="px-4 py-3 border-t flex items-center justify-between"
                            style={{ borderColor: 'rgb(var(--border-muted))', backgroundColor: 'rgb(var(--surface-2))' }}>
                            <span className="text-xs font-500" style={{ color: 'rgb(var(--text-3))' }}>
                                {admins.length} administrators
                            </span>
                        </div>
                    </div>
                )}
            </div>

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
                        fetchAdmins();
                    }}
                />
            )}
        </div>
    );
};

export default AdminManagementPage;