import React from 'react';
import AnimatedSection from '../components/AnimatedSection';
import TimelineSection from '../components/TimelineSection';

const pmSuryaGharProcess = [
    { id: 1, title: 'Register on Portal', description: 'Begin by registering on the National Portal for Rooftop Solar. You will need your latest electricity bill and other basic household details to start the process.', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg> },
    { id: 2, title: 'Feasibility Approval', description: 'Submit your application through the portal. It will be automatically forwarded to your local DISCOM, who will provide technical feasibility approval within approximately 15 days.', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { id: 3, title: 'Installation', description: 'Once approved, select SuryaKiran Solar as your registered vendor. We will procure high-quality components and complete the installation as per MNRE standards.', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12V6a2 2 0 012-2h10a2 2 0 012 2v6m-7-3h4m-2 2v2m-2-2l-2-2m4 4l-2 2" /></svg> },
    { id: 4, title: 'Net Metering & Inspection', description: 'After installation, we submit the project details. Your DISCOM will then inspect the system and install the net meter, which tracks your energy export and import.', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg> },
    { id: 5, title: 'Subsidy Disbursal', description: 'Upon successful inspection, a commissioning certificate is issued. The central government subsidy is then directly credited to your bank account within 30-60 days.', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg> }
];

const pmKusumBreakdown = [
    { id: 1, title: 'Component B', description: 'This component focuses on the installation of new, standalone solar-powered agriculture pumps of up to 7.5 HP capacity. It is ideal for farmers without a reliable grid connection or those looking to replace diesel pumps.', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { id: 2, title: 'Component C', description: 'Aimed at farmers who already have grid-connected agriculture pumps. This component supports the solarisation of these existing pumps, reducing their reliance on the grid and lowering electricity bills.', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> },
    { id: 3, title: 'Financial Structure', description: 'Both components receive substantial government support: typically 30% from the central government (CFA) and 30% from the state government. The farmer often only needs to bear 40% of the cost, with bank finance options available to cover up to 30% of the total cost, reducing the upfront burden to just 10%.', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8h6m-5 4h4m5 6H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2z" /></svg> }
];


const SubsidiesPage: React.FC = () => {
    return (
        <div className="bg-transparent text-text-primary">
            <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
                <AnimatedSection>
                    <div className="text-center mb-4">
                        <h1 className="text-4xl font-extrabold text-white sm:text-5xl">
                            Subsidies & Finance
                        </h1>
                        <p className="mt-4 max-w-2xl mx-auto text-xl text-text-secondary">
                            Making solar affordable for every Indian.
                        </p>
                    </div>
                </AnimatedSection>

                <TimelineSection
                    title="PM Surya Ghar: Application Process Simplified"
                    steps={pmSuryaGharProcess}
                />

                <div className="mt-16">
                    <TimelineSection
                        title="PM-KUSUM Scheme Explained"
                        steps={pmKusumBreakdown}
                    />
                </div>

                <AnimatedSection>
                    <div className="mt-16 text-center">
                        <h2 className="text-3xl font-extrabold text-white">Flexible Financing Options</h2>
                        <p className="mt-4 max-w-3xl mx-auto text-lg text-text-secondary">Don't let upfront costs stop you. We partner with leading financial institutions to offer attractive loan and EMI options tailored to your needs.</p>
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="bg-glass-surface backdrop-blur-sm border border-glass-border p-6 rounded-lg shadow transform hover:-translate-y-1 transition-transform">
                                <h3 className="font-bold text-xl text-accent-yellow">Bank Loans</h3>
                                <p className="mt-2 text-text-secondary">Easy processing with our partner banks at competitive interest rates.</p>
                            </div>
                            <div className="bg-glass-surface backdrop-blur-sm border border-glass-border p-6 rounded-lg shadow transform hover:-translate-y-1 transition-transform">
                                <h3 className="font-bold text-xl text-accent-yellow">EMI Options</h3>
                                <p className="mt-2 text-text-secondary">Convert your investment into manageable monthly payments.</p>
                            </div>
                            <div className="bg-glass-surface backdrop-blur-sm border border-glass-border p-6 rounded-lg shadow transform hover:-translate-y-1 transition-transform">
                                <h3 className="font-bold text-xl text-accent-yellow">Power Purchase Agreements (PPAs)</h3>
                                <p className="mt-2 text-text-secondary">For commercial clients, pay only for the energy you consume with zero upfront investment.</p>
                            </div>
                        </div>
                    </div>
                </AnimatedSection>
            </div>
        </div>
    );
};

export default SubsidiesPage;
