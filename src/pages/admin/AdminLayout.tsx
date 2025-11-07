import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Sidebar from '../../components/admin/Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { useCrmUpdates } from '../../contexts/CrmUpdatesContext';
import Toast from '../../components/admin/Toast';
import ThemeToggle from '../../components/admin/ThemeToggle';

const API_BASE_URL = import.meta.env.VITE_CRM_API_URL || 'http://localhost:3001';

interface AdminLayoutProps {
    children: React.ReactNode;
}

const UserDropdown: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useAuth();
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const DefaultAvatarIcon = () => (
        <span className="inline-block h-9 w-9 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 ring-2 ring-gray-300 dark:ring-white/20">
            <svg className="h-full w-full text-gray-300 dark:text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        </span>
    );

    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center space-x-3 hover:bg-black/10 dark:hover:bg-white/10 p-2 rounded-lg transition-colors">
                {user?.profileImage ? (
                    <img className="h-9 w-9 rounded-full object-cover ring-2 ring-gray-300 dark:ring-white/20" src={`${API_BASE_URL}/files/${user.profileImage}`} alt="Admin user avatar" />
                ) : (
                    <DefaultAvatarIcon />
                )}
                <div className="text-left hidden md:block">
                    <div className="font-semibold text-sm text-gray-800 dark:text-text-primary">{user?.name}</div>
                    <div className="text-xs text-gray-500 dark:text-text-secondary">{user?.role}</div>
                </div>
                <svg className="w-4 h-4 text-gray-500 dark:text-text-secondary hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-glass-surface backdrop-blur-lg rounded-lg shadow-lg py-1 z-50 ring-1 ring-black/5 dark:ring-glass-border">
                    <Link to="/admin/profile" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-sm text-gray-700 dark:text-text-primary hover:bg-gray-100 dark:hover:bg-electric-blue">My Profile</Link>
                </div>
            )}
        </div>
    );
};


const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const location = useLocation();
    const { triggerUpdate } = useCrmUpdates();
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        setIsMobileSidebarOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        let isMounted = true;

        const subscribe = async () => {
            if (!isMounted) return;

            abortControllerRef.current = new AbortController();
            const signal = abortControllerRef.current.signal;

            try {
                const response = await fetch(`${API_BASE_URL}/api/admin/events`, { signal });
                if (response.ok) {
                    const event = await response.json();
                    console.log('Received real-time event:', event);
                    if (event.type === 'NEW_LEAD') {
                        setToastMessage(`New lead received: ${event.data.name || 'N/A'}`);
                    } else if (event.type === 'LEAD_UPDATE') {
                        setToastMessage(`Lead updated: ${event.data.name || 'N/A'}`);
                    }
                    triggerUpdate();
                }
            } catch (e: any) {
                if (e.name === 'AbortError') {
                    console.log('Subscription aborted.');
                    return; // Don't retry on abort
                }
                console.error('Subscription error, retrying in 5 seconds...', e);
                await new Promise(resolve => setTimeout(resolve, 5000));
            }

            if (isMounted) {
                subscribe();
            }
        };
        subscribe();

        return () => {
            isMounted = false;
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [triggerUpdate]);

    return (
        <div className="flex h-screen font-sans overflow-hidden text-gray-900 dark:text-text-primary">
            <Sidebar
                isCollapsed={isSidebarCollapsed}
                setCollapsed={setIsSidebarCollapsed}
                isMobileOpen={isMobileSidebarOpen}
                onMobileClose={() => setIsMobileSidebarOpen(false)}
            />

            <div className="flex-1 flex flex-col min-w-0">
                <header className="flex justify-between items-center px-4 sm:px-6 h-20 bg-white/80 dark:bg-glass-surface/50 backdrop-blur-lg border-b border-gray-200 dark:border-glass-border flex-shrink-0">
                    <div className="flex items-center">
                        <button
                            onClick={() => setIsMobileSidebarOpen(true)}
                            className="p-2 rounded-md text-gray-500 dark:text-text-secondary md:hidden mr-2"
                            aria-label="Open sidebar"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </button>
                        {/* Search Bar */}
                        <div className="relative hidden sm:block">
                            <input type="text" placeholder="Search..." className="bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-glass-border rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-neon-cyan focus:border-neon-cyan w-full max-w-xs transition-all" />
                            <svg className="w-5 h-5 text-gray-500 dark:text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <ThemeToggle />
                        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-text-secondary hover:text-gray-900 dark:hover:text-text-primary transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                        </button>
                        <UserDropdown />
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6">
                    <div key={location.pathname} className="animate-fade-in">
                        {children}
                    </div>
                </main>
            </div>
            {toastMessage && <Toast message={toastMessage} type="info" onDismiss={() => setToastMessage(null)} />}
        </div>
    );
};

export default AdminLayout;