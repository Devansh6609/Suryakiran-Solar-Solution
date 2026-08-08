import React, { useState, useEffect } from 'react';
import { getFormSchema, updateFormSchema } from '../../service/adminService';
import { FormSchema, FormField, CalculatorType } from '../../types';
import FormFieldEditor from '../../components/admin/FormFieldEditor';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Settings, Plus, Save, ChevronUp, ChevronDown, Edit2, Trash2, GripVertical, Settings2 } from 'lucide-react';

const FormSection: React.FC<{
    title: string;
    formType: CalculatorType;
}> = ({ title, formType }) => {
    const [fields, setFields] = useState<FormSchema>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingField, setEditingField] = useState<FormField | null>(null);

    useEffect(() => {
        getFormSchema(formType)
            .then(data => setFields(data))
            .catch(() => setError(`Failed to load ${title} form.`))
            .finally(() => setLoading(false));
    }, [formType, title]);

    const handleMove = (index: number, direction: 'up' | 'down') => {
        const newFields = [...fields];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newFields.length) return;
        [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
        setFields(newFields);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this field?')) {
            setFields(fields.filter(f => f.id !== id));
        }
    };

    const handleSaveField = (field: FormField) => {
        if (editingField) {
            setFields(fields.map(f => f.id === field.id ? field : f));
        } else {
            setFields([...fields, field]);
        }
        setIsEditorOpen(false);
        setEditingField(null);
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);
        setError(null);
        try {
            await updateFormSchema(formType, fields);
            alert(`${title} form saved successfully!`);
        } catch (err) {
            setError(`Failed to save ${title} form.`);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="crm-card flex flex-col h-full relative overflow-hidden">
            <div className="p-4 md:p-6 border-b flex items-center justify-between" style={{ borderColor: 'rgb(var(--border-muted))' }}>
                <h3 className="text-lg font-700 flex items-center gap-2" style={{ color: 'rgb(var(--text-0))' }}>
                    <Settings2 size={18} style={{ color: 'rgb(var(--accent))' }} />
                    {title} Form
                </h3>
            </div>

            <div className="p-4 md:p-6 flex-grow flex flex-col relative z-10 bg-[rgb(var(--surface-0))]">
                {loading && (
                    <div className="flex justify-center p-8">
                        <LoadingSpinner size="lg" />
                    </div>
                )}
                {error && <p className="text-sm font-600 text-center p-4 mb-4 rounded-lg" style={{ color: 'rgb(var(--color-danger))', backgroundColor: 'rgb(var(--color-danger)/0.1)' }}>{error}</p>}

                {!loading && (
                    <div className="space-y-3 flex-grow">
                        {fields.map((field, index) => (
                            <div key={field.id} className="group flex items-center gap-3 p-3 bg-[rgb(var(--surface-1))] border border-[rgb(var(--border-default))] rounded-xl transition-all hover:border-[rgb(var(--accent))]">
                                <div className="cursor-grab active:cursor-grabbing text-[rgb(var(--text-3))]">
                                    <GripVertical size={16} />
                                </div>
                                <div className="flex-grow min-w-0">
                                    <p className="font-600 text-sm truncate flex items-center gap-2" style={{ color: 'rgb(var(--text-0))' }}>
                                        {field.label}
                                        {field.required && <span style={{ color: 'rgb(var(--color-danger))' }}>*</span>}
                                        <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-700 ml-2" style={{ backgroundColor: 'rgb(var(--surface-2))', color: 'rgb(var(--text-2))' }}>
                                            {field.type}
                                        </span>
                                    </p>
                                    <p className="text-xs font-500 font-mono truncate mt-1" style={{ color: 'rgb(var(--text-3))' }}>name: "{field.name}"</p>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="flex flex-col border-r pr-2 mr-1" style={{ borderColor: 'rgb(var(--border-muted))' }}>
                                        <button onClick={() => handleMove(index, 'up')} disabled={index === 0} className="p-0.5 disabled:opacity-20 transition-colors" style={{ color: 'rgb(var(--text-2))' }} title="Move Up">
                                            <ChevronUp size={14} />
                                        </button>
                                        <button onClick={() => handleMove(index, 'down')} disabled={index === fields.length - 1} className="p-0.5 mt-0.5 disabled:opacity-20 transition-colors" style={{ color: 'rgb(var(--text-2))' }} title="Move Down">
                                            <ChevronDown size={14} />
                                        </button>
                                    </div>
                                    <button onClick={() => { setEditingField(field); setIsEditorOpen(true); }} className="p-1.5 rounded-lg transition-colors hover:bg-[rgb(var(--surface-2))]" style={{ color: 'rgb(var(--text-2))' }} title="Edit">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(field.id)} className="p-1.5 rounded-lg transition-colors text-[rgb(var(--color-danger))] hover:bg-[rgb(var(--color-danger)/0.1)]" title="Delete">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}

                        <button onClick={() => { setEditingField(null); setIsEditorOpen(true); }} className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed text-sm font-600 transition-colors" style={{ color: 'rgb(var(--accent))', borderColor: 'rgb(var(--accent)/0.3)', backgroundColor: 'rgb(var(--accent)/0.05)' }}>
                            <Plus size={16} /> ADD NEW FIELD
                        </button>
                    </div>
                )}
            </div>

            <div className="p-4 md:p-6 border-t" style={{ borderColor: 'rgb(var(--border-muted))', backgroundColor: 'rgb(var(--surface-1))' }}>
                <button onClick={handleSaveChanges} disabled={isSaving || loading} className="w-full crm-btn-primary py-2.5 justify-center">
                    {isSaving ? (
                        <>
                            <LoadingSpinner size="sm" />
                            SAVING...
                        </>
                    ) : (
                        <>
                            <Save size={16} />
                            SAVE CHANGES
                        </>
                    )}
                </button>
            </div>

            {isEditorOpen && (
                <FormFieldEditor
                    field={editingField}
                    onSave={handleSaveField}
                    onClose={() => { setIsEditorOpen(false); setEditingField(null); }}
                />
            )}
        </div>
    );
};


const FormBuilderPage: React.FC = () => {
    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-4 anim-fade-up">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div>
                    <div className="flex items-center gap-2 text-xs font-600 mb-0.5" style={{ color: 'rgb(var(--color-warning))' }}>
                        <Settings size={14} /> Configuration
                    </div>
                    <h1 className="text-2xl font-700" style={{ color: 'rgb(var(--text-0))' }}>Form Builder</h1>
                    <p className="text-xs font-500 mt-1" style={{ color: 'rgb(var(--text-2))' }}>Customize public-facing calculators. Changes are published immediately.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                <FormSection title="Rooftop Solar" formType={CalculatorType.Rooftop} />
                <FormSection title="Solar Pump" formType={CalculatorType.Pump} />
            </div>
        </div>
    );
};

export default FormBuilderPage;