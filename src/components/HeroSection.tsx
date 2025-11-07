
import React from 'react';
// FIX: Changed to namespace import to resolve module export errors.
import * as ReactRouterDOM from 'react-router-dom';
// NOTE: Please ensure you have this image file at 'src/assets/solar-panels-on-hill.jpeg'
import heroPoster from '../assets/solar-panels-on-hill.jpeg';
import Marquee from './Marquee';
import { HERO_MARQUEE_TEXT, HERO_HEADLINES } from '../constants';
import { useTypewriter } from '../hooks/useTypewriter';
import heroVideo from '../assets/hero-background-video.mp4';

const HeroSection: React.FC = () => {
    const typedText = useTypewriter(HERO_HEADLINES, {
        loop: true,
        typeSpeed: 30,
        deleteSpeed: 20,
        delaySpeed: 2500
    });

    return (
        <div className="relative h-full w-full flex items-center text-white overflow-hidden bg-primary-green">
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute top-1/2 left-1/2 w-auto min-w-full min-h-full max-w-none -translate-x-1/2 -translate-y-1/2 z-0"
                poster={heroPoster}
            >
                {/* Use the locally imported video */}
                <source src={heroVideo} type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-black/60 via-black/40 to-transparent z-10"></div>

            <div className="relative z-20 p-8 md:p-12 lg:p-16 max-w-7xl w-full">
                <div className="max-w-3xl text-left">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight min-h-[144px] md:min-h-[240px]">
                        {typedText}
                        <span className="animate-blink text-accent-yellow">|</span>
                    </h1>
                    <p className="mt-4 max-w-2xl text-lg md:text-xl text-gray-200">
                        Maximize PM Surya Ghar & PM-KUSUM Benefits. Start Saving Today.
                    </p>
                    <div className="mt-10 flex flex-col sm:flex-row items-start justify-start gap-4">
                        <ReactRouterDOM.Link to="/calculator/rooftop" className="w-full sm:w-auto text-lg text-center font-bold bg-accent-orange text-white py-4 px-8 rounded-lg shadow-lg hover:bg-accent-orange-hover transform hover:-translate-y-1 transition-all duration-300">
                            Calculate Rooftop Savings
                        </ReactRouterDOM.Link>
                        <ReactRouterDOM.Link to="/calculator/pump" className="w-full sm:w-auto text-lg text-center font-bold bg-accent-yellow text-white py-4 px-8 rounded-lg shadow-lg hover:bg-accent-yellow-hover transform hover:-translate-y-1 transition-all duration-300">
                            Estimate Pump Subsidy
                        </ReactRouterDOM.Link>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-0 left-0 w-full z-20">
                <Marquee texts={HERO_MARQUEE_TEXT} />
            </div>
        </div>
    );
};

export default HeroSection;