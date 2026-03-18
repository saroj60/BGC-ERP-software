import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const ReportForm = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [formData, setFormData] = useState({
        project: '',
        date: new Date().toISOString().split('T')[0],
        weather: '',
        labor_count: '',
        work_done: '',
        remarks: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await api.get('projects/');
            setProjects(response.data);
            if (response.data.length > 0) {
                setFormData(prev => ({ ...prev, project: response.data[0].id }));
            }
        } catch (err) {
            setError('Failed to fetch projects');
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('reports/', formData);
            alert('Report Submitted Successfully!');
            navigate('/reports');
        } catch (err) {
            console.error(err);
            if (err.response && err.response.status === 403) {
                setError('Permission Denied: Only Site Engineers can submit reports.');
            } else {
                setError('Failed to submit report. Please check your inputs.');
            }
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: '680px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <Link to="/reports" className="btn btn-secondary btn-sm" style={{ marginBottom: '1rem', display: 'inline-flex' }}>
                    ← Back to Reports
                </Link>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '0.4rem', color: 'var(--text-primary)', marginTop: '0.5rem' }}>
                    📝 Create Daily Report
                </h2>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Record today's site activity and progress.</p>
            </div>

            {error && (
                <div style={{ padding: '0.9rem 1.2rem', background: '#fef2f2', color: '#dc2626', borderRadius: '10px', marginBottom: '1.5rem', border: '1px solid #fecaca', fontWeight: 500 }}>
                    ⚠️ {error}
                </div>
            )}

            <div className="glass-card" style={{ padding: '2rem' }}>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Project</label>
                        <select
                            name="project"
                            value={formData.project}
                            onChange={handleChange}
                            required
                            className="form-control"
                        >
                            <option value="">Select Project</option>
                            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label">Date</label>
                            <input type="date" name="date" value={formData.date} onChange={handleChange} required className="form-control" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Weather</label>
                            <input type="text" name="weather" placeholder="e.g. Sunny, Rainy" value={formData.weather} onChange={handleChange} required className="form-control" />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Labor Count</label>
                        <input type="number" name="labor_count" placeholder="Total workers present" value={formData.labor_count} onChange={handleChange} required className="form-control" />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Work Done</label>
                        <textarea
                            name="work_done"
                            placeholder="Describe all completed tasks today..."
                            value={formData.work_done}
                            onChange={handleChange}
                            required
                            rows="4"
                            className="form-control"
                            style={{ fontFamily: 'inherit', resize: 'vertical' }}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Remarks / Issues</label>
                        <textarea
                            name="remarks"
                            placeholder="Any blockers, observations, or remarks..."
                            value={formData.remarks}
                            onChange={handleChange}
                            rows="3"
                            className="form-control"
                            style={{ fontFamily: 'inherit', resize: 'vertical' }}
                        />
                    </div>

                    <div className="btn-group" style={{ marginTop: '0.5rem' }}>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary btn-lg btn-block"
                        >
                            {loading ? '⏳ Submitting...' : '✅ Submit Report'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReportForm;
