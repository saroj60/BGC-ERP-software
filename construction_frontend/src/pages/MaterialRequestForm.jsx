import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const MaterialRequestForm = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [formData, setFormData] = useState({
        project: '',
        material_name: '',
        quantity: '',
        unit: 'PCS',
        required_date: '',
        priority: 'MEDIUM'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await api.get('projects/');
                setProjects(response.data);
                if (response.data.length > 0) {
                    setFormData(prev => ({ ...prev, project: response.data[0].id }));
                }
            } catch (err) {
                console.error("Failed to fetch projects", err);
                setError("Failed to load projects.");
            }
        };
        fetchProjects();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('materials/requests/', formData);
            alert('Material Request Submitted Successfully!');
            navigate('/dashboard');
        } catch (err) {
            console.error("Submission error:", err);
            setError('Failed to submit request. Please check your inputs.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: '700px', margin: '0 auto', paddingBottom: '4rem' }}>
            <header style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    Request Materials
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Specify the materials required for your current project site.
                </p>
            </header>

            {error && (
                <div style={{
                    padding: '1rem 1.5rem', marginBottom: '2rem', borderRadius: '12px',
                    background: '#fef2f2', color: '#dc2626', border: '1px solid #fee2e2',
                    fontSize: '0.9rem', fontWeight: '500'
                }}>
                    ⚠️ {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '3rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="form-group">
                        <label className="form-label">Select Project</label>
                        <select
                            name="project"
                            value={formData.project}
                            onChange={handleChange}
                            required
                            disabled={localStorage.getItem('user_role') === 'SITE_ENGINEER'}
                            className="form-control"
                        >
                            <option value="">Choose Project...</option>
                            {projects.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Material Name</label>
                        <input
                            type="text"
                            name="material_name"
                            placeholder="e.g. Portland Cement, Red Bricks"
                            value={formData.material_name}
                            onChange={handleChange}
                            required
                            className="form-control"
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label className="form-label">Quantity</label>
                            <input
                                type="number"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                                required
                                min="0.1"
                                step="0.1"
                                className="form-control"
                                placeholder="0.0"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Measurement Unit</label>
                            <select
                                name="unit"
                                value={formData.unit}
                                onChange={handleChange}
                                className="form-control"
                            >
                                <option value="PCS">PCS</option>
                                <option value="KG">KG</option>
                                <option value="LITERS">Liters</option>
                                <option value="BAGS">Bags</option>
                                <option value="TONS">Tons</option>
                                <option value="METERS">Meters</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label className="form-label">Required By Date</label>
                            <input
                                type="date"
                                name="required_date"
                                value={formData.required_date}
                                onChange={handleChange}
                                required
                                className="form-control"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Priority Level</label>
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                className="form-control"
                            >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                                <option value="URGENT">Urgent</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '3rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button type="button" onClick={() => navigate('/dashboard')} className="btn btn-secondary">
                        Discard
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ minWidth: '180px' }}>
                        {loading ? 'Submitting...' : 'Send Request'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default MaterialRequestForm;
