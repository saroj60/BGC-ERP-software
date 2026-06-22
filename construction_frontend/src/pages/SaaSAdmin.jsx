import React, { useState, useEffect } from 'react';
import axios from '../api/axios';

const SaaSAdmin = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        subdomain: '',
        admin_email: '',
        admin_password: '',
        logo: '',
        theme_color: '#4f46e5'
    });

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            // NOTE: the endpoint we created is /api/saas/companies/
            const response = await axios.get('/api/saas/companies/');
            setCompanies(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load companies. Make sure you are a Super Admin.');
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/saas/companies/', formData);
            setShowForm(false);
            setFormData({ name: '', subdomain: '', admin_email: '', admin_password: '', logo: '', theme_color: '#4f46e5' });
            fetchCompanies();
        } catch (err) {
            setError(err.response?.data?.detail || 'Error creating company.');
        }
    };

    if (loading) return <div className="page-container">Loading...</div>;

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">SaaS Super Admin</h1>
                    <p className="page-subtitle">Provision and manage isolated client companies</p>
                </div>
                <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : '+ Provision New Company'}
                </button>
            </div>

            {error && <div className="error-alert">{error}</div>}

            {showForm && (
                <div className="form-card" style={{ marginBottom: '2rem' }}>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div className="form-group">
                                <label>Company Name</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Subdomain (e.g. apex)</label>
                                <input type="text" name="subdomain" value={formData.subdomain} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Initial Admin Email</label>
                                <input type="email" name="admin_email" value={formData.admin_email} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Initial Admin Password</label>
                                <input type="text" name="admin_password" value={formData.admin_password} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Logo URL (Optional)</label>
                                <input type="url" name="logo" value={formData.logo} onChange={handleChange} placeholder="https://example.com/logo.png" />
                            </div>
                            <div className="form-group">
                                <label>Primary Theme Color</label>
                                <input type="color" name="theme_color" value={formData.theme_color} onChange={handleChange} style={{ height: '40px', padding: '2px', width: '100%' }} />
                            </div>
                        </div>
                        <button type="submit" className="btn-primary">Provision Tenant Space</button>
                    </form>
                </div>
            )}

            <div className="card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Company Name</th>
                            <th>Subdomain</th>
                            <th>Status</th>
                            <th>Created On</th>
                        </tr>
                    </thead>
                    <tbody>
                        {companies.length > 0 ? (
                            companies.map((c) => (
                                <tr key={c.id}>
                                    <td>{c.id}</td>
                                    <td style={{ fontWeight: '600' }}>{c.name}</td>
                                    <td><span className="status-badge" style={{ background: '#e0e7ff', color: '#3730a3' }}>{c.subdomain}</span></td>
                                    <td>
                                        <span className={`status-badge ${c.is_active ? 'status-approved' : 'status-rejected'}`}>
                                            {c.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>{new Date(c.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No companies found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SaaSAdmin;
