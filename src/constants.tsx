import React from 'react';
import { Testimonial, SuccessStory, StorySegment, PipelineStage } from './types';
import logoUrl from './assets/suryakiran.png';
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
        quote: "Our electricity bills have vanished! SuryaKiran's team handled the entire subsidy process flawlessly. Highly recommended for any homeowner.",
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
        quote: "The professionalism and technical expertise of SuryaKiran are unmatched. Our commercial unit now runs on clean energy, and the ROI is even better than projected.",
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
        customerQuote: "Our factory's energy overhead was a major concern. The 50kW rooftop system from SuryaKiran has cut our power costs by over 70%, making us more competitive in the market.",
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
        customerQuote: "Integrating solar with our smart home setup was a dream. SuryaKiran provided a seamless solution with high-efficiency panels. We even charge our EV for free!",
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
    <img src={logoUrl} alt="SuryaKiran Solar Solutions Logo" className={`h-[150px] w-auto ${className}`} />
);

export const ADMIN_NAV_LINKS = [
    {
        name: 'Dashboard',
        path: '/admin',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>,
        roles: ['Master', 'Vendor'],
    },
    {
        name: 'Leads Pipeline',
        path: '/admin/leads',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1z" /></svg>,
        roles: ['Master', 'Vendor'],
    },
    {
        name: 'Vendor Management',
        path: '/admin/vendors',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>,
        roles: ['Master'],
    },
    {
        name: 'Admin Management',
        path: '/admin/admins',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 8a6 6 0 11-12 0 6 6 0 0112 0zM5.468 15.118A8.969 8.969 0 0112 13a8.969 8.969 0 016.532 2.118A9 9 0 105.468 15.118z" clipRule="evenodd" /></svg>,
        roles: ['Master'],
    },
    {
        name: 'Data Explorer',
        path: '/admin/data-explorer',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM4 8h5v2H4V8z" clipRule="evenodd" /></svg>,
        roles: ['Master', 'Vendor'],
    },
    {
        name: 'Form Builder',
        path: '/admin/form-builder',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>,
        roles: ['Master'],
    },
    {
        name: 'Settings',
        path: '/admin/settings',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.982.54 2.295 0 3.277-1.372.836-.836 2.942 2.106 2.106.54-.982 2.295-.982 3.277 0 .836 1.372 2.942.836 2.106-2.106a1.532 1.532 0 010-3.277c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.286-.948zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>,
        roles: ['Master'],
    }
];

export const PIPELINE_STAGES: PipelineStage[] = [
    PipelineStage.NewLead,
    PipelineStage.VerifiedLead,
    PipelineStage.Qualified,
    PipelineStage.SiteSurveyScheduled,
    PipelineStage.ProposalSent,
    PipelineStage.Negotiation,
    PipelineStage.ClosedWon,
    PipelineStage.ClosedLost,
];