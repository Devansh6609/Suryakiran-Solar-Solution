import React, { useState, useEffect } from 'react';
import { useTheme, Theme } from '../../contexts/ThemeContext';
import { 
    Settings as SettingsIcon, Palette, Bell, CheckCircle2, 
    Plus, Edit, Trash2, Upload, FileImage, Sparkles, Loader2, X, Package
} from 'lucide-react';
import { getProducts, createProduct, updateProduct, deleteInventoryProduct } from '../../service/adminService';
import LoadingSpinner from '../../components/LoadingSpinner';

const API_BASE_URL = import.meta.env.VITE_CRM_API_URL || 'http://localhost:3001';

const resizeAndCropToSquare = (file: File, size: number = 300): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = size; canvas.height = size;
                const ctx = canvas.getContext('2d');
                if (!ctx) return reject(new Error("Could not get canvas context"));
                ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, size, size);
                const minSide = Math.min(img.width, img.height);
                const sx = (img.width - minSide) / 2; const sy = (img.height - minSide) / 2;
                ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
                canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Canvas toBlob failed")), 'image/jpeg', 0.85);
            };
            img.onerror = () => reject(new Error("Image loading error"));
            img.src = e.target?.result as string;
        };
        reader.onerror = () => reject(new Error("File reading error"));
        reader.readAsDataURL(file);
    });
};

const SettingsPage: React.FC = () => {
    const { theme, setTheme } = useTheme();
    const [activeTab, setActiveTab] = useState<'appearance' | 'products'>('appearance');
    const [products, setProducts] = useState<any[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any | null>(null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({ name: '', category: 'Solar Module', make: '', description: '', image: null as File | null });
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const categories = ['Solar Module', 'Solar Inverter', 'Module mounting Structure', 'PVC Pipe', 'AC Wire', 'DC Wire', 'LA Cable', 'Earthing Wire', '14 MM 4.0 Mtr', 'AC / DC Protection Box', 'MC4 Connector', 'Cable Tie', 'J Hook Corrosion Free SS 304'];

    const themes: { id: Theme; name: string; description: string; colors: string[] }[] = [
        { id: 'dark', name: 'Professional Dark', description: 'Dark theme for focus and reduced glare.', colors: ['#000000', '#262626', '#f59e0b'] },
        { id: 'light', name: 'Professional Light', description: 'Clean light theme for a corporate look.', colors: ['#ffffff', '#2563eb', '#64748b'] }
    ];

    useEffect(() => { if (activeTab === 'products') loadProductsList(); }, [activeTab]);

    const loadProductsList = async () => {
        try { setLoadingProducts(true); const data = await getProducts(); setProducts(data); }
        catch (err) { console.error(err); } finally { setLoadingProducts(false); }
    };

    const openAddModal = () => {
        setEditingProduct(null); setFormData({ name: '', category: 'Solar Module', make: '', description: '', image: null });
        setImagePreview(null); setIsModalOpen(true);
    };

    const openEditModal = (product: any) => {
        setEditingProduct(product); setFormData({ name: product.name, category: product.category, make: product.make, description: product.description, image: null });
        setImagePreview(product.imageUrl ? (product.imageUrl.startsWith('/assets/') ? product.imageUrl : `${API_BASE_URL}${product.imageUrl}`) : null); setIsModalOpen(true);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return;
        try {
            const compressedBlob = await resizeAndCropToSquare(file);
            const compressedFile = new File([compressedBlob], `${file.name.substring(0, file.name.lastIndexOf('.')) || file.name}.jpg`, { type: 'image/jpeg', lastModified: Date.now() });
            setFormData(prev => ({ ...prev, image: compressedFile })); setImagePreview(URL.createObjectURL(compressedFile));
        } catch (err) { alert("Failed to process image."); }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            const payload = new FormData();
            payload.append('name', formData.name); payload.append('category', formData.category);
            payload.append('make', formData.make); payload.append('description', formData.description);
            if (formData.image) payload.append('image', formData.image);
            if (editingProduct) await updateProduct(editingProduct.id, payload);
            else await createProduct(payload);
            setIsModalOpen(false); loadProductsList();
        } catch (err: any) { alert(err.message || "Error saving product."); } finally { setSaving(false); }
    };

    const handleDeleteProduct = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete ${name}?`)) return;
        try { await deleteInventoryProduct(id); setProducts(prev => prev.filter(p => p.id !== id)); }
        catch (err) { alert("Failed to delete product"); }
    };

    const inputClasses = "w-full p-2.5 rounded-lg border text-sm focus:ring-2 focus:ring-[rgb(var(--accent))/0.5] focus:border-[rgb(var(--accent))] outline-none transition-all placeholder:text-[rgb(var(--text-3))]";
    const labelClasses = "block text-[11px] font-600 mb-1.5 uppercase tracking-wide";

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 anim-fade-up">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs font-600" style={{ color: 'rgb(var(--accent))' }}>
                    <SettingsIcon size={14} /> System
                </div>
                <h1 className="text-3xl font-700 tracking-tight" style={{ color: 'rgb(var(--text-0))' }}>Platform <span style={{ color: 'rgb(var(--accent))' }}>Settings</span></h1>
                <p className="text-sm font-500" style={{ color: 'rgb(var(--text-2))' }}>Customize visual themes and manage your dynamic inventory specifications.</p>
            </div>

            <div className="flex border-b gap-6" style={{ borderColor: 'rgb(var(--border-muted))' }}>
                <button onClick={() => setActiveTab('appearance')} className={`pb-3 text-sm font-700 uppercase tracking-wide border-b-2 transition-all ${activeTab === 'appearance' ? 'border-[rgb(var(--accent))] text-[rgb(var(--accent))]' : 'border-transparent hover:text-[rgb(var(--text-0))]'}`} style={{ color: activeTab === 'appearance' ? 'rgb(var(--accent))' : 'rgb(var(--text-2))' }}>Appearance</button>
                <button onClick={() => setActiveTab('products')} className={`pb-3 text-sm font-700 uppercase tracking-wide border-b-2 transition-all flex items-center gap-2 ${activeTab === 'products' ? 'border-[rgb(var(--accent))] text-[rgb(var(--accent))]' : 'border-transparent hover:text-[rgb(var(--text-0))]'}`} style={{ color: activeTab === 'products' ? 'rgb(var(--accent))' : 'rgb(var(--text-2))' }}><Package size={16} /> Product Catalog</button>
            </div>

            {activeTab === 'appearance' ? (
                <div className="crm-card p-6 md:p-8 space-y-6">
                    <h2 className="text-xl font-700 flex items-center gap-2" style={{ color: 'rgb(var(--text-0))' }}><Palette size={20} style={{ color: 'rgb(var(--accent))' }} /> Appearance</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {themes.map((t) => (
                            <button key={t.id} onClick={() => setTheme(t.id)} className={`relative flex flex-col items-start p-5 rounded-2xl border-2 transition-all text-left ${theme === t.id ? 'scale-[1.02]' : 'hover:scale-[1.01]'}`} style={{ backgroundColor: theme === t.id ? 'rgb(var(--accent)/0.05)' : 'rgb(var(--surface-1))', borderColor: theme === t.id ? 'rgb(var(--accent))' : 'rgb(var(--border-muted))' }}>
                                <div className="flex items-center justify-between w-full mb-4">
                                    <div className="flex -space-x-2">
                                        {t.colors.map((color, i) => <div key={i} className="w-8 h-8 rounded-full border-2" style={{ backgroundColor: color, borderColor: 'rgb(var(--surface-0))' }} />)}
                                    </div>
                                    {theme === t.id && <CheckCircle2 size={24} style={{ color: 'rgb(var(--accent))' }} />}
                                </div>
                                <span className="font-700 text-lg mb-1" style={{ color: theme === t.id ? 'rgb(var(--accent))' : 'rgb(var(--text-0))' }}>{t.name}</span>
                                <p className="text-sm font-500" style={{ color: 'rgb(var(--text-2))' }}>{t.description}</p>
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="crm-card p-6 flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-700 flex items-center gap-2" style={{ color: 'rgb(var(--text-0))' }}><Package size={20} style={{ color: 'rgb(var(--accent))' }} /> Inventory Catalog</h2>
                            <p className="text-xs font-500 mt-1" style={{ color: 'rgb(var(--text-2))' }}>Configure details and high-resolution thumbnails for quotation specifications.</p>
                        </div>
                        <button onClick={openAddModal} className="crm-btn-primary text-xs flex items-center gap-2"><Plus size={16} /> Add Product</button>
                    </div>

                    {loadingProducts ? (
                        <div className="flex flex-col items-center justify-center p-20 space-y-4"><LoadingSpinner size="lg" /><p className="text-sm font-700 uppercase" style={{ color: 'rgb(var(--text-2))' }}>Fetching Catalog...</p></div>
                    ) : products.length === 0 ? (
                        <div className="crm-card p-20 text-center border-dashed"><Package size={48} className="mx-auto mb-4 opacity-50" style={{ color: 'rgb(var(--text-3))' }} /><p className="text-lg font-700 mb-1" style={{ color: 'rgb(var(--text-0))' }}>No Products Available</p><p className="text-sm font-500" style={{ color: 'rgb(var(--text-2))' }}>Seed the database or add new solar components to populate your catalog.</p></div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.map((product) => (
                                <div key={product.id} className="crm-card p-5 flex flex-col hover:border-[rgb(var(--accent))] transition-colors">
                                    <div className="flex gap-4">
                                        <div className="w-16 h-16 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden bg-white">
                                            {product.imageUrl ? <img src={product.imageUrl?.startsWith('/assets/') ? product.imageUrl : `${API_BASE_URL}${product.imageUrl}`} alt={product.name} className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).src = '/assets/favicon.png'; }} /> : <FileImage size={24} className="opacity-40" style={{ color: 'rgb(var(--text-3))' }} />}
                                        </div>
                                        <div className="space-y-1 min-w-0 flex-1">
                                            <span className="px-2 py-0.5 rounded text-[10px] font-700 uppercase" style={{ backgroundColor: 'rgb(var(--accent)/0.1)', color: 'rgb(var(--accent))' }}>{product.category}</span>
                                            <h3 className="font-700 text-sm truncate" style={{ color: 'rgb(var(--text-0))' }}>{product.name}</h3>
                                            <p className="text-[10px] font-700 uppercase" style={{ color: 'rgb(var(--text-2))' }}>Make: <span style={{ color: 'rgb(var(--color-success))' }}>{product.make || 'Standard'}</span></p>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t flex-1" style={{ borderColor: 'rgb(var(--border-muted))' }}>
                                        <p className="text-xs font-500 line-clamp-2" style={{ color: 'rgb(var(--text-1))' }}>{product.description}</p>
                                    </div>
                                    <div className="mt-4 flex justify-end gap-2">
                                        <button onClick={() => openEditModal(product)} className="p-1.5 rounded hover:bg-[rgb(var(--surface-2))]" style={{ color: 'rgb(var(--text-2))' }}><Edit size={14} /></button>
                                        <button onClick={() => handleDeleteProduct(product.id, product.name)} className="p-1.5 rounded text-red-400 hover:bg-red-500/10"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="crm-card p-6 opacity-60">
                <h2 className="text-lg font-700 flex items-center gap-2 mb-1" style={{ color: 'rgb(var(--text-0))' }}><Bell size={18} style={{ color: 'rgb(var(--text-2))' }} /> Notifications <span className="px-2 py-0.5 rounded text-[10px] uppercase font-600 ml-2" style={{ backgroundColor: 'rgb(var(--color-info)/0.1)', color: 'rgb(var(--color-info))' }}>Coming Soon</span></h2>
                <p className="text-sm font-500 ml-7" style={{ color: 'rgb(var(--text-2))' }}>Manage your email and push notification preferences.</p>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm anim-fade-in">
                    <div className="crm-card w-full max-w-lg overflow-hidden relative">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-5 right-5 p-1.5 rounded hover:bg-black/10" style={{ color: 'rgb(var(--text-2))' }}><X size={16} /></button>
                        <div className="p-6 border-b" style={{ borderColor: 'rgb(var(--border-muted))' }}>
                            <h3 className="text-lg font-700 flex items-center gap-2" style={{ color: 'rgb(var(--text-0))' }}><Sparkles size={18} style={{ color: 'rgb(var(--accent))' }} /> {editingProduct ? 'Edit Component' : 'Add Solar Component'}</h3>
                        </div>
                        <form onSubmit={handleSaveProduct} className="p-6 space-y-5">
                            <div className="space-y-1.5">
                                <label className={labelClasses} style={{ color: 'rgb(var(--text-2))' }}>Component Category</label>
                                <select name="category" value={formData.category} onChange={handleInputChange} className={inputClasses} style={{ backgroundColor: 'rgb(var(--surface-1))', borderColor: 'rgb(var(--border-default))', color: 'rgb(var(--text-0))' }} required>
                                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className={labelClasses} style={{ color: 'rgb(var(--text-2))' }}>Equipment Name</label>
                                <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g. Solar Module, AC Wire" className={inputClasses} style={{ backgroundColor: 'rgb(var(--surface-1))', borderColor: 'rgb(var(--border-default))', color: 'rgb(var(--text-0))' }} required />
                            </div>
                            <div className="space-y-1.5">
                                <label className={labelClasses} style={{ color: 'rgb(var(--text-2))' }}>Make / Brand</label>
                                <input type="text" name="make" value={formData.make} onChange={handleInputChange} placeholder="e.g. Waaree, Polycab, Deye" className={inputClasses} style={{ backgroundColor: 'rgb(var(--surface-1))', borderColor: 'rgb(var(--border-default))', color: 'rgb(var(--text-0))' }} required />
                            </div>
                            <div className="space-y-1.5">
                                <label className={labelClasses} style={{ color: 'rgb(var(--text-2))' }}>Description & Specifications</label>
                                <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="e.g. Topcon Bifacial 550 Wp, 2.5 MM" rows={3} className={inputClasses} style={{ backgroundColor: 'rgb(var(--surface-1))', borderColor: 'rgb(var(--border-default))', color: 'rgb(var(--text-0))' }} required />
                            </div>
                            <div className="space-y-1.5">
                                <label className={labelClasses} style={{ color: 'rgb(var(--text-2))' }}>Product Image (1:1 aspect ratio)</label>
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-xl flex items-center justify-center overflow-hidden bg-white">
                                        {imagePreview ? <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" /> : <FileImage size={24} style={{ color: 'rgb(var(--text-3))' }} />}
                                    </div>
                                    <label className="flex-1 flex flex-col items-center justify-center border border-dashed rounded-xl p-4 cursor-pointer hover:border-[rgb(var(--accent))]" style={{ borderColor: 'rgb(var(--border-muted))', backgroundColor: 'rgb(var(--surface-1))' }}>
                                        <div className="flex items-center gap-2" style={{ color: 'rgb(var(--text-2))' }}>
                                            <Upload size={16} /> <span className="text-xs font-700 uppercase">Upload Thumbnail</span>
                                        </div>
                                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                    </label>
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="crm-btn-secondary flex-1 py-2.5">Cancel</button>
                                <button type="submit" disabled={saving} className="crm-btn-primary flex-1 py-2.5">{saving ? <span className="flex items-center justify-center gap-2"><LoadingSpinner size="sm" /> Saving...</span> : 'Save Product'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsPage;
