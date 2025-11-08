import React, { useState, useEffect, FormEvent, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { getVendors, getStates, getDistricts, createVendor } from '../../service/adminService';
import { User } from '../../types';
import Card from '../../components/admin/Card.tsx';
import LoadingSpinner from '../../components/LoadingSpinner.tsx';
import DeleteUserConfirmationModal from '../../components/admin/DeleteUserConfirmationModal.tsx';

const VendorManagementPage: React.FC = () => {
    const [vendors, setVendors] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    const [newVendor, setNewVendor] = useState({ name: '', email: '', password: '', state: '', district: '' });
    const [states, setStates] = useState<string[]>([]);
    const [districts, setDistricts] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');

    const fetchVendors = async () => {
        try {
            setLoading(true);
            const data = await getVendors();
            setVendors(data);
        } catch (err) {
            setError('Failed to load vendors.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVendors();
        getStates().then(setStates).catch(() => setError("Could not load states"));
    }, []);

    useEffect(() => {
        if (newVendor.state) {
            getDistricts(newVendor.state).then(setDistricts).catch(() => setError("Could not load districts"));
        } else {
            setDistricts([]);
        }
    }, [newVendor.state]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewVendor(prev => ({ ...prev, [name]: value }));
        if (name === 'state') {
            setNewVendor(prev => ({ ...prev, district: '' }));
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);
        try {
            await createVendor(newVendor);
            setIsCreateModalOpen(false);
            setNewVendor({ name: '', email: '', password: '', state: '', district: '' });
            await fetchVendors(); // Refresh the list
        } catch (err: any) {
            setError(err.message || 'Failed to create vendor.');
        } finally {
            setIsSaving(false);
        }
    };

    const filteredVendors = useMemo(() => {
        return vendors.filter(vendor =>
            vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vendor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vendor.district?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [vendors, searchTerm]);

    const modalRoot = document.getElementById('modal-root');
    const modalInputClass = "w-full p-2 border rounded-lg bg-gray-50 text-gray-900 border-gray-300 focus:ring-neon-cyan focus:border-neon-cyan dark:bg-night-sky dark:text-text-primary dark:border-glass-border";

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-text-light">Vendor Management</h2>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-accent-blue text-white font-bold py-2 px-4 rounded-lg hover:bg-accent-blue-hover transition-colors w-full sm:w-auto"
                >
                    + Add Vendor
                </button>
            </div>

            <Card>
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search vendors..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full max-w-sm bg-white dark:bg-secondary-background border border-gray-300 dark:border-border-color rounded-lg py-2 px-4 text-sm"
                    />
                </div>
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-text-muted uppercase tracking-wider">Location</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-text-muted uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-secondary-background divide-y divide-gray-200 dark:divide-border-color">
                                {filteredVendors.map(vendor => (
                                    <tr key={vendor.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-text-light">{vendor.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-text-muted">{vendor.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-text-muted">{vendor.district}, {vendor.state}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => setUserToDelete(vendor)} className="text-error-red hover:text-red-700">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {error && !loading && <p className="text-red-500 p-4 text-center">{error}</p>}
            </Card>

            {isCreateModalOpen && modalRoot && createPortal(
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-4 pt-24 pb-12 overflow-y-auto animate-fade-in">
                    <div className="bg-white dark:bg-glass-surface border border-gray-200 dark:border-glass-border p-8 rounded-xl shadow-2xl w-full max-w-lg">
                        <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-text-primary">Create New Vendor</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Form fields for creating a vendor */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-1">Full Name</label>
                                <input id="name" type="text" name="name" placeholder="Enter full name" value={newVendor.name} onChange={handleInputChange} required className={modalInputClass} />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-1">Email Address</label>
                                <input id="email" type="email" name="email" placeholder="Enter email address" value={newVendor.email} onChange={handleInputChange} required className={modalInputClass} />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-1">Password</label>
                                <input id="password" type="password" name="password" placeholder="Create a strong password" value={newVendor.password} onChange={handleInputChange} required className={modalInputClass} />
                            </div>
                            <div>
                                <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-1">State</label>
                                <select id="state" name="state" value={newVendor.state} onChange={handleInputChange} required className={modalInputClass}>
                                    <option value="">Select State</option>
                                    {states.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="district" className="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-1">District</label>
                                <select id="district" name="district" value={newVendor.district} onChange={handleInputChange} required disabled={!newVendor.state} className={`${modalInputClass} disabled:opacity-50 disabled:cursor-not-allowed`}>
                                    <option value="">Select District</option>
                                    {districts.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>

                            {error && <p className="text-error-red text-sm bg-error-red/10 p-3 rounded-md">{error}</p>}

                            <div className="flex justify-end space-x-4 pt-4">
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="py-2 px-4 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-text-primary dark:hover:bg-gray-500 transition-colors">Cancel</button>
                                <button type="submit" disabled={isSaving} className="py-2 px-4 w-36 flex items-center justify-center bg-accent-blue text-white font-semibold rounded-lg hover:bg-accent-blue-hover transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
                                    {isSaving ? (
                                        <>
                                            <LoadingSpinner size="sm" className="mr-2 !text-white" />
                                            Saving...
                                        </>
                                    ) : 'Create Vendor'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                modalRoot
            )}

            {userToDelete && (
                <DeleteUserConfirmationModal
                    userToDelete={userToDelete}
                    onClose={() => setUserToDelete(null)}
                    onDeleteSuccess={() => {
                        setUserToDelete(null);
                        fetchVendors(); // Refresh list after successful deletion
                    }}
                />
            )}
        </div>
    );
};

export default VendorManagementPage;