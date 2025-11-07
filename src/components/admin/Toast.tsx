import React, { useState, useEffect } from 'react';

interface ToastProps {
    message: string;
    type: 'success' | 'info';
    onDismiss: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss();
        }, 4000); // Auto-dismiss after 4 seconds

        return () => clearTimeout(timer);
    }, [onDismiss]);

    const colors = {
        success: 'bg-green-500',
        info: 'bg-blue-500',
    }

    return (
        <div className={`fixed bottom-5 right-5 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in ${colors[type]}`}>
            <div className="flex items-center">
                <span>{message}</span>
                <button onClick={onDismiss} className="ml-4 text-xl font-semibold">&times;</button>
            </div>
        </div>
    );
};

export default Toast;
