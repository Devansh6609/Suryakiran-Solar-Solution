import React, { useState, useEffect } from 'react';
import {
    IndianRupee, TrendingUp, TrendingDown, Plus, Trash2, Edit3, Save,
    X, FileText
} from 'lucide-react';
import {
    getProjectFinance,
    updateProjectFinance,
    addProjectExpense,
    deleteProjectExpense
} from '../../service/adminService';
import LoadingSpinner from '../LoadingSpinner';

interface LeadFinanceTabProps {
    leadId: string;
    leadName?: string;
}

const EXPENSE_TYPES = ['Labor', 'Transport', 'Electrician', 'Permit', 'Material', 'Other'];

const LeadFinanceTab: React.FC<LeadFinanceTabProps> = ({ leadId }) => {
    const [finance, setFinance] = useState<any>(null);
    const [expenses, setExpenses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [saving, setSaving] = useState(false);
    const [addExpenseOpen, setAddExpenseOpen] = useState(false);

    const [editData, setEditData] = useState({
        quotationAmount: 0, advanceReceived: 0, finalPaymentReceived: 0,
        laborCost: 0, transportCost: 0, electricianCost: 0, otherExpenses: 0, notes: ''
    });

    const [newExpense, setNewExpense] = useState({
        expenseType: 'Labor', description: '', amount: '', paidTo: '', date: new Date().toISOString().split('T')[0]
    });

    const loadFinance = async () => {
        try {
            setLoading(true);
            const data = await getProjectFinance(leadId);
            if (data.success) {
                setFinance(data.finance); setExpenses(data.expenses || []);
                setEditData({
                    quotationAmount: data.finance.quotationAmount || 0, advanceReceived: data.finance.advanceReceived || 0,
                    finalPaymentReceived: data.finance.finalPaymentReceived || 0, laborCost: data.finance.laborCost || 0,
                    transportCost: data.finance.transportCost || 0, electricianCost: data.finance.electricianCost || 0,
                    otherExpenses: data.finance.otherExpenses || 0, notes: data.finance.notes || ''
                });
            }
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    useEffect(() => { loadFinance(); }, [leadId]);

    const handleSave = async () => {
        try {
            setSaving(true);
            await updateProjectFinance(leadId, editData); await loadFinance(); setEditMode(false);
        } catch (err) { alert('Failed to save finance data.'); } finally { setSaving(false); }
    };

    const handleAddExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newExpense.description || !newExpense.amount) return;
        try {
            await addProjectExpense(leadId, newExpense);
            setNewExpense({ expenseType: 'Labor', description: '', amount: '', paidTo: '', date: new Date().toISOString().split('T')[0] });
            setAddExpenseOpen(false); await loadFinance();
        } catch (err) { alert('Failed to add expense.'); }
    };

    const handleDeleteExpense = async (id: string) => {
        if (!confirm('Remove this expense?')) return;
        try { await deleteProjectExpense(id); await loadFinance(); } catch (err) { alert('Failed to delete expense.'); }
    };

    const inputStyle = {
        backgroundColor: 'rgb(var(--surface-2))', border: '1px solid rgb(var(--border-default))',
        color: 'rgb(var(--text-0))', borderRadius: '8px', padding: '0.4rem 0.75rem', fontSize: '0.8125rem', outline: 'none', width: '100%'
    };

    if (loading) return <div className="flex items-center justify-center py-20"><LoadingSpinner /></div>;

    const isProfit = finance?.grossProfit >= 0;
    const profitColor = isProfit ? 'rgb(var(--color-success))' : 'rgb(var(--color-danger))';
    const profitBg = isProfit ? 'rgb(var(--color-success)/0.1)' : 'rgb(var(--color-danger)/0.1)';
    const totalReceived = (finance?.advanceReceived || 0) + (finance?.finalPaymentReceived || 0);
    const pendingAmount = (finance?.quotationAmount || 0) - totalReceived;

    return (
        <div className="space-y-5">
            {/* KPI Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="border rounded-2xl p-4" style={{ backgroundColor: 'rgb(var(--surface-1))', borderColor: 'rgb(var(--border-muted))' }}>
                    <p className="text-[10px] font-700 uppercase tracking-widest mb-1" style={{ color: 'rgb(var(--text-2))' }}>Project Value</p>
                    <p className="text-xl font-700" style={{ color: 'rgb(var(--text-0))' }}>₹{(finance?.quotationAmount || 0).toLocaleString('en-IN')}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'rgb(var(--text-3))' }}>Quotation amount</p>
                </div>
                <div className="border rounded-2xl p-4" style={{ backgroundColor: 'rgb(var(--surface-1))', borderColor: 'rgb(var(--border-muted))' }}>
                    <p className="text-[10px] font-700 uppercase tracking-widest mb-1" style={{ color: 'rgb(var(--text-2))' }}>Amount Received</p>
                    <p className="text-xl font-700" style={{ color: 'rgb(var(--color-success))' }}>₹{totalReceived.toLocaleString('en-IN')}</p>
                    <p className="text-[10px] font-600 mt-0.5" style={{ color: 'rgb(var(--color-warning))' }}>₹{pendingAmount.toLocaleString('en-IN')} pending</p>
                </div>
                <div className="border rounded-2xl p-4" style={{ backgroundColor: 'rgb(var(--surface-1))', borderColor: 'rgb(var(--border-muted))' }}>
                    <p className="text-[10px] font-700 uppercase tracking-widest mb-1" style={{ color: 'rgb(var(--text-2))' }}>Total Expenses</p>
                    <p className="text-xl font-700" style={{ color: 'rgb(var(--color-danger))' }}>₹{(finance?.totalExpenses || 0).toLocaleString('en-IN')}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'rgb(var(--text-3))' }}>All costs combined</p>
                </div>
                <div className="border rounded-2xl p-4" style={{ backgroundColor: profitBg, borderColor: isProfit ? 'rgb(var(--color-success)/0.3)' : 'rgb(var(--color-danger)/0.3)' }}>
                    <p className="text-[10px] font-700 uppercase tracking-widest mb-1" style={{ color: 'rgb(var(--text-2))' }}>Net Profit</p>
                    <p className="text-xl font-700" style={{ color: profitColor }}>{isProfit ? '+' : ''}₹{(finance?.grossProfit || 0).toLocaleString('en-IN')}</p>
                    <p className="text-[10px] font-700 mt-0.5" style={{ color: profitColor }}>
                        {isProfit ? <TrendingUp size={10} className="inline mr-1" /> : <TrendingDown size={10} className="inline mr-1" />}
                        {(finance?.profitMargin || 0).toFixed(1)}% margin
                    </p>
                </div>
            </div>

            {/* Income & Expenses Edit Section */}
            <div className="border rounded-2xl overflow-hidden" style={{ backgroundColor: 'rgb(var(--surface-1))', borderColor: 'rgb(var(--border-muted))' }}>
                <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'rgb(var(--border-muted))' }}>
                    <h3 className="text-sm font-700 flex items-center gap-2" style={{ color: 'rgb(var(--text-0))' }}>
                        <IndianRupee size={15} style={{ color: 'rgb(var(--accent))' }} /> Budget & Expenses
                    </h3>
                    {!editMode ? (
                        <button onClick={() => setEditMode(true)} className="crm-btn-secondary text-[11px]" style={{ padding: '0.2rem 0.5rem' }}><Edit3 size={12} /> Edit Budget</button>
                    ) : (
                        <div className="flex gap-2">
                            <button onClick={() => setEditMode(false)} className="p-1 rounded text-[11px] font-600 hover:bg-black/5"><X size={12} /></button>
                            <button onClick={handleSave} disabled={saving} className="crm-btn-primary text-[11px]" style={{ padding: '0.2rem 0.5rem' }}>{saving ? <LoadingSpinner size="sm" /> : <Save size={12} />} Save</button>
                        </div>
                    )}
                </div>

                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-3">
                        <p className="text-[10px] font-700 uppercase tracking-widest border-b pb-1" style={{ color: 'rgb(var(--color-success))', borderColor: 'rgb(var(--color-success)/0.2)' }}>💰 Income</p>
                        {[
                            { label: 'Quotation / Project Value (₹)', key: 'quotationAmount', color: 'rgb(var(--text-0))' },
                            { label: 'Advance Received (₹)', key: 'advanceReceived', color: 'rgb(var(--color-success))' },
                            { label: 'Final Payment Received (₹)', key: 'finalPaymentReceived', color: 'rgb(var(--color-success))' }
                        ].map(field => (
                            <div key={field.key}>
                                <label className="block text-[10px] font-600 mb-1" style={{ color: 'rgb(var(--text-2))' }}>{field.label}</label>
                                {editMode ? (
                                    <input type="number" min="0" value={(editData as any)[field.key]} onChange={e => setEditData(prev => ({ ...prev, [field.key]: Number(e.target.value) }))} style={inputStyle} />
                                ) : (
                                    <p className="text-sm font-700" style={{ color: field.color }}>₹{((finance as any)?.[field.key] || 0).toLocaleString('en-IN')}</p>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="space-y-3">
                        <p className="text-[10px] font-700 uppercase tracking-widest border-b pb-1" style={{ color: 'rgb(var(--color-danger))', borderColor: 'rgb(var(--color-danger)/0.2)' }}>🧾 Expenses</p>
                        <div>
                            <label className="block text-[10px] font-600 mb-1" style={{ color: 'rgb(var(--text-2))' }}>Material Cost (₹) — Auto</label>
                            <p className="text-sm font-700" style={{ color: 'rgb(var(--color-danger))' }}>₹{(finance?.materialCost || 0).toLocaleString('en-IN')} <span className="text-[10px] font-500">(auto-updated)</span></p>
                        </div>
                        {[
                            { label: 'Labor Cost (₹)', key: 'laborCost' }, { label: 'Transport Cost (₹)', key: 'transportCost' },
                            { label: 'Electrician Cost (₹)', key: 'electricianCost' }, { label: 'Other Expenses (₹)', key: 'otherExpenses' }
                        ].map(field => (
                            <div key={field.key}>
                                <label className="block text-[10px] font-600 mb-1" style={{ color: 'rgb(var(--text-2))' }}>{field.label}</label>
                                {editMode ? (
                                    <input type="number" min="0" value={(editData as any)[field.key]} onChange={e => setEditData(prev => ({ ...prev, [field.key]: Number(e.target.value) }))} style={inputStyle} />
                                ) : (
                                    <p className="text-sm font-700" style={{ color: 'rgb(var(--color-danger))' }}>₹{((finance as any)?.[field.key] || 0).toLocaleString('en-IN')}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {editMode && (
                    <div className="px-5 pb-5">
                        <label className="block text-[10px] font-600 mb-1" style={{ color: 'rgb(var(--text-2))' }}>Notes</label>
                        <textarea rows={2} value={editData.notes} onChange={e => setEditData(prev => ({ ...prev, notes: e.target.value }))} placeholder="Additional notes..." style={inputStyle} />
                    </div>
                )}
            </div>

            {/* Expense Log */}
            <div className="border rounded-2xl overflow-hidden" style={{ backgroundColor: 'rgb(var(--surface-1))', borderColor: 'rgb(var(--border-muted))' }}>
                <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'rgb(var(--border-muted))' }}>
                    <h3 className="text-sm font-700 flex items-center gap-2" style={{ color: 'rgb(var(--text-0))' }}>
                        <FileText size={15} style={{ color: 'rgb(var(--color-warning))' }} /> Expense Ledger
                        <span className="text-[10px] px-2 py-0.5 rounded font-mono" style={{ backgroundColor: 'rgb(var(--color-warning)/0.1)', color: 'rgb(var(--color-warning))' }}>{expenses.length} entries</span>
                    </h3>
                    <button onClick={() => setAddExpenseOpen(!addExpenseOpen)} className="crm-btn-secondary text-[11px]" style={{ padding: '0.2rem 0.5rem' }}><Plus size={12} /> Add Expense</button>
                </div>

                {addExpenseOpen && (
                    <form onSubmit={handleAddExpense} className="p-4 border-b" style={{ backgroundColor: 'rgb(var(--surface-2))', borderColor: 'rgb(var(--border-muted))' }}>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            <div>
                                <label className="block text-[10px] font-600 mb-1" style={{ color: 'rgb(var(--text-2))' }}>Type</label>
                                <select value={newExpense.expenseType} onChange={e => setNewExpense(prev => ({ ...prev, expenseType: e.target.value }))} style={inputStyle}>
                                    {EXPENSE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-600 mb-1" style={{ color: 'rgb(var(--text-2))' }}>Description *</label>
                                <input required value={newExpense.description} onChange={e => setNewExpense(prev => ({ ...prev, description: e.target.value }))} style={inputStyle} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-600 mb-1" style={{ color: 'rgb(var(--text-2))' }}>Amount (₹) *</label>
                                <input required type="number" min="1" value={newExpense.amount} onChange={e => setNewExpense(prev => ({ ...prev, amount: e.target.value }))} style={inputStyle} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-600 mb-1" style={{ color: 'rgb(var(--text-2))' }}>Paid To</label>
                                <input value={newExpense.paidTo} onChange={e => setNewExpense(prev => ({ ...prev, paidTo: e.target.value }))} style={inputStyle} />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-3">
                            <button type="button" onClick={() => setAddExpenseOpen(false)} className="p-1 rounded text-xs font-600 hover:bg-black/5" style={{ color: 'rgb(var(--text-2))' }}>Cancel</button>
                            <button type="submit" className="crm-btn-primary text-xs" style={{ padding: '0.2rem 0.7rem' }}>+ Add Expense</button>
                        </div>
                    </form>
                )}

                {expenses.length === 0 ? (
                    <div className="p-8 text-center" style={{ color: 'rgb(var(--text-3))' }}>
                        <FileText size={32} className="mx-auto mb-2 opacity-30" />
                        <p className="text-xs">No expenses logged yet.</p>
                    </div>
                ) : (
                    <div className="divide-y" style={{ borderColor: 'rgb(var(--border-muted))' }}>
                        {expenses.map(exp => (
                            <div key={exp.id} className="flex items-center gap-3 px-5 py-3 hover:bg-[rgb(var(--surface-2))] transition-colors">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] px-2 py-0.5 rounded-full font-700" style={{ backgroundColor: 'rgb(var(--color-warning)/0.1)', color: 'rgb(var(--color-warning))' }}>{exp.expenseType}</span>
                                        <span className="text-xs font-600" style={{ color: 'rgb(var(--text-0))' }}>{exp.description}</span>
                                    </div>
                                    <p className="text-[10px] mt-0.5" style={{ color: 'rgb(var(--text-2))' }}>
                                        {exp.paidTo && `Paid to: ${exp.paidTo} • `}{exp.date} • Added by {exp.addedBy}
                                    </p>
                                </div>
                                <p className="text-sm font-700" style={{ color: 'rgb(var(--color-danger))' }}>₹{exp.amount.toLocaleString('en-IN')}</p>
                                <button onClick={() => handleDeleteExpense(exp.id)} className="p-1 rounded text-red-400 hover:bg-red-500/10 ml-2"><Trash2 size={13} /></button>
                            </div>
                        ))}
                        <div className="flex items-center justify-between px-5 py-3 border-t" style={{ backgroundColor: 'rgb(var(--color-danger)/0.05)', borderColor: 'rgb(var(--color-danger)/0.2)' }}>
                            <span className="text-xs font-700 uppercase" style={{ color: 'rgb(var(--text-2))' }}>Total Manual Expenses</span>
                            <span className="text-base font-700" style={{ color: 'rgb(var(--color-danger))' }}>₹{expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                )}
            </div>
            {finance?.notes && <div className="text-[11px] italic px-2" style={{ color: 'rgb(var(--text-2))' }}>📝 {finance.notes}</div>}
        </div>
    );
};

export default LeadFinanceTab;
