import React from 'react';
// FIX: Changed to named import to resolve module export errors.
import { Link } from 'react-router-dom';
import pumpVideo from '../assets/solar-pump-agriculture.mp4';
import AnimatedSection from '../components/AnimatedSection.tsx';
import pumpInFieldImage from '../assets/solar-pump-in-field.png';

const SolarPumpsPage: React.FC = () => {
    return (
        <div className="bg-transparent text-text-primary">
            <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
                <AnimatedSection>
                    <div className="text-center">
                        <h1 className="text-4xl font-extrabold text-white sm:text-5xl">
                            Solar Water Pumps
                        </h1>
                        <p className="mt-4 max-w-2xl mx-auto text-xl text-text-secondary">
                            Empowering agriculture with reliable, cost-effective water access.
                        </p>
                    </div>
                </AnimatedSection>

                <AnimatedSection className="mt-16">
                    <div className="grid gap-16 lg:grid-cols-2 lg:gap-x-8 items-center">
                        <div className="rounded-lg shadow-xl overflow-hidden lg:order-2">
                            <video
                                className="w-full h-full object-cover"
                                src={pumpVideo}
                                autoPlay
                                loop
                                muted
                                playsInline
                                poster="https://picsum.photos/seed/solar-pump/600/500"
                            >
                                Your browser does not support the video tag.
                            </video>
                        </div>
                        <div className="lg:order-1">
                            <h2 className="text-3xl font-extrabold text-white">See Our Pumps in Action</h2>
                            <p className="mt-4 text-lg text-text-secondary">
                                Watch how our solar pumps transform arid land into fertile fields, providing a reliable and cost-effective water supply for farmers across India.
                            </p>
                            <div className="mt-6 space-y-4">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <svg className="h-6 w-6 text-primary-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-lg font-medium text-white">Submersible & Surface models available.</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <svg className="h-6 w-6 text-primary-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-lg font-medium text-white">Payback period as short as 1.875 years.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </AnimatedSection>

                <AnimatedSection className="mt-20">
                    <div className="bg-glass-surface backdrop-blur-sm border border-glass-border p-8 rounded-lg relative overflow-hidden">
                        <img src="https://picsum.photos/1200/400?random=8" alt="Farmer with solar pump" className="absolute top-0 left-0 w-full h-full object-cover opacity-10 z-0" />
                        <div className="relative z-10 text-center">
                            <h2 className="text-3xl font-extrabold text-electric-blue text-glow">Secure Your Solar Pump with Up to 60%+ Subsidy</h2>
                            <p className="mt-4 max-w-3xl mx-auto text-lg text-text-secondary">
                                Under PM-KUSUM Component B & C, farmers can get substantial financial assistance. We guide you through the entire process.
                            </p>
                            <div className="mt-8 max-w-2xl mx-auto bg-glass-surface/80 backdrop-blur-sm p-6 rounded-md shadow-lg">
                                <p className="text-xl font-bold text-electric-blue">Typical Subsidy Structure</p>
                                <p className="text-lg text-white mt-2">
                                    <span className="font-bold">30%</span> Central Financial Assistance (CFA) <br />
                                    <span className="font-bold">+ 30%</span> State Subsidy <br />
                                    <span className="font-bold">= 60%</span> Total Government Support*
                                </p>
                                <p className="text-sm text-text-secondary mt-2">*Subsidy may reach 75-80% in select states. Capped at 7.5 HP capacity.</p>
                            </div>
                        </div>
                    </div>
                </AnimatedSection>

                <AnimatedSection className="mt-20">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-extrabold text-white">Eliminate Diesel Costs, Boost Your Yield</h2>
                            <p className="mt-4 text-lg text-text-secondary">A solar pump is not an expense; it's an investment in your farm's profitability. With a typical payback period of less than 2 years, the benefits are immediate and long-lasting.</p>
                            <div className="mt-10">
                                <Link to="/calculator/pump" className="inline-block text-lg font-bold bg-accent-orange text-white py-4 px-8 rounded-lg shadow-lg hover:bg-accent-orange-hover transform hover:scale-105 transition-all duration-300">
                                    Estimate Subsidy & Diesel Savings ROI
                                </Link>
                            </div>
                        </div>
                        <div>
                            <img className="rounded-lg shadow-xl" src={pumpInFieldImage} alt="Solar pump in an agricultural field" />
                        </div>
                    </div>
                </AnimatedSection>

            </div>
        </div>
    );
};

export default SolarPumpsPage;