import React, { useState } from 'react';
import { X, ShoppingBag, Plus, Trash2, CheckCircle2, FileText } from 'lucide-react';
import { createPurchaseOrder } from '../../service/adminService';
import LoadingSpinner from '../LoadingSpinner';
import { createPortal } from 'react-dom';

interface CreatePOModalProps {
    isOpen: boolean;
    onClose: () => void;
    products: any[];
    onCreated: () => void;
}

const CreatePOModal: React.FC<CreatePOModalProps> = ({
    isOpen,
    onClose,
    products,
    onCreated
}) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        vendorName: '',
        vendorGst: '',
        orderDate: new Date().toISOString().split('T')[0],
        expectedDelivery: '',
        grnNotes: '',
        paymentStatus: 'Pending'
    });

    const [poItems, setPoItems] = useState<Array<{ sku: string; qty: number; unitPrice: number }>>([
        { sku: products[0]?.sku || '', qty: 10, unitPrice: products[0]?.unitPrice || 0 }
    ]);

    if (!isOpen) return null;

    const handleAddItem = () => {
        setPoItems([...poItems, { sku: products[0]?.sku || '', qty: 1, unitPrice: products[0]?.unitPrice || 0 }]);
    };

    const handleRemoveItem = (index: number) => {
        setPoItems(poItems.filter((_, i) => i !== index));
    };

    const handleItemChange = (index: number, field: 'sku' | 'qty' | 'unitPrice', value: any) => {
        const updated = [...poItems];
        if (field === 'sku') {
            const selectedProd = products.find(p => p.sku === value);
            updated[index] = {
                ...updated[index],
                sku: value,
                unitPrice: selectedProd?.unitPrice || 0
            };
        } else {
            updated[index] = { ...updated[index], [field]: value };
        }
        setPoItems(updated);
    };

    const totalAmount = poItems.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            await createPurchaseOrder({
                ...formData,
                totalAmount,
                items: poItems
            });
            onCreated();
            onClose();
        } catch (err: any) {
            alert(err.message || 'Failed to create Purchase Order.');
        } finally {
            setLoading(false);
        }
    };

    const inputClasses = "w-full bg-[rgb(var(--surface-1))] border border-[rgb(var(--border-default))] rounded-xl px-4 py-2.5 text-xs text-[rgb(var(--text-0))] placeholder:text-[rgb(var(--text-3))] focus:outline-none focus:border-[rgb(var(--accent))/0.5] transition-colors";

    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md anim-fade-in overflow-y-auto">
            <div className="crm-card relative w-full max-w-3xl flex flex-col overflow-hidden shadow-2xl p-6 max-h-[90vh]">
                <div className="flex items-center justify-between pb-4 border-b border-[rgb(var(--border-muted))] mb-6 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400">
                            <ShoppingBag size={22} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black" style={{ color: 'rgb(var(--text-0))' }}>Create Purchase Order & Goods Received Note (GRN)</h2>
                            <p className="text-xs" style={{ color: 'rgb(var(--text-2))' }}>Order materials from vendors and log incoming inventory</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl text-[rgb(var(--text-2))] hover:text-[rgb(var(--text-0))]">
                        <X size={18} />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 pr-2">
                    <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">Vendor / Supplier *</label>
                            <input
                                type="text"
                                required
                                value={formData.vendorName}
                                onChange={e => setFormData({ ...formData, vendorName: e.target.value })}
                                placeholder="e.g. Waaree Energies Ltd"
                                className={inputClasses}
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">Vendor GST Number</label>
                            <input
                                type="text"
                                value={formData.vendorGst}
                                onChange={e => setFormData({ ...formData, vendorGst: e.target.value })}
                                placeholder="24XXXXX0000X1Z5"
                                className={inputClasses}
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">Expected Delivery</label>
                            <input
                                type="date"
                                value={formData.expectedDelivery}
                                onChange={e => setFormData({ ...formData, expectedDelivery: e.target.value })}
                                className={inputClasses}
                            />
                        </div>
                    </div>

                    {/* Order Line Items */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-[11px] font-bold text-neon-cyan uppercase">Material Line Items *</label>
                            <button
                                type="button"
                                onClick={handleAddItem}
                                className="px-3 py-1 bg-neon-cyan/10 text-neon-cyan rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-neon-cyan hover:text-night-sky transition-all cursor-pointer"
                            >
                                <Plus size={14} /> Add Line Item
                            </button>
                        </div>

                        <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                            {poItems.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-3 bg-white/[0.02] border border-glass-border/20 rounded-2xl">
                                    <div className="flex-1">
                                        <select
                                            value={item.sku}
                                            onChange={e => handleItemChange(idx, 'sku', e.target.value)}
                                            className={inputClasses}
                                        >
                                            {products.map(p => (
                                                <option key={p.sku} value={p.sku} className="bg-night-sky">
                                                    [{p.category}] {p.name} ({p.sku})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="w-24">
                                        <input
                                            type="number"
                                            min="1"
                                            value={item.qty}
                                            onChange={e => handleItemChange(idx, 'qty', Number(e.target.value))}
                                            placeholder="Qty"
                                            className={inputClasses}
                                        />
                                    </div>
                                    <div className="w-28">
                                        <input
                                            type="number"
                                            min="0"
                                            value={item.unitPrice}
                                            onChange={e => handleItemChange(idx, 'unitPrice', Number(e.target.value))}
                                            placeholder="Rate ₹"
                                            className={inputClasses}
                                        />
                                    </div>
                                    <div className="text-xs font-black text-status-green w-28 text-right">
                                        ₹{(item.qty * item.unitPrice).toLocaleString('en-IN')}
                                    </div>
                                    {poItems.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveItem(idx)}
                                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-xl"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-glass-border/20">
                        <span className="text-xs font-bold text-text-secondary">Total Purchase Valuation:</span>
                        <span className="text-lg font-black text-status-green">₹{totalAmount.toLocaleString('en-IN')}</span>
                    </div>

                        <div className="pt-4 border-t border-[rgb(var(--border-muted))] flex items-center justify-end gap-3 mt-4">
                            <button type="button" onClick={onClose} className="crm-btn-secondary px-5 py-2 text-xs">
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="crm-btn-primary px-6 py-2.5 text-xs flex items-center gap-2"
                            >
                                {loading ? <LoadingSpinner size="sm" /> : <CheckCircle2 size={14} />}
                                <span>Issue Purchase Order & GRN</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>,
        modalRoot
    );
};

export default CreatePOModal;
