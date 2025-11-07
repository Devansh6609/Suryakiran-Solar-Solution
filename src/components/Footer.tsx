import React from 'react';
// FIX: Changed to named import to resolve module export errors.
import { Link } from 'react-router-dom';
import { NAV_LINKS, Logo } from '../constants';

const Footer: React.FC = () => {
    const socialIcons = [
        { name: 'Facebook', path: '#', icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg> },
        { name: 'Twitter', path: '#', icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.71v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg> },
        { name: 'LinkedIn', path: '#', icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg> },
    ];

    const linkStyle = "text-base text-gray-200 hover:text-accent-yellow transition-colors duration-300";

    return (
        <footer className="bg-brand-blue/80 backdrop-blur-lg text-white">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="xl:grid xl:grid-cols-3 xl:gap-8">
                    <div className="space-y-8 xl:col-span-1">
                        <Logo className="text-white" />
                        <p className="text-gray-200 text-base">
                            India's partner for solar energy and sustainable water access.
                        </p>
                        <div className="flex space-x-6">
                            {socialIcons.map(item => (
                                <a key={item.name} href={item.path} className="text-gray-200 hover:text-accent-yellow transition-colors duration-300">
                                    <span className="sr-only">{item.name}</span>
                                    {item.icon}
                                </a>
                            ))}
                        </div>
                    </div>
                    <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
                        <div className="md:grid md:grid-cols-2 md:gap-8">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-100 tracking-wider uppercase">Solutions</h3>
                                <ul className="mt-4 space-y-4">
                                    <li><Link to="/rooftop-solar" className={linkStyle}>Rooftop Solar</Link></li>
                                    <li><Link to="/solar-pumps" className={linkStyle}>Solar Pumps</Link></li>
                                    <li><Link to="/success-stories" className={linkStyle}>Success Stories</Link></li>
                                </ul>
                            </div>
                            <div className="mt-12 md:mt-0">
                                <h3 className="text-sm font-semibold text-gray-100 tracking-wider uppercase">Company</h3>
                                <ul className="mt-4 space-y-4">
                                    <li><Link to="/about" className={linkStyle}>About Us</Link></li>
                                    <li><Link to="/subsidies" className={linkStyle}>Subsidies & Finance</Link></li>
                                    <li><Link to="/contact" className={linkStyle}>Contact</Link></li>
                                </ul>
                            </div>
                        </div>
                        <div className="md:grid md:grid-cols-2 md:gap-8">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-100 tracking-wider uppercase">Legal</h3>
                                <ul className="mt-4 space-y-4">
                                    <li><a href="#" className={linkStyle}>Privacy Policy</a></li>
                                    <li><a href="#" className={linkStyle}>Terms & Conditions</a></li>
                                    <li><a href="#" className={linkStyle}>Sitemap</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-12 border-t border-white/10 pt-8">
                    <p className="text-base text-gray-300 xl:text-center">&copy; {new Date().getFullYear()} SuryaKiran Solar Solutions. All rights reserved.</p>
                    <div className="mt-4 flex justify-center space-x-4">
                        <span className="font-bold">MNRE Approved</span>
                        <span>|</span>
                        <span className="font-bold">ISO Certified</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
