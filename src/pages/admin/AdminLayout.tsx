import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import Sidebar from '../../components/admin/Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { useCrmUpdates } from '../../contexts/CrmUpdatesContext';
import { useTheme } from '../../contexts/ThemeContext';
import { NotificationProvider } from '../../contexts/NotificationContext';
import NotificationBell from '../../components/common/NotificationBell';
import { ADMIN_NAV_LINKS } from '../../constants';
import {
    Menu, Sun, Moon, ChevronDown, LogOut, User,
    LayoutDashboard, GitBranch, ClipboardCheck, FileText, Package
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_CRM_API_URL || 'http://localhost:3001';

/* ---- Theme Toggle ---- */
const ThemeToggle: React.FC = () => {
    const { theme, setTheme, isDark } = useTheme();
    return (
        <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="relative w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-150"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            style={{
                backgroundColor: 'rgb(var(--surface-2))',
                color: 'rgb(var(--text-1))',
                border: '1px solid rgb(var(--border-default))',
            }}
        >
            {isDark
                ? <Sun size={16} />
                : <Moon size={16} />
            }
        </button>
    );
};

/* ---- User Dropdown ---- */
const UserDropdown: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user, logout } = useAuth();
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleLogout = () => {
        logout();
        window.location.hash = '/login';
        window.location.reload();
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2.5 h-9 px-2.5 rounded-lg transition-all duration-150"
                style={{
                    backgroundColor: isOpen ? 'rgb(var(--surface-2))' : undefined,
                    border: '1px solid transparent',
                }}
                onMouseEnter={e => { if (!isOpen) e.currentTarget.style.backgroundColor = 'rgb(var(--surface-2))'; }}
                onMouseLeave={e => { if (!isOpen) e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
                {/* Avatar */}
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ backgroundColor: 'rgb(var(--accent))' }}>
                    {user?.profileImage
                        ? <img src={`${API_BASE_URL}/files/${user.profileImage}`} alt="avatar" className="w-7 h-7 rounded-full object-cover" />
                        : user?.name?.charAt(0).toUpperCase()
                    }
                </div>
                <div className="text-left hidden sm:block">
                    <p className="text-xs font-600 leading-none" style={{ color: 'rgb(var(--text-0))' }}>{user?.name}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'rgb(var(--text-2))' }}>{user?.role}</p>
                </div>
                <ChevronDown size={13} className={`transition-transform duration-200 hidden sm:block ${isOpen ? 'rotate-180' : ''}`}
                    style={{ color: 'rgb(var(--text-2))' }} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-1.5 w-44 rounded-xl border py-1 z-[200] anim-fade-up"
                    style={{
                        backgroundColor: 'rgb(var(--surface-1))',
                        border: '1px solid rgb(var(--border-default))',
                        boxShadow: 'var(--shadow-lg)',
                    }}>
                    <Link
                        to="/admin/profile"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm transition-colors"
                        style={{ color: 'rgb(var(--text-1))' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgb(var(--surface-2))'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <User size={14} />
                        My Profile
                    </Link>
                    <div className="my-1 border-t" style={{ borderColor: 'rgb(var(--border-muted))' }} />
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 w-full px-3 py-2 text-sm transition-colors"
                        style={{ color: 'rgb(var(--color-danger))' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgb(var(--color-danger) / 0.08)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <LogOut size={14} />
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
};

/* ---- Mobile Bottom Nav ---- */
const BOTTOM_NAV_LINKS = [
    { name: 'Dashboard',  path: '/admin',           icon: LayoutDashboard, end: true },
    { name: 'Leads',      path: '/admin/leads',      icon: GitBranch,       end: false },
    { name: 'Surveys',    path: '/admin/surveys',    icon: ClipboardCheck,  end: false },
    { name: 'Quotes',     path: '/admin/quotations', icon: FileText,        end: false },
    { name: 'Inventory',  path: '/admin/inventory',  icon: Package,         end: false },
];

const BottomNav: React.FC = () => {
    const location = useLocation();
    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden border-t"
            style={{
                backgroundColor: 'rgb(var(--topbar-bg))',
                borderColor: 'rgb(var(--border-default))',
                paddingBottom: 'env(safe-area-inset-bottom)',
            }}>
            {BOTTOM_NAV_LINKS.map(link => {
                const Icon = link.icon;
                const isActive = link.end
                    ? location.pathname === link.path
                    : location.pathname.startsWith(link.path);
                return (
                    <NavLink
                        key={link.path}
                        to={link.path}
                        end={link.end}
                        className="flex-1 flex flex-col items-center justify-center py-2 gap-1 text-[10px] font-500 transition-colors"
                        style={{ color: isActive ? 'rgb(var(--accent))' : 'rgb(var(--text-2))' }}
                    >
                        <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                        <span>{link.name}</span>
                    </NavLink>
                );
            })}
        </div>
    );
};

/* ---- Page breadcrumb ---- */
const Breadcrumb: React.FC = () => {
    const location = useLocation();
    const parts = location.pathname.split('/').filter(Boolean);
    const label = parts.length > 1
        ? parts[parts.length - 1].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
        : 'Dashboard';
    return (
        <span className="text-sm font-600" style={{ color: 'rgb(var(--text-0))' }}>
            {label}
        </span>
    );
};

/* ---- Main Layout ---- */
interface AdminLayoutProps { children: React.ReactNode; }

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const location = useLocation();
    const { isDark } = useTheme();

    useEffect(() => {
        setIsMobileSidebarOpen(false);
    }, [location.pathname]);

    return (
        <NotificationProvider>
            {/* Apply dark class conditionally to the CRM container to prevent bleeding to the public website */}
            <div className={`crm-app flex h-dvh overflow-hidden ${isDark ? 'dark' : ''}`} style={{ fontFamily: 'Inter, system-ui, sans-serif', backgroundColor: 'rgb(var(--surface-0))' }}>

                {/* Sidebar */}
                <Sidebar
                    isCollapsed={isSidebarCollapsed}
                    setCollapsed={setIsSidebarCollapsed}
                    isMobileOpen={isMobileSidebarOpen}
                    onMobileClose={() => setIsMobileSidebarOpen(false)}
                />

                {/* Main column */}
                <div className="flex-1 flex flex-col min-w-0">

                    {/* Topbar */}
                    <header className="flex-shrink-0 h-[60px] flex items-center justify-between px-4 md:px-5 border-b z-20"
                        style={{
                            backgroundColor: 'rgb(var(--topbar-bg))',
                            borderColor: 'rgb(var(--border-default))',
                        }}>
                        {/* Left: hamburger (mobile) + breadcrumb */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsMobileSidebarOpen(true)}
                                className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
                                style={{ color: 'rgb(var(--text-1))' }}
                                aria-label="Open menu"
                            >
                                <Menu size={20} />
                            </button>
                            <Breadcrumb />
                        </div>

                        {/* Right: notifications + theme toggle + user */}
                        <div className="flex items-center gap-2">
                            <NotificationBell />
                            <ThemeToggle />
                            <UserDropdown />
                        </div>
                    </header>

                    {/* Page content */}
                    <main className="flex-1 overflow-y-auto overflow-x-hidden pb-[68px] md:pb-0">
                        <div key={location.pathname} className="anim-fade-up" style={{ animationDuration: '0.25s' }}>
                            {children}
                        </div>
                    </main>
                </div>

                {/* Mobile bottom navigation */}
                <BottomNav />
            </div>
        </NotificationProvider>
    );
};

export default AdminLayout;