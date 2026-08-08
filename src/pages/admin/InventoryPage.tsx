import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Package, Plus, Search, Filter, AlertTriangle, ShoppingBag, 
    Truck, IndianRupee, Edit3, Trash2, Barcode, CheckCircle2, ChevronRight
} from 'lucide-react';
import { 
    getInventoryOverview, deleteInventoryProduct, getPurchaseOrders, 
    getInventoryAnalytics, quickUpdateStock, getPanelSerials, 
    addPanelSerial, deletePanelSerial, confirmGRN
} from '../../service/adminService';
import { useAuth } from '../../contexts/AuthContext';
import AddProductModal from '../../components/admin/AddProductModal';
import CreatePOModal from '../../components/admin/CreatePOModal';
import DispatchModal from '../../components/admin/DispatchModal';
import { TableSkeleton } from '../../components/skeletons';

const CATEGORIES = [
    { label: 'All Categories', value: 'all' },
    { label: 'Solar Panels', value: 'Solar Panel' },
    { label: 'Inverters', value: 'Solar Inverter' },
    { label: 'Mounting Structures', value: 'Mounting Structure' },
    { label: 'ACDB', value: 'ACDB' },
    { label: 'DCDB', value: 'DCDB' },
    { label: 'Earthing Materials', value: 'Earthing Material' },
    { label: 'Lightning Arrestors', value: 'Lightning Arrestor' },
    { label: 'DC Wires', value: 'DC Wire' },
    { label: 'AC Wires', value: 'AC Wire' },
    { label: 'MC4 Connectors', value: 'MC4 Connector' },
    { label: 'PVC Pipes', value: 'PVC Pipe' },
    { label: 'Fasteners', value: 'Fasteners' }
];

const InventoryPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState<any[]>([]);
    const [summary, setSummary] = useState({ totalItems: 0, totalValuation: 0, totalReserved: 0, lowStockCount: 0 });
    const [activeTab, setActiveTab] = useState<'catalog' | 'orders' | 'movements'>('catalog');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
    const [analytics, setAnalytics] = useState<{ movements: any[]; challans: any[] }>({ movements: [], challans: [] });
    const [panelSerials, setPanelSerials] = useState<any[]>([]);

    const [addProductModal, setAddProductModal] = useState<{ isOpen: boolean; product?: any }>({ isOpen: false });
    const [poModalOpen, setPoModalOpen] = useState(false);
    const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
    const [addSerialModalOpen, setAddSerialModalOpen] = useState(false);

    const [newSerialData, setNewSerialData] = useState({
        serialNumber: '', brand: 'Waaree', wattage: '550W', itemSku: 'PNL-WAR-550', itemName: 'Waaree 550W Topcon Panel', status: 'In_Warehouse', notes: ''
    });

    const loadInventoryData = async () => {
        try {
            setLoading(true);
            const data = await getInventoryOverview({ category: selectedCategory, search: searchQuery });
            if (data.success) {
                setProducts(data.products || []);
                setSummary(data.summary || { totalItems: 0, totalValuation: 0, totalReserved: 0, lowStockCount: 0 });
            }
            const pos = await getPurchaseOrders(); setPurchaseOrders(pos || []);
            const analyticsData = await getInventoryAnalytics();
            if (analyticsData.success) setAnalytics({ movements: analyticsData.movements || [], challans: analyticsData.challans || [] });
            const serials = await getPanelSerials(); setPanelSerials(serials || []);
        } catch (err) { console.error("Failed to load inventory data:", err); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadInventoryData(); }, [selectedCategory, searchQuery]);

    const handleConfirmGRN = async (poId: string) => {
        if (!confirm("Confirm GRN? This will permanently add stock to the Product Master.")) return;
        try {
            await confirmGRN(poId, { receivedBy: user?.name || "Admin" });
            loadInventoryData();
        } catch (err) { alert("Failed to confirm GRN."); }
    };

    const handleInlineUpdate = async (id: string, currentStock: number, unitPrice: number) => {
        try {
            await quickUpdateStock(id, { currentStock, unitPrice });
            setProducts(prev => prev.map(p => p.id === id ? { ...p, currentStock, unitPrice } : p));
            setSummary(prev => {
                const updatedProducts = products.map(p => p.id === id ? { ...p, currentStock, unitPrice } : p);
                const totalValuation = updatedProducts.reduce((sum, p) => sum + (p.currentStock * p.unitPrice), 0);
                return { ...prev, totalValuation };
            });
        } catch (err) { console.error("Failed to update stock inline:", err); }
    };

    const handleDeleteProduct = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}" from Product Master?`)) return;
        try { await deleteInventoryProduct(id); loadInventoryData(); }
        catch (err) { alert("Failed to delete product."); }
    };

    const handleAddPanelSerial = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await addPanelSerial(newSerialData);
            setNewSerialData({ serialNumber: '', brand: 'Waaree', wattage: '550W', itemSku: 'PNL-WAR-550', itemName: 'Waaree 550W Topcon Panel', status: 'In_Warehouse', notes: '' });
            setAddSerialModalOpen(false);
            const serials = await getPanelSerials(); setPanelSerials(serials || []);
        } catch (err: any) { alert(err.message || 'Failed to add serial number.'); }
    };

    const handleDeleteSerial = async (id: string, sNo: string) => {
        if (!confirm(`Remove serial number ${sNo} from registry?`)) return;
        try { await deletePanelSerial(id); setPanelSerials(prev => prev.filter(s => s.id !== id)); }
        catch (err) { alert('Failed to delete serial number.'); }
    };

    const inputStyle = {
        backgroundColor: 'rgb(var(--surface-1))', border: '1px solid rgb(var(--border-default))',
        color: 'rgb(var(--text-0))', borderRadius: '8px', padding: '0.4rem 0.75rem', fontSize: '0.8125rem', outline: 'none',
    };

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-4 anim-fade-up">
            {/* Header Title Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <p className="text-xs font-500 mb-0.5" style={{ color: 'rgb(var(--text-2))' }}>Product Master & Stock</p>
                    <h1 className="text-2xl font-700" style={{ color: 'rgb(var(--text-0))' }}>Inventory Management</h1>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <button onClick={() => setDispatchModalOpen(true)} className="crm-btn-secondary text-xs" style={{ padding: '0.45rem 0.875rem' }}>
                        <Truck size={14} /> Issue Dispatch
                    </button>
                    <button onClick={() => setPoModalOpen(true)} className="crm-btn-secondary text-xs" style={{ padding: '0.45rem 0.875rem' }}>
                        <ShoppingBag size={14} /> Create PO/GRN
                    </button>
                    <button onClick={() => setAddProductModal({ isOpen: true })} className="crm-btn-primary text-xs" style={{ padding: '0.45rem 0.875rem' }}>
                        <Plus size={14} /> Add Product
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Live Stock Valuation', value: `₹${summary.totalValuation.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'rgb(16 185 129)', bg: 'rgb(16 185 129 / 0.1)' },
                    { label: 'Active SKUs', value: `${summary.totalItems} Items`, icon: Package, color: 'rgb(6 182 212)', bg: 'rgb(6 182 212 / 0.1)' },
                    { label: 'Tracked Serials', value: `${panelSerials.length} Panels`, icon: Barcode, color: 'rgb(139 92 246)', bg: 'rgb(139 92 246 / 0.1)' },
                    { label: 'Low Stock Alerts', value: `${summary.lowStockCount} Items`, icon: AlertTriangle, color: 'rgb(245 158 11)', bg: 'rgb(245 158 11 / 0.1)' }
                ].map((kpi, i) => (
                    <div key={i} className="crm-card p-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: kpi.bg, color: kpi.color }}>
                            <kpi.icon size={18} />
                        </div>
                        <div>
                            <p className="text-[11px] font-500" style={{ color: 'rgb(var(--text-2))' }}>{kpi.label}</p>
                            <p className="text-lg font-700 leading-tight" style={{ color: 'rgb(var(--text-0))' }}>{kpi.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 hide-scrollbar">
                {[
                    { id: 'catalog', label: 'Products & Stock', icon: Package },
                    { id: 'orders', label: 'Purchase Orders & GRN', icon: ShoppingBag },
                    { id: 'movements', label: 'Dispatch & Movements', icon: Truck },
                ].map(tab => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-500 whitespace-nowrap transition-all"
                            style={{
                                backgroundColor: isActive ? 'rgb(var(--accent) / 0.1)' : 'transparent',
                                color: isActive ? 'rgb(var(--accent))' : 'rgb(var(--text-2))',
                                border: isActive ? `1px solid rgb(var(--accent) / 0.3)` : '1px solid transparent',
                            }}>
                            <Icon size={14} /> {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Filter & Search Bar */}
            <div className="crm-card p-4 flex flex-col md:flex-row items-center gap-3">
                <div className="relative flex-1 w-full max-w-sm">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgb(var(--text-3))' }} />
                    <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search SKU, Product, Brand..." className="crm-input pl-9 w-full" />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Filter size={14} className="hidden md:block" style={{ color: 'rgb(var(--text-3))' }} />
                    <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} style={{ ...inputStyle, minWidth: '200px' }}>
                        {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                </div>
            </div>

            {/* Main Content Areas */}
            {loading ? (
                <TableSkeleton />
            ) : (
                <>
                    {/* TAB 1: Product Master Catalog & Serials */}
                    {activeTab === 'catalog' && (
                        <div className="space-y-6">
                            <div className="crm-card overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="crm-table mobile-card-list">
                                        <thead>
                                            <tr>
                                                <th>Product</th>
                                                <th>SKU</th>
                                                <th>Category</th>
                                                <th>Brand</th>
                                                <th>Stock</th>
                                                <th>Unit ₹</th>
                                                <th>Total Val ₹</th>
                                                <th style={{ textAlign: 'right' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {products.length === 0 ? (
                                                <tr><td colSpan={8} className="text-center py-10" style={{ color: 'rgb(var(--text-3))' }}>No products found.</td></tr>
                                            ) : products.map(p => (
                                                <tr key={p.id}>
                                                    <td data-label="Product">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden border" style={{ backgroundColor: 'rgb(var(--surface-2))', borderColor: 'rgb(var(--border-muted))' }}>
                                                                <img src={p.imageUrl || '/assets/logo-icon.png'} alt={p.name} className="w-full h-full object-contain p-1" onError={(e: any) => { e.target.src = '/assets/logo-icon.png'; }} />
                                                            </div>
                                                            <div>
                                                                <div className="font-500 text-sm leading-tight" style={{ color: 'rgb(var(--text-0))' }}>{p.name}</div>
                                                                <div className="text-[10px] truncate w-40" style={{ color: 'rgb(var(--text-3))' }}>{p.description}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td data-label="SKU">
                                                        <span className="font-mono text-xs" style={{ color: 'rgb(var(--accent))' }}>{p.sku}</span>
                                                    </td>
                                                    <td data-label="Category" style={{ color: 'rgb(var(--text-1))', fontSize: '13px' }}>{p.category}</td>
                                                    <td data-label="Brand" style={{ color: 'rgb(var(--color-info))', fontSize: '13px', fontWeight: 600 }}>{p.companyBrand || p.make}</td>
                                                    <td data-label="Stock">
                                                        <input type="number" min="0" value={p.currentStock} onChange={e => handleInlineUpdate(p.id, Number(e.target.value), p.unitPrice)}
                                                            style={{ ...inputStyle, padding: '0.2rem 0.4rem', width: '70px', fontWeight: 600, color: 'rgb(var(--accent))' }} />
                                                    </td>
                                                    <td data-label="Unit ₹">
                                                        <input type="number" min="0" value={p.unitPrice} onChange={e => handleInlineUpdate(p.id, p.currentStock, Number(e.target.value))}
                                                            style={{ ...inputStyle, padding: '0.2rem 0.4rem', width: '90px', fontWeight: 600, color: 'rgb(var(--color-success))' }} />
                                                    </td>
                                                    <td data-label="Total Val ₹">
                                                        <span className="font-600 text-sm" style={{ color: 'rgb(var(--color-success))' }}>₹{(p.currentStock * p.unitPrice).toLocaleString('en-IN')}</span>
                                                    </td>
                                                    <td data-label="Actions" style={{ textAlign: 'right' }}>
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <button onClick={() => setAddProductModal({ isOpen: true, product: p })} className="p-1.5 rounded-lg transition-colors" style={{ color: 'rgb(var(--accent))', backgroundColor: 'rgb(var(--accent)/0.1)' }}>
                                                                <Edit3 size={14} />
                                                            </button>
                                                            {user?.role === 'Master' && (
                                                                <button onClick={() => handleDeleteProduct(p.id, p.name)} className="p-1.5 rounded-lg transition-colors" style={{ color: 'rgb(var(--color-danger))', backgroundColor: 'rgb(var(--color-danger)/0.1)' }}>
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="crm-card p-4">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
                                    <div>
                                        <h3 className="text-sm font-600 flex items-center gap-2" style={{ color: 'rgb(var(--text-0))' }}>
                                            <Barcode size={16} style={{ color: 'rgb(var(--color-info))' }} /> Panel & Inverter Serials
                                        </h3>
                                        <p className="text-xs mt-0.5" style={{ color: 'rgb(var(--text-2))' }}>Track warranty items by unique serial number</p>
                                    </div>
                                    <button onClick={() => setAddSerialModalOpen(true)} className="crm-btn-primary text-xs" style={{ padding: '0.45rem 0.875rem' }}>
                                        <Plus size={14} /> Register Serial #
                                    </button>
                                </div>
                                <div className="overflow-x-auto border rounded-xl" style={{ borderColor: 'rgb(var(--border-muted))' }}>
                                    <table className="crm-table">
                                        <thead>
                                            <tr>
                                                <th>Serial Number</th>
                                                <th>Item Name</th>
                                                <th>Brand</th>
                                                <th>Wattage</th>
                                                <th>Status</th>
                                                <th>Notes</th>
                                                <th style={{ textAlign: 'right' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {panelSerials.length === 0 ? (
                                                <tr><td colSpan={7} className="text-center py-6" style={{ color: 'rgb(var(--text-3))' }}>No serials tracked.</td></tr>
                                            ) : panelSerials.map(s => (
                                                <tr key={s.id}>
                                                    <td className="font-mono font-600 text-xs" style={{ color: 'rgb(var(--accent))' }}>{s.serialNumber}</td>
                                                    <td className="font-500 text-xs" style={{ color: 'rgb(var(--text-0))' }}>{s.itemName}</td>
                                                    <td className="text-xs font-600" style={{ color: 'rgb(var(--color-info))' }}>{s.brand}</td>
                                                    <td className="text-xs text-mono" style={{ color: 'rgb(var(--text-2))' }}>{s.wattage || '550W'}</td>
                                                    <td>
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-600" style={{ 
                                                            backgroundColor: s.status === 'In_Warehouse' ? 'rgb(var(--color-success)/0.1)' : s.status === 'Reserved' ? 'rgb(var(--color-info)/0.1)' : 'rgb(var(--color-warning)/0.1)',
                                                            color: s.status === 'In_Warehouse' ? 'rgb(var(--color-success))' : s.status === 'Reserved' ? 'rgb(var(--color-info))' : 'rgb(var(--color-warning))'
                                                        }}>
                                                            {s.status}
                                                        </span>
                                                    </td>
                                                    <td className="text-[11px]" style={{ color: 'rgb(var(--text-2))' }}>{s.notes || 'Warehouse'}</td>
                                                    <td style={{ textAlign: 'right' }}>
                                                        <button onClick={() => handleDeleteSerial(s.id, s.serialNumber)} className="p-1 rounded text-red-400 hover:bg-red-500/10">
                                                            <Trash2 size={13} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: Orders */}
                    {activeTab === 'orders' && (
                        <div className="crm-card p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-600" style={{ color: 'rgb(var(--text-0))' }}>Purchase Orders</h3>
                            </div>
                            <div className="overflow-x-auto border rounded-xl" style={{ borderColor: 'rgb(var(--border-muted))' }}>
                                <table className="crm-table mobile-card-list">
                                    <thead>
                                        <tr>
                                            <th>PO #</th>
                                            <th>Vendor</th>
                                            <th>Date</th>
                                            <th>Delivery</th>
                                            <th>Total ₹</th>
                                            <th>Status</th>
                                            <th style={{ textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {purchaseOrders.length === 0 ? (
                                            <tr><td colSpan={7} className="text-center py-6" style={{ color: 'rgb(var(--text-3))' }}>No Purchase Orders.</td></tr>
                                        ) : purchaseOrders.map(po => (
                                            <tr key={po.id}>
                                                <td data-label="PO #" className="font-600 text-xs" style={{ color: 'rgb(var(--color-warning))' }}>{po.poNo}</td>
                                                <td data-label="Vendor" className="font-500 text-sm" style={{ color: 'rgb(var(--text-0))' }}>{po.vendorName}</td>
                                                <td data-label="Date" className="text-xs" style={{ color: 'rgb(var(--text-1))' }}>{po.orderDate}</td>
                                                <td data-label="Delivery" className="text-xs" style={{ color: 'rgb(var(--text-2))' }}>{po.expectedDelivery || 'Immediate'}</td>
                                                <td data-label="Total ₹" className="font-600 text-sm" style={{ color: 'rgb(var(--color-success))' }}>₹{(po.totalAmount || 0).toLocaleString('en-IN')}</td>
                                                <td data-label="Status">
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-600" style={{
                                                        backgroundColor: po.status === 'Pending' ? 'rgb(var(--color-warning)/0.1)' : 'rgb(var(--color-success)/0.1)',
                                                        color: po.status === 'Pending' ? 'rgb(var(--color-warning))' : 'rgb(var(--color-success))'
                                                    }}>{po.status}</span>
                                                </td>
                                                <td data-label="Actions" style={{ textAlign: 'right' }}>
                                                    {po.status === 'Pending' && (
                                                        <button onClick={() => handleConfirmGRN(po.id)} className="crm-btn-secondary text-[10px]" style={{ padding: '0.2rem 0.5rem' }}>Confirm GRN</button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: Movements */}
                    {activeTab === 'movements' && (
                        <div className="crm-card p-4">
                            <h3 className="text-sm font-600 mb-4" style={{ color: 'rgb(var(--text-0))' }}>Stock Movement Audit Trail</h3>
                            <div className="overflow-x-auto border rounded-xl" style={{ borderColor: 'rgb(var(--border-muted))' }}>
                                <table className="crm-table">
                                    <thead>
                                        <tr>
                                            <th>Date & Time</th>
                                            <th>Item SKU & Name</th>
                                            <th>Type</th>
                                            <th>Quantity</th>
                                            <th>Reference</th>
                                            <th>By</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {analytics.movements.length === 0 ? (
                                            <tr><td colSpan={6} className="text-center py-6" style={{ color: 'rgb(var(--text-3))' }}>No movements recorded.</td></tr>
                                        ) : analytics.movements.map((m, idx) => (
                                            <tr key={idx}>
                                                <td className="text-xs" style={{ color: 'rgb(var(--text-2))' }}>{new Date(m.createdAt).toLocaleString('en-IN')}</td>
                                                <td>
                                                    <div className="font-500 text-sm leading-tight" style={{ color: 'rgb(var(--text-0))' }}>{m.itemName}</div>
                                                    <div className="font-mono text-[10px]" style={{ color: 'rgb(var(--accent))' }}>{m.itemSku}</div>
                                                </td>
                                                <td>
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-600 uppercase" style={{
                                                        backgroundColor: m.movementType === 'GRN' ? 'rgb(var(--color-success)/0.1)' : m.movementType === 'Reserved' ? 'rgb(var(--color-info)/0.1)' : 'rgb(var(--color-warning)/0.1)',
                                                        color: m.movementType === 'GRN' ? 'rgb(var(--color-success))' : m.movementType === 'Reserved' ? 'rgb(var(--color-info))' : 'rgb(var(--color-warning))'
                                                    }}>{m.movementType}</span>
                                                </td>
                                                <td className="font-600 text-sm" style={{ color: 'rgb(var(--text-0))' }}>{m.quantity}</td>
                                                <td className="font-mono text-[11px]" style={{ color: 'rgb(var(--text-2))' }}>{m.referenceNo || 'N/A'}</td>
                                                <td className="font-500 text-xs" style={{ color: 'rgb(var(--text-1))' }}>{m.createdBy || 'System'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}

            <AddProductModal isOpen={addProductModal.isOpen} onClose={() => setAddProductModal({ isOpen: false })} product={addProductModal.product} onSaved={loadInventoryData} />
            <CreatePOModal isOpen={poModalOpen} onClose={() => setPoModalOpen(false)} products={products} onCreated={loadInventoryData} />
            <DispatchModal isOpen={dispatchModalOpen} onClose={() => setDispatchModalOpen(false)} onDispatched={loadInventoryData} />

            {/* Serial Modal */}
            {addSerialModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 anim-fade-in backdrop-blur-sm">
                    <div className="crm-card p-6 w-full max-w-md shadow-2xl relative">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-700 flex items-center gap-2" style={{ color: 'rgb(var(--text-0))' }}>
                                <Barcode size={18} style={{ color: 'rgb(var(--color-info))' }} /> Register Serial
                            </h3>
                            <button onClick={() => setAddSerialModalOpen(false)} className="p-1 rounded hover:bg-black/10">✕</button>
                        </div>
                        <form onSubmit={handleAddPanelSerial} className="space-y-4">
                            <div>
                                <label className="block text-xs font-600 mb-1" style={{ color: 'rgb(var(--text-2))' }}>Serial Number *</label>
                                <input type="text" required value={newSerialData.serialNumber} onChange={e => setNewSerialData({...newSerialData, serialNumber: e.target.value})} placeholder="WAR-2026-PNL-9084" style={inputStyle} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-600 mb-1" style={{ color: 'rgb(var(--text-2))' }}>Brand</label>
                                    <input type="text" value={newSerialData.brand} onChange={e => setNewSerialData({...newSerialData, brand: e.target.value})} style={inputStyle} />
                                </div>
                                <div>
                                    <label className="block text-xs font-600 mb-1" style={{ color: 'rgb(var(--text-2))' }}>Wattage</label>
                                    <input type="text" value={newSerialData.wattage} onChange={e => setNewSerialData({...newSerialData, wattage: e.target.value})} style={inputStyle} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-600 mb-1" style={{ color: 'rgb(var(--text-2))' }}>Notes / Location</label>
                                <input type="text" value={newSerialData.notes} onChange={e => setNewSerialData({...newSerialData, notes: e.target.value})} style={inputStyle} />
                            </div>
                            <div className="flex gap-3 pt-4 border-t mt-4" style={{ borderColor: 'rgb(var(--border-muted))' }}>
                                <button type="button" onClick={() => setAddSerialModalOpen(false)} className="crm-btn-secondary flex-1">Cancel</button>
                                <button type="submit" className="crm-btn-primary flex-[2]">Save Serial Number</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryPage;
