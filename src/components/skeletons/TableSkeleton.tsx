import React from 'react';
import { Skeleton } from './Skeleton';

export const TableSkeleton: React.FC = () => {
    return (
        <div className="crm-card flex flex-col h-[calc(100vh-220px)] overflow-hidden animate-pulse">
            {/* Table Header */}
            <div className="px-6 py-4 flex gap-4" style={{ backgroundColor: 'rgb(var(--surface-2))' }}>
                <Skeleton width="15%" height="1rem" />
                <Skeleton width="25%" height="1rem" />
                <Skeleton width="20%" height="1rem" />
                <Skeleton width="15%" height="1rem" />
                <Skeleton width="15%" height="1rem" />
                <Skeleton width="10%" height="1rem" />
            </div>

            {/* Table Rows */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex gap-4 items-center py-2 border-b" style={{ borderColor: 'rgb(var(--border-muted))' }}>
                        <Skeleton width="15%" height="1.5rem" />
                        <Skeleton width="25%" height="1.5rem" />
                        <Skeleton width="20%" height="1.5rem" />
                        <Skeleton width="15%" height="1.5rem" />
                        <Skeleton width="15%" height="1.5rem" />
                        <Skeleton width="10%" height="1.5rem" />
                    </div>
                ))}
            </div>
        </div>
    );
};
