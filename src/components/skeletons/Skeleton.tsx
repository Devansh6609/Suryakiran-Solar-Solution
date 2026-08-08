import React from 'react';

interface SkeletonProps {
    width?: string | number;
    height?: string | number;
    className?: string;
    circle?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
    width = '100%', 
    height = '1rem', 
    className = '',
    circle = false
}) => {
    return (
        <div 
            className={`crm-skeleton ${className}`}
            style={{ 
                width, 
                height, 
                borderRadius: circle ? '50%' : undefined 
            }}
        />
    );
};
