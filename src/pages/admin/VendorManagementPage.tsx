import React, { useState, useEffect, FormEvent, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { getVendors, getStates, getDistricts, createVendor } from '../../service/adminService';
import { User } from '../../types';
import { TableSkeleton } from '../../components/skeletons';
import LoadingSpinner from '../../components/LoadingSpinner';
import DeleteUserConfirmationModal from '../../components/admin/DeleteUserConfirmationModal';
import { Users, Search, UserPlus, Trash2, MapPin, Mail, ShieldCheck } from 'lucide-react';

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
        } catch (err) { setError('Failed to load vendors.'); }
        finally { setLoading(false); }
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
        if (name === 'state') setNewVendor(prev => ({ ...prev, district: '' }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSaving(true); setError(null);
        try {
            await createVendor(newVendor);
            setIsCreateModalOpen(false);
            setNewVendor({ name: '', email: '', password: '', state: '', district: '' });
            await fetchVendors();
        } catch (err: any) { setError(err.message || 'Failed to create vendor.'); }
        finally { setIsSaving(false); }
    };

    const filteredVendors = useMemo(() => {
        return vendors.filter(vendor =>
            vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vendor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vendor.district?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [vendors, searchTerm]);

    const modalRoot = document.getElementById('modal-root');
    const inputStyle = { backgroundColor: 'rgb(var(--surface-2))', border: '1px solid rgb(var(--border-default))', color: 'rgb(var(--text-0))', padding: '0.6rem 1rem', borderRadius: '8px', outline: 'none', width: '100%', fontSize: '0.875rem' };

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-4 anim-fade-up">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <p className="text-xs font-500 mb-0.5" style={{ color: 'rgb(var(--text-2))' }}>Directory</p>
                    <h1 className="text-2xl font-700" style={{ color: 'rgb(var(--text-0))' }}>Vendor Management</h1>
                </div>
                <button onClick={() => setIsCreateModalOpen(true)} className="crm-btn-primary text-xs" style={{ padding: '0.45rem 0.875rem' }}>
                    <UserPlus size={14} /> Add Vendor
                </button>
            </div>

            {/* Content */}
            <div className="crm-card overflow-visible">
                <div className="p-4 border-b flex flex-col sm:flex-row justify-between items-center gap-3" style={{ borderColor: 'rgb(var(--border-muted))' }}>
                    <div className="relative w-full max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={15} style={{ color: 'rgb(var(--text-3))' }} />
                        <input type="text" placeholder="Search vendors..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="crm-input pl-9 w-full" />
                    </div>
                </div>

                {loading ? (
                    <TableSkeleton />
                ) : error ? (
                    <div className="p-10 text-center" style={{ color: 'rgb(var(--color-danger))' }}>{error}</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="crm-table mobile-card-list">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Contact</th>
                                    <th>Location</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredVendors.length === 0 ? (
                                    <tr><td colSpan={4} className="text-center py-10" style={{ color: 'rgb(var(--text-3))' }}>No vendors found.</td></tr>
                                ) : filteredVendors.map(vendor => (
                                    <tr key={vendor.id}>
                                        <td data-label="Name">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-600 flex-shrink-0" style={{ backgroundColor: 'rgb(var(--color-info)/0.1)', color: 'rgb(var(--color-info))' }}>
                                                    {vendor.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="font-500 text-sm" style={{ color: 'rgb(var(--text-0))' }}>{vendor.name}</div>
                                            </div>
                                        </td>
                                        <td data-label="Contact">
                                            <div className="flex items-center gap-2 text-xs" style={{ color: 'rgb(var(--text-1))' }}>
                                                <Mail size={12} style={{ color: 'rgb(var(--text-3))' }} />
                                                {vendor.email}
                                            </div>
                                        </td>
                                        <td data-label="Location">
                                            <div className="flex items-center gap-2 text-xs" style={{ color: 'rgb(var(--text-1))' }}>
                                                <MapPin size={12} style={{ color: 'rgb(var(--text-3))' }} />
                                                {vendor.district}, {vendor.state}
                                            </div>
                                        </td>
                                        <td data-label="Actions" style={{ textAlign: 'right' }}>
                                            <button onClick={() => setUserToDelete(vendor)} className="p-1.5 rounded-lg transition-colors" style={{ color: 'rgb(var(--color-danger))', backgroundColor: 'rgb(var(--color-danger)/0.1)' }}>
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isCreateModalOpen && modalRoot && createPortal(
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 anim-fade-in backdrop-blur-sm">
                    <div className="crm-card p-6 w-full max-w-md shadow-2xl relative">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-700" style={{ color: 'rgb(var(--text-0))' }}>Create New Vendor</h3>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgb(var(--color-info)/0.1)', color: 'rgb(var(--color-info))' }}><UserPlus size={16} /></div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-600 mb-1" style={{ color: 'rgb(var(--text-2))' }}>Full Name *</label>
                                <input type="text" name="name" value={newVendor.name} onChange={handleInputChange} required style={inputStyle} />
                            </div>
                            <div>
                                <label className="block text-xs font-600 mb-1" style={{ color: 'rgb(var(--text-2))' }}>Email Address *</label>
                                <input type="email" name="email" value={newVendor.email} onChange={handleInputChange} required style={inputStyle} />
                            </div>
                            <div>
                                <label className="block text-xs font-600 mb-1" style={{ color: 'rgb(var(--text-2))' }}>Password *</label>
                                <input type="password" name="password" value={newVendor.password} onChange={handleInputChange} required style={inputStyle} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-600 mb-1" style={{ color: 'rgb(var(--text-2))' }}>State *</label>
                                    <select name="state" value={newVendor.state} onChange={handleInputChange} required style={inputStyle}>
                                        <option value="">Select State</option>
                                        {states.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-600 mb-1" style={{ color: 'rgb(var(--text-2))' }}>District *</label>
                                    <select name="district" value={newVendor.district} onChange={handleInputChange} required disabled={!newVendor.state} style={{ ...inputStyle, opacity: !newVendor.state ? 0.5 : 1 }}>
                                        <option value="">Select District</option>
                                        {districts.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                            </div>

                            {error && <p className="text-xs font-500 p-2 rounded" style={{ backgroundColor: 'rgb(var(--color-danger)/0.1)', color: 'rgb(var(--color-danger))' }}>{error}</p>}

                            <div className="flex gap-3 pt-4 border-t mt-4" style={{ borderColor: 'rgb(var(--border-muted))' }}>
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="crm-btn-secondary flex-1">Cancel</button>
                                <button type="submit" disabled={isSaving} className="crm-btn-primary flex-[2] flex items-center justify-center gap-2">
                                    {isSaving ? <><LoadingSpinner size="sm" /> Saving...</> : 'Create Vendor'}
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
                    onDeleteSuccess={() => { setUserToDelete(null); fetchVendors(); }}
                />
            )}
        </div>
    );
};

export default VendorManagementPage;