import React, { useState } from 'react';

interface FaqItemProps {
    question: string;
    answer: string;
    isOpen: boolean;
    onClick: () => void;
}

const FaqItem: React.FC<FaqItemProps> = ({ question, answer, isOpen, onClick }) => {
    return (
        <div className="border-b border-white/20 py-4">
            <button
                onClick={onClick}
                className="w-full flex justify-between items-center text-left text-lg font-medium text-white focus:outline-none"
                aria-expanded={isOpen}
            >
                <span>{question}</span>
                <svg
                    className={`w-6 h-6 transition-transform duration-300 text-accent-orange ${isOpen ? 'transform rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </button>
            <div
                className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
            >
                <div className="overflow-hidden">
                    <p className="pt-4 text-gray-300">
                        {answer}
                    </p>
                </div>
            </div>
        </div>
    );
};


interface FaqProps {
    faqData: { question: string; answer: string }[];
}

const Faq: React.FC<FaqProps> = ({ faqData }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const handleClick = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="w-full max-w-3xl mx-auto">
            {faqData.map((item, index) => (
                <FaqItem
                    key={index}
                    question={item.question}
                    answer={item.answer}
                    isOpen={openIndex === index}
                    onClick={() => handleClick(index)}
                />
            ))}
        </div>
    );
};

export default Faq;