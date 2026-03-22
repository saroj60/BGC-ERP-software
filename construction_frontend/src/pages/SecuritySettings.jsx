import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const SecuritySettings = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const response = await api.get('accounts/sessions/');
            setSessions(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch active sessions');
            setLoading(false);
        }
    };

    const handleLogoutSession = async (sessionId) => {
        if (!window.confirm('Are you sure you want to log out from this device?')) return;
        
        try {
            await api.post(`accounts/sessions/${sessionId}/logout/`);
            setSessions(sessions.filter(s => s.id !== sessionId));
        } catch (err) {
            alert('Failed to terminate session');
        }
    };

    const getDeviceIcon = (deviceName) => {
        if (!deviceName) return '💻';
        const name = deviceName.toLowerCase();
        if (name.includes('iphone') || name.includes('android')) return '📱';
        if (name.includes('ipad')) return '📟';
        if (name.includes('windows') || name.includes('mac') || name.includes('linux')) return '💻';
        return '🌐';
    };

    if (loading) return <div className="flex justify-center items-center h-64">Loading security settings...</div>;

    return (
        <div className="animate-fade-in">
            <div className="page-header" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 className="text-2xl font-bold text-primary">Security Settings</h1>
                    <p className="text-secondary" style={{ fontSize: '0.9rem' }}>Manage your active sessions and devices.</p>
                </div>
            </div>

            <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <span style={{ fontSize: '1.2rem' }}>🛡️</span> Active Sessions
                </h3>
                <p className="text-secondary mb-6" style={{ fontSize: '0.9rem' }}>
                    These are the devices currently logged into your account. You can log out of any session remotely.
                </p>

                {error && <div className="badge badge-danger mb-4 w-full justify-center py-2">{error}</div>}

                <div className="table-container shadow-sm p-0" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '8px 16px', background: 'rgba(79,70,229,0.05)',
                        borderBottom: '1px solid #eef2f7',
                        fontSize: '0.7rem', color: 'var(--primary-color)', fontWeight: 500,
                    }}>
                        ⇔ Swipe to see session details
                    </div>
                    <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                        <table className="modern-table">
                            <thead>
                                <tr>
                                    <th>Device</th>
                                    <th>IP Address</th>
                                    <th>Last Active</th>
                                    <th>Logged In</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sessions.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-8 text-secondary">No other active sessions found.</td>
                                    </tr>
                                ) : (
                                    sessions.map((session) => (
                                        <tr key={session.id}>
                                            <td className="font-medium">
                                                <div className="flex items-center gap-3">
                                                    <span style={{ fontSize: '1.2rem' }}>{getDeviceIcon(session.device_name)}</span>
                                                    <div>
                                                        <div className="text-primary font-bold">{session.device_name || 'Unknown Device'}</div>
                                                        <div className="text-light" style={{ fontSize: '0.75rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                            {session.user_agent.substring(0, 50)}...
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-secondary font-mono" style={{ fontSize: '0.85rem' }}>{session.ip_address}</td>
                                            <td>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{new Date(session.last_active).toLocaleDateString()}</span>
                                                    <span className="text-light" style={{ fontSize: '0.75rem' }}>{new Date(session.last_active).toLocaleTimeString()}</span>
                                                </div>
                                            </td>
                                            <td>{new Date(session.created_at).toLocaleDateString()}</td>
                                            <td>
                                                <button 
                                                    onClick={() => handleLogoutSession(session.id)}
                                                    className="btn btn-soft-danger btn-sm"
                                                >
                                                    🚪 Log Out
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="glass-card" style={{ padding: '2rem' }}>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <span style={{ fontSize: '1.2rem' }}>🔑</span> Password & Account
                </h3>
                <p className="text-secondary mb-6" style={{ fontSize: '0.9rem' }}>
                    It is recommended to change your password periodically to keep your account secure.
                </p>
                <div className="flex gap-4 mobile-stack">
                    <button className="btn btn-secondary" onClick={() => alert('Change password feature is coming soon.')}>
                        Change Password
                    </button>
                    <button className="btn btn-ghost text-danger" onClick={() => alert('Please contact administrator to deactivate account.')}>
                        Deactivate Account
                    </button>
                </div>
            </div>

            <div className="mt-8">
                <Link to="/dashboard" className="text-secondary hover:text-primary transition-colors flex items-center gap-2">
                    ← Back to Dashboard
                </Link>
            </div>
        </div>
    );
};

export default SecuritySettings;
