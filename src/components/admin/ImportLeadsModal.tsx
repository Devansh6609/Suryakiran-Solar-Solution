import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { importLeads } from '../../service/adminService';
import LoadingSpinner from '../LoadingSpinner';

interface ImportLeadsModalProps {
    onClose: () => void;
    onImportComplete: () => void;
}

interface ImportResult {
    successCount: number;
    errorCount: number;
    errors: string[];
}

const ImportLeadsModal: React.FC<ImportLeadsModalProps> = ({ onClose, onImportComplete }) => {
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [importResult, setImportResult] = useState<ImportResult | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && selectedFile.type === "text/csv") {
            setFile(selectedFile);
            setError(null);
        } else {
            setFile(null);
            setError("Please select a valid .csv file.");
        }
    };

    const handleDownloadTemplate = () => {
        const headers = "Name,Email,Phone,Product,Vendor,Stage,Amount";
        const sampleRow = "John Doe,john@example.com,9876543210,rooftop,Unassigned,New Lead,5000";
        const blob = new Blob([`${headers}\n${sampleRow}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "leads_import_template.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImport = async () => {
        if (!file) {
            setError("Please select a file to import.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setImportResult(null);

        try {
            // Frontend Adapter: Parse and Transform CSV
            const text = await file.text();
            const rows = text.split('\n').map(row => row.trim()).filter(row => row);

            if (rows.length < 2) throw new Error("CSV file is empty or missing data.");

            // Backend expects: name,email,phone,productType,pipelineStage,source,bill,energyCost,...
            // We map: 
            // Name -> name
            // Email -> email
            // Phone -> phone
            // Product -> productType
            // Stage -> pipelineStage
            // Amount -> bill (if rooftop) OR energyCost (if pump)
            // Vendor -> (Ignored for now as bulk assign is separate, or we could try to map if backend supports it)

            const backendHeaders = "name,email,phone,productType,pipelineStage,bill,energyCost";
            const transformedRows = [backendHeaders];

            // Skip header row (index 0)
            for (let i = 1; i < rows.length; i++) {
                // Simple CSV parse (handling quotes basic)
                // Note: This is a basic parser. For robust parsing, a library is better, but keeping it simple for now.
                // Assuming no commas IN fields for this simple implementation or standard "split" if user follows template.
                // Removing quotes if present.
                const cols = rows[i].split(',').map(c => c.replace(/^"|"$/g, '').trim());

                // Map columns based on the simple template: Name(0), Email(1), Phone(2), Product(3), Vendor(4), Stage(5), Amount(6)
                if (cols.length < 7) continue; // Skip invalid rows

                const [name, email, phone, product, vendor, stage, amount] = cols;
                const productType = product.toLowerCase();

                let bill = '';
                let energyCost = '';

                if (productType === 'rooftop') {
                    bill = amount;
                } else if (productType === 'pump') {
                    energyCost = amount;
                }

                // Construct backend row matching backendHeaders order
                const newRow = [
                    `"${name}"`,
                    `"${email}"`,
                    `"${phone}"`,
                    `"${productType}"`,
                    `"${stage}"`, // pipelineStage
                    `"${bill}"`,
                    `"${energyCost}"`
                ].join(',');

                transformedRows.push(newRow);
            }

            const transformedCsvContent = transformedRows.join('\n');
            const transformedBlob = new Blob([transformedCsvContent], { type: 'text/csv' });
            const transformedFile = new File([transformedBlob], "transformed_leads.csv", { type: "text/csv" });

            const formData = new FormData();
            formData.append('leadsCsv', transformedFile);

            const result = await importLeads(formData);
            setImportResult(result);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred during import.');
        } finally {
            setIsLoading(false);
        }
    };

    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md anim-fade-in overflow-y-auto">
            <div className="crm-card relative w-full max-w-lg flex flex-col overflow-hidden shadow-2xl p-6 max-h-[90vh]">
                <h3 className="text-xl font-700 mb-4" style={{ color: 'rgb(var(--text-0))' }}>Import Leads from CSV</h3>

                {importResult ? (
                    <div>
                        <h4 className="font-600 text-green-500">Import Complete!</h4>
                        <p className="text-sm mt-2" style={{ color: 'rgb(var(--text-2))' }}>Successfully imported: {importResult.successCount} leads.</p>
                        {importResult.errorCount > 0 && (
                            <div className="mt-4">
                                <p className="text-red-500 text-sm">Failed rows: {importResult.errorCount}.</p>
                                <ul className="text-xs list-disc list-inside max-h-24 overflow-y-auto mt-2" style={{ color: 'rgb(var(--text-3))' }}>
                                    {importResult.errors.map((err, i) => <li key={i}>{err}</li>)}
                                </ul>
                            </div>
                        )}
                        <div className="flex justify-end mt-6">
                            <button onClick={onImportComplete} className="crm-btn-primary py-2 px-5">Done</button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="mb-4 text-sm space-y-2" style={{ color: 'rgb(var(--text-2))' }}>
                            <p>Upload a CSV file with your lead data. The file must contain a header row with the correct column names.</p>
                            <p>Required columns: <strong>name, email, productType</strong>.</p>
                            <p>The <strong>productType</strong> must be either 'rooftop' or 'pump'.</p>
                            <button onClick={handleDownloadTemplate} className="font-600 hover:underline" style={{ color: 'rgb(var(--accent))' }}>Download CSV Template</button>
                        </div>

                        <div
                            className={`mt-4 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors ${error ? 'border-red-500/50 bg-red-500/5' : 'border-[rgb(var(--border-muted))]'}`}
                            onDragOver={e => e.preventDefault()}
                            onDrop={e => {
                                e.preventDefault();
                                fileInputRef.current && (fileInputRef.current.files = e.dataTransfer.files);
                                handleFileChange({ target: fileInputRef.current } as any);
                            }}
                            style={{ backgroundColor: error ? undefined : 'rgb(var(--surface-1))' }}
                        >
                            <div className="space-y-1 text-center">
                                <svg className="mx-auto h-12 w-12 text-[rgb(var(--text-3))]" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
                                <div className="flex text-sm text-[rgb(var(--text-2))] mt-2">
                                    <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium hover:underline focus-within:outline-none" style={{ color: 'rgb(var(--accent))' }}>
                                        <span>Upload a file</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" ref={fileInputRef} onChange={handleFileChange} accept=".csv" />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                {file ? (
                                    <p className="text-xs text-primary-green">{file.name}</p>
                                ) : (
                                    <p className="text-xs text-gray-500">CSV up to 10MB</p>
                                )}
                            </div>
                        </div>

                        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

                        <div className="flex justify-end space-x-3 pt-6 mt-4 border-t border-[rgb(var(--border-muted))]">
                            <button type="button" onClick={onClose} className="crm-btn-secondary py-2 px-5 text-sm">Cancel</button>
                            <button onClick={handleImport} disabled={isLoading || !file} className="crm-btn-primary py-2 px-5 w-40 flex items-center justify-center text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                                {isLoading ? (
                                    <>
                                        <LoadingSpinner size="sm" className="mr-2" />
                                        Importing...
                                    </>
                                ) : 'Upload and Import'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>,
        modalRoot
    );
};

export default ImportLeadsModal;