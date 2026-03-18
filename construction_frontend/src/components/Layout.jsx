import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Close sidebar on ESC key
    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') setSidebarOpen(false); };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, []);

    // Prevent body scroll when sidebar is open on mobile
    useEffect(() => {
        if (sidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [sidebarOpen]);

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>

            {/* ── Mobile top header bar (hidden on desktop via CSS) ── */}
            <header className="mobile-header">
                <div className="mobile-header-brand">
                    <span>🏗️</span> ConstructionOS
                </div>
                <button
                    className="hamburger-btn"
                    onClick={() => setSidebarOpen(true)}
                    aria-label="Open menu"
                    aria-expanded={sidebarOpen}
                >
                    <span />
                    <span />
                    <span />
                </button>
            </header>

            {/* ── Sidebar overlay (mobile tap-outside-to-close) ── */}
            {sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* ── Sidebar (always shown on desktop, drawer on mobile) ── */}
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* ── Main content ── */}
            <main
                className="mobile-main-content"
                style={{
                    flex: 1,
                    marginLeft: '280px',
                    padding: '2rem',
                    width: 'calc(100% - 280px)',
                    maxWidth: '1600px',
                    boxSizing: 'border-box',
                }}
            >
                <div style={{ margin: '0 auto', maxWidth: '1200px' }}>
                    {children}
                </div>
            </main>

            {/* ── Responsive style override to reset margin on mobile ── */}
            <style>{`
                @media (max-width: 768px) {
                    main.mobile-main-content {
                        margin-left: 0 !important;
                        width: 100% !important;
                        padding: 1rem !important;
                        padding-top: 76px !important;
                        box-sizing: border-box !important;
                    }
                    /* Remove extra padding from page containers */
                    main.mobile-main-content > div {
                        padding: 0 !important;
                        max-width: 100% !important;
                    }
                    /* All page headers — wrap instead of overflow */
                    .page-header {
                        flex-wrap: wrap !important;
                        gap: 10px !important;
                    }
                    .page-header h1,
                    .page-header h2 {
                        font-size: 1.3rem !important;
                        word-break: break-word !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default Layout;
