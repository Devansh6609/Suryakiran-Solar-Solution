import React from 'react';
import { Testimonial, SuccessStory, StorySegment, PipelineStage } from './types';
import logoIcon from './assets/logo-icon.png';

import sharmaResidenceImage from './assets/success-story-sharma-residence.png';
import patelFarmsImage from './assets/success-story-patel-farms.png';
import guptaTextilesImage from './assets/success-story-gupta-textiles.png';
import jaipurHomeImage from './assets/success-story-jaipur-smart-home.png';


export const NAV_LINKS = [
    { name: 'Home', path: '/' },
    { name: 'Rooftop Solar', path: '/rooftop-solar' },
    { name: 'Solar Pumps', path: '/solar-pumps' },
    { name: 'Success Stories', path: '/success-stories' },
    { name: 'Subsidies & Finance', path: '/subsidies' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
];

export const HERO_HEADLINES = [
    "Pioneering India's Green Revolution with End-to-End Solar Solutions.",
    "Secure Your Family's Future and Achieve Zero Electricity Bills.",
    "Empowering India's Farmers with Reliable, Cost-Effective Solar Water Pumps.",
    "Navigate Government Subsidies with Our Expert Guidance for Maximum Benefits.",
];

export const HERO_MARQUEE_TEXT = [
    "Achieve Zero Electricity Bills with Rooftop Solar.",
    "25-Year Performance Warranty on All Panels.",
    "Secure Your Farm's Future with a PM-KUSUM Solar Pump.",
    "MNRE Approved & ISO 9001 Certified Installer.",
    "Go Solar, Go Green: Save Money and the Planet.",
];

export const TESTIMONIALS: Testimonial[] = [
    {
        quote: "Our electricity bills have vanished! Varcas Energy's team handled the entire subsidy process flawlessly. Highly recommended for any homeowner.",
        name: 'Anjali & Rohan Mehta',
        segment: StorySegment.Residential,
        image: 'https://picsum.photos/seed/anjali/100/100',
    },
    {
        quote: "Switching to a solar pump has secured our irrigation and our future. We've saved over ₹40,000 on diesel in the first year alone. The crop yield has never been better.",
        name: 'Balwinder Singh',
        segment: StorySegment.Agricultural,
        image: 'https://picsum.photos/seed/balwinder/100/100',
    },
    {
        quote: "The professionalism and technical expertise of Varcas Energy are unmatched. Our commercial unit now runs on clean energy, and the ROI is even better than projected.",
        name: 'Priya Desai, Factory Manager',
        segment: StorySegment.Commercial,
        image: 'https://picsum.photos/seed/priya/100/100',
    },
];

export const SUCCESS_STORIES: SuccessStory[] = [
    {
        id: 1,
        title: "The Sharma Residence: Zero Bill Achievement",
        segment: StorySegment.Residential,
        image: sharmaResidenceImage,
        customerQuote: "We haven't paid an electricity bill in six months. The installation was quick, and the team educated us on how to maximize our savings. It feels great to be energy independent.",
        roiData: [
            { label: 'System Size', value: '5 kW' },
            { label: 'Annual Savings', value: '₹ 60,000' },
            { label: '25-Year Savings', value: '₹ 15 Lakhs' },
            { label: 'Payback Period', value: '4.5 Years' },
        ],
    },
    {
        id: 2,
        title: "Patel Farms: 30% Crop Yield Increase",
        segment: StorySegment.Agricultural,
        image: patelFarmsImage,
        customerQuote: "Consistent water supply from the solar pump transformed our farm. We're now able to grow a third crop cycle, which has increased our income significantly. No more diesel expenses!",
        roiData: [
            { label: 'Pump Capacity', value: '7.5 HP' },
            { label: 'Annual Diesel Savings', value: '₹ 42,000' },
            { label: 'Crop Yield Increase', value: '30%' },
            { label: 'PM-KUSUM Subsidy', value: '60%' },
        ],
    },
    {
        id: 3,
        title: "Gupta Textiles: Slashing Operational Costs",
        segment: StorySegment.Commercial,
        image: guptaTextilesImage,
        customerQuote: "Our factory's energy overhead was a major concern. The 50kW rooftop system from Varcas Energy has cut our power costs by over 70%, making us more competitive in the market.",
        roiData: [
            { label: 'System Size', value: '50 kW' },
            { label: 'Monthly Savings', value: '₹ 85,000' },
            { label: 'Carbon Footprint Reduction', value: '55 Tons/Year' },
            { label: 'Project ROI', value: '22%' },
        ],
    },
    {
        id: 4,
        title: "Jaipur Smart Home: Future-Proof Energy",
        segment: StorySegment.Residential,
        image: jaipurHomeImage,
        customerQuote: "Integrating solar with our smart home setup was a dream. Varcas Energy provided a seamless solution with high-efficiency panels. We even charge our EV for free!",
        roiData: [
            { label: 'System Size', value: '8 kW' },
            { label: 'Annual Savings', value: '₹ 96,000' },
            { label: 'Subsidy Availed', value: '₹ 78,000' },
            { label: 'Payback Period', value: '4 Years' },
        ],
    },
];

export const FAQ_DATA = [
    {
        question: "What is the average cost of a rooftop solar system?",
        answer: "The cost varies depending on the system size. For a typical 3 kW system, the cost is around ₹1,80,000 to ₹2,10,000. However, with the PM Surya Ghar subsidy of ₹78,000, the net cost to the customer is significantly lower. We also offer flexible EMI and loan options."
    },
    {
        question: "How much can I save on my electricity bills?",
        answer: "With a properly sized system, you can reduce your electricity bills to zero. Any surplus energy generated is exported to the grid, and you get credits for it, further reducing or eliminating your bill. On average, a 1 kW system saves you about ₹1,000 per month."
    },
    {
        question: "How does the PM-KUSUM subsidy for solar pumps work?",
        answer: "Under PM-KUSUM, farmers typically receive a total subsidy of 60% (30% from the Central Government and 30% from the State Government). You only need to pay 40% of the cost, and bank loans are available for up to 30% of the total cost, meaning your upfront contribution can be as low as 10%."
    },
    {
        question: "How long does the installation process take?",
        answer: "For a residential rooftop system, the physical installation usually takes only 2-3 days. The complete process, including subsidy application, DISCOM approval, and net meter installation, can take between 45 to 120 days. Our team handles all the paperwork to ensure a smooth process for you."
    },
    {
        question: "What is the lifespan of a solar panel system?",
        answer: "Our Tier-1 solar panels come with a 25-year performance warranty. The panels can continue to produce power for 30 years or more. The inverter typically has a warranty of 5-10 years and might need replacement once during the system's lifetime."
    }
];

export const Logo: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`flex items-center gap-3 ${className}`}>
        <img src={logoIcon} alt="Varcas Energy Icon" className="h-10 md:h-14 w-auto object-contain brightness-110" />
        <div className="flex flex-col justify-center leading-none">
            <span className="text-solar-gold font-extrabold text-xl md:text-2xl tracking-tight uppercase">Varcas</span>
            <span className="text-white font-bold text-[0.6rem] md:text-sm tracking-[0.2em] uppercase mt-0.5 opacity-90">Energy</span>
        </div>
    </div>
);

import {
    LayoutDashboard,
    GitBranch,
    FilePlus2,
    Users,
    UserCog,
    LayoutTemplate,
    PenLine,
    Settings,
    FileText,
    ClipboardCheck,
    Package
} from 'lucide-react';

export const ADMIN_NAV_LINKS = [
    {
        name: 'Dashboard',
        path: '/admin',
        icon: <LayoutDashboard className="h-5 w-5 md:h-6 md:w-6" />,
        roles: ['Master', 'Vendor'],
    },
    {
        name: 'Leads Pipeline',
        path: '/admin/leads',
        icon: <GitBranch className="h-5 w-5 md:h-6 md:w-6" />,
        roles: ['Master', 'Vendor'],
    },
    {
        name: 'Survey Management',
        path: '/admin/surveys',
        icon: <ClipboardCheck className="h-5 w-5 md:h-6 md:w-6" />,
        roles: ['Master', 'Vendor'],
    },
    {
        name: 'Quotations Hub',
        path: '/admin/quotations',
        icon: <FileText className="h-5 w-5 md:h-6 md:w-6" />,
        roles: ['Master', 'Vendor'],
    },
    {
        name: 'Inventory Management',
        path: '/admin/inventory',
        icon: <Package className="h-5 w-5 md:h-6 md:w-6" />,
        roles: ['Master', 'Vendor'],
    },
    {
        name: 'Offline Entry',
        path: '/admin/leads/manual',
        icon: <FilePlus2 className="h-5 w-5 md:h-6 md:w-6" />,
        roles: ['Master', 'Vendor'],
    },
    {
        name: 'Vendor Management',
        path: '/admin/vendors',
        icon: <Users className="h-5 w-5 md:h-6 md:w-6" />,
        roles: ['Master'],
    },
    {
        name: 'Admin Management',
        path: '/admin/admins',
        icon: <UserCog className="h-5 w-5 md:h-6 md:w-6" />,
        roles: ['Master'],
    },
    {
        name: 'Data Explorer',
        path: '/admin/data-explorer',
        icon: <LayoutTemplate className="h-5 w-5 md:h-6 md:w-6" />,
        roles: ['Master', 'Vendor'],
    },
    {
        name: 'Form Builder',
        path: '/admin/form-builder',
        icon: <PenLine className="h-5 w-5 md:h-6 md:w-6" />,
        roles: ['Master'],
    },
    {
        name: 'Settings',
        path: '/admin/settings',
        icon: <Settings className="h-5 w-5 md:h-6 md:w-6" />,
        roles: ['Master'],
    }
];

export const PIPELINE_STAGES: PipelineStage[] = [
    PipelineStage.NewLead,
    PipelineStage.Survey,
    PipelineStage.QuotationSent,
    PipelineStage.CustomerApproved,
    PipelineStage.MaterialDispatched,
    PipelineStage.Installation,
    PipelineStage.Completed,
    PipelineStage.Lost,
];

// Human-readable labels for pipeline stages
export const PIPELINE_STAGE_LABELS: Record<string, string> = {
    'New_Lead':           '🆕 New Lead',
    'Survey':             '📋 Survey',
    'Quotation_Sent':     '💰 Quotation Sent',
    'Customer_Approved':  '✅ Customer Approved',
    'Material_Dispatched':'🚚 Material Dispatched',
    'Installation':       '🔨 Installation',
    'Completed':          '🏆 Completed',
    'Lost':               '❌ Lost',
};

// Stage colors for UI
export const PIPELINE_STAGE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    'New_Lead':            { bg: 'bg-slate-500/10', text: 'text-slate-300', border: 'border-slate-500/30' },
    'Survey':              { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
    'Quotation_Sent':      { bg: 'bg-blue-500/10',  text: 'text-blue-400',  border: 'border-blue-500/30' },
    'Customer_Approved':   { bg: 'bg-violet-500/10',text: 'text-violet-400',border: 'border-violet-500/30' },
    'Material_Dispatched': { bg: 'bg-orange-500/10',text: 'text-orange-400',border: 'border-orange-500/30' },
    'Installation':        { bg: 'bg-cyan-500/10',  text: 'text-cyan-400',  border: 'border-cyan-500/30' },
    'Completed':           { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
    'Lost':                { bg: 'bg-red-500/10',   text: 'text-red-400',   border: 'border-red-500/30' },
};