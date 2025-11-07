import React, { useEffect } from 'react';
// FIX: Changed to named imports to resolve module export errors.
import { useLocation, Outlet } from 'react-router-dom';
import Header from '../components/Header.tsx';
import Footer from '../components/Footer.tsx';
import ScrollToTop from '../components/ScrollToTop.tsx';
import ParticlesBackground from '../components/ParticlesBackground.tsx';

const MainLayout: React.FC = () => {
    const location = useLocation();
    const isHomePage = location.pathname === '/';

    useEffect(() => {
        // This effect ensures that whenever a user is on the public-facing site,
        // specific CRM dark theme styles are disabled. The public site has its own dark theme.
        document.documentElement.classList.remove('dark');
    }, []);

    return (
        <div className="flex flex-col min-h-screen font-sans relative text-gray-200 bg-electric-gradient from-night-sky to-deep-violet bg-fixed">
            <ParticlesBackground />
            <ScrollToTop />
            <Header />
            <main className={`relative z-10 ${isHomePage ? '' : 'flex-grow pt-24'}`}>
                <Outlet />
            </main>
            {/* The footer is now part of the HomePage's sticky scroll, so we only show it on other pages */}
            {!isHomePage && <Footer />}
        </div>
    );
}

export default MainLayout;