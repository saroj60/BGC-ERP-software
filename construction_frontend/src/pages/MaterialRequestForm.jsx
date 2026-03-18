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
            await api.post('materials/', formData);
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
        <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '2rem' }}>
            <div className="glass-card" style={{ padding: '2rem' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--primary-color)' }}>
                    📦 Request Materials
                </h2>

                {error && (
                    <div style={{ padding: '10px', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '1rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Project</label>
                        <select
                            name="project"
                            value={formData.project}
                            onChange={handleChange}
                            required
                            disabled={localStorage.getItem('user_role') === 'SITE_ENGINEER'}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                                backgroundColor: localStorage.getItem('user_role') === 'SITE_ENGINEER' ? '#f3f4f6' : 'white',
                                cursor: localStorage.getItem('user_role') === 'SITE_ENGINEER' ? 'not-allowed' : 'pointer'
                            }}
                        >
                            <option value="">Select Project</option>
                            {projects.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Material Name</label>
                        <input
                            type="text"
                            name="material_name"
                            placeholder="e.g. Cement, Bricks"
                            value={formData.material_name}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Quantity</label>
                            <input
                                type="number"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                                required
                                min="0.1"
                                step="0.1"
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Unit</label>
                            <select
                                name="unit"
                                value={formData.unit}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
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

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Required Date</label>
                            <input
                                type="date"
                                name="required_date"
                                value={formData.required_date}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Priority</label>
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                                <option value="URGENT">Urgent</option>
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                        style={{ padding: '14px', borderRadius: '8px', fontSize: '1rem', marginTop: '1rem' }}
                    >
                        {loading ? 'Sending Request...' : 'Send Request'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default MaterialRequestForm;
