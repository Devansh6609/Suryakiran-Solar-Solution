import React from 'react';
import { Skeleton } from './Skeleton';

export const DashboardSkeleton: React.FC = () => {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="crm-card p-6 h-[120px] flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <Skeleton width="40%" height="1rem" />
                            <Skeleton width="32px" height="32px" circle />
                        </div>
                        <Skeleton width="60%" height="2rem" />
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="crm-card p-6 lg:col-span-2 h-[400px] flex flex-col">
                    <Skeleton width="30%" height="1.5rem" className="mb-6" />
                    <Skeleton width="100%" height="100%" className="flex-1" />
                </div>
                <div className="crm-card p-6 h-[400px] flex flex-col">
                    <Skeleton width="40%" height="1.5rem" className="mb-6" />
                    <Skeleton width="100%" height="100%" className="flex-1" circle />
                </div>
            </div>

            {/* Bottom Table */}
            <div className="crm-card p-6 h-[300px]">
                <Skeleton width="20%" height="1.5rem" className="mb-6" />
                <div className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} width="100%" height="2.5rem" />
                    ))}
                </div>
            </div>
        </div>
    );
};
