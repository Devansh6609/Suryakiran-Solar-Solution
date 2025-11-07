import React from 'react';
import { NavLink } from 'react-router-dom';
import { ADMIN_NAV_LINKS, Logo } from '../../constants';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
    isCollapsed: boolean;
    setCollapsed: (isCollapsed: boolean) => void;
    isMobileOpen: boolean;
    onMobileClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setCollapsed, isMobileOpen, onMobileClose }) => {
    const { user, logout } = useAuth();

    const linkClass = "flex items-center px-4 py-2.5 text-gray-600 dark:text-text-secondary hover:text-gray-900 dark:hover:text-text-primary hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors duration-200 group relative";
    const activeLinkClass = "font-semibold border-l-4 bg-primary-green/10 text-primary-green border-primary-green dark:bg-gradient-to-r dark:from-electric-blue/20 dark:to-transparent dark:text-text-accent dark:border-electric-blue dark:shadow-lg dark:shadow-electric-blue/20 dark:animate-pulse-glow dark:[--tw-shadow-color:theme(colors.electric-blue/50)]";

    const visibleLinks = ADMIN_NAV_LINKS.filter(link => user && link.roles.includes(user.role));

    const handleLogout = () => {
        logout();
        // Force a full page reload after navigating to ensure all state is cleared
        window.location.hash = '/login';
        window.location.reload();
    };

    const sidebarContent = (
        <div className={`flex flex-col h-full bg-white dark:bg-glass-surface dark:backdrop-blur-xl border-r border-gray-200 dark:border-glass-border`}>
            <div className={`flex items-center h-20 flex-shrink-0 px-4 ${isCollapsed && 'lg:px-0 lg:justify-center'}`}>
                <div className={`${isCollapsed ? 'lg:hidden' : ''} md:hidden lg:block text-gray-800 dark:text-text-primary`}>
                    <Logo />
                </div>
                <div className={`hidden ${isCollapsed ? 'lg:block' : ''} md:block lg:hidden text-gray-800 dark:text-text-primary`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-neon-cyan" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 5a1 1 0 112 0v2.25a.75.75 0 01-1.5 0V5zm1.5 5.5a1 1 0 00-1 1v4a1 1 0 102 0v-4a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                </div>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                {visibleLinks.map((link) => (
                    <NavLink
                        key={link.name}
                        to={link.path}
                        end={link.path === '/admin'}
                        className={({ isActive }) => `${linkClass} ${isActive ? activeLinkClass : ''}`}
                        title={link.name}
                    >
                        {link.icon}
                        <span className={`ml-4 whitespace-nowrap transition-opacity duration-200 md:hidden ${isCollapsed ? 'lg:hidden' : 'lg:inline-block'}`}>{link.name}</span>
                    </NavLink>
                ))}
            </nav>
            <div className="px-4 py-4">
                <button
                    onClick={handleLogout}
                    className={`${linkClass} w-full`}
                    title="Logout"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>
                    <span className={`ml-4 whitespace-nowrap transition-opacity duration-200 md:hidden ${isCollapsed ? 'lg:hidden' : 'lg:inline-block'}`}>Logout</span>
                </button>
            </div>
            {/* Collapse button for desktop */}
            <button
                onClick={() => setCollapsed(!isCollapsed)}
                className="absolute top-6 p-2 rounded-full text-gray-500 dark:text-text-secondary hover:text-gray-900 dark:hover:text-text-primary bg-white dark:bg-glass-surface border border-gray-200 dark:border-glass-border hidden lg:block transition-all duration-300"
                style={{ right: '-16px' }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
        </div>
    );

    return (
        <>
            {/* Mobile Sidebar (Drawer) */}
            <div className="md:hidden">
                {isMobileOpen && <div onClick={onMobileClose} className="fixed inset-0 bg-black/60 z-40" />}
                <div className={`fixed top-0 left-0 h-full w-64 z-50 transition-transform duration-300 ease-in-out ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    {sidebarContent}
                </div>
            </div>

            {/* Static Sidebar for Tablet/Desktop */}
            <div className={`hidden md:flex md:flex-shrink-0 relative transition-all duration-300 ${isCollapsed ? 'lg:w-20' : 'lg:w-64'} md:w-20`}>
                {sidebarContent}
            </div>
        </>
    );
};

export default Sidebar;