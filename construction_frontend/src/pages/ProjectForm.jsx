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
        const { name, value, type, selectedOptions } = e.target;
        if (type === 'select-multiple') {
            const values = Array.from(selectedOptions, option => option.value);
            setFormData({ ...formData, [name]: values });
        } else {
            setFormData({ ...formData, [name]: value });
        }
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

    const toggleEngineer = (engineerId) => {
        const currentEngineers = formData.site_engineers || [];
        if (currentEngineers.includes(engineerId)) {
            setFormData({ ...formData, site_engineers: currentEngineers.filter(id => id !== engineerId) });
        } else {
            setFormData({ ...formData, site_engineers: [...currentEngineers, engineerId] });
        }
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '3rem' }}>
            <header className="page-header">
                <div>
                    <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                        {isEdit ? 'Edit Project' : 'New Project'}
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                        Fill in the details below to launch or update a project.
                    </p>
                </div>
            </header>

            {error && (
                <div style={{
                    padding: '0.8rem 1.25rem', marginBottom: '1.5rem', borderRadius: '12px',
                    background: '#fef2f2', color: '#dc2626', border: '1px solid #fee2e2',
                    fontSize: '0.85rem', fontWeight: '500'
                }}>
                    ⚠️ {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="glass-card" style={{ padding: window.innerWidth > 768 ? '2.5rem' : '1.25rem' }}>
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: window.innerWidth > 768 ? '1fr 1fr' : '1fr', 
                    gap: '1.25rem' 
                }}>
                    <div className="form-group" style={{ gridColumn: window.innerWidth > 768 ? 'span 2' : 'auto' }}>
                        <label className="form-label">Project Name</label>
                        <input
                            className="form-control"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="e.g. Skyline Residency"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Client Name</label>
                        <input
                            className="form-control"
                            name="client_name"
                            value={formData.client_name}
                            onChange={handleChange}
                            required
                            placeholder="e.g. Urban Realty Group"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Location</label>
                        <input
                            className="form-control"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            required
                            placeholder="e.g. Kathmandu, Nepal"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Project Budget (Rs.)</label>
                        <input
                            className="form-control"
                            type="number"
                            name="budget"
                            value={formData.budget}
                            onChange={handleChange}
                            required
                            placeholder="0.00"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Project Manager</label>
                        <select
                            className="form-control"
                            name="project_manager"
                            value={formData.project_manager || ''}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Manager</option>
                            {users.filter(u => u.role === 'PROJECT_MANAGER').map(user => (
                                <option key={user.id} value={user.id}>{user.email}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group" style={{ gridColumn: window.innerWidth > 768 ? 'span 2' : 'auto' }}>
                        <label className="form-label" style={{ marginBottom: '1rem' }}>Assign Site Engineers</label>
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
                            gap: '10px', padding: '1.25rem', background: '#f8fafc', 
                            borderRadius: '12px', border: '1px solid #eef2f6' 
                        }}>
                            {users.filter(u => u.role === 'SITE_ENGINEER').map(user => (
                                <label key={user.id} style={{ 
                                    display: 'flex', alignItems: 'center', gap: '8px', 
                                    padding: '8px 12px', background: '#ffffff', borderRadius: '10px',
                                    border: (formData.site_engineers || []).includes(user.id) ? '1px solid var(--primary-color)' : '1px solid #eef2f6',
                                    cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.8rem'
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={(formData.site_engineers || []).includes(user.id)}
                                        onChange={() => toggleEngineer(user.id)}
                                        style={{ accentColor: 'var(--primary-color)' }}
                                    />
                                    {user.email}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Start Date</label>
                        <input
                            className="form-control"
                            type="date"
                            name="start_date"
                            value={formData.start_date}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Completion Date</label>
                        <input
                            className="form-control"
                            type="date"
                            name="end_date"
                            value={formData.end_date || ''}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group" style={{ gridColumn: window.innerWidth > 768 ? 'span 2' : 'auto' }}>
                        <label className="form-label">Project Status</label>
                        <select
                            className="form-control"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            required
                        >
                            <option value="PLANNED">Planned</option>
                            <option value="ONGOING">Ongoing</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="ON_HOLD">On Hold</option>
                        </select>
                    </div>
                </div>

                <div style={{ 
                    marginTop: '2.5rem', 
                    display: 'flex', 
                    gap: '0.75rem', 
                    justifyContent: 'flex-end',
                    flexWrap: 'wrap'
                }}>
                    <button 
                        type="button" 
                        onClick={() => navigate('/projects')} 
                        className="btn btn-secondary btn-block-mobile"
                        style={{ flex: window.innerWidth <= 768 ? '1' : 'none' }}
                    >
                        Discard
                    </button>
                    <button 
                        type="submit" 
                        className="btn btn-primary btn-block-mobile" 
                        disabled={loading} 
                        style={{ 
                            minWidth: window.innerWidth > 768 ? '160px' : '100%',
                            flex: window.innerWidth <= 768 ? '1' : 'none'
                        }}
                    >
                        {loading ? 'Processing...' : (isEdit ? 'Save Changes' : 'Create Project')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProjectForm;
