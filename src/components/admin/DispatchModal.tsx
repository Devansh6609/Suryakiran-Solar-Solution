import React, { useState, useEffect } from 'react';
import { X, Truck, Upload, Image as ImageIcon, Send, Plus, Trash2, Package, IndianRupee } from 'lucide-react';
import { generateDispatchChallan, getInventoryOverview } from '../../service/adminService';
import LoadingSpinner from '../LoadingSpinner';
import { createPortal } from 'react-dom';

interface DispatchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDispatched: () => void;
    prefillLeadId?: string;
}

interface DispatchItem {
    sku: string;
    name: string;
    qty: number;
    unitPrice: number;
}

const DispatchModal: React.FC<DispatchModalProps> = ({
    isOpen,
    onClose,
    onDispatched,
    prefillLeadId = ''
}) => {
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        leadId: prefillLeadId,
        vehicleNo: '',
        driverName: '',
        remarks: '',
        loadingPhotoUrl: ''
    });

    const [items, setItems] = useState<DispatchItem[]>([]);
    const [imagePreview, setImagePreview] = useState<string>('');

    useEffect(() => {
        if (isOpen) {
            setFormData(prev => ({ ...prev, leadId: prefillLeadId }));
            getInventoryOverview({}).then(data => {
                if (data.success) setProducts(data.products || []);
            }).catch(() => {});
        }
    }, [isOpen, prefillLeadId]);

    if (!isOpen) return null;

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setImagePreview(base64);
                setFormData(prev => ({ ...prev, loadingPhotoUrl: base64 }));
            };
            reader.readAsDataURL(file);
        }
    };

    const addItem = () => {
        setItems(prev => [...prev, { sku: '', name: '', qty: 1, unitPrice: 0 }]);
    };

    const removeItem = (idx: number) => {
        setItems(prev => prev.filter((_, i) => i !== idx));
    };

    const updateItem = (idx: number, field: keyof DispatchItem, value: any) => {
        setItems(prev => prev.map((item, i) => {
            if (i !== idx) return item;
            if (field === 'sku') {
                const prod = products.find(p => p.sku === value);
                if (prod) {
                    return { ...item, sku: prod.sku, name: prod.name, unitPrice: prod.unitPrice };
                }
            }
            return { ...item, [field]: field === 'qty' || field === 'unitPrice' ? Number(value) : value };
        }));
    };

    const totalMaterialCost = items.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.leadId.trim()) {
            alert('Please enter a Lead ID');
            return;
        }
        try {
            setLoading(true);
            await generateDispatchChallan({ ...formData, items });
            onDispatched();
            onClose();
            // Reset
            setItems([]);
            setImagePreview('');
            setFormData({ leadId: '', vehicleNo: '', driverName: '', remarks: '', loadingPhotoUrl: '' });
        } catch (err: any) {
            alert(err.message || 'Failed to issue Dispatch Challan.');
        } finally {
            setLoading(false);
        }
    };

    const inputClasses = "w-full bg-[rgb(var(--surface-1))] border border-[rgb(var(--border-default))] rounded-xl px-4 py-2.5 text-xs text-[rgb(var(--text-0))] placeholder:text-[rgb(var(--text-3))] focus:outline-none focus:border-[rgb(var(--accent))/0.5] transition-colors";

    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md anim-fade-in">
            <div className="crm-card relative w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[rgb(var(--border-muted))] flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-electric-blue/10 text-electric-blue">
                            <Truck size={22} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black" style={{ color: 'rgb(var(--text-0))' }}>Generate Dispatch Challan</h2>
                            <p className="text-xs" style={{ color: 'rgb(var(--text-2))' }}>Items dispatched will auto-deduct from inventory</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-[rgb(var(--text-2))] hover:text-[rgb(var(--text-0))]">
                        <X size={18} />
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="overflow-y-auto flex-1 px-6 py-4">
                    <form id="dispatch-form" onSubmit={handleSubmit} className="space-y-4">
                        {/* Lead ID */}
                        <div>
                            <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">Project / Lead ID *</label>
                            <input
                                type="text"
                                required
                                value={formData.leadId}
                                onChange={e => setFormData({ ...formData, leadId: e.target.value })}
                                placeholder="Lead ID from system"
                                className={inputClasses}
                            />
                        </div>

                        {/* Vehicle + Driver */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">Vehicle Number *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.vehicleNo}
                                    onChange={e => setFormData({ ...formData, vehicleNo: e.target.value })}
                                    placeholder="GJ-01-AB-1234"
                                    className={inputClasses}
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">Driver Name & Phone</label>
                                <input
                                    type="text"
                                    value={formData.driverName}
                                    onChange={e => setFormData({ ...formData, driverName: e.target.value })}
                                    placeholder="Ramesh Patel (9876543210)"
                                    className={inputClasses}
                                />
                            </div>
                        </div>

                        {/* Dispatched Items Section */}
                        <div className="rounded-2xl border border-electric-blue/20 bg-electric-blue/5 p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Package size={15} className="text-electric-blue" />
                                    <h3 className="text-xs font-bold text-electric-blue uppercase tracking-wider">Items Dispatched</h3>
                                    <span className="text-[10px] text-text-secondary/60">(auto-deducts from stock)</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={addItem}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-electric-blue/20 border border-electric-blue/30 text-electric-blue rounded-lg text-[11px] font-bold hover:bg-electric-blue hover:text-white transition-all"
                                >
                                    <Plus size={12} /> Add Item
                                </button>
                            </div>

                            {items.length === 0 ? (
                                <p className="text-xs text-text-secondary/50 text-center py-3">
                                    No items added. Click "Add Item" to list what's being dispatched.
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {items.map((item, idx) => (
                                        <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                                            <div className="col-span-5">
                                                <select
                                                    value={item.sku}
                                                    onChange={e => updateItem(idx, 'sku', e.target.value)}
                                                    className="w-full bg-night-sky/80 border border-glass-border/30 rounded-lg px-2 py-2 text-xs text-white focus:outline-none focus:border-neon-cyan/50"
                                                >
                                                    <option value="">Select Product</option>
                                                    {products.map(p => (
                                                        <option key={p.sku} value={p.sku} className="text-gray-900">
                                                            {p.name} (Stock: {p.currentStock})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="col-span-2">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.qty}
                                                    onChange={e => updateItem(idx, 'qty', e.target.value)}
                                                    placeholder="Qty"
                                                    className="w-full bg-night-sky/80 border border-glass-border/30 rounded-lg px-2 py-2 text-xs text-white focus:outline-none focus:border-neon-cyan/50"
                                                />
                                            </div>
                                            <div className="col-span-3">
                                                <input
                                                    type="number"
                                                    value={item.unitPrice}
                                                    onChange={e => updateItem(idx, 'unitPrice', e.target.value)}
                                                    placeholder="₹ Unit Price"
                                                    className="w-full bg-night-sky/80 border border-glass-border/30 rounded-lg px-2 py-2 text-xs text-white focus:outline-none focus:border-neon-cyan/50"
                                                />
                                            </div>
                                            <div className="col-span-2 flex items-center justify-end gap-1">
                                                <span className="text-[10px] text-neon-cyan font-bold">
                                                    ₹{(item.qty * item.unitPrice).toLocaleString('en-IN')}
                                                </span>
                                                <button type="button" onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-300 ml-1">
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {/* Total */}
                                    <div className="flex justify-between items-center pt-2 border-t border-electric-blue/20 mt-2">
                                        <span className="text-[11px] font-bold text-text-secondary uppercase">Total Material Cost</span>
                                        <span className="text-base font-black text-neon-cyan flex items-center gap-1">
                                            <IndianRupee size={14} />{totalMaterialCost.toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Loading Photo */}
                        <div>
                            <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">Loading Photo Proof</label>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-glass-border/30 overflow-hidden flex items-center justify-center">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Loading Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <ImageIcon className="text-text-secondary/40" size={24} />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                        id="loading-photo-upload"
                                    />
                                    <label
                                        htmlFor="loading-photo-upload"
                                        className="px-4 py-2 bg-electric-blue/10 border border-electric-blue/30 text-electric-blue rounded-xl text-xs font-bold hover:bg-electric-blue hover:text-white transition-all flex items-center gap-2 cursor-pointer w-fit"
                                    >
                                        <Upload size={14} /> Upload Loading Photo
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Remarks */}
                        <div>
                            <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">Remarks / Special Handling</label>
                            <textarea
                                rows={2}
                                value={formData.remarks}
                                onChange={e => setFormData({ ...formData, remarks: e.target.value })}
                                placeholder="Fragile panels loaded on top, handle with care"
                                className={inputClasses}
                            />
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-[rgb(var(--border-muted))] flex items-center justify-end gap-3 flex-shrink-0" style={{ backgroundColor: 'rgb(var(--surface-0))' }}>
                    <button type="button" onClick={onClose} className="crm-btn-secondary px-5 py-2 text-xs">
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="dispatch-form"
                        disabled={loading}
                        className="crm-btn-primary px-6 py-2.5 text-xs flex items-center gap-2"
                    >
                        {loading ? <LoadingSpinner size="sm" /> : <Send size={14} />}
                        <span>Issue Dispatch Challan</span>
                    </button>
                </div>
            </div>
        </div>,
        modalRoot
    );
};

export default DispatchModal;
