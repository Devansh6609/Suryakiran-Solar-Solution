import React from 'react';
import { Skeleton } from './Skeleton';

export const DetailSkeleton: React.FC = () => {
    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-100px)] gap-6 animate-pulse">
            {/* Left Sidebar (Tabs/Nav) */}
            <div className="w-full md:w-64 flex-shrink-0 space-y-3">
                <Skeleton width="100%" height="40px" className="mb-6" />
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} width="100%" height="48px" />
                ))}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-full crm-card p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-8 pb-6 border-b" style={{ borderColor: 'rgb(var(--border-muted))' }}>
                    <div className="space-y-3 w-1/2">
                        <Skeleton width="40%" height="2rem" />
                        <Skeleton width="60%" height="1rem" />
                    </div>
                    <div className="flex gap-3">
                        <Skeleton width="100px" height="36px" />
                        <Skeleton width="120px" height="36px" />
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 overflow-y-auto pr-2">
                    {/* Section 1 */}
                    <div className="space-y-6">
                        <Skeleton width="30%" height="1.5rem" />
                        <div className="space-y-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="flex flex-col gap-1">
                                    <Skeleton width="25%" height="0.875rem" />
                                    <Skeleton width="80%" height="1.25rem" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Section 2 */}
                    <div className="space-y-6">
                        <Skeleton width="30%" height="1.5rem" />
                        <div className="crm-card p-4 space-y-4 border-dashed" style={{ backgroundColor: 'transparent' }}>
                            <Skeleton width="100%" height="4rem" />
                            <Skeleton width="100%" height="4rem" />
                        </div>
                    </div>
                    
                    {/* Full width section */}
                    <div className="lg:col-span-2 space-y-6 mt-4">
                        <Skeleton width="20%" height="1.5rem" />
                        <Skeleton width="100%" height="200px" />
                    </div>
                </div>
            </div>
        </div>
    );
};
