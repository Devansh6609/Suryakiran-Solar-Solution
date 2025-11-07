import React from 'react';
import AnimatedSection from '../components/AnimatedSection';
import missionImage from '../assets/solar-farm-wind-turbines.jpeg';

const TeamMemberCard: React.FC<{ name: string; title: string; image: string; }> = ({ name, title, image }) => (
    <div className="text-center transform hover:scale-105 transition-transform duration-300">
        <img className="mx-auto h-32 w-32 rounded-full object-cover shadow-lg" src={image} alt={name} />
        <h3 className="mt-4 text-lg font-medium text-text-primary">{name}</h3>
        <p className="text-accent-orange">{title}</p>
    </div>
);

const AboutUsPage: React.FC = () => {
    return (
        <div className="bg-transparent text-text-primary">
            <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
                <AnimatedSection>
                    <div className="text-center">
                        <h1 className="text-4xl font-extrabold text-white sm:text-5xl">
                            About SuryaKiran Solar Solutions
                        </h1>
                        <p className="mt-4 max-w-2xl mx-auto text-xl text-text-secondary">
                            Pioneering India's transition to sustainable energy, one rooftop and one farm at a time.
                        </p>
                    </div>
                </AnimatedSection>

                <div className="mt-16 grid lg:grid-cols-2 gap-16 items-center">
                    <AnimatedSection>
                        <div>
                            <h2 className="text-3xl font-extrabold text-primary-green">Our Mission & Vision</h2>
                            <p className="mt-4 text-lg text-text-secondary">
                                Our mission is to accelerate India's adoption of solar energy by making it simple, affordable, and accessible for everyone. We envision a future where every home is a power plant, and every farm is energy-independent, contributing to a cleaner, more prosperous nation.
                            </p>
                            <p className="mt-4 text-lg text-text-secondary">
                                Founded on the principles of integrity, innovation, and customer-centricity, SuryaKiran has grown from a small team of passionate engineers to a leading name in the solar industry. We are committed to quality, from the components we choose to the post-installation support we provide.
                            </p>
                        </div>
                    </AnimatedSection>
                    <AnimatedSection delay="delay-100">
                        <img src={missionImage} className="rounded-lg shadow-xl" alt="Large solar farm representing the company's vision" />
                    </AnimatedSection>
                </div>

                <div className="mt-20 text-center">
                    <AnimatedSection>
                        <h2 className="text-3xl font-extrabold text-white">Meet Our Leadership</h2>
                    </AnimatedSection>
                    <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        <AnimatedSection delay="delay-100"><TeamMemberCard name="Ravi Sharma" title="Founder & CEO" image="https://picsum.photos/seed/ravi/200/200" /></AnimatedSection>
                        <AnimatedSection delay="delay-200"><TeamMemberCard name="Sunita Patel" title="Head of Operations" image="https://picsum.photos/seed/sunita/200/200" /></AnimatedSection>
                        <AnimatedSection delay="delay-300"><TeamMemberCard name="Amit Kumar" title="Chief Technology Officer" image="https://picsum.photos/seed/amit/200/200" /></AnimatedSection>
                        <AnimatedSection delay="delay-400"><TeamMemberCard name="Meera Reddy" title="Director, Agricultural Solutions" image="https://picsum.photos/seed/meera/200/200" /></AnimatedSection>
                    </div>
                </div>

                <AnimatedSection>
                    <div className="mt-20 bg-glass-surface backdrop-blur-sm border border-glass-border p-12 rounded-lg">
                        <h2 className="text-3xl font-extrabold text-white text-center">Our Affiliations & Certifications</h2>
                        <div className="mt-8 flow-root">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 justify-items-center">
                                <div className="flex flex-col items-center">
                                    <span className="text-4xl font-bold text-primary-green">MNRE</span>
                                    <p className="text-sm text-text-secondary mt-2">Approved Installer</p>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-4xl font-bold text-primary-green">ISO 9001</span>
                                    <p className="text-sm text-text-secondary mt-2">Quality Management</p>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-4xl font-bold text-primary-blue">DISCOM</span>
                                    <p className="text-sm text-text-secondary mt-2">State Nodal Agency Partner</p>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-4xl font-bold text-green-500">NABARD</span>
                                    <p className="text-sm text-text-secondary mt-2">Finance Partner</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </AnimatedSection>
            </div>
        </div>
    );
};

export default AboutUsPage;
