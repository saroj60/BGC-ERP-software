import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const TenderForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        estimated_budget: '',
        submission_deadline: '',
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

        try {
            await api.post('tenders/', formData);
            navigate('/tenders');
        } catch (err) {
            console.error('Error creating tender:', err);
            setError('Failed to create tender. Please verify the form details.');
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '40px auto', padding: '30px', background: '#fff', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', fontFamily: "'Inter', sans-serif" }} className="animate-fade-in">
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '10px' }}>Issue New Tender</h2>
            <p style={{ color: 'var(--text-light)', marginBottom: '30px' }}>Open a new project for contractor bidding.</p>

            {error && <div style={{ color: 'red', marginBottom: '20px', padding: '10px', background: '#fee2e2', borderRadius: '4px' }}>{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group" style={{ marginBottom: '20px' }}>
                    <label className="form-label">Tender Title *</label>
                    <input type="text" className="form-control" name="title" value={formData.title} onChange={handleChange} required placeholder="e.g. Central City HQ Construction" />
                </div>

                <div className="form-group" style={{ marginBottom: '20px' }}>
                    <label className="form-label">Scope of Work (Description) *</label>
                    <textarea className="form-control" name="description" value={formData.description} onChange={handleChange} required rows="5" placeholder="Detail the requirements, materials, and expectations for the contractors..." />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <div className="form-group">
                        <label className="form-label">Project Location</label>
                        <input type="text" className="form-control" name="location" value={formData.location} onChange={handleChange} placeholder="Site address" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Submission Deadline *</label>
                        <input type="date" className="form-control" name="submission_deadline" value={formData.submission_deadline} onChange={handleChange} required />
                    </div>
                </div>

                <div className="form-group" style={{ marginBottom: '30px' }}>
                    <label className="form-label">Estimated Budget Limits (₨)</label>
                    <input type="number" step="0.01" className="form-control" name="estimated_budget" value={formData.estimated_budget} onChange={handleChange} placeholder="Leave blank if undisclosed" />
                </div>

                <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => navigate('/tenders')} disabled={loading}>
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Publishing...' : 'Publish Tender'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TenderForm;
