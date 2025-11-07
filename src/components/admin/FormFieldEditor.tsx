import React, { useState, useEffect } from 'react';
import { FormField, FormFieldType } from '../../types';

interface FormFieldEditorProps {
    field: FormField | null;
    onSave: (field: FormField) => void;
    onClose: () => void;
}

const FormFieldEditor: React.FC<FormFieldEditorProps> = ({ field, onSave, onClose }) => {
    const [currentField, setCurrentField] = useState<Partial<FormField>>({
        type: 'text',
        required: true,
    });

    useEffect(() => {
        if (field) {
            setCurrentField(field);
        } else {
            setCurrentField({
                id: `field_${Date.now()}`,
                type: 'text',
                name: '',
                label: '',
                required: true,
                placeholder: '',
                options: [],
            });
        }
    }, [field]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            setCurrentField({ ...currentField, [name]: (e.target as HTMLInputElement).checked });
        } else {
            setCurrentField({ ...currentField, [name]: value });
        }
    };

    const handleOptionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const options = e.target.value.split('\n');
        setCurrentField({ ...currentField, options });
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Basic validation
        if (!currentField.name || !currentField.label) {
            alert("Field Name and Label are required.");
            return;
        }
        onSave(currentField as FormField);
    };

    const inputStyles = "mt-1 w-full p-2 border rounded bg-gray-50 border-gray-300 dark:bg-night-sky dark:border-border-color dark:text-text-primary";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-secondary-background p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-text-primary">{field ? 'Edit Field' : 'Add New Field'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-text-secondary">Field Type</label>
                        <select name="type" value={currentField.type} onChange={handleChange} className={inputStyles}>
                            <option value="text">Text</option>
                            <option value="number">Number</option>
                            <option value="select">Select (Dropdown)</option>
                            <option value="email">Email</option>
                            <option value="tel">Telephone</option>
                            <option value="image">Image Upload</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-text-secondary">Label</label>
                        <input type="text" name="label" value={currentField.label || ''} onChange={handleChange} className={inputStyles} placeholder="e.g., Average Monthly Bill" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-text-secondary">Field Name (no spaces)</label>
                        <input type="text" name="name" value={currentField.name || ''} onChange={handleChange} className={inputStyles} placeholder="e.g., avgMonthlyBill" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-text-secondary">Placeholder</label>
                        <input type="text" name="placeholder" value={currentField.placeholder || ''} onChange={handleChange} className={inputStyles} placeholder="Optional hint text" />
                    </div>
                    {currentField.type === 'select' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-text-secondary">Options (one per line)</label>
                            <textarea name="options" value={currentField.options?.join('\n') || ''} onChange={handleOptionsChange} className={inputStyles} rows={4}></textarea>
                        </div>
                    )}
                    <div className="flex items-center">
                        <input type="checkbox" name="required" id="required" checked={currentField.required} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-primary-green focus:ring-primary-green" />
                        <label htmlFor="required" className="ml-2 text-sm font-medium text-gray-700 dark:text-text-secondary">Required Field</label>
                    </div>
                    <div className="flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-text-primary dark:hover:bg-gray-600">Cancel</button>
                        <button type="submit" className="py-2 px-4 bg-primary-green text-white rounded-lg hover:bg-green-800">Save Field</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FormFieldEditor;