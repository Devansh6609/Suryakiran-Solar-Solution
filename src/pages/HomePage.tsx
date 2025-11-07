
import React from 'react';
// FIX: Changed to namespace import to resolve module export errors.
import * as ReactRouterDOM from 'react-router-dom';
import TestimonialCarousel from '../components/TestimonialCarousel.tsx';
import AnimatedCounter from '../components/AnimatedCounter.tsx';
import HeroSection from '../components/HeroSection.tsx';
import Faq from '../components/Faq.tsx';
import { FAQ_DATA } from '../constants.tsx';
import Footer from '../components/Footer.tsx';
import AnimatedSection from '../components/AnimatedSection.tsx';

const TrustBar: React.FC = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white w-full max-w-7xl">
        <AnimatedSection delay="delay-100">
            <div className="flex flex-col items-center">
                <span className="text-3xl lg:text-4xl font-bold">MNRE</span>
                <p className="text-sm lg:text-base text-gray-200">Approved Installer</p>
            </div>
        </AnimatedSection>
        <AnimatedSection delay="delay-200">
            <div className="flex flex-col items-center">
                <span className="text-3xl lg:text-4xl font-bold">ISO</span>
                <p className="text-sm lg:text-base text-gray-200">9001:2015 Certified</p>
            </div>
        </AnimatedSection>
        <AnimatedSection delay="delay-300">
            <div className="flex flex-col items-center">
                <div className="text-3xl lg:text-4xl font-bold">
                    <AnimatedCounter target={50} suffix=" Cr+" />
                </div>
                <p className="text-sm lg:text-base text-gray-200">Customer Savings</p>
            </div>
        </AnimatedSection>
        <AnimatedSection delay="delay-400">
            <div className="flex flex-col items-center">
                <div className="text-3xl lg:text-4xl font-bold">
                    <AnimatedCounter target={10000} suffix="+" />
                </div>
                <p className="text-sm lg:text-base text-gray-200">Pumps Installed</p>
            </div>
        </AnimatedSection>
    </div>
);

const ValuePillar: React.FC<{ icon: React.ReactNode; title: string; description: string; link: string; }> = ({ icon, title, description, link }) => (
    <div className="bg-slate-800/60 p-6 rounded-lg shadow-lg hover:bg-slate-800/80 hover:-translate-y-2 transition-all duration-300 h-full text-white text-center">
        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-accent-orange text-white mx-auto">
            {icon}
        </div>
        <h3 className="mt-5 text-xl font-bold">{title}</h3>
        <p className="mt-2 text-base text-gray-200">{description}</p>
        <div className="mt-6">
            <ReactRouterDOM.Link to={link} className="font-bold bg-white text-primary-green py-2 px-6 rounded-full hover:bg-gray-200 transition-colors">Learn More &rarr;</ReactRouterDOM.Link>
        </div>
    </div>
);


const HomePage: React.FC = () => {
    return (
        <div>
            <section className="panel">
                <HeroSection />
            </section>

            <section className="panel px-4 bg-slate-900/80 backdrop-blur-lg">
                <div className="text-center text-white max-w-7xl w-full mx-auto overflow-y-auto max-h-[100vh] py-36 md:py-0 md:max-h-[80vh]">
                    <h2 className="text-4xl font-extrabold sm:text-5xl">Your Comprehensive Solar Solution</h2>
                    <p className="mt-4 text-lg text-gray-200">From homes to farms, we power your future with sustainable energy.</p>
                    <div className="mt-12 grid gap-8 md:grid-cols-3">
                        <ValuePillar
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>}
                            title="Residential & Commercial Solar"
                            description="Reduce your bills to zero and get up to ₹78,000 in subsidies with our rooftop solutions."
                            link="/rooftop-solar"
                        />
                        <ValuePillar
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                            title="Agricultural Water Pumps"
                            description="Replace expensive diesel with solar pumps and secure up to 60%+ subsidy via PM-KUSUM."
                            link="/solar-pumps"
                        />
                        <ValuePillar
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                            title="Finance & Subsidy Support"
                            description="We are experts in navigating subsidy processes and offer flexible EMI/Loan options."
                            link="/subsidies"
                        />
                    </div>
                </div>
            </section>

            <section className="panel bg-slate-800/80 backdrop-blur-lg px-4">
                <TrustBar />
            </section>

            <section className="panel bg-slate-700/80 backdrop-blur-lg px-4">
                <div className="max-w-7xl w-full mx-auto text-center overflow-y-auto max-h-[100vh] py-36 md:py-0 md:max-h-[80vh]">
                    <h2 className="text-4xl font-extrabold text-white sm:text-5xl">Trusted by Thousands of Indians</h2>
                    <p className="mt-4 text-lg text-gray-300">Hear what our happy customers have to say.</p>
                    <div className="mt-12">
                        <TestimonialCarousel />
                    </div>
                </div>
            </section>

            <section className="panel bg-slate-600/80 backdrop-blur-lg px-4">
                <div className="max-w-7xl w-full mx-auto text-center overflow-y-auto max-h-[100vh] py-36 md:py-0 md:max-h-[80vh]">
                    <h2 className="text-4xl font-extrabold text-white sm:text-5xl">Frequently Asked Questions</h2>
                    <p className="mt-4 text-lg text-gray-300">
                        Have questions? We have answers. Here are some of the most common inquiries we receive.
                    </p>
                    <div className="mt-12 text-left">
                        <Faq faqData={FAQ_DATA} />
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default HomePage;