import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Edit3, Eye, Sun, Phone, Mail, MapPin, CheckCircle } from 'lucide-react';
import { getLeadDetails, getProducts } from '../../service/adminService';
import { Logo } from '../../constants';
import logoIcon from '../../assets/logo-icon.png';
import Card from '../../components/admin/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const API_BASE_URL = import.meta.env.VITE_CRM_API_URL || 'http://localhost:3001';

interface QuotationData {
    clientName: string;
    clientPhone: string;
    quotationDate: string;
    plantCapacity: string;
    
    companyPhone: string;
    companyEmail: string;
    companyLocation: string;
    companyGst: string;
    
    baseAmount: number;
    totalAmount: number;
    subsidyAmount: number;
    finalAmount: number;
    
    bankAcNo: string;
    bankAcType: string;
    bankName: string;
    bankIfsc: string;
}

interface BomItem {
    category: string;
    name: string;
    description: string;
    make: string;
    imageUrl: string;
}

const QuotationGeneratorPage: React.FC = () => {
    const { leadId } = useParams<{ leadId: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [generatingPdf, setGeneratingPdf] = useState(false);
    const previewRef = useRef<HTMLDivElement>(null);

    const [data, setData] = useState<QuotationData>({
        clientName: '',
        clientPhone: '',
        quotationDate: new Date().toISOString().split('T')[0],
        plantCapacity: '5.5',
        
        companyPhone: '+91 9876543210',
        companyEmail: 'info@varcasenergy.com',
        companyLocation: 'Gujarat, India',
        companyGst: '24XXXXX0000X1Z5',
        
        baseAmount: 280000,
        totalAmount: 280000,
        subsidyAmount: 78000,
        finalAmount: 202000,
        
        bankAcNo: '12345678901234',
        bankAcType: 'Current',
        bankName: 'HDFC Bank',
        bankIfsc: 'HDFC0001234'
    });

    const [dbProducts, setDbProducts] = useState<any[]>([]);
    const [bom, setBom] = useState<BomItem[]>([]);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true);
                // 1. Fetch products catalog
                const productsList = await getProducts();
                setDbProducts(productsList);

                // 2. Fetch lead if present
                if (leadId) {
                    const lead = await getLeadDetails(leadId);
                    if (lead) {
                        setData(prev => ({
                            ...prev,
                            clientName: lead.name || '',
                            clientPhone: lead.phone || '',
                        }));
                    }
                }
            } catch (error) {
                console.error("Error loading quotation generator:", error);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, [leadId]);

    // Recalculate and build dynamic BOM when capacity or products load
    useEffect(() => {
        const capacity = parseFloat(data.plantCapacity) || 0;
        const panelQty = Math.ceil(capacity / 0.55);
        const inverterSize = capacity <= 3.3 ? "3.0 KW" :
                             capacity <= 5.5 ? "5.0 KW" :
                             capacity <= 8.8 ? "8.0 KW" :
                             capacity <= 11 ? "10.0 KW" : `${Math.ceil(capacity)} KW`;

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

        const calculatedBom = categories.map(cat => {
            const product = dbProducts.find(p => p.category === cat) || {};
            
            let desc = product.description || '';
            let make = product.make || 'Standard';
            let imageUrl = product.imageUrl || '';
            if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/assets/')) {
                imageUrl = `${API_BASE_URL}${imageUrl}`;
            }

            // Handle dynamic scaling logic
            if (cat === 'Solar Module') {
                desc = `Topcon Bifacial ${panelQty} Panel 550 WP`;
                make = product.make || "Adani/waree (30 Year Performance Warranty)";
            } else if (cat === 'Solar Inverter') {
                desc = `On-grid String inverters ${inverterSize}`;
                make = product.make || "Deye (10 Year warranty)";
            }

            return {
                category: cat,
                name: product.name || cat,
                description: desc,
                make: make,
                imageUrl: imageUrl
            };
        });

        setBom(calculatedBom);
    }, [data.plantCapacity, dbProducts]);

    const calculateSubsidy = (capacity: number) => {
        if (capacity <= 0) return 0;
        if (capacity <= 2) {
            return capacity * 30000;
        } else if (capacity <= 3) {
            return 60000 + (capacity - 2) * 18000;
        } else {
            return 78000;
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setData(prev => {
            const updated = { ...prev, [name]: value };
            
            // Auto calculate financials
            if (name === 'plantCapacity') {
                const capacity = parseFloat(value) || 0;
                updated.baseAmount = Math.round(capacity * 50000);
                updated.subsidyAmount = Math.round(calculateSubsidy(capacity));
                updated.totalAmount = updated.baseAmount;
                updated.finalAmount = updated.totalAmount - updated.subsidyAmount;
            } else if (name === 'baseAmount') {
                const base = parseFloat(value) || 0;
                updated.baseAmount = base;
                updated.totalAmount = base;
                updated.finalAmount = base - Number(prev.subsidyAmount || 0);
            } else if (name === 'subsidyAmount') {
                const sub = parseFloat(value) || 0;
                updated.subsidyAmount = sub;
                updated.finalAmount = Number(prev.baseAmount || 0) - sub;
            }
            
            return updated;
        });
    };

    const handleBomChange = (idx: number, field: 'description' | 'make', value: string) => {
        setBom(prev => {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], [field]: value };
            return updated;
        });
    };

    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const generatePDF = async () => {
        if (!previewRef.current) return;
        setGeneratingPdf(true);
        try {
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pages = previewRef.current.querySelectorAll('.pdf-page');
            
            const originalTransform = previewRef.current.style.transform;
            previewRef.current.style.transform = 'none';
            
            await new Promise(resolve => setTimeout(resolve, 150));

            for (let i = 0; i < pages.length; i++) {
                const element = pages[i] as HTMLElement;
                if (i > 0) pdf.addPage();
                
                element.setAttribute('data-rendering', 'true');
                
                const canvas = await html2canvas(element, {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#ffffff',
                    width: 794,
                    height: 1123,
                    windowWidth: 794,
                    windowHeight: 1123,
                    onclone: (clonedDoc) => {
                        const clonedPage = clonedDoc.querySelector('[data-rendering="true"]') as HTMLElement;
                        if (clonedPage) {
                            clonedPage.style.transform = 'none';
                            clonedPage.style.margin = '0';
                            clonedPage.style.width = '794px';
                            clonedPage.style.height = '1123px';
                            clonedPage.style.minHeight = '1123px';
                            clonedPage.style.boxShadow = 'none';
                            clonedPage.style.border = 'none';
                            clonedPage.classList.remove('shadow-xl', 'border');
                            
                            let currentParent = clonedPage.parentElement;
                            while (currentParent && currentParent !== clonedDoc.body) {
                                currentParent.style.transform = 'none';
                                currentParent.style.scale = 'none';
                                currentParent.style.margin = '0';
                                currentParent.style.padding = '0';
                                currentParent.style.maxHeight = 'none';
                                currentParent.style.maxWidth = 'none';
                                currentParent.style.height = 'auto';
                                currentParent.style.width = 'auto';
                                currentParent.style.overflow = 'visible';
                                currentParent = currentParent.parentElement;
                            }
                        }
                    }
                });
                
                element.removeAttribute('data-rendering');
                
                const imgData = canvas.toDataURL('image/png');
                pdf.addImage(imgData, 'PNG', 0, 0, 210, 297, undefined, 'FAST');
            }
            
            previewRef.current.style.transform = originalTransform;
            
            pdf.save(`Varcas_Energy_Quotation_${data.clientName.replace(/\s+/g, '_') || 'Customer'}_${data.quotationDate}.pdf`);
        } catch (error) {
            console.error("PDF generation failed:", error);
            alert("Failed to generate PDF. Please try again.");
        } finally {
            setGeneratingPdf(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><LoadingSpinner size="lg" /></div>;

    const scaleFactor = windowWidth < 1280 
        ? Math.min(1, (windowWidth - 120) / 800) 
        : Math.min(0.85, (windowWidth / 2 - 160) / 800); 

    const Footer = () => (
        <div className="mt-auto border-t-2 border-emerald-500 pt-3 flex justify-between items-center text-xs text-gray-600 bg-emerald-50 px-4 py-2 rounded-b-lg">
            <div className="flex items-center gap-1"><Phone size={12} className="text-emerald-600"/> {data.companyPhone}</div>
            <div className="flex items-center gap-1"><Mail size={12} className="text-emerald-600"/> {data.companyEmail}</div>
            <div className="flex items-center gap-1"><MapPin size={12} className="text-emerald-600"/> {data.companyLocation}</div>
        </div>
    );

    const Header = ({ title }: { title?: string }) => (
        <div className="flex justify-between items-center border-b-2 border-gray-200 pb-4 mb-6">
            <div>
                <Logo className="scale-110 !text-gray-900 origin-left" />
            </div>
            {title && <h2 className="text-xl font-bold text-emerald-800 uppercase tracking-widest bg-emerald-50 px-4 py-2 rounded-lg">{title}</h2>}
        </div>
    );

    return (
        <div className="p-4 sm:p-8 lg:p-12 max-w-[1600px] mx-auto animate-fade-in-up space-y-8">
            <style>{`
                .pdf-page img + div span.text-white {
                    color: #065f46 !important;
                }
            `}</style>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <button
                    onClick={() => navigate(-1)}
                    className="group flex items-center gap-3 text-text-secondary hover:text-neon-cyan transition-all duration-300 font-bold uppercase tracking-widest text-xs"
                >
                    <div className="p-2 rounded-xl bg-white/5 border border-glass-border/30 group-hover:border-neon-cyan group-hover:bg-neon-cyan/10 transition-all">
                        <ArrowLeft size={16} />
                    </div>
                    Back
                </button>

                <div className="flex items-center gap-3">
                    <button
                        onClick={generatePDF}
                        disabled={generatingPdf}
                        className="px-6 py-3 rounded-2xl bg-neon-cyan text-white font-black uppercase tracking-widest text-xs shadow-glow-sm shadow-neon-cyan/20 hover:scale-105 transition-all flex items-center gap-2"
                    >
                        {generatingPdf ? <LoadingSpinner size="sm" /> : <Download size={18} />}
                        {generatingPdf ? 'Generating...' : 'Generate 5-Page PDF'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 items-start">
                {/* Editor Sidebar */}
                <div className="space-y-8">
                    <Card className="bg-glass-surface/20 border-glass-border/30 p-8">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 rounded-2xl bg-neon-cyan/10 text-neon-cyan">
                                <Edit3 size={24} />
                            </div>
                            <h3 className="text-xl font-black text-text-primary tracking-tight">Quotation Editor</h3>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-4">
                                <h4 className="text-sm font-black uppercase tracking-widest text-neon-cyan">Client Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Client Name</label>
                                        <input type="text" name="clientName" value={data.clientName} onChange={handleInputChange} className="w-full bg-white/5 border border-glass-border/30 rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan outline-none transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Client Mobile</label>
                                        <input type="text" name="clientPhone" value={data.clientPhone} onChange={handleInputChange} className="w-full bg-white/5 border border-glass-border/30 rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan outline-none transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Quotation Date</label>
                                        <input type="date" name="quotationDate" value={data.quotationDate} onChange={handleInputChange} className="w-full bg-white/5 border border-glass-border/30 rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan outline-none transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Plant Capacity (KW)</label>
                                        <input type="text" name="plantCapacity" value={data.plantCapacity} onChange={handleInputChange} className="w-full bg-white/5 border border-glass-border/30 rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan outline-none transition-all" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-sm font-black uppercase tracking-widest text-neon-cyan">Company Details</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Company Mobile</label>
                                        <input type="text" name="companyPhone" value={data.companyPhone} onChange={handleInputChange} className="w-full bg-white/5 border border-glass-border/30 rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan outline-none transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Company Email</label>
                                        <input type="text" name="companyEmail" value={data.companyEmail} onChange={handleInputChange} className="w-full bg-white/5 border border-glass-border/30 rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan outline-none transition-all" />
                                    </div>
                                </div>
                            </div>

                            {/* Dynamic BOM Editor */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-black uppercase tracking-widest text-neon-cyan">Equipment Details</h4>
                                <div className="space-y-4">
                                    {bom.map((item, idx) => (
                                        <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-glass-border/10 space-y-3">
                                            <span className="text-xs font-black uppercase tracking-widest text-emerald-400">{item.name}</span>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary ml-1">Description / Spec</label>
                                                    <input
                                                        type="text"
                                                        value={item.description}
                                                        onChange={(e) => handleBomChange(idx, 'description', e.target.value)}
                                                        className="w-full bg-white/5 border border-glass-border/30 rounded-xl px-3 py-2 text-xs font-bold text-text-primary focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan outline-none transition-all"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary ml-1">Brand / Make</label>
                                                    <input
                                                        type="text"
                                                        value={item.make}
                                                        onChange={(e) => handleBomChange(idx, 'make', e.target.value)}
                                                        className="w-full bg-white/5 border border-glass-border/30 rounded-xl px-3 py-2 text-xs font-bold text-text-primary focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan outline-none transition-all"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-sm font-black uppercase tracking-widest text-neon-cyan">Financials</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Base Amount (₹)</label>
                                        <input type="number" name="baseAmount" value={data.baseAmount} onChange={handleInputChange} className="w-full bg-white/5 border border-glass-border/30 rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan outline-none transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Total Amount (₹) [Auto]</label>
                                        <input type="number" name="totalAmount" value={data.totalAmount} disabled className="w-full bg-white/5 border border-glass-border/30 rounded-xl px-4 py-3 text-sm font-bold text-gray-400 bg-white/5 cursor-not-allowed outline-none transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Subsidy Amount (₹)</label>
                                        <input type="number" name="subsidyAmount" value={data.subsidyAmount} onChange={handleInputChange} className="w-full bg-white/5 border border-glass-border/30 rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan outline-none transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Final Amount (₹) [Auto]</label>
                                        <input type="number" name="finalAmount" value={data.finalAmount} disabled className="w-full bg-white/5 border border-glass-border/30 rounded-xl px-4 py-3 text-sm font-bold text-gray-400 bg-white/5 cursor-not-allowed outline-none transition-all" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* PDF Live Preview Container */}
                <div className="space-y-8 xl:sticky xl:top-8">
                    <div className="flex items-center justify-between ml-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-neon-cyan/10 text-neon-cyan">
                                <Eye size={20} />
                            </div>
                            <h3 className="text-lg font-black text-text-primary tracking-tight">Live Preview (5 Pages)</h3>
                        </div>
                    </div>

                    <div className="relative w-full rounded-2xl border border-glass-border/30 bg-black/20 p-4 sm:p-8 flex flex-col items-center overflow-y-auto max-h-[80vh] backdrop-blur-sm scrollbar-thin scrollbar-thumb-neon-cyan/50">
                        <div ref={previewRef} className="flex flex-col gap-8 w-[210mm] origin-top" style={{ transform: `scale(${scaleFactor})` }}>
                            
                            {/* PAGE 1: COVER PAGE */}
                            <div className="pdf-page bg-white w-[210mm] min-h-[297mm] h-[297mm] p-[12mm] relative flex flex-col font-sans border shadow-xl overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-3 bg-emerald-600"></div>
                                
                                <div className="flex flex-col items-center mt-16 mb-8">
                                    <Logo className="scale-150 !text-gray-900 mb-6" />
                                    <h1 className="text-4xl font-black text-emerald-800 tracking-wider mb-3">VARCAS ENERGY</h1>
                                    <div className="w-32 h-1.5 bg-yellow-400 mb-4 rounded-full"></div>
                                    <p className="text-lg text-gray-600 font-semibold italic">"Let's contribute towards green revolution"</p>
                                </div>

                                <div className="flex flex-col items-center justify-center my-12 py-8 border-y-2 border-emerald-500/20 w-full">
                                    <h2 className="text-3xl font-black text-emerald-800 tracking-[0.25em] uppercase text-center">SOLAR QUOTATION</h2>
                                </div>

                                <div className="grid grid-cols-2 gap-6 mb-12">
                                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center text-center">
                                        <h3 className="text-4xl font-black text-emerald-600 mb-2">4000+</h3>
                                        <p className="text-sm font-bold text-gray-700 uppercase tracking-wide">Satisfied Customers</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center text-center">
                                        <h3 className="text-4xl font-black text-emerald-600 mb-2">30 YRS</h3>
                                        <p className="text-sm font-bold text-gray-700 uppercase tracking-wide">Performance Warranty</p>
                                    </div>
                                </div>

                                <div className="mt-auto">
                                    <h3 className="text-xl font-bold text-emerald-800 mb-4 border-b-2 border-emerald-200 inline-block pb-1">Our Services</h3>
                                    <ul className="grid grid-cols-2 gap-4 text-sm font-semibold text-gray-700">
                                        <li className="flex items-center gap-2"><CheckCircle size={16} className="text-yellow-500"/> Rooftop Solar For Home</li>
                                        <li className="flex items-center gap-2"><CheckCircle size={16} className="text-yellow-500"/> Commercial Solar Installation</li>
                                        <li className="flex items-center gap-2"><CheckCircle size={16} className="text-yellow-500"/> Industrial Solar</li>
                                        <li className="flex items-center gap-2"><CheckCircle size={16} className="text-yellow-500"/> After Sales Services</li>
                                    </ul>
                                </div>
                                <div className="absolute bottom-0 left-0 w-full h-3 bg-emerald-600"></div>
                            </div>

                            {/* PAGE 2: COVER LETTER & EQUIP (PART 1) */}
                            <div className="pdf-page bg-white w-[210mm] min-h-[297mm] h-[297mm] p-[12mm] relative flex flex-col font-sans border shadow-xl overflow-hidden">
                                <Header title="Quotation Details" />
                                
                                <div className="bg-gray-50 border border-gray-200 p-5 rounded-xl mb-6 shadow-sm">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Client Name</p>
                                            <p className="font-bold text-lg text-gray-900">{data.clientName || 'Valued Customer'}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Date</p>
                                            <p className="font-bold text-lg text-gray-900">{new Date(data.quotationDate).toLocaleDateString('en-GB')}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Contact Number</p>
                                            <p className="font-bold text-lg text-gray-900">{data.clientPhone || 'N/A'}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Plant Capacity</p>
                                            <p className="font-black text-lg text-emerald-700 bg-emerald-100 inline-block px-3 py-1 rounded">{data.plantCapacity} KW</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-6 text-sm text-gray-700 leading-relaxed text-justify">
                                    <p className="mb-2 font-bold text-gray-900">Dear Sir/Madam,</p>
                                    <p>We are pleased to hear from you and would like to give our best-in-class solar solutions for your inquiry. As per our discussion, we are submitting you the below solution with our best price to work further. We request you to go through the same and have a chance to serve you in your green future.</p>
                                </div>

                                <h3 className="text-md font-bold text-emerald-800 mb-3 bg-emerald-50 p-2 rounded border-l-4 border-emerald-500 uppercase tracking-wider">Detailed System Specifications (Part 1)</h3>
                                <table className="w-full border-collapse text-xs shadow-sm rounded-lg overflow-hidden border border-gray-200">
                                    <thead>
                                        <tr className="bg-emerald-700 text-white">
                                            <th className="border-b border-emerald-800 p-3 text-center w-12">Sr. No.</th>
                                            <th className="border-b border-emerald-800 p-3 text-center w-24">Product Image</th>
                                            <th className="border-b border-emerald-800 p-3 text-left w-1/4">Equipment/Component</th>
                                            <th className="border-b border-emerald-800 p-3 text-left w-1/3">Description & Specifications</th>
                                            <th className="border-b border-emerald-800 p-3 text-left">Make/Brand</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white">
                                        {bom.slice(0, 6).map((item, idx) => (
                                            <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                                                <td className="p-2 text-center font-bold text-gray-500" style={{ verticalAlign: 'middle' }}>{idx + 1}</td>
                                                <td className="p-2 text-center" style={{ verticalAlign: 'middle' }}>
                                                    {item.imageUrl ? (
                                                        <img
                                                            src={item.imageUrl}
                                                            alt={item.name}
                                                            className="w-[15mm] h-[15mm] object-contain border border-gray-100 rounded bg-white shadow-sm mx-auto block"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src = logoIcon;
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-[15mm] h-[15mm] flex flex-col items-center justify-center bg-gray-50 border border-gray-200 rounded p-1 mx-auto">
                                                            <img src={logoIcon} alt="Varcas Placeholder" className="w-10 h-auto object-contain opacity-70 mx-auto" />
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-2 font-bold text-gray-800" style={{ verticalAlign: 'middle' }}>{item.name}</td>
                                                <td className="p-2 text-gray-600 leading-normal" style={{ verticalAlign: 'middle' }}>{item.description}</td>
                                                <td className="p-2 font-semibold text-emerald-700 leading-normal" style={{ verticalAlign: 'middle' }}>{item.make}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                
                                <Footer />
                            </div>

                            {/* PAGE 3: EQUIP (PART 2) */}
                            <div className="pdf-page bg-white w-[210mm] min-h-[297mm] h-[297mm] p-[12mm] relative flex flex-col font-sans border shadow-xl overflow-hidden">
                                <Header title="Equipment Details" />

                                <h3 className="text-md font-bold text-emerald-800 mb-3 bg-emerald-50 p-2 rounded border-l-4 border-emerald-500 uppercase tracking-wider">Detailed System Specifications (Part 2)</h3>
                                <table className="w-full border-collapse text-xs shadow-sm rounded-lg overflow-hidden border border-gray-200">
                                    <thead>
                                        <tr className="bg-emerald-700 text-white">
                                            <th className="border-b border-emerald-800 p-3 text-center w-12">Sr. No.</th>
                                            <th className="border-b border-emerald-800 p-3 text-center w-24">Product Image</th>
                                            <th className="border-b border-emerald-800 p-3 text-left w-1/4">Equipment/Component</th>
                                            <th className="border-b border-emerald-800 p-3 text-left w-1/3">Description & Specifications</th>
                                            <th className="border-b border-emerald-800 p-3 text-left">Make/Brand</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white">
                                        {bom.slice(6, 13).map((item, idx) => (
                                            <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                                                <td className="p-2 text-center font-bold text-gray-500" style={{ verticalAlign: 'middle' }}>{idx + 7}</td>
                                                <td className="p-2 text-center" style={{ verticalAlign: 'middle' }}>
                                                    {item.imageUrl ? (
                                                        <img
                                                            src={item.imageUrl}
                                                            alt={item.name}
                                                            className="w-[15mm] h-[15mm] object-contain border border-gray-100 rounded bg-white shadow-sm mx-auto block"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src = logoIcon;
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-[15mm] h-[15mm] flex flex-col items-center justify-center bg-gray-50 border border-gray-200 rounded p-1 mx-auto">
                                                            <img src={logoIcon} alt="Varcas Placeholder" className="w-10 h-auto object-contain opacity-70 mx-auto" />
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-2 font-bold text-gray-800" style={{ verticalAlign: 'middle' }}>{item.name}</td>
                                                <td className="p-2 text-gray-600 leading-normal" style={{ verticalAlign: 'middle' }}>{item.description}</td>
                                                <td className="p-2 font-semibold text-emerald-700 leading-normal" style={{ verticalAlign: 'middle' }}>{item.make}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <Footer />
                            </div>

                            {/* PAGE 4: PRICING & DOCUMENTS */}
                            <div className="pdf-page bg-white w-[210mm] min-h-[297mm] h-[297mm] p-[12mm] relative flex flex-col font-sans border shadow-xl overflow-hidden">
                                <Header title="Commercials" />

                                <div className="bg-gray-50 border border-gray-200 p-5 rounded-xl mb-6 shadow-sm">
                                    <h3 className="font-bold text-emerald-800 mb-2 uppercase tracking-wider text-sm">Scope of Work</h3>
                                    <p className="text-gray-700 text-sm font-semibold">Complete design, Engineering, Installation & Commissioning Of Rooftop Solar PV System.</p>
                                </div>

                                <h3 className="text-md font-bold text-emerald-800 mb-3 bg-emerald-50 p-2 rounded border-l-4 border-emerald-500 uppercase tracking-wider">Financial Breakdown</h3>
                                <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm mb-8">
                                    <table className="w-full text-sm">
                                        <tbody className="divide-y divide-gray-200">
                                            <tr className="bg-white hover:bg-gray-50">
                                                <td className="p-4 font-bold text-gray-700">Capacity</td>
                                                <td className="p-4 font-black text-emerald-700 text-right">{data.plantCapacity} KW</td>
                                            </tr>
                                            <tr className="bg-gray-50 hover:bg-gray-100">
                                                <td className="p-4 font-bold text-gray-700">Base Amount</td>
                                                <td className="p-4 font-bold text-gray-900 text-right">₹ {Number(data.baseAmount).toLocaleString()}/-</td>
                                            </tr>
                                            <tr className="bg-white hover:bg-gray-50">
                                                <td className="p-4 font-bold text-gray-700">Net-Meter Applicable & Stamp Charge</td>
                                                <td className="p-4 font-bold text-gray-900 text-right">₹ 0/-</td>
                                            </tr>
                                            <tr className="bg-gray-50 hover:bg-gray-100">
                                                <td className="p-4 font-bold text-gray-700">Extra Expense</td>
                                                <td className="p-4 font-bold text-gray-900 text-right">₹ 0/-</td>
                                            </tr>
                                            <tr className="bg-emerald-50 border-t-2 border-emerald-200">
                                                <td className="p-4 font-black text-emerald-900 text-lg">TOTAL AMOUNT</td>
                                                <td className="p-4 font-black text-emerald-900 text-lg text-right">₹ {Number(data.totalAmount).toLocaleString()}/-</td>
                                            </tr>
                                            <tr className="bg-yellow-50 text-yellow-900 border-t border-yellow-200">
                                                <td className="p-4 font-bold">SUBSIDY</td>
                                                <td className="p-4 font-bold text-right">- ₹ {Number(data.subsidyAmount).toLocaleString()}/-</td>
                                            </tr>
                                            <tr className="bg-emerald-700 text-white">
                                                <td className="p-5 font-black text-xl uppercase tracking-widest">Final Amount</td>
                                                <td className="p-5 font-black text-xl text-right">₹ {Number(data.finalAmount).toLocaleString()}/-</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div className="mt-4">
                                    <h3 className="text-md font-bold text-emerald-800 mb-3 bg-emerald-50 p-2 rounded border-l-4 border-emerald-500 uppercase tracking-wider">Required Documents For Registration</h3>
                                    <div className="grid grid-cols-2 gap-3 text-sm font-semibold text-gray-700 bg-gray-50 p-6 rounded-xl border border-gray-200">
                                        <div className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500"/> LIGHT BILL</div>
                                        <div className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500"/> VERA BILL</div>
                                        <div className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500"/> ADHAR CARD</div>
                                        <div className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500"/> PAN CARD</div>
                                        <div className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500"/> CANCEL CHEQUE</div>
                                        <div className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500"/> PASSPORT PHOTO</div>
                                        <div className="flex items-center gap-2 col-span-2"><CheckCircle size={16} className="text-emerald-500"/> EMAIL ID</div>
                                    </div>
                                </div>

                                <Footer />
                            </div>

                            {/* PAGE 5: PAYMENT DETAILS & TERMS */}
                            <div className="pdf-page bg-white w-[210mm] min-h-[297mm] h-[297mm] p-[12mm] relative flex flex-col font-sans border shadow-xl overflow-hidden">
                                <Header title="Payment & Terms" />

                                <h3 className="text-md font-bold text-emerald-800 mb-3 bg-emerald-50 p-2 rounded border-l-4 border-emerald-500 uppercase tracking-wider">Bank Details</h3>
                                <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm mb-8">
                                    <table className="w-full text-sm">
                                        <tbody className="divide-y divide-gray-200">
                                            <tr className="bg-white hover:bg-gray-50">
                                                <td className="p-3 w-1/3 font-bold text-gray-500 uppercase tracking-wider text-xs">A/C Name</td>
                                                <td className="p-3 font-bold text-gray-900">VARCAS ENERGY</td>
                                            </tr>
                                            <tr className="bg-gray-50 hover:bg-gray-100">
                                                <td className="p-3 font-bold text-gray-500 uppercase tracking-wider text-xs">A/C No.</td>
                                                <td className="p-3 font-black text-emerald-700 tracking-wider">{data.bankAcNo}</td>
                                            </tr>
                                            <tr className="bg-white hover:bg-gray-50">
                                                <td className="p-3 font-bold text-gray-500 uppercase tracking-wider text-xs">Account Type</td>
                                                <td className="p-3 font-bold text-gray-900">{data.bankAcType}</td>
                                            </tr>
                                            <tr className="bg-gray-50 hover:bg-gray-100">
                                                <td className="p-3 font-bold text-gray-500 uppercase tracking-wider text-xs">Bank Name</td>
                                                <td className="p-3 font-bold text-gray-900">{data.bankName}</td>
                                            </tr>
                                            <tr className="bg-white hover:bg-gray-50">
                                                <td className="p-3 font-bold text-gray-500 uppercase tracking-wider text-xs">IFSC Code</td>
                                                <td className="p-3 font-bold text-gray-900 tracking-wider">{data.bankIfsc}</td>
                                            </tr>
                                            <tr className="bg-gray-50 hover:bg-gray-100">
                                                <td className="p-3 font-bold text-gray-500 uppercase tracking-wider text-xs">GST No.</td>
                                                <td className="p-3 font-bold text-gray-900 tracking-wider">{data.companyGst}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <h3 className="text-md font-bold text-emerald-800 mb-3 bg-emerald-50 p-2 rounded border-l-4 border-emerald-500 uppercase tracking-wider">Terms & Conditions</h3>
                                <ul className="space-y-3 text-sm text-gray-700 mb-12 bg-gray-50 p-6 rounded-xl border border-gray-200">
                                    <li className="flex gap-3"><span className="font-bold text-emerald-600 min-w-[120px]">Discom Estimate:</span> Extra As per Actual Estimate</li>
                                    <li className="flex gap-3"><span className="font-bold text-emerald-600 min-w-[120px]">Structure:</span> WALK WAY AND LADDERS EXCLUDING</li>
                                    <li className="flex gap-3"><span className="font-bold text-emerald-600 min-w-[120px]">Delivery Period:</span> 10 To 15 Days After Receiving Advance Payment & Approval Of Govt</li>
                                    <li className="flex gap-3"><span className="font-bold text-emerald-600 min-w-[120px]">Warranty:</span> 30-Year Performance Warranty Of SPV Module Up To 80% As Per Company Policy & 5-Year Unit Except External Damage.</li>
                                    <li className="flex gap-3"><span className="font-bold text-emerald-600 min-w-[120px]">Note:</span> Quotation Validity 7 Days</li>
                                </ul>

                                <div className="mt-auto flex justify-between items-end mb-6">
                                    <div className="text-xl font-black text-emerald-800">
                                        Thank You
                                    </div>
                                    <div className="text-right">
                                        <div className="h-16 w-48 border-b-2 border-gray-400 mb-2"></div>
                                        <p className="font-bold text-gray-900 uppercase text-sm">Authorized Signatory</p>
                                        <p className="font-black text-emerald-700 uppercase tracking-widest text-lg">VARCAS ENERGY</p>
                                    </div>
                                </div>

                                <Footer />
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuotationGeneratorPage;
