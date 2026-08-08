import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedSection from '../components/AnimatedSection';
import CalculatorForm from '../components/CalculatorForm';
import InteractiveCalculator from '../components/InteractiveCalculator';
import { CalculatorType } from '../types';
import { CalculationResults } from '../utils/calculatorUtils';
import { 
    Droplets, 
    Sun, 
    Zap, 
    ShieldCheck, 
    ArrowRight, 
    Leaf,
    Sprout
} from 'lucide-react';
import pumpVideo from '../assets/solar-pump-agriculture.mp4';

const SolarPumpsPage: React.FC = () => {
    const navigate = useNavigate();
    const [calcValue, setCalcValue] = useState<number>(10000);
    const [calcResults, setCalcResults] = useState<CalculationResults | null>(null);

    const handleCalcChange = (val: number, results: CalculationResults) => {
        setCalcValue(val);
        setCalcResults(results);
    };

    const features = [
        {
            icon: <Zap className="text-primary-green" />,
            title: "Zero Diesel Cost",
            description: "Replace expensive diesel with free solar energy and increase your farm's profitability immediately."
        },
        {
            icon: <Leaf className="text-neon-cyan" />,
            title: "Eco-Friendly",
            description: "Reduce your carbon footprint and eliminate noise and smoke pollution from your irrigation process."
        },
        {
            icon: <ShieldCheck className="text-accent-orange" />,
            title: "PM-KUSUM Subsidy",
            description: "Avail up to 60% subsidy from the government. Pay only 40% and get a permanent irrigation solution."
        }
    ];

    return (
        <div className="text-white selection:bg-neon-cyan/30">
            {/* Hero Section */}
            <section className="relative pb-20 px-4 overflow-hidden pt-10">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
                    <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-green/10 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-cyan/10 rounded-full blur-[120px]"></div>
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <AnimatedSection>
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-green/10 border border-primary-green/20 text-primary-green text-xs font-black tracking-widest uppercase mb-6">
                                <Droplets size={14} /> Smart Irrigation Solutions
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
                                Empower Your Farm with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-green to-neon-cyan">Solar Pumps</span>
                            </h1>
                            <p className="text-lg text-text-secondary font-medium mb-8 max-w-xl leading-relaxed">
                                Experience hassle-free irrigation with Varcas Solar Pumps. No dependence on diesel or irregular grid power. High efficiency, low maintenance, and massive government subsidies.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <button 
                                    onClick={() => {
                                        document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className="px-8 py-4 rounded-2xl bg-gradient-to-r from-primary-green to-neon-cyan text-night-sky font-black tracking-widest shadow-glow-sm shadow-primary-green/20 hover:scale-105 transition-all flex items-center gap-2 uppercase text-sm cursor-pointer"
                                >
                                    Calculate My Savings <ArrowRight size={18} />
                                </button>
                                <button 
                                    onClick={() => navigate('/success-stories')}
                                    className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black tracking-widest hover:bg-white/10 transition-all uppercase text-sm cursor-pointer"
                                >
                                    View Projects
                                </button>
                            </div>
                        </AnimatedSection>

                        <AnimatedSection className="relative">
                            <div className="relative rounded-3xl overflow-hidden border border-glass-border/30 shadow-2xl">
                                <video 
                                    src={pumpVideo}
                                    autoPlay 
                                    loop 
                                    muted 
                                    playsInline
                                    className="w-full h-[500px] object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-night-sky via-transparent to-transparent"></div>
                                <div className="absolute bottom-8 left-8 right-8 p-6 bg-glass-surface/60 backdrop-blur-xl border border-glass-border/20 rounded-2xl">
                                    <div className="flex items-center gap-6 mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-neon-cyan/20 flex items-center justify-center text-neon-cyan">
                                                <Sun size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Efficiency</p>
                                                <p className="text-sm font-bold text-white">98% Energy Conversion</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary-green/20 flex items-center justify-center text-primary-green">
                                                <Sprout size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Farm ROI</p>
                                                <p className="text-sm font-bold text-white">1.5 Year Payback</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-bold text-text-primary">Monthly Diesel Savings</p>
                                        <p className="text-xl font-black text-primary-green">₹ 15,000+</p>
                                    </div>
                                </div>
                            </div>
                        </AnimatedSection>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 px-4 bg-night-sky-light/30">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <AnimatedSection key={index} className="p-8 rounded-3xl bg-glass-surface/20 border border-glass-border/10 hover:border-primary-green/30 transition-all group">
                                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 text-2xl group-hover:scale-110 transition-transform">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-black text-white mb-4 uppercase tracking-wider">{feature.title}</h3>
                                <p className="text-text-secondary font-medium leading-relaxed">
                                    {feature.description}
                                </p>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Solar Pumps? */}
            <section className="py-24 px-4 overflow-hidden relative">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <AnimatedSection>
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-8 leading-tight">
                                Reliable Water Supply, <span className="text-primary-green">Day and Night</span>
                            </h2>
                            <p className="text-lg text-text-secondary font-medium mb-8">
                                Varcas Solar Pumps are designed specifically for the unique challenges of Indian agriculture. Our systems guarantee water flow even in low sunlight conditions.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    "Hybrid connectivity with existing grid power.",
                                    "Stainless steel body for long-lasting durability.",
                                    "Remote monitoring via mobile application.",
                                    "Anti-theft and anti-vandalism features."
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <div className="mt-1 w-5 h-5 rounded-full bg-primary-green/20 flex items-center justify-center text-primary-green">
                                            <ArrowRight size={12} />
                                        </div>
                                        <span className="text-white font-medium">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </AnimatedSection>
                        <AnimatedSection>
                            <div className="grid grid-cols-2 gap-4">
                                <img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=500&auto=format" alt="Farm" className="rounded-2xl border border-glass-border/20 shadow-xl" />
                                <img src="https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?q=80&w=500&auto=format" alt="Pump" className="rounded-2xl border border-glass-border/20 shadow-xl translate-y-8" />
                            </div>
                        </AnimatedSection>
                    </div>
                </div>
            </section>

            {/* Integrated Calculator Section */}
            <section className="py-24 px-4 bg-gradient-to-b from-night-sky to-night-sky-light/40 overflow-hidden relative">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black text-white mb-4 uppercase">Diesel vs <span className="text-primary-green">Solar</span> ROI</h2>
                        <p className="text-text-secondary font-bold italic">Adjust your current diesel cost to see how soon your solar pump pays for itself.</p>
                    </div>
                    <div className="max-w-4xl mx-auto">
                        <InteractiveCalculator 
                            type={CalculatorType.Pump} 
                            onChange={handleCalcChange}
                            initialValue={calcValue}
                        />
                    </div>
                </div>
            </section>

            {/* Application Form */}
            <section id="apply" className="py-24 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tight">Kusum Yojana <span className="text-primary-green">Registration</span></h2>
                        <p className="text-text-secondary font-bold">Fill details to check your subsidy eligibility.</p>
                    </div>
                    <CalculatorForm 
                        type={CalculatorType.Pump} 
                        initialValue={calcValue}
                        calculatorResults={calcResults}
                    />
                </div>
            </section>
        </div>
    );
};

export default SolarPumpsPage;