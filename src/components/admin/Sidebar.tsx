import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ADMIN_NAV_LINKS } from '../../constants';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, Zap } from 'lucide-react';

interface SidebarProps {
    isCollapsed: boolean;
    setCollapsed: (v: boolean) => void;
    isMobileOpen: boolean;
    onMobileClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setCollapsed, isMobileOpen, onMobileClose }) => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const visibleLinks = ADMIN_NAV_LINKS.filter(link => user && link.roles.includes(user.role));

    const handleLogout = () => {
        logout();
        window.location.hash = '/login';
        window.location.reload();
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full" style={{
            backgroundColor: 'rgb(var(--sidebar-bg))',
            borderRight: '1px solid rgb(var(--sidebar-border))',
        }}>
            {/* Logo */}
            <div className={`flex items-center gap-3 h-[60px] flex-shrink-0 px-4 border-b`}
                style={{ borderColor: 'rgb(var(--sidebar-border))' }}>
                <div className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
                    style={{ backgroundColor: 'rgb(var(--accent))' }}>
                    <Zap size={16} className="text-white" fill="white" />
                </div>
                {!isCollapsed && (
                    <div className="min-w-0">
                        <p className="text-sm font-700 leading-none truncate" style={{ color: 'rgb(var(--text-0))' }}>
                            Varcas Energy
                        </p>
                        <p className="text-[10px] mt-0.5" style={{ color: 'rgb(var(--text-2))' }}>
                            CRM Platform
                        </p>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto hide-scrollbar">
                {visibleLinks.map((link) => {
                    const isActive = link.path === '/admin'
                        ? location.pathname === '/admin'
                        : location.pathname.startsWith(link.path);

                    return (
                        <NavLink
                            key={link.name}
                            to={link.path}
                            title={isCollapsed ? link.name : undefined}
                            onClick={onMobileClose}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group relative ${
                                isActive
                                    ? 'text-accent'
                                    : 'hover:bg-surface-2'
                            }`}
                            style={{
                                backgroundColor: isActive ? 'rgb(var(--accent) / 0.1)' : undefined,
                                color: isActive ? 'rgb(var(--accent))' : 'rgb(var(--text-2))',
                            }}
                        >
                            {/* Active indicator */}
                            {isActive && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r"
                                    style={{ backgroundColor: 'rgb(var(--accent))' }} />
                            )}

                            {/* Icon */}
                            <span className={`flex-shrink-0 transition-colors ${isActive ? '' : 'group-hover:text-text-0'}`}
                                style={{ color: isActive ? 'rgb(var(--accent))' : 'rgb(var(--text-2))' }}>
                                {link.icon}
                            </span>

                            {/* Label */}
                            {!isCollapsed && (
                                <span className="truncate" style={{ color: isActive ? 'rgb(var(--accent))' : 'rgb(var(--text-1))' }}>
                                    {link.name}
                                </span>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            {/* User section + logout */}
            <div className="p-3 border-t space-y-1" style={{ borderColor: 'rgb(var(--sidebar-border))' }}>
                {!isCollapsed && user && (
                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg mb-1"
                        style={{ backgroundColor: 'rgb(var(--surface-2))' }}>
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                            style={{ backgroundColor: 'rgb(var(--accent))' }}>
                            {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-600 truncate" style={{ color: 'rgb(var(--text-0))' }}>{user.name}</p>
                            <p className="text-[10px] truncate" style={{ color: 'rgb(var(--text-2))' }}>{user.role}</p>
                        </div>
                    </div>
                )}

                <button
                    onClick={handleLogout}
                    title="Logout"
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
                    style={{ color: 'rgb(var(--color-danger))' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgb(var(--color-danger) / 0.08)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                    <LogOut size={17} className="flex-shrink-0" />
                    {!isCollapsed && <span>Logout</span>}
                </button>
            </div>

            {/* Collapse toggle (desktop only) */}
            <button
                onClick={() => setCollapsed(!isCollapsed)}
                className="absolute -right-3 top-[72px] w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-150 z-50 hidden lg:flex"
                style={{
                    backgroundColor: 'rgb(var(--surface-1))',
                    borderColor: 'rgb(var(--border-default))',
                    color: 'rgb(var(--text-2))',
                    boxShadow: 'var(--shadow-md)',
                }}
                title={isCollapsed ? 'Expand' : 'Collapse'}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}>
                    <polyline points="15 18 9 12 15 6" />
                </svg>
            </button>
        </div>
    );

    return (
        <>
            {/* Mobile drawer */}
            <div className="md:hidden">
                {isMobileOpen && (
                    <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={onMobileClose} />
                )}
                <div className={`fixed top-0 left-0 h-full w-60 z-50 transition-transform duration-300 ease-out ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <SidebarContent />
                </div>
            </div>

            {/* Desktop sidebar */}
            <div className={`hidden md:flex md:flex-shrink-0 relative z-30 transition-all duration-300 ${isCollapsed ? 'lg:w-[64px]' : 'lg:w-[240px]'} md:w-[64px]`}>
                <div className="w-full">
                    <SidebarContent />
                </div>
            </div>
        </>
    );
};

export default Sidebar;