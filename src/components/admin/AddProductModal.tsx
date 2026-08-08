import React, { useState, useEffect } from 'react';
import { X, Package, Upload, Image as ImageIcon, Save, ShieldCheck } from 'lucide-react';
import { createOrUpdateProduct } from '../../service/adminService';
import LoadingSpinner from '../LoadingSpinner';
import { createPortal } from 'react-dom';

interface AddProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    product?: any;
    onSaved: () => void;
}

const CATEGORIES = [
    'Solar Panel',
    'Solar Inverter',
    'Mounting Structure',
    'ACDB',
    'DCDB',
    'Earthing Material',
    'Lightning Arrestor',
    'DC Wire',
    'AC Wire',
    'MC4 Connector',
    'PVC Pipe',
    'Cable Tray',
    'Fasteners',
    'Safety Equipment',
    'Consumables'
];

const PREDEFINED_BRANDS: Record<string, string[]> = {
    'Solar Panel': ['Waaree', 'Adani', 'Tata Solar', 'Vikram Solar', 'Goldi Solar', 'Other'],
    'Solar Inverter': ['Deye', 'AP Systems', 'Growatt', 'Sungrow', 'Havells', 'Microtek', 'Other'],
    'DC Wire': ['Polycab', 'Havells', 'Finolex', 'RR Kabel', 'Other'],
    'AC Wire': ['Havells', 'Polycab', 'Finolex', 'Kei', 'Other'],
    'ACDB': ['L&T', 'Schneider', 'Hensel', 'Siemens', 'Other'],
    'DCDB': ['L&T', 'Hensel', 'Schneider', 'Other'],
};

const AddProductModal: React.FC<AddProductModalProps> = ({
    isOpen,
    onClose,
    product,
    onSaved
}) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        id: product?.id || '',
        sku: product?.sku || '',
        name: product?.name || '',
        category: product?.category || 'Solar Panel',
        companyBrand: product?.companyBrand || 'Waaree',
        customBrand: '',
        make: product?.make || '',
        warranty: product?.warranty || '10 Years',
        minStock: product?.minStock || 5,
        maxStock: product?.maxStock || 50,
        currentStock: product?.currentStock || 25,
        unitPrice: product?.unitPrice || 0,
        description: product?.description || '',
        imageUrl: product?.imageUrl || ''
    });

    const [imagePreview, setImagePreview] = useState<string>(product?.imageUrl || '');

    useEffect(() => {
        if (product) {
            setFormData({
                id: product.id || '',
                sku: product.sku || '',
                name: product.name || '',
                category: product.category || 'Solar Panel',
                companyBrand: product.companyBrand || 'Waaree',
                customBrand: '',
                make: product.make || '',
                warranty: product.warranty || '10 Years',
                minStock: product.minStock || 5,
                maxStock: product.maxStock || 50,
                currentStock: product.currentStock || 25,
                unitPrice: product.unitPrice || 0,
                description: product.description || '',
                imageUrl: product.imageUrl || ''
            });
            setImagePreview(product.imageUrl || '');
        }
    }, [product]);

    if (!isOpen) return null;

    const availableBrands = PREDEFINED_BRANDS[formData.category] || ['Generic', 'Standard', 'L&T', 'Havells', 'Polycab', 'Other'];

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setImagePreview(base64);
                setFormData(prev => ({ ...prev, imageUrl: base64 }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            await createOrUpdateProduct(formData);
            onSaved();
            onClose();
        } catch (err: any) {
            alert(err.message || 'Failed to save product master item.');
        } finally {
            setLoading(false);
        }
    };

    const inputClasses = "w-full bg-[rgb(var(--surface-1))] border border-[rgb(var(--border-default))] rounded-xl px-4 py-2.5 text-xs text-[rgb(var(--text-0))] placeholder:text-[rgb(var(--text-3))] focus:outline-none focus:border-[rgb(var(--accent))/0.5] transition-colors";

    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md anim-fade-in overflow-y-auto">
            <div className="crm-card relative w-full max-w-2xl flex flex-col overflow-hidden shadow-2xl p-6 max-h-[90vh] my-8">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-[rgb(var(--border-muted))] mb-4 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-neon-cyan/10 text-neon-cyan">
                            <Package size={22} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black" style={{ color: 'rgb(var(--text-0))' }}>
                                {product ? 'Edit Product Master' : 'Add New Inventory Component'}
                            </h2>
                            <p className="text-xs" style={{ color: 'rgb(var(--text-2))' }}>
                                Configure product specifications, stock thresholds, and brand images
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-[rgb(var(--text-2))] hover:text-[rgb(var(--text-0))] hover:bg-[rgb(var(--surface-2))] transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-2 flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Name */}
                        <div>
                            <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">
                                Product Name *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Waaree 550W Topcon Panel"
                                className={inputClasses}
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">
                                Category *
                            </label>
                            <select
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value, companyBrand: PREDEFINED_BRANDS[e.target.value]?.[0] || 'Generic' })}
                                className={inputClasses}
                            >
                                {CATEGORIES.map(cat => (
                                    <option key={cat} value={cat} className="bg-night-sky">{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Company / Brand Selection */}
                        <div>
                            <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">
                                Brand / Company Name *
                            </label>
                            <select
                                value={formData.companyBrand}
                                onChange={e => setFormData({ ...formData, companyBrand: e.target.value })}
                                className={inputClasses}
                            >
                                {availableBrands.map(brand => (
                                    <option key={brand} value={brand} className="bg-night-sky">{brand}</option>
                                ))}
                            </select>
                        </div>

                        {/* Custom Brand Input if "Other" is selected */}
                        {formData.companyBrand === 'Other' && (
                            <div>
                                <label className="block text-[11px] font-bold text-neon-cyan uppercase mb-1">
                                    Specify Company Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.customBrand}
                                    onChange={e => setFormData({ ...formData, customBrand: e.target.value })}
                                    placeholder="Enter Custom Brand Name"
                                    className={inputClasses}
                                />
                            </div>
                        )}

                        {/* SKU */}
                        <div>
                            <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">
                                SKU / Part Number
                            </label>
                            <input
                                type="text"
                                value={formData.sku}
                                onChange={e => setFormData({ ...formData, sku: e.target.value })}
                                placeholder="Auto-generated if left empty"
                                className={inputClasses}
                            />
                        </div>

                        {/* Unit Price */}
                        <div>
                            <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">
                                Estimated Unit Price (₹)
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={formData.unitPrice}
                                onChange={e => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                                className={inputClasses}
                            />
                        </div>

                        {/* Warranty */}
                        <div>
                            <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">
                                Warranty Period
                            </label>
                            <input
                                type="text"
                                value={formData.warranty}
                                onChange={e => setFormData({ ...formData, warranty: e.target.value })}
                                placeholder="e.g. 25 Years Performance"
                                className={inputClasses}
                            />
                        </div>

                        {/* Min Stock */}
                        <div>
                            <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">
                                Low Stock Alert Threshold (Min Qty)
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={formData.minStock}
                                onChange={e => setFormData({ ...formData, minStock: Number(e.target.value) })}
                                className={inputClasses}
                            />
                        </div>

                        {/* Current Stock */}
                        <div>
                            <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">
                                Initial Warehouse Stock (Qty)
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={formData.currentStock}
                                onChange={e => setFormData({ ...formData, currentStock: Number(e.target.value) })}
                                className={inputClasses}
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">
                            Technical Description
                        </label>
                        <textarea
                            rows={2}
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Detailed technical specifications"
                            className={inputClasses}
                        />
                    </div>

                    {/* Product Photo Upload */}
                    <div>
                        <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">
                            Product Image / Photo Proof
                        </label>
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-glass-border/30 overflow-hidden flex items-center justify-center">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Product Preview" className="w-full h-full object-contain" />
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
                                    id="product-photo-upload"
                                />
                                <label
                                    htmlFor="product-photo-upload"
                                    className="px-4 py-2 bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan rounded-xl text-xs font-bold hover:bg-neon-cyan hover:text-night-sky transition-all flex items-center gap-2 cursor-pointer w-fit mb-1"
                                >
                                    <Upload size={14} /> Upload Product Image
                                </label>
                                <p className="text-[10px] text-text-secondary/60">Supports PNG, JPG, WebP images</p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 border-t border-[rgb(var(--border-muted))] flex items-center justify-end gap-3 mt-4" style={{ backgroundColor: 'rgb(var(--surface-0))' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            className="crm-btn-secondary px-5 py-2 text-xs"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="crm-btn-primary px-6 py-2.5 text-xs flex items-center gap-2"
                        >
                            {loading ? <LoadingSpinner size="sm" /> : <Save size={14} />}
                            <span>Save Product Master</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        modalRoot
    );
};

export default AddProductModal;
