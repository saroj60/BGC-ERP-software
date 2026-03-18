import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';

const ProjectForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        name: '',
        client_name: '',
        location: '',
        start_date: '',
        end_date: '',
        status: 'PLANNED',
        project_manager: '',
        site_engineers: [],
        budget: ''
    });
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUsers();
        if (isEdit) {
            fetchProject();
        }
    }, [id]);

    const fetchUsers = async () => {
        try {
            // Fetch all users to filter by role client-side
            const response = await api.get('accounts/users/');
            setUsers(Array.isArray(response.data) ? response.data : response.data.results || []);
        } catch (err) {
            console.error("Failed to fetch users", err);
        }
    };

    const fetchProject = async () => {
        try {
            const response = await api.get(`projects/${id}/`);
            setFormData(response.data);
        } catch (err) {
            setError('Failed to fetch project details');
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isEdit) {
                await api.put(`projects/${id}/`, formData);
            } else {
                await api.post('projects/', formData);
            }
            navigate('/projects');
        } catch (err) {
            console.error(err);
            setError('Failed to save project');
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({ ...formData, background_image: e.target.files[0] });
        }
    };

    // Helper to toggle engineer selection
    const toggleEngineer = (engineerId) => {
        const currentEngineers = formData.site_engineers || [];
        if (currentEngineers.includes(engineerId)) {
            setFormData({ ...formData, site_engineers: currentEngineers.filter(id => id !== engineerId) });
        } else {
            setFormData({ ...formData, site_engineers: [...currentEngineers, engineerId] });
        }
    };

    return (
        <div className="glass-panel animate-fade-in" style={{ padding: '2.5rem', maxWidth: '800px', margin: '2rem auto', borderRadius: 'var(--radius-xl)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2.5rem' }}>
                <div style={{ padding: '0.75rem', background: 'var(--primary-light)', borderRadius: 'var(--radius-lg)', marginRight: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 3v18" /><path d="M3 12h18" /><path d="M16 8l-4-4-4 4" /><path d="M8 16l4 4 4-4" />
                    </svg>
                </div>
                <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.8rem', fontWeight: '700', letterSpacing: '-0.02em', textAlign: 'left' }}>
                    {isEdit ? 'Edit Project' : 'Create New Project'}
                </h2>
            </div>

            {error && (
                <div style={{
                    background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
                    padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem',
                    display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem'
                }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: '600' }}>Project Name <span className="text-danger">*</span></label>
                    <input
                        className="form-control"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="e.g. Skyline Apartments"
                    />
                </div>

                <div className="dashboard-grid">
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontWeight: '600' }}>Client Name <span className="text-danger">*</span></label>
                        <input
                            className="form-control"
                            name="client_name"
                            value={formData.client_name}
                            onChange={handleChange}
                            required
                            placeholder="e.g. ABC Corp"
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontWeight: '600' }}>Location <span className="text-danger">*</span></label>
                        <input
                            className="form-control"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            required
                            placeholder="e.g. Kathmandu"
                        />
                    </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: '600' }}>Project Budget (Rs) <span className="text-danger">*</span></label>
                    <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)', fontWeight: '500' }}>₨</span>
                        <input
                            className="form-control"
                            type="number"
                            name="budget"
                            value={formData.budget || ''}
                            onChange={handleChange}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            required
                            style={{ paddingLeft: '2.5rem' }}
                        />
                    </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: '600' }}>Project Manager <span className="text-danger">*</span></label>
                    <div style={{ position: 'relative' }}>
                        <select
                            className="form-control"
                            name="project_manager"
                            value={formData.project_manager || ''}
                            onChange={handleChange}
                            required
                            style={{ appearance: 'none', cursor: 'pointer' }}
                        >
                            <option value="">Select a Manager</option>
                            {users.filter(u => u.role === 'PROJECT_MANAGER').map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.email}
                                </option>
                            ))}
                        </select>
                        <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-light)' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: '600' }}>Site Engineers</label>
                    <div style={{
                        border: '1px solid #e2e8f0', borderRadius: 'var(--radius-lg)', padding: '1rem',
                        maxHeight: '220px', overflowY: 'auto', background: 'var(--surface-color)',
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem',
                        boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.02)'
                    }}>
                        {users.filter(u => u.role === 'SITE_ENGINEER').length === 0 ? (
                            <div style={{ color: 'var(--text-light)', fontStyle: 'italic', padding: '1rem', gridColumn: '1 / -1', textAlign: 'center' }}>No Site Engineers found. Create one in User Management.</div>
                        ) : (
                            users.filter(u => u.role === 'SITE_ENGINEER').map(user => (
                                <label key={user.id} style={{
                                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                                    padding: '0.6rem 0.8rem', cursor: 'pointer', borderRadius: 'var(--radius-md)',
                                    border: (formData.site_engineers || []).includes(user.id) ? '1px solid var(--primary-color)' : '1px solid #e2e8f0',
                                    background: (formData.site_engineers || []).includes(user.id) ? 'var(--primary-light)' : 'white',
                                    transition: 'all 0.2s ease',
                                    fontWeight: '500', 
                                    color: (formData.site_engineers || []).includes(user.id) ? 'var(--primary-hover)' : 'var(--text-secondary)',
                                    boxShadow: (formData.site_engineers || []).includes(user.id) ? '0 2px 4px rgba(79, 70, 229, 0.1)' : 'none'
                                }}
                                    onMouseOver={(e) => {
                                        if (!(formData.site_engineers || []).includes(user.id)) {
                                            e.currentTarget.style.background = '#f8fafc';
                                            e.currentTarget.style.borderColor = '#cbd5e1';
                                        }
                                    }}
                                    onMouseOut={(e) => {
                                        if (!(formData.site_engineers || []).includes(user.id)) {
                                            e.currentTarget.style.background = 'white';
                                            e.currentTarget.style.borderColor = '#e2e8f0';
                                        }
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={(formData.site_engineers || []).includes(user.id)}
                                        onChange={() => toggleEngineer(user.id)}
                                        style={{ width: '18px', height: '18px', accentColor: 'var(--primary-color)', cursor: 'pointer', margin: 0 }}
                                    />
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.9rem' }}>{user.email}</span>
                                </label>
                            ))
                        )}
                    </div>
                </div>

                <div className="dashboard-grid">
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontWeight: '600' }}>Start Date <span className="text-danger">*</span></label>
                        <input
                            className="form-control"
                            type="date"
                            name="start_date"
                            value={formData.start_date}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontWeight: '600' }}>End Date</label>
                        <input
                            className="form-control"
                            type="date"
                            name="end_date"
                            value={formData.end_date || ''}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: '600' }}>Status <span className="text-danger">*</span></label>
                    <div style={{ position: 'relative' }}>
                        <select
                            className="form-control"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            required
                            style={{ appearance: 'none', cursor: 'pointer' }}
                        >
                            <option value="PLANNED">Planned</option>
                            <option value="ONGOING">Ongoing</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="ON_HOLD">On Hold</option>
                        </select>
                        <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-light)' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                    <button
                        type="button"
                        onClick={() => navigate('/projects')}
                        className="btn btn-secondary"
                        style={{ flex: 1, padding: '0.8rem', fontSize: '1rem' }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{ flex: 2, padding: '0.8rem', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                        {loading ? 'Saving...' : (
                            <>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                                {isEdit ? 'Update Project' : 'Create Project'}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProjectForm;
