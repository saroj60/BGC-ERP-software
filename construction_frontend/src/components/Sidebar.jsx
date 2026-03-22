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

    const mainItems = [
        { name: 'Dashboard', path: '/dashboard', icon: '📊' },
        { name: 'Projects', path: '/projects', icon: '🏗️' },
        { name: 'Security', path: '/security', icon: '🛡️' },
    ];

    const operationsItems = [];
    if (role === 'ADMIN' || role === 'PROJECT_MANAGER' || role === 'SITE_ENGINEER') {
        operationsItems.push({ name: 'Daily Reports', path: '/reports', icon: '📄' });
        operationsItems.push({ name: 'Tasks', path: '/tasks', icon: '📝' });
        operationsItems.push({ name: 'Attendance', path: '/attendance', icon: '📋' });
    }

    const resourceItems = [];
    if (role === 'ADMIN' || role === 'PROJECT_MANAGER' || role === 'SITE_ENGINEER') {
        resourceItems.push({ name: 'Materials', path: '/materials', icon: '🧱' });
        resourceItems.push({ name: 'Workers', path: '/workers', icon: '👷' });
        resourceItems.push({ name: 'Vehicles', path: '/vehicles', icon: '🚜' });
    }

    const managementItems = [];
    if (role === 'PROJECT_MANAGER' || role === 'ADMIN') {
        managementItems.push({ name: 'Tenders & Bids', path: '/tenders', icon: '⚖️' });
        managementItems.push({ name: 'Expenses', path: '/expenses', icon: '💰' });
        managementItems.push({ name: 'Material Approvals', path: '/materials/approvals', icon: '✅' });
        managementItems.push({ name: 'Analytics', path: '/analytics', icon: '📊' });
    }

    const adminItems = [];
    if (role === 'ADMIN') {
        adminItems.push({ name: 'Employees', path: '/users', icon: '👥' });
        adminItems.push({ name: 'Inventory', path: '/inventory', icon: '📦' });
        adminItems.push({ name: 'HR Hub', path: '/hr', icon: '💼' });
    }

    const renderNavGroup = (title, items) => {
        if (items.length === 0) return null;
        return (
            <>
                <div className="nav-section-title">{title}</div>
                {items.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={handleNavClick}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        {item.name}
                    </NavLink>
                ))}
            </>
        );
    };

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
                    backgroundColor: '#ffffff',
                    borderRight: '1px solid #eef2f6',
                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}>
                {/* Header */}
                <div style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid #f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <div>
                        <div style={{
                            fontSize: '1.3rem',
                            fontWeight: '800',
                            color: 'var(--primary-color)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontFamily: "'Outfit', sans-serif",
                            letterSpacing: '-0.02em',
                        }}>
                             Bhagat Grp of Construction
                        </div>
                        <div style={{
                            marginTop: '4px',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            fontSize: '0.65rem',
                            fontWeight: '600',
                            backgroundColor: 'var(--primary-light)',
                            color: 'var(--primary-color)',
                            display: 'inline-block',
                            textTransform: 'uppercase',
                        }}>
                            {role ? role.replace('_', ' ') : 'Guest'}
                        </div>
                    </div>
 
                    {/* Mobile close button */}
                    <button
                        className="mobile-close-btn"
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
                            visibility: onClose ? 'visible' : 'hidden',
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* Nav items */}
                <nav style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>
                    {renderNavGroup('Overview', mainItems)}
                    {renderNavGroup('Operations', operationsItems)}
                    {renderNavGroup('Resources', resourceItems)}
                    {renderNavGroup('Management', managementItems)}
                    {renderNavGroup('Administration', adminItems)}
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
                    .mobile-close-btn {
                        display: none !important;
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
