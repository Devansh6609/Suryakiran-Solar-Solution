import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface FullScreenLoaderProps {
    message?: string;
}

const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({ message = 'Loading...' }) => {
    return (
        <div className="fixed inset-0 bg-night-sky/80 backdrop-blur-sm flex flex-col items-center justify-center z-[100]" aria-live="polite" aria-busy="true">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-lg text-text-secondary">{message}</p>
        </div>
    );
};

export default FullScreenLoader;
