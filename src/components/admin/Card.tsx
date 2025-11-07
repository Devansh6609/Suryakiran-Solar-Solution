import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
    return (
        <div className={`
            bg-white dark:bg-glass-surface dark:backdrop-blur-lg 
            border border-gray-200 dark:border-glass-border 
            rounded-xl shadow-lg dark:shadow-black/20 
            p-6 transition-all duration-300
            hover:-translate-y-1 hover:shadow-xl
            dark:hover:border-glow-cyan/50 dark:hover:shadow-glow-sm dark:hover:shadow-glow-cyan/20
            ${className}
        `}>
            {children}
        </div>
    );
};

export default Card;