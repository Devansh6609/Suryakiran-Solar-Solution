import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedSection from '../components/AnimatedSection';
import CalculatorForm from '../components/CalculatorForm';
import InteractiveCalculator from '../components/InteractiveCalculator';
import { CalculatorType } from '../types';
import { CalculationResults } from '../utils/calculatorUtils';
import { 
    Sun, 
    Zap, 
    ShieldCheck, 
    ArrowRight, 
    PieChart, 
    Coins, 
    CheckCircle2
} from 'lucide-react';
import rooftopVideo from '../assets/rooftop-solar-installation.mp4';

const RooftopSolarPage: React.FC = () => {
    const navigate = useNavigate();
    const [calcValue, setCalcValue] = useState<number>(3000);
    const [calcResults, setCalcResults] = useState<CalculationResults | null>(null);

    const handleCalcChange = (val: number, results: CalculationResults) => {
        setCalcValue(val);
        setCalcResults(results);
    };

    const features = [
        {
            icon: <Zap className="text-neon-cyan" />,
            title: "Zero Electricity Bills",
            description: "Generate your own power and significantly reduce or even eliminate your monthly electricity costs."
        },
        {
            icon: <ShieldCheck className="text-primary-green" />,
            title: "25 Years Warranty",
            description: "Our high-efficiency solar panels come with a performance warranty of up to 25 years for peace of mind."
        },
        {
            icon: <Coins className="text-accent-orange" />,
            title: "Government Subsidy",
            description: "Avail up to ₹78,000 in direct subsidies under the PM-Surya Ghar: Muft Bijli Yojana."
        }
    ];

    return (
        <div className="text-white selection:bg-neon-cyan/30">
            {/* Hero Section */}
            <section className="relative pb-20 px-4 overflow-hidden pt-10">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-cyan/10 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-electric-blue/10 rounded-full blur-[120px]"></div>
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <AnimatedSection>
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan text-xs font-black tracking-widest uppercase mb-6">
                                <Sun size={14} /> Power Your Home With Sun
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
                                Turn Your Roof Into a <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-electric-blue">Power Plant</span>
                            </h1>
                            <p className="text-lg text-text-secondary font-medium mb-8 max-w-xl leading-relaxed">
                                Experience energy independence with Varcas Rooftop Solar. Reduce bills, increase property value, and contribute to a greener planet with India's most trusted solar partner.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <button 
                                    onClick={() => {
                                        document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className="px-8 py-4 rounded-2xl bg-gradient-to-r from-neon-cyan to-electric-blue text-night-sky font-black tracking-widest shadow-glow-sm shadow-neon-cyan/20 hover:scale-105 transition-all flex items-center gap-2 uppercase text-sm cursor-pointer"
                                >
                                    Start Saving Now <ArrowRight size={18} />
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
                                    src={rooftopVideo}
                                    autoPlay 
                                    loop 
                                    muted 
                                    playsInline
                                    className="w-full h-[500px] object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-night-sky via-transparent to-transparent"></div>
                                <div className="absolute bottom-8 left-8 right-8 p-6 bg-glass-surface/60 backdrop-blur-xl border border-glass-border/20 rounded-2xl">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary-green/20 flex items-center justify-center text-primary-green">
                                                <PieChart size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Real-time Savings</p>
                                                <p className="text-sm font-bold text-white">Generating 12.4 kWh</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Status</p>
                                            <p className="text-sm font-bold text-primary-green flex items-center gap-1 justify-end">
                                                <CheckCircle2 size={14} /> Optimal
                                            </p>
                                        </div>
                                    </div>
                                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-primary-green h-full w-[85%] rounded-full"></div>
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
                            <AnimatedSection key={index} className="p-8 rounded-3xl bg-glass-surface/20 border border-glass-border/10 hover:border-neon-cyan/30 transition-all group">
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

            {/* Savings Calculator INTEGRATED SECTION */}
            <section className="py-24 px-4 bg-gradient-to-b from-night-sky to-night-sky-light/40 overflow-hidden relative">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-6 uppercase tracking-tight">Calculate Your <span className="text-primary-green">ROI</span></h2>
                        <p className="text-text-secondary font-bold max-w-2xl mx-auto text-lg italic">Adjust your load to see immediate savings potential.</p>
                    </div>
                    <div className="max-w-4xl mx-auto">
                         <InteractiveCalculator 
                            type={CalculatorType.Rooftop} 
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
                        <h2 className="text-3xl font-black text-white mb-4 uppercase">Apply for <span className="text-neon-cyan">Subsidy</span></h2>
                        <p className="text-text-secondary font-bold">Secure your verified quote in 3 simple steps.</p>
                    </div>
                    <CalculatorForm 
                        type={CalculatorType.Rooftop} 
                        initialValue={calcValue}
                        calculatorResults={calcResults}
                    />
                </div>
            </section>
        </div>
    );
};

export default RooftopSolarPage;