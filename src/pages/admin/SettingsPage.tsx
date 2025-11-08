import React, { useState, useEffect, FormEvent } from 'react';
import { getSettings, updateSettings } from '../../service/adminService';
import Card from '../../components/admin/Card.tsx';
import ThemeToggle from '../../components/admin/ThemeToggle.tsx';
import LoadingSpinner from '../../components/LoadingSpinner.tsx';

const SettingsPage: React.FC = () => {
    const [apiKey, setApiKey] = useState('');
    const [apiKeyIsSet, setApiKeyIsSet] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                setIsLoading(true);
                const settings = await getSettings();
                setApiKeyIsSet(settings.apiKeyIsSet);
            } catch (err) {
                setError('Failed to load settings status.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!apiKey) {
            setError('API Key cannot be empty.');
            return;
        }
        setIsSaving(true);
        setError(null);
        setSuccessMessage(null);
        try {
            await updateSettings(apiKey);
            setSuccessMessage('API Key saved successfully! AI features are now active.');
            setApiKeyIsSet(true);
            setApiKey(''); // Clear the input field for security
        } catch (err) {
            setError('Failed to save API Key. Please check the key and try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-text-light mb-6">Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-text-light mb-4 border-b border-gray-200 dark:border-border-color pb-2">Gemini API Configuration</h3>

                    {isLoading && (
                        <div className="flex justify-center p-8">
                            <LoadingSpinner />
                        </div>
                    )}

                    {!isLoading && (
                        <>
                            <div className="mb-4">
                                <p className="text-sm font-medium text-gray-500 dark:text-text-muted">API Key Status:</p>
                                {apiKeyIsSet ? (
                                    <span className="text-success-green font-bold bg-success-green/20 px-2 py-1 rounded-md">Configured</span>
                                ) : (
                                    <span className="text-error-red font-bold bg-error-red/20 px-2 py-1 rounded-md">Not Configured</span>
                                )}
                                <p className="text-xs text-gray-500 dark:text-text-muted mt-2">
                                    AI-powered features like lead summaries will be disabled until a valid API key is provided.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="apiKey" className="block text-sm font-medium text-gray-500 dark:text-text-muted">
                                        {apiKeyIsSet ? 'Update Gemini API Key' : 'Enter Gemini API Key'}
                                    </label>
                                    <input
                                        type="password"
                                        id="apiKey"
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-primary-background border border-gray-300 dark:border-border-color rounded-lg shadow-sm placeholder-gray-500 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"
                                        placeholder="Enter your new API key here"
                                    />
                                </div>

                                {error && <p className="text-error-red text-sm">{error}</p>}
                                {successMessage && <p className="text-success-green text-sm">{successMessage}</p>}

                                <div>
                                    <button
                                        type="submit"
                                        disabled={isSaving || isLoading}
                                        className="w-full flex justify-center items-center font-bold bg-accent-blue text-white py-3 px-4 rounded-lg shadow-lg hover:bg-accent-blue-hover transition-colors duration-300 disabled:bg-gray-500"
                                    >
                                        {isSaving ? (
                                            <>
                                                <LoadingSpinner size="sm" className="mr-2 !text-white" />
                                                Saving...
                                            </>
                                        ) : 'Save API Key'}
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </Card>
                <Card>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-text-light mb-4 border-b border-gray-200 dark:border-border-color pb-2">User Preferences</h3>
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-500 dark:text-text-muted">Theme</span>
                        <ThemeToggle />
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default SettingsPage;