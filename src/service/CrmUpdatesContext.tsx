import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';

interface CrmUpdatesContextType {
    lastUpdate: number; // A timestamp to trigger updates
    triggerUpdate: () => void;
}

const CrmUpdatesContext = createContext<CrmUpdatesContextType | undefined>(undefined);

export const CrmUpdatesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [lastUpdate, setLastUpdate] = useState(Date.now());

    const triggerUpdate = useCallback(() => {
        setLastUpdate(Date.now());
    }, []);

    return (
        <CrmUpdatesContext.Provider value={{ lastUpdate, triggerUpdate }}>
            {children}
        </CrmUpdatesContext.Provider>
    );
};

export const useCrmUpdates = () => {
    const context = useContext(CrmUpdatesContext);
    if (context === undefined) {
        throw new Error('useCrmUpdates must be used within a CrmUpdatesProvider');
    }
    return context;
};
