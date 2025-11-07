import React from 'react';

interface MarqueeProps {
    texts: string[];
}

const Marquee: React.FC<MarqueeProps> = ({ texts }) => {
    const marqueeContent = texts.map((text, index) => (
        <span key={index} className="mx-8 text-md md:text-lg">{text}</span>
    ));

    return (
        <div className="relative w-full overflow-hidden bg-black/40 backdrop-blur-sm py-4">
            <div className="flex animate-marquee whitespace-nowrap">
                {marqueeContent}
                {/* This duplicate is for the animation to work seamlessly */}
                {marqueeContent}
            </div>
        </div>
    );
}


export default Marquee;