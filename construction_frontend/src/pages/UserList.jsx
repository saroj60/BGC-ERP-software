import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showInactive, setShowInactive] = useState(false);
    const navigate = useNavigate();
    const isAdmin = localStorage.getItem('user_role') === 'ADMIN';

    useEffect(() => {
        if (!isAdmin) {
            navigate('/dashboard');
            return;
        }
        fetchUsers();
    }, [showInactive]);

    const fetchUsers = async () => {
        try {
            const url = showInactive ? 'accounts/users/' : 'accounts/users/?is_active=True';
            const response = await api.get(url);
            setUsers(Array.isArray(response.data) ? response.data : response.data.results || []);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch users');
            setLoading(false);
        }
    };

    const handleDelete = async (id, email) => {
        if (!window.confirm(`Are you sure you want to deactivate user ${email}?`)) return;
        try {
            await api.delete(`accounts/users/${id}/`);
            setUsers(users.map(u => u.id === id ? { ...u, is_active: false } : u));
        } catch (err) {
            alert('Failed to deactivate user');
        }
    };

    const handleActivate = async (id, email) => {
        if (!window.confirm(`Are you sure you want to reactivate user ${email}?`)) return;
        try {
            await api.post(`accounts/users/${id}/activate/`);
            setUsers(users.map(u => u.id === id ? { ...u, is_active: true } : u));
        } catch (err) {
            alert('Failed to reactivate user: ' + (err.response?.data?.detail || err.message));
        }
    };

    const handleResetPassword = async (id, email) => {
        const newPassword = prompt(`Enter new password for ${email}:`);
        if (!newPassword) return;

        try {
            await api.post(`accounts/users/${id}/reset-password/`, {
                password: newPassword,
                password_confirm: newPassword
            });
            alert(`Password for ${email} has been reset successfully.`);
        } catch (err) {
            alert('Failed to reset password: ' + (err.response?.data?.detail || err.message));
        }
    };

    const handleLoginAs = async (id, email) => {
        if (!window.confirm(`Are you sure you want to login as ${email}? You will be logged out of your current account.`)) return;

        try {
            const response = await api.post(`accounts/users/${id}/impersonate/`);
            const { access, refresh, user } = response.data;

            localStorage.clear();
            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);
            localStorage.setItem('user_role', user.role);
            localStorage.setItem('user_id', user.id);

            alert(`Switched to user ${email}`);
            window.location.href = '/dashboard';
        } catch (err) {
            console.error("Login As failed", err);
            alert('Failed to login as user: ' + (err.response?.data?.detail || err.message));
        }
    };

    const getRoleBadgeClass = (role) => {
        if (role === 'ADMIN') return 'badge-neutral';
        if (role === 'PROJECT_MANAGER') return 'badge-info';
        return 'badge-success'; // Site Engineer
    };

    if (loading) return <div className="flex justify-center items-center h-64">Loading users...</div>;
    if (error) return <div className="text-center text-danger p-8">{error}</div>;

    return (
        <div>
            <div className="page-header" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 className="text-2xl font-bold text-primary">Employee Management</h1>
                    <p className="text-secondary" style={{ fontSize: '0.9rem' }}>Manage access and roles for your team.</p>
                </div>

                <div className="flex items-center gap-3" style={{ flexWrap: 'wrap', marginTop: '1rem' }}>
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-secondary" style={{ background: '#f8fafc', padding: '6px 12px', borderRadius: '8px', border: '1px solid #eef2f6' }}>
                        <input
                            type="checkbox"
                            checked={showInactive}
                            onChange={(e) => setShowInactive(e.target.checked)}
                            style={{ width: '16px', height: '16px', accentColor: 'var(--primary-color)' }}
                        />
                        Show Inactive
                    </label>
                    <Link to="/users/new" className="btn btn-primary btn-sm">
                        + Add Employee
                    </Link>
                </div>
            </div>

            <div className="table-container shadow-sm" style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 16px', background: 'rgba(79,70,229,0.05)',
                    borderBottom: '1px solid #eef2f7',
                    fontSize: '0.7rem', color: 'var(--primary-color)', fontWeight: 500,
                }}>
                    ⇔ Swipe to see all details
                </div>
                <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                    <table className="modern-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.first_name || user.last_name ? `${user.first_name} ${user.last_name}` : <em className="text-light">-</em>}</td>
                                    <td className="font-medium text-primary">{user.email}</td>
                                    <td>
                                        <span className={`badge ${getRoleBadgeClass(user.role)}`}>
                                            {user.role ? user.role.replace('_', ' ') : 'N/A'}
                                        </span>
                                    </td>
                                    <td>
                                        <span style={{ color: user.is_active ? 'var(--success-color)' : 'var(--danger-color)', fontWeight: 'bold' }}>
                                            {user.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>{new Date(user.date_joined).toLocaleDateString()}</td>
                                    <td>
                                        {user.is_active ? (
                                            <div className="flex gap-2">
                                                {isAdmin && user.id !== parseInt(localStorage.getItem('user_id') || '0') && (
                                                    <button
                                                        onClick={() => handleLoginAs(user.id, user.email)}
                                                        className="btn btn-secondary btn-sm"
                                                        title={`Login as ${user.email}`}
                                                    >
                                                        🔐 Login As
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleResetPassword(user.id, user.email)}
                                                    className="btn btn-secondary btn-sm"
                                                    title="Set a new password"
                                                >
                                                    🔑 Reset Pwd
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id, user.email)}
                                                    className="btn btn-soft-danger btn-sm"
                                                >
                                                    🗑 Remove
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleActivate(user.id, user.email)}
                                                    className="btn btn-success btn-sm"
                                                >
                                                    ♻️ Reactivate
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-6">
                <Link to="/dashboard" className="text-secondary hover:text-primary transition-colors">← Back to Dashboard</Link>
            </div>
        </div>
    );
};

export default UserList;
