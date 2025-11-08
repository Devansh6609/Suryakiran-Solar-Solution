/// <reference types="react" />
import React from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { SUCCESS_STORIES } from '../constants';
import { StorySegment } from '../types';
import AnimatedSection from '../components/AnimatedSection';
import AnimatedCounter from '../components/AnimatedCounter';

const SuccessStoryDetailPage: React.FC = () => {
    const { storyId } = useParams<{ storyId: string }>();
    const story = SUCCESS_STORIES.find(s => s.id === Number(storyId));

    if (!story) {
        return <Navigate to="/success-stories" replace />;
    }

    // Define the narrative content based on the story segment
    const storyContent = story.segment === StorySegment.Residential ? [
        { title: 'The Challenge', text: 'The family faced rising electricity costs, with monthly bills often exceeding expectations, especially during summer months with high AC usage.' },
        { title: 'Our Solution', text: 'We designed and installed a high-efficiency rooftop solar system, perfectly tailored to their roof space and energy consumption needs, ensuring optimal power generation throughout the day.' },
        { title: 'The Impact', text: 'The system now generates enough power for their entire home, with surplus energy exported back to the grid. This has led to zero electricity bills and significant annual savings.' },
    ] : [
        { title: 'The Challenge', text: "The farm relied on expensive and unreliable diesel generators for irrigation. This not only increased operational costs but also limited their crop cycles and overall profitability." },
        { title: 'Our Solution', text: 'We installed a robust solar water pump, subsidized under the PM-KUSUM scheme, to provide a consistent and cost-effective water supply for their fields.' },
        { title: 'The Impact', text: "With reliable, on-demand irrigation powered by the sun, the farm can now support an additional crop cycle, dramatically increasing their yield and income while completely eliminating diesel costs." },
    ];

    // Select the top 3 most impactful stats for the Key Metrics section
    const keyMetrics = story.roiData.slice(0, 3);

    return (
        <div className="bg-transparent text-text-primary">
            {/* Hero Section */}
            <section className="relative h-[60vh] md:h-[70vh] flex items-center justify-center text-center text-white overflow-hidden">
                <img src={story.image} alt={story.title} className="absolute top-0 left-0 w-full h-full object-cover z-0" />
                <div className="absolute top-0 left-0 w-full h-full bg-black/60 z-10"></div>
                <div className="relative z-20 p-4 max-w-4xl mx-auto">
                    <AnimatedSection>
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">{story.title}</h1>
                        <p className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-gray-200 italic">
                            "{story.customerQuote}"
                        </p>
                    </AnimatedSection>
                </div>
            </section>

            {/* Key Metrics Section */}
            <section className="bg-glass-surface backdrop-blur-md py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        {keyMetrics.map((metric, index) => {
                            const numberMatch = metric.value.match(/[\d,.]+/);
                            const isNumeric = numberMatch && !isNaN(parseFloat(numberMatch[0].replace(/,/g, '')));
                            let numericValue = 0;
                            let prefix = '';
                            let suffix = '';

                            if (isNumeric) {
                                const numberString = numberMatch[0];
                                numericValue = parseFloat(numberString.replace(/,/g, ''));
                                const parts = metric.value.split(numberString);
                                prefix = parts[0];
                                suffix = parts[1];
                            }

                            return (
                                <AnimatedSection key={metric.label} delay={`delay-${index * 100}`}>
                                    <div className="p-4">
                                        <p className="text-4xl lg:text-5xl font-bold text-accent-orange">
                                            {isNumeric ? (
                                                <AnimatedCounter target={numericValue} prefix={prefix} suffix={suffix} />
                                            ) : (
                                                metric.value
                                            )}
                                        </p>
                                        <h3 className="mt-2 text-lg text-text-secondary">{metric.label}</h3>
                                    </div>
                                </AnimatedSection>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* Main Story Section */}
            <section className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16 items-start">
                    {/* Sticky Image */}
                    <div className="lg:sticky top-32">
                        <AnimatedSection>
                            <img src={story.image} alt="Detailed view of the project" className="rounded-lg shadow-2xl w-full" />
                        </AnimatedSection>
                    </div>
                    {/* Scrolling Narrative */}
                    <div className="space-y-12">
                        {storyContent.map((item, index) => (
                            <AnimatedSection key={item.title} delay={`delay-${index * 150}`}>
                                <div>
                                    <h2 className="text-3xl font-bold text-primary-green">{item.title}</h2>
                                    <p className="mt-4 text-lg text-text-secondary leading-relaxed">{item.text}</p>
                                </div>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* ROI Deep Dive Section */}
            <section className="py-16">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <AnimatedSection>
                        <div className="bg-glass-surface backdrop-blur-sm border border-glass-border p-8 rounded-lg shadow-lg">
                            <h3 className="text-2xl font-bold text-center mb-6 text-accent-yellow">Incredible ROI</h3>
                            <div className="border-t border-glass-border pt-4 space-y-3">
                                {story.roiData.map(data => (
                                    <div key={data.label} className="flex justify-between text-lg">
                                        <span className="text-text-secondary">{data.label}</span>
                                        <span className="font-bold text-white">{data.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </AnimatedSection>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-16 text-center">
                <AnimatedSection>
                    <Link to={`/calculator/${story.segment === StorySegment.Residential ? 'rooftop' : 'pump'}`} className="inline-block text-lg font-bold bg-accent-orange text-white py-4 px-10 rounded-lg shadow-lg hover:bg-accent-orange-hover transform hover:scale-105 transition-all duration-300">
                        Calculate Your Own Savings
                    </Link>
                    <div className="mt-8">
                        <Link to="/success-stories" className="text-primary-green hover:underline">&larr; Back to All Success Stories</Link>
                    </div>
                </AnimatedSection>
            </section>
        </div>
    );
};

export default SuccessStoryDetailPage;