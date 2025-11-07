import React, { useState, useEffect } from 'react';
// FIX: Changed to named imports to resolve module export errors.
import { Link, NavLink, useLocation } from 'react-router-dom';
import { NAV_LINKS, Logo } from '../constants';

const Header: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const location = useLocation();
    const isHomePage = location.pathname === '/';

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Set initial state on mount
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const headerClass = `
    fixed w-full top-0 z-50 transition-all duration-300 
    ${isHomePage && !isScrolled
            ? 'bg-transparent'
            : 'bg-brand-blue/80 backdrop-blur-lg shadow-lg'
        }
  `;

    const linkColor = 'text-white';

    return (
        <header className={headerClass}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-[99px]">
                    <div className="flex-shrink-0 -ml-12">
                        <Link to="/" onClick={() => setIsOpen(false)}>
                            <Logo />
                        </Link>
                    </div>
                    {/* Desktop Navigation */}
                    <div className="hidden md:block">
                        <nav className="ml-10 flex items-center space-x-2">
                            {NAV_LINKS.map((link) => (
                                <NavLink
                                    key={link.name}
                                    to={link.path}
                                    className={({ isActive }) => `nav-link-animated ${linkColor} ${isActive ? 'active' : ''}`}
                                >
                                    {link.name}
                                </NavLink>
                            ))}
                        </nav>
                    </div>
                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            type="button"
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-200 hover:text-white hover:bg-white/20 focus:outline-none"
                            aria-controls="mobile-menu"
                            aria-expanded="false"
                        >
                            <span className="sr-only">Open main menu</span>
                            {!isOpen ? (
                                <svg className="block h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                                </svg>
                            ) : (
                                <svg className="block h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-brand-blue/95 backdrop-blur-lg" id="mobile-menu">
                    <nav className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
                        {NAV_LINKS.map((link) => (
                            <NavLink
                                key={link.name}
                                to={link.path}
                                onClick={() => setIsOpen(false)}
                                className={({ isActive }) => `nav-link-animated ${linkColor} ${isActive ? 'active' : ''}`}
                            >
                                {link.name}
                            </NavLink>
                        ))}
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;
