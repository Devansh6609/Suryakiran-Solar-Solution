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
        const headers = "name,email,phone,productType,pipelineStage,source,bill,energyCost,pumpHP,waterSource,propertyStatus,roofType,state,district,pincode";
        const blob = new Blob([headers], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "leads_template.csv");
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

        const formData = new FormData();
        formData.append('leadsCsv', file);

        try {
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white dark:bg-glass-surface border border-gray-200 dark:border-glass-border p-8 rounded-xl shadow-2xl w-full max-w-lg">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-text-primary">Import Leads from CSV</h3>

                {importResult ? (
                    <div>
                        <h4 className="font-semibold text-primary-green">Import Complete!</h4>
                        <p className="text-gray-600 dark:text-text-secondary mt-2">Successfully imported: {importResult.successCount} leads.</p>
                        {importResult.errorCount > 0 && (
                            <div className="mt-4">
                                <p className="text-error-red">Failed rows: {importResult.errorCount}.</p>
                                <ul className="text-xs list-disc list-inside text-gray-500 dark:text-text-muted max-h-24 overflow-y-auto mt-2">
                                    {importResult.errors.map((err, i) => <li key={i}>{err}</li>)}
                                </ul>
                            </div>
                        )}
                        <div className="flex justify-end mt-6">
                            <button onClick={onImportComplete} className="py-2 px-4 bg-accent-blue text-white font-semibold rounded-lg hover:bg-accent-blue-hover transition-colors">Done</button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="mb-4 text-sm text-gray-600 dark:text-text-secondary space-y-2">
                            <p>Upload a CSV file with your lead data. The file must contain a header row with the correct column names.</p>
                            <p>Required columns: <strong>name, email, productType</strong>.</p>
                            <p>The <strong>productType</strong> must be either 'rooftop' or 'pump'.</p>
                            <button onClick={handleDownloadTemplate} className="text-accent-blue hover:underline font-semibold">Download CSV Template</button>
                        </div>

                        <div
                            className={`mt-4 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${error ? 'border-error-red' : 'border-gray-300 dark:border-glass-border'}`}
                            onDragOver={e => e.preventDefault()}
                            onDrop={e => {
                                e.preventDefault();
                                fileInputRef.current && (fileInputRef.current.files = e.dataTransfer.files);
                                handleFileChange({ target: fileInputRef.current } as any);
                            }}
                        >
                            <div className="space-y-1 text-center">
                                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
                                <div className="flex text-sm text-gray-600 dark:text-text-secondary">
                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-secondary-background rounded-md font-medium text-accent-blue hover:text-accent-blue-hover focus-within:outline-none">
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

                        {error && <p className="text-error-red text-sm mt-2">{error}</p>}

                        <div className="flex justify-end space-x-4 pt-6">
                            <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-text-primary dark:hover:bg-gray-500 transition-colors">Cancel</button>
                            <button onClick={handleImport} disabled={isLoading || !file} className="py-2 px-4 w-40 flex items-center justify-center bg-accent-blue text-white font-semibold rounded-lg hover:bg-accent-blue-hover transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
                                {isLoading ? (
                                    <>
                                        <LoadingSpinner size="sm" className="mr-2 !text-white" />
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