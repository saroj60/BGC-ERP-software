import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const MaterialApprovalList = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => { fetchRequests(); }, []);

    const fetchRequests = async () => {
        try {
            const response = await api.get('materials/');
            setRequests(Array.isArray(response.data) ? response.data : response.data.results || []);
        } catch (err) {
            setError('Failed to fetch material requests');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            await api.patch(`materials/${id}/`, { status: newStatus });
            setRequests(requests.map(req => req.id === id ? { ...req, status: newStatus } : req));
        } catch (err) {
            if (err.response?.status === 403) {
                alert('Permission Denied: Only Project Managers can approve/reject.');
            } else {
                alert('Failed to update status.');
            }
        }
    };

    const statusConfig = {
        APPROVED:  { color: '#059669', bg: '#d1fae5', border: '#6ee7b7', label: '✓ Approved' },
        REJECTED:  { color: '#dc2626', bg: '#fee2e2', border: '#fca5a5', label: '✕ Rejected' },
        REQUESTED: { color: '#d97706', bg: '#fef3c7', border: '#fcd34d', label: '⏳ Pending' },
    };

    const getStatusChip = (status) => {
        const cfg = statusConfig[status] || statusConfig.REQUESTED;
        return (
            <span style={{
                padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem',
                fontWeight: 600, background: cfg.bg, color: cfg.color,
                border: `1px solid ${cfg.border}`, whiteSpace: 'nowrap',
            }}>{cfg.label}</span>
        );
    };

    return (
        <div>
            {/* ── Page header ── */}
            <div className="page-header" style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '12px',
            }}>
                <div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>
                        🧱 Material Log
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0', fontSize: '0.9rem' }}>
                        Track and manage material requests for all projects.
                    </p>
                </div>

                {/* ✨ Premium "Request Material" button */}
                <Link
                    to="/materials/new"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '0.7rem 1.4rem',
                        borderRadius: '12px',
                        textDecoration: 'none',
                        fontWeight: 600,
                        fontSize: '0.92rem',
                        color: 'white',
                        background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                        boxShadow: '0 4px 14px rgba(79,70,229,0.35)',
                        transition: 'all 0.2s ease',
                        border: 'none',
                        whiteSpace: 'nowrap',
                        minHeight: '44px',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(79,70,229,0.45)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 14px rgba(79,70,229,0.35)';
                    }}
                >
                    {/* Brick icon */}
                    <span style={{
                        width: '28px', height: '28px',
                        background: 'rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1rem', flexShrink: 0,
                    }}>🧱</span>
                    Request Material
                </Link>
            </div>

            {error && (
                <div style={{ padding: '12px 16px', background: '#fee2e2', color: '#dc2626', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.9rem' }}>
                    ⚠ {error}
                </div>
            )}

            {/* ── Stats row ── */}
            {requests.length > 0 && (
                <div style={{ display: 'flex', gap: '12px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    {[
                        { label: 'Total',    count: requests.length,                                        color: '#4f46e5', bg: '#ede9fe' },
                        { label: 'Pending',  count: requests.filter(r => r.status === 'REQUESTED').length,  color: '#d97706', bg: '#fef3c7' },
                        { label: 'Approved', count: requests.filter(r => r.status === 'APPROVED').length,   color: '#059669', bg: '#d1fae5' },
                        { label: 'Rejected', count: requests.filter(r => r.status === 'REJECTED').length,   color: '#dc2626', bg: '#fee2e2' },
                    ].map(s => (
                        <div key={s.label} style={{
                            flex: '1 1 80px', minWidth: '80px',
                            background: s.bg, borderRadius: '12px',
                            padding: '12px 16px', textAlign: 'center',
                        }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: s.color }}>{s.count}</div>
                            <div style={{ fontSize: '0.75rem', color: s.color, fontWeight: 600, opacity: 0.85 }}>{s.label}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Table card ── */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading requests…</div>
            ) : (
                <div className="table-container shadow-md" style={{ background: 'white', borderRadius: '14px', border: '1px solid rgba(226,232,240,0.6)', overflow: 'hidden' }}>
                    {/* Swipe hint */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '8px 16px', background: 'rgba(79,70,229,0.05)',
                        borderBottom: '1px solid #eef2f7',
                        fontSize: '0.72rem', color: 'var(--primary-color)', fontWeight: 500,
                    }}>
                        ⇔ Swipe to see all columns
                    </div>

                    {/* Scrollable table */}
                    <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', touchAction: 'pan-x' }}>
                        <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc' }}>
                                    {['Project', 'Material', 'Quantity', 'Requested By', 'Status', 'Actions'].map(h => (
                                        <th key={h} style={{
                                            padding: '12px 16px', textAlign: 'left',
                                            fontSize: '0.78rem', fontWeight: 600,
                                            color: 'var(--text-secondary)', textTransform: 'uppercase',
                                            letterSpacing: '0.05em', borderBottom: '2px solid #eef2f7',
                                            whiteSpace: 'nowrap',
                                        }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {requests.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{ padding: '3rem', textAlign: 'center' }}>
                                            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🧱</div>
                                            <div style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>No material requests yet.</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '4px' }}>
                                                Click "Request Material" to submit your first request.
                                            </div>
                                        </td>
                                    </tr>
                                ) : requests.map((req, i) => (
                                    <tr key={req.id} style={{
                                        borderBottom: '1px solid #f1f5f9',
                                        background: i % 2 === 0 ? 'white' : '#fafbfc',
                                        transition: 'background 0.15s',
                                    }}>
                                        <td style={{ padding: '13px 16px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                                            {req.project_name || req.project}
                                        </td>
                                        <td style={{ padding: '13px 16px', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                                            {req.material_name}
                                        </td>
                                        <td style={{ padding: '13px 16px', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                                            {req.quantity} {req.unit}
                                        </td>
                                        <td style={{ padding: '13px 16px', fontSize: '0.88rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                                            {req.requested_by}
                                        </td>
                                        <td style={{ padding: '13px 16px' }}>
                                            {getStatusChip(req.status)}
                                        </td>
                                        <td style={{ padding: '13px 16px' }}>
                                            {req.status === 'REQUESTED' ? (
                                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                    <button
                                                        className="btn btn-soft-success btn-sm"
                                                        onClick={() => handleUpdateStatus(req.id, 'APPROVED')}
                                                        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                                                    >
                                                        ✓ App
                                                    </button>
                                                    <button
                                                        className="btn btn-soft-danger btn-sm"
                                                        onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                                                        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                                                    >
                                                        ✕ Rej
                                                    </button>
                                                </div>
                                            ) : (
                                                <span style={{ fontSize: '0.82rem', color: 'var(--text-light)' }}>—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MaterialApprovalList;
