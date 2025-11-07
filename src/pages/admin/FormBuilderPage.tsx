import React, { useState, useEffect } from 'react';
import * as adminService from '../../service/adminService';
import { FormSchema, FormField, CalculatorType } from '../../types';
import FormFieldEditor from '../../components/admin/FormFieldEditor';
import LoadingSpinner from '../../components/LoadingSpinner.tsx';
import Card from '../../components/admin/Card.tsx';

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
        adminService.getFormSchema(formType)
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
        if (editingField) { // Editing existing field
            setFields(fields.map(f => f.id === field.id ? field : f));
        } else { // Adding new field
            setFields([...fields, field]);
        }
        setIsEditorOpen(false);
        setEditingField(null);
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);
        setError(null);
        try {
            await adminService.updateFormSchema(formType, fields);
            alert(`${title} form saved successfully!`);
        } catch (err) {
            setError(`Failed to save ${title} form.`);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card>
            <h3 className="text-xl font-bold text-gray-900 dark:text-text-light mb-4 border-b border-gray-200 dark:border-border-color pb-2">{title} Form Fields</h3>
            {loading && (
                <div className="flex justify-center p-8">
                    <LoadingSpinner />
                </div>
            )}
            {error && <p className="text-error-red">{error}</p>}
            {!loading && (
                <div className="space-y-3">
                    {fields.map((field, index) => (
                        <div key={field.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-primary-background rounded-md">
                            <div>
                                <p className="font-semibold text-gray-800 dark:text-text-light">{field.label} <span className="text-xs text-gray-500 dark:text-text-muted">({field.type})</span></p>
                                <p className="text-sm text-gray-600 dark:text-text-muted">Name: <code>{field.name}</code> {field.required && <span className="text-error-red">*</span>}</p>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-500 dark:text-text-muted">
                                <button onClick={() => handleMove(index, 'up')} disabled={index === 0} className="p-1 disabled:opacity-30 hover:text-gray-900 dark:hover:text-text-light">↑</button>
                                <button onClick={() => handleMove(index, 'down')} disabled={index === fields.length - 1} className="p-1 disabled:opacity-30 hover:text-gray-900 dark:hover:text-text-light">↓</button>
                                <button onClick={() => { setEditingField(field); setIsEditorOpen(true); }} className="text-sm text-accent-blue hover:underline">Edit</button>
                                <button onClick={() => handleDelete(field.id)} className="text-sm text-error-red hover:underline">Delete</button>
                            </div>
                        </div>
                    ))}
                    <button onClick={() => { setEditingField(null); setIsEditorOpen(true); }} className="w-full mt-4 bg-secondary-cyan/10 text-secondary-cyan font-semibold py-2 rounded-md hover:bg-secondary-cyan/20 dark:bg-secondary-cyan/20 dark:hover:bg-secondary-cyan/30">
                        + Add New Field
                    </button>
                </div>
            )}
            <button onClick={handleSaveChanges} disabled={isSaving || loading} className="w-full mt-6 flex items-center justify-center bg-accent-blue text-white font-bold py-3 rounded-lg hover:bg-accent-blue-hover transition-colors disabled:bg-gray-500">
                {isSaving ? (
                    <>
                        <LoadingSpinner size="sm" className="mr-2 !text-white" />
                        Saving...
                    </>
                ) : 'Save Changes'}
            </button>
            {isEditorOpen && (
                <FormFieldEditor
                    field={editingField}
                    onSave={handleSaveField}
                    onClose={() => { setIsEditorOpen(false); setEditingField(null); }}
                />
            )}
        </Card>
    );
};


const FormBuilderPage: React.FC = () => {
    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-text-light mb-6">Calculator Form Builder</h2>
            <p className="mb-6 text-gray-600 dark:text-text-muted">
                Customize the fields that appear on your public-facing calculator pages. Changes saved here will be reflected on your website immediately.
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <FormSection title="Rooftop Solar" formType={CalculatorType.Rooftop} />
                <FormSection title="Solar Pump" formType={CalculatorType.Pump} />
            </div>
        </div>
    );
};

export default FormBuilderPage;