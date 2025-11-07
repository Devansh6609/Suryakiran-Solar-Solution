import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Sidebar from '../../components/admin/Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { useCrmUpdates } from '../../contexts/CrmUpdatesContext';
import Toast from '../../components/admin/Toast';

const API_BASE_URL = 'http://localhost:3001';

interface AdminLayoutProps {
    children: React.ReactNode;
}

const UserDropdown: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { logout, user } = useAuth();
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

    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center space-x-3 hover:bg-gray-100 p-2 rounded-lg transition-colors">
                <img className="h-9 w-9 rounded-full object-cover" src="https://picsum.photos/100/100?random=40" alt="Admin user avatar" />
                <div className="text-left hidden md:block">
                    <div className="font-medium text-sm text-gray-800">{user?.name}</div>
                    <div className="text-xs text-gray-500">{user?.role}</div>
                </div>
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
                    <Link to="/admin/profile" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Profile</Link>
                    <button onClick={logout} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
};


const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const location = useLocation();
    const { triggerUpdate } = useCrmUpdates();
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

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
                // Wait before retrying to avoid spamming the server
                await new Promise(resolve => setTimeout(resolve, 5000));
            }

            // Resubscribe immediately after success or after retry delay
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
        <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
            <Sidebar isCollapsed={isSidebarCollapsed} setCollapsed={setIsSidebarCollapsed} />

            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
                <header className="flex justify-between items-center p-4 bg-white/80 backdrop-blur-sm border-b border-gray-200">
                    <div className="flex items-center">
                        <h1 className="text-xl font-semibold text-gray-800">SuryaKiran CRM</h1>
                    </div>
                    <UserDropdown />
                </header>

                <main className="flex-1 overflow-y-auto overflow-x-auto bg-gray-50 p-6">
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
