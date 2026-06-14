import React, { useState, useEffect } from 'react';
import { useTheme, Theme } from '../../contexts/ThemeContext';
import { 
    Settings as SettingsIcon, 
    Palette, 
    Bell, 
    CheckCircle2, 
    Plus, 
    Edit, 
    Trash2, 
    Upload, 
    FileImage, 
    Sparkles, 
    Loader2,
    X,
    Package
} from 'lucide-react';
import { 
    getProducts, 
    createProduct, 
    updateProduct, 
    deleteProduct 
} from '../../service/adminService';

const API_BASE_URL = import.meta.env.VITE_CRM_API_URL || 'http://localhost:3001';

const resizeAndCropToSquare = (file: File, size: number = 300): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error("Could not get canvas context"));
                    return;
                }
                
                // Solid white background
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, size, size);
                
                // Crop to center square
                const minSide = Math.min(img.width, img.height);
                const sx = (img.width - minSide) / 2;
                const sy = (img.height - minSide) / 2;
                
                ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
                
                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error("Canvas toBlob failed"));
                    }
                }, 'image/jpeg', 0.85);
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
    
    // Product catalog states
    const [products, setProducts] = useState<any[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any | null>(null);
    const [saving, setSaving] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        category: 'Solar Module',
        make: '',
        description: '',
        image: null as File | null
    });
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const categories = [
        'Solar Module',
        'Solar Inverter',
        'Module mounting Structure',
        'PVC Pipe',
        'AC Wire',
        'DC Wire',
        'LA Cable',
        'Earthing Wire',
        '14 MM 4.0 Mtr',
        'AC / DC Protection Box',
        'MC4 Connector',
        'Cable Tie',
        'J Hook Corrosion Free SS 304'
    ];

    const themes: { id: Theme; name: string; description: string; colors: string[] }[] = [
        {
            id: 'professional-dark',
            name: 'Professional Dark',
            description: 'A pitch black, high-contrast theme for focus.',
            colors: ['#000000', '#262626', '#10b981']
        },
        {
            id: 'professional-light',
            name: 'Professional Light',
            description: 'A simple, non-glowing light theme for a professional corporate look.',
            colors: ['#ffffff', '#2563eb', '#64748b']
        },
        {
            id: 'deep-space',
            name: 'Deep Space Glass',
            description: 'Futuristic, high-transparency interface with neon cyan and electric blue accents.',
            colors: ['#0f172a', '#3b82f6', '#06b6d4']
        },
        {
            id: 'midnight',
            name: 'Midnight Obsidian',
            description: 'Premium, grounded dark mode with rich matte surfaces and solar gold accents.',
            colors: ['#020617', '#f59e0b', '#f97316']
        },
        {
            id: 'aurora',
            name: 'Aurora Borealis',
            description: 'Vibrant and dynamic with animated gradients and frosted glass effects.',
            colors: ['#312e81', '#10b981', '#8b5cf6']
        }
    ];

    useEffect(() => {
        if (activeTab === 'products') {
            loadProductsList();
        }
    }, [activeTab]);

    const loadProductsList = async () => {
        try {
            setLoadingProducts(true);
            const data = await getProducts();
            setProducts(data);
        } catch (err) {
            console.error("Error loading products:", err);
        } finally {
            setLoadingProducts(false);
        }
    };

    const openAddModal = () => {
        setEditingProduct(null);
        setFormData({
            name: '',
            category: 'Solar Module',
            make: '',
            description: '',
            image: null
        });
        setImagePreview(null);
        setIsModalOpen(true);
    };

    const openEditModal = (product: any) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            category: product.category,
            make: product.make,
            description: product.description,
            image: null
        });
        setImagePreview(product.imageUrl ? (product.imageUrl.startsWith('/assets/') ? product.imageUrl : `${API_BASE_URL}${product.imageUrl}`) : null);
        setIsModalOpen(true);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            // Compress and crop image to a square 1:1 on the client side
            const compressedBlob = await resizeAndCropToSquare(file);
            const compressedFile = new File([compressedBlob], `${pathWithoutExtension(file.name)}.jpg`, {
                type: 'image/jpeg',
                lastModified: Date.now()
            });
            
            setFormData(prev => ({ ...prev, image: compressedFile }));
            setImagePreview(URL.createObjectURL(compressedFile));
        } catch (err) {
            console.error("Image processing failed:", err);
            alert("Failed to process image. Standardizing failed.");
        }
    };

    const pathWithoutExtension = (filename: string) => {
        return filename.substring(0, filename.lastIndexOf('.')) || filename;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            const payload = new FormData();
            payload.append('name', formData.name);
            payload.append('category', formData.category);
            payload.append('make', formData.make);
            payload.append('description', formData.description);
            if (formData.image) {
                payload.append('image', formData.image);
            }

            if (editingProduct) {
                await updateProduct(editingProduct.id, payload);
            } else {
                await createProduct(payload);
            }
            
            setIsModalOpen(false);
            loadProductsList();
        } catch (err: any) {
            console.error("Error saving product:", err);
            alert(err.message || "Error saving product. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;
        try {
            await deleteProduct(id);
            loadProductsList();
        } catch (err: any) {
            console.error("Error deleting product:", err);
            alert(err.message || "Failed to delete product.");
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-fade-in pb-24">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                            <SettingsIcon size={12} className="text-neon-cyan" />
                            System
                        </div>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black text-text-primary tracking-tight">
                        Platform <span className="text-neon-cyan">Settings</span>
                    </h1>
                    <p className="text-text-secondary/60 text-sm font-bold">
                        Customize visual themes and manage your dynamic inventory specifications.
                    </p>
                </div>
            </div>

            {/* Tab Switched Navigation */}
            <div className="flex border-b border-glass-border/30 gap-6">
                <button
                    onClick={() => setActiveTab('appearance')}
                    className={`pb-4 text-sm font-black uppercase tracking-widest border-b-2 transition-all ${
                        activeTab === 'appearance'
                            ? 'border-neon-cyan text-neon-cyan'
                            : 'border-transparent text-text-secondary hover:text-text-primary'
                    }`}
                >
                    Appearance
                </button>
                <button
                    onClick={() => setActiveTab('products')}
                    className={`pb-4 text-sm font-black uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 ${
                        activeTab === 'products'
                            ? 'border-neon-cyan text-neon-cyan'
                            : 'border-transparent text-text-secondary hover:text-text-primary'
                    }`}
                >
                    <Package size={16} />
                    Product Catalog
                </button>
            </div>

            {activeTab === 'appearance' ? (
                /* APPEARANCE TAB */
                <div className="bg-glass-surface/40 backdrop-blur-3xl rounded-3xl border border-glass-border/30 shadow-glow-sm shadow-neon-cyan/5 p-6 md:p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-neon-cyan/5 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

                    <h2 className="text-xl md:text-2xl font-black text-text-primary mb-6 flex items-center gap-3 relative z-10 w-fit">
                        <span className="p-2 rounded-xl bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20 shadow-glow-sm shadow-neon-cyan/20">
                            <Palette size={20} />
                        </span>
                        Appearance
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 relative z-10">
                        {themes.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setTheme(t.id)}
                                className={`relative group flex flex-col items-start p-6 rounded-2xl border-2 transition-all duration-300 text-left ${theme === t.id
                                    ? 'border-neon-cyan bg-neon-cyan/10 shadow-glow-md shadow-neon-cyan/20 scale-[1.02]'
                                    : 'border-glass-border/30 bg-night-sky/50 hover:border-glass-border hover:bg-white/5'
                                    }`}
                            >
                                <div className="flex items-center justify-between w-full mb-4">
                                    <div className="flex -space-x-2">
                                        {t.colors.map((color, i) => (
                                            <div
                                                key={i}
                                                className="w-8 h-8 rounded-full border-2 border-night-sky shadow-lg"
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                    {theme === t.id && (
                                        <div className="text-neon-cyan animate-fade-in shadow-glow-sm shadow-neon-cyan/30 rounded-full">
                                            <CheckCircle2 size={24} className="drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                                        </div>
                                    )}
                                </div>

                                <span className={`font-black text-lg mb-2 ${theme === t.id ? 'text-neon-cyan' : 'text-text-primary group-hover:text-text-light'}`}>
                                    {t.name}
                                </span>

                                <p className="text-sm font-bold text-text-secondary/60 leading-relaxed group-hover:text-text-secondary/80 transition-colors">
                                    {t.description}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                /* PRODUCT CATALOG TAB */
                <div className="space-y-6">
                    <div className="flex justify-between items-center bg-glass-surface/30 border border-glass-border/20 p-6 rounded-3xl">
                        <div>
                            <h2 className="text-xl md:text-2xl font-black text-text-primary flex items-center gap-3">
                                <span className="p-2 rounded-xl bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20">
                                    <Package size={20} />
                                </span>
                                Inventory Catalog
                            </h2>
                            <p className="text-xs text-text-secondary/60 font-bold mt-1">Configure details and high-resolution thumbnails for quotation specifications.</p>
                        </div>
                        <button
                            onClick={openAddModal}
                            className="px-5 py-3 rounded-2xl bg-neon-cyan text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 hover:scale-105 transition-all shadow-glow-sm shadow-neon-cyan/20"
                        >
                            <Plus size={16} />
                            Add Product
                        </button>
                    </div>

                    {loadingProducts ? (
                        <div className="flex flex-col items-center justify-center p-20 space-y-4">
                            <Loader2 size={40} className="animate-spin text-neon-cyan" />
                            <p className="text-sm text-text-secondary font-black tracking-widest uppercase">Fetching Catalog...</p>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center p-20 bg-glass-surface/20 border border-dashed border-glass-border/40 rounded-3xl">
                            <Package size={60} className="mx-auto text-text-secondary/40 mb-4" />
                            <p className="text-lg font-black text-text-primary">No Products Available</p>
                            <p className="text-sm text-text-secondary/60 font-bold mt-1 mb-6">Seed the database or add new solar components to populate your catalog.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.map((product) => (
                                <div
                                    key={product.id}
                                    className="bg-glass-surface/35 border border-glass-border/20 rounded-3xl p-6 flex flex-col hover:border-neon-cyan/50 hover:bg-glass-surface/50 transition-all duration-300 relative group"
                                >
                                    <div className="flex gap-4">
                                        <div className="w-20 h-20 bg-white border border-gray-100 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center relative shadow-sm">
                                            {product.imageUrl ? (
                                                <img
                                                    src={product.imageUrl?.startsWith('/assets/') ? product.imageUrl : `${API_BASE_URL}${product.imageUrl}`}
                                                    alt={product.name}
                                                    className="w-full h-full object-contain"
                                                    onError={(e) => {
                                                        // Replace broken image with local assets or placeholder
                                                        (e.target as HTMLImageElement).src = '/assets/favicon.png';
                                                    }}
                                                />
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full w-full bg-emerald-50 text-emerald-800">
                                                    <FileImage size={24} className="opacity-40" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-1 min-w-0">
                                            <span className="px-2.5 py-0.5 rounded-full bg-neon-cyan/15 text-neon-cyan text-[9px] font-black uppercase tracking-wider">
                                                {product.category}
                                            </span>
                                            <h3 className="font-bold text-base text-text-primary truncate">{product.name}</h3>
                                            <p className="text-[10px] text-text-secondary font-black uppercase tracking-widest">
                                                Make: <span className="text-emerald-500 font-black">{product.make || 'Standard'}</span>
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 pt-4 border-t border-glass-border/10 flex-1">
                                        <p className="text-xs text-text-secondary/80 font-bold leading-relaxed line-clamp-3">
                                            {product.description}
                                        </p>
                                    </div>

                                    <div className="mt-6 flex justify-end gap-2">
                                        <button
                                            onClick={() => openEditModal(product)}
                                            className="p-2 rounded-xl border border-glass-border/40 text-text-secondary hover:text-neon-cyan hover:bg-neon-cyan/10 hover:border-neon-cyan/30 transition-all"
                                            title="Edit"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteProduct(product.id)}
                                            className="p-2 rounded-xl border border-glass-border/40 text-text-secondary hover:text-error-red hover:bg-error-red/10 hover:border-error-red/30 transition-all"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Placeholder for notification settings */}
            <div className="bg-glass-surface/20 backdrop-blur-xl rounded-3xl border border-glass-border/20 p-6 md:p-8 opacity-60">
                <h2 className="text-xl font-black text-text-primary mb-2 flex items-center gap-3">
                    <span className="p-2 rounded-xl bg-text-secondary/10 text-text-secondary border border-text-secondary/20">
                        <Bell size={20} />
                    </span>
                    Notifications
                    <span className="px-2 py-0.5 rounded-md bg-neon-cyan/10 text-neon-cyan text-[10px] uppercase tracking-widest ml-2 border border-neon-cyan/20">Coming Soon</span>
                </h2>
                <p className="text-text-secondary/60 font-bold ml-14">Manage your email and push notification preferences.</p>
            </div>

            {/* ADD/EDIT PRODUCT MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[#0f172a] border border-glass-border rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 border border-glass-border/30 hover:bg-white/10 text-text-secondary hover:text-text-primary transition-all"
                        >
                            <X size={16} />
                        </button>
                        
                        <div className="p-6 md:p-8 border-b border-glass-border/20">
                            <h3 className="text-xl font-black text-text-primary flex items-center gap-3">
                                <span className="p-2 rounded-xl bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20">
                                    <Sparkles size={18} />
                                </span>
                                {editingProduct ? 'Edit Component' : 'Add Solar Component'}
                            </h3>
                        </div>

                        <form onSubmit={handleSaveProduct} className="p-6 md:p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Component Category</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/5 border border-glass-border/30 rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan outline-none transition-all"
                                    required
                                >
                                    {categories.map((c) => (
                                        <option key={c} value={c} className="bg-slate-900 text-white">{c}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Equipment Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Solar Module, AC Wire"
                                    className="w-full bg-white/5 border border-glass-border/30 rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan outline-none transition-all"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Make / Brand</label>
                                <input
                                    type="text"
                                    name="make"
                                    value={formData.make}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Waaree, Polycab, Deye"
                                    className="w-full bg-white/5 border border-glass-border/30 rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan outline-none transition-all"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Description & Specifications</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Topcon Bifacial 550 Wp, 2.5 MM, Hot Dip Galvanized"
                                    rows={3}
                                    className="w-full bg-white/5 border border-glass-border/30 rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan outline-none transition-all"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Product Image (1:1 aspect ratio)</label>
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-white border border-gray-100 rounded-xl flex items-center justify-center overflow-hidden shadow-inner flex-shrink-0">
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                                        ) : (
                                            <FileImage size={24} className="text-gray-300" />
                                        )}
                                    </div>
                                    <label className="flex-1 flex flex-col items-center justify-center border border-dashed border-glass-border/40 rounded-xl p-4 bg-white/5 hover:bg-white/10 hover:border-neon-cyan transition-all cursor-pointer">
                                        <div className="flex items-center gap-2 text-text-secondary hover:text-text-primary">
                                            <Upload size={16} />
                                            <span className="text-xs font-bold uppercase tracking-wider">Upload Thumbnail</span>
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-5 py-3 rounded-2xl border border-glass-border/40 text-text-secondary text-xs font-black uppercase tracking-wider hover:bg-white/5 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 px-5 py-3 rounded-2xl bg-neon-cyan text-white text-xs font-black uppercase tracking-wider hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                                    {saving ? 'Saving...' : 'Save Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsPage;
