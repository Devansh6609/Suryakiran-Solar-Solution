import React from 'react';
// FIX: Changed to named import to resolve module export errors.
import { Link } from 'react-router-dom';
import rooftopVideo from '../assets/rooftop-solar-installation.mp4';
import AnimatedSection from '../components/AnimatedSection.tsx';
import mehraResidenceImage from '../assets/case-study-mehra-residence.png';

const RooftopSolarPage: React.FC = () => {
    return (
        <div className="bg-transparent text-text-primary">
            <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
                <AnimatedSection>
                    <div className="text-center">
                        <h1 className="text-4xl font-extrabold text-white sm:text-5xl">
                            Rooftop Solar Systems
                        </h1>
                        <p className="mt-4 max-w-2xl mx-auto text-xl text-text-secondary">
                            Own your power. Eliminate electricity bills and secure your energy future.
                        </p>
                    </div>
                </AnimatedSection>

                <AnimatedSection className="mt-16">
                    <div className="grid gap-16 lg:grid-cols-2 lg:gap-x-8 items-center">
                        <div>
                            <h2 className="text-3xl font-extrabold text-white">Witness Our Professional Installation</h2>
                            <p className="mt-4 text-lg text-text-secondary">
                                Our video showcases the meticulous and professional installation process our certified engineers follow, ensuring your system's peak performance and longevity.
                            </p>
                            <dl className="mt-8 space-y-6">
                                <div className="flex">
                                    <dt className="flex-shrink-0 w-32 font-medium text-white">System Size:</dt>
                                    <dd className="ml-4 text-text-secondary">1 kW to 100+ kW</dd>
                                </div>
                                <div className="flex">
                                    <dt className="flex-shrink-0 w-32 font-medium text-white">Annual Production:</dt>
                                    <dd className="ml-4 text-text-secondary">~1,500 kWh per kW installed</dd>
                                </div>
                                <div className="flex">
                                    <dt className="flex-shrink-0 w-32 font-medium text-white">Components:</dt>
                                    <dd className="ml-4 text-text-secondary">Tier-1 Solar Panels & Inverters</dd>
                                </div>
                                <div className="flex">
                                    <dt className="flex-shrink-0 w-32 font-medium text-white">Warranty:</dt>
                                    <dd className="ml-4 text-text-secondary">25-Year Performance Warranty on Panels</dd>
                                </div>
                            </dl>
                        </div>
                        <div className="rounded-lg shadow-xl overflow-hidden">
                            <video
                                className="w-full h-full object-cover"
                                src={rooftopVideo}
                                autoPlay
                                loop
                                muted
                                playsInline
                                poster="https://picsum.photos/seed/solar-roof/600/400"
                            >
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    </div>
                </AnimatedSection>

                <AnimatedSection className="mt-20">
                    <div className="bg-glass-surface backdrop-blur-sm border border-glass-border p-8 rounded-lg">
                        <div className="text-center">
                            <h2 className="text-3xl font-extrabold text-primary-green text-glow">Unlock Your Maximum ₹78,000 Subsidy</h2>
                            <p className="mt-4 text-lg text-text-secondary">
                                With the "PM Surya Ghar: Muft Bijli Yojana", going solar has never been more affordable. We are experts in navigating the 45-120 day approval process for you.
                            </p>
                        </div>
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                            <div className="bg-glass-surface/70 backdrop-blur-sm p-6 rounded-md">
                                <p className="text-xl font-bold text-primary-green">Up to 2 kW</p>
                                <p className="text-2xl font-extrabold text-white mt-2">₹30,000 / kW</p>
                                <p className="text-sm text-text-secondary">Total: ₹60,000</p>
                            </div>
                            <div className="bg-glass-surface/70 backdrop-blur-sm p-6 rounded-md">
                                <p className="text-xl font-bold text-primary-green">For the 3rd kW</p>
                                <p className="text-2xl font-extrabold text-white mt-2">₹18,000</p>
                                <p className="text-sm text-text-secondary">Additional Subsidy</p>
                            </div>
                            <div className="bg-glass-surface/70 backdrop-blur-sm p-6 rounded-md">
                                <p className="text-xl font-bold text-primary-green">3 kW & Above</p>
                                <p className="text-2xl font-extrabold text-white mt-2">₹78,000</p>
                                <p className="text-sm text-text-secondary">Maximum Capped Subsidy</p>
                            </div>
                        </div>
                    </div>
                </AnimatedSection>

                <AnimatedSection className="mt-20">
                    <div className="grid lg:grid-cols-5 gap-8 items-center">
                        <div className="lg:col-span-2">
                            <img className="rounded-lg shadow-xl" src={mehraResidenceImage} alt="Happy family in front of their solar-powered home" />
                        </div>
                        <div className="lg:col-span-3">
                            <h3 className="text-2xl font-bold text-white">Case Study: The Mehra Residence, Pune</h3>
                            <p className="mt-2 text-lg text-text-secondary">
                                After installing a 3 kW system, the Mehras now enjoy zero electricity bills and are projected to save over <span className="font-bold text-primary-green">₹12 Lakhs</span> over 25 years.
                            </p>
                            <div className="mt-8">
                                <Link to="/calculator/rooftop" className="inline-block text-lg font-bold bg-accent-orange text-white py-4 px-8 rounded-lg shadow-lg hover:bg-accent-orange-hover transform hover:scale-105 transition-all duration-300">
                                    Calculate Your Net System Cost & Savings Now
                                </Link>
                            </div>
                        </div>
                    </div>
                </AnimatedSection>

            </div>
        </div>
    );
};

export default RooftopSolarPage;