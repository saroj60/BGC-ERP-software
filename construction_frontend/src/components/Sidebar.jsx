import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Sidebar = ({ isOpen, onClose }) => {
    const role = localStorage.getItem('user_role');
    const email = localStorage.getItem('user_email') || `${role?.toLowerCase() || 'user'}@company.com`;
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const getInitials = (roleName) => {
        if (!roleName) return 'G';
        return roleName.substring(0, 2).toUpperCase();
    };

    // Auto-close sidebar when a nav link is clicked (mobile)
    const handleNavClick = () => {
        if (onClose) onClose();
    };

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: '📊' },
        { name: 'Projects', path: '/projects', icon: '🏗️' },
    ];

    if (role === 'ADMIN' || role === 'PROJECT_MANAGER' || role === 'SITE_ENGINEER') {
        navItems.push({ name: 'Tasks', path: '/tasks', icon: '📝' });
        navItems.push({ name: 'Daily Reports', path: '/reports', icon: '📄' });
        navItems.push({ name: 'Materials', path: '/materials', icon: '🧱' });
        navItems.push({ name: 'Attendance', path: '/attendance', icon: '📋' });
        navItems.push({ name: 'Workers', path: '/workers', icon: '👷' });
        navItems.push({ name: 'Vehicles', path: '/vehicles', icon: '🚜' });
    }

    if (role === 'PROJECT_MANAGER' || role === 'ADMIN') {
        navItems.push({ name: 'Tenders & Bids', path: '/tenders', icon: '⚖️' });
        navItems.push({ name: 'Expenses', path: '/expenses', icon: '💰' });
        navItems.push({ name: 'Material Approvals', path: '/materials/approvals', icon: '✅' });
        navItems.push({ name: 'Analytics', path: '/analytics', icon: '📊' });
        navItems.push({ name: 'HR Hub', path: '/hr', icon: '💼' });
    }

    if (role === 'ADMIN') {
        navItems.push({ name: 'Employees', path: '/users', icon: '👥' });
        navItems.push({ name: 'Inventory', path: '/inventory', icon: '📦' });
    }

    return (
        <>
            {/* ── Sidebar panel ── */}
            <div
                id="sidebar-panel"
                className={isOpen ? 'sidebar-open' : ''}
                style={{
                    width: '280px',
                    height: '100vh',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 150,
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRight: '1px solid rgba(226, 232, 240, 0.8)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}>
                {/* Header */}
                <div style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid rgba(0,0,0,0.03)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <div>
                        <div style={{
                            fontSize: '1.3rem',
                            fontWeight: '700',
                            color: 'var(--primary-color)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontFamily: "'Outfit', sans-serif",
                        }}>
                            <span>🏗️</span> ConstructionOS
                        </div>
                        <div style={{
                            marginTop: '6px',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '0.7rem',
                            fontWeight: '600',
                            backgroundColor: 'var(--primary-light)',
                            color: 'var(--primary-color)',
                            display: 'inline-block',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                        }}>
                            {role ? role.replace('_', ' ') : 'Guest'}
                        </div>
                    </div>

                    {/* Mobile close button */}
                    <button
                        onClick={onClose}
                        aria-label="Close menu"
                        style={{
                            background: '#f1f5f9',
                            border: 'none',
                            borderRadius: '8px',
                            width: '32px',
                            height: '32px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1rem',
                            color: 'var(--text-secondary)',
                            flexShrink: 0,
                            // Only visible on mobile (where Layout passes onClose)
                            visibility: onClose ? 'visible' : 'hidden',
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* Nav items */}
                <nav style={{
                    flex: 1,
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    overflowY: 'auto',
                    overscrollBehavior: 'contain',
                }}>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={handleNavClick}
                            style={({ isActive }) => ({
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '11px 14px',
                                borderRadius: '10px',
                                textDecoration: 'none',
                                color: isActive ? 'var(--primary-color)' : 'var(--text-secondary)',
                                fontWeight: isActive ? '600' : '500',
                                fontSize: '0.9rem',
                                backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                                transition: 'all 0.15s',
                                // Larger touch targets on mobile
                                minHeight: '44px',
                            })}
                        >
                            <span style={{ fontSize: '1.15rem', flexShrink: 0 }}>{item.icon}</span>
                            {item.name}
                        </NavLink>
                    ))}
                </nav>

                {/* Footer / profile */}
                <div style={{
                    padding: '1rem',
                    borderTop: '1px solid rgba(0,0,0,0.05)',
                    backgroundColor: 'rgba(248, 250, 252, 0.6)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px' }}>
                        <div style={{
                            width: '38px', height: '38px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--primary-color), #6366f1)',
                            color: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 'bold', fontSize: '0.85rem',
                            flexShrink: 0,
                        }}>
                            {getInitials(role)}
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                                {role ? role.replace('_', ' ') : 'User'}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {email}
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            title="Logout"
                            style={{
                                background: '#fef2f2',
                                border: 'none',
                                borderRadius: '8px',
                                width: '34px',
                                height: '34px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#dc2626',
                                flexShrink: 0,
                                transition: 'background 0.2s',
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                <polyline points="16 17 21 12 16 7"></polyline>
                                <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* CSS for desktop always-visible + mobile drawer */}
            <style>{`
                /* Desktop: always show sidebar */
                @media (min-width: 769px) {
                    #sidebar-panel {
                        transform: translateX(0) !important;
                        box-shadow: none !important;
                    }
                }
                /* Mobile: hidden by default, open when .sidebar-open */
                @media (max-width: 768px) {
                    #sidebar-panel {
                        transform: translateX(-100%);
                    }
                    #sidebar-panel.sidebar-open {
                        transform: translateX(0);
                        box-shadow: 4px 0 24px rgba(0,0,0,0.15) !important;
                    }
                }
            `}</style>
        </>
    );
};

export default Sidebar;
