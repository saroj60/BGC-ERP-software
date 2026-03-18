import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const UserForm = () => {
    const navigate = useNavigate();
    const isAdmin = localStorage.getItem('user_role') === 'ADMIN';

    // Redirect if not admin (client-side check)
    if (!isAdmin) {
        // We'll handle this in useEffect to avoid render warning, but simple return here works for now or let useEffect handle it
    }

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        password_confirm: '',
        role: 'SITE_ENGINEER'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password !== formData.password_confirm) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            // Split full name into first and last name
            const names = formData.fullName.trim().split(' ');
            const firstName = names[0] || '';
            const lastName = names.slice(1).join(' ') || '';

            const payload = {
                ...formData,
                first_name: firstName,
                last_name: lastName
            };
            delete payload.fullName; // Remove temporary field

            await api.post('accounts/users/', payload);
            navigate('/users');
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to create user. Check if email exists.');
            setLoading(false);
        }
    };

    const styles = {
        container: {
            padding: '40px',
            maxWidth: '600px',
            margin: '40px auto',
            fontFamily: "'Segoe UI', sans-serif",
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        },
        header: {
            textAlign: 'center',
            marginBottom: '30px',
            color: '#2c3e50',
            fontSize: '24px',
            fontWeight: '600'
        },
        formGroup: { marginBottom: '20px' },
        label: { display: 'block', marginBottom: '8px', fontWeight: '600', color: '#34495e' },
        input: {
            width: '100%', padding: '12px', border: '1px solid #dfe6e9', borderRadius: '6px',
            fontSize: '15px', outline: 'none', boxSizing: 'border-box'
        },
        select: {
            width: '100%', padding: '12px', border: '1px solid #dfe6e9', borderRadius: '6px',
            fontSize: '15px', backgroundColor: 'white', outline: 'none', boxSizing: 'border-box'
        },
        button: {
            width: '100%', padding: '14px', backgroundColor: '#3498db', color: 'white',
            border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: '600',
            cursor: 'pointer', marginTop: '10px'
        },
        cancelBtn: {
            width: '100%', padding: '14px', backgroundColor: '#95a5a6', color: 'white',
            border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: '600',
            cursor: 'pointer', marginTop: '10px'
        },
        error: {
            backgroundColor: '#fee2e2', color: '#c0392b', padding: '10px', borderRadius: '6px',
            marginBottom: '20px', textAlign: 'center'
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.header}>Create New User</h2>
            {error && <div style={styles.error}>{error}</div>}

            <form onSubmit={handleSubmit}>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Full Name</label>
                    <input name="fullName" type="text" value={formData.fullName} onChange={handleChange} required style={styles.input} placeholder="e.g. John Doe" />
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>Email Address</label>
                    <input name="email" type="email" value={formData.email} onChange={handleChange} required style={styles.input} />
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>Role</label>
                    <select name="role" value={formData.role} onChange={handleChange} style={styles.select}>
                        <option value="SITE_ENGINEER">Site Engineer</option>
                        <option value="PROJECT_MANAGER">Project Manager</option>
                        <option value="ADMIN">Admin</option>
                    </select>
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>Password</label>
                    <input name="password" type="password" value={formData.password} onChange={handleChange} required style={styles.input} placeholder="Min 8 chars, strong" />
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>Confirm Password</label>
                    <input name="password_confirm" type="password" value={formData.password_confirm} onChange={handleChange} required style={styles.input} />
                </div>

                <button type="submit" disabled={loading} style={styles.button}>
                    {loading ? 'Creating...' : 'Create User'}
                </button>
                <button type="button" onClick={() => navigate('/users')} style={styles.cancelBtn}>
                    Cancel
                </button>
            </form>
        </div>
    );
};

export default UserForm;
