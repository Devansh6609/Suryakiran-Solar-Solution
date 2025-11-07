import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5;
        const halfPages = Math.floor(maxPagesToShow / 2);

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            let startPage = Math.max(1, currentPage - halfPages);
            let endPage = Math.min(totalPages, currentPage + halfPages);

            if (currentPage - 1 <= halfPages) {
                endPage = maxPagesToShow;
            }
            if (totalPages - currentPage < halfPages) {
                startPage = totalPages - maxPagesToShow + 1;
            }

            if (startPage > 1) {
                pageNumbers.push(1, '...');
            }

            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i);
            }

            if (endPage < totalPages) {
                pageNumbers.push('...', totalPages);
            }
        }

        return pageNumbers;
    };

    const pageNumbers = getPageNumbers();
    if (totalPages <= 1) return null;

    const baseButtonClass = "px-3 py-1 text-sm font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed";

    return (
        <div className="flex items-center justify-center space-x-2 mt-6">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`${baseButtonClass} text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 dark:text-text-muted dark:bg-secondary-background dark:border-border-color dark:hover:bg-primary-background`}
            >
                Previous
            </button>
            {pageNumbers.map((page, index) =>
                typeof page === 'number' ? (
                    <button
                        key={index}
                        onClick={() => onPageChange(page)}
                        className={`${baseButtonClass} border ${currentPage === page
                                ? 'bg-accent-blue text-white border-accent-blue'
                                : 'text-gray-600 bg-white border-gray-300 hover:bg-gray-50 dark:text-text-muted dark:bg-secondary-background dark:border-border-color dark:hover:bg-primary-background'
                            }`}
                    >
                        {page}
                    </button>
                ) : (
                    <span key={index} className="px-3 py-1 text-sm text-gray-500 dark:text-text-muted">
                        {page}
                    </span>
                )
            )}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`${baseButtonClass} text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 dark:text-text-muted dark:bg-secondary-background dark:border-border-color dark:hover:bg-primary-background`}
            >
                Next
            </button>
        </div>
    );
};

export default Pagination;