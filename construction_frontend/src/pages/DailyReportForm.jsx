import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const DailyReportForm = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [formData, setFormData] = useState({
        project: '',
        date: new Date().toISOString().split('T')[0],
        weather: '',
        labor_count: '',
        work_done: '',
        issues: '',
        remarks: ''
    });
    const [photos, setPhotos] = useState([]);
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

    const handlePhotoChange = (e) => {
        setPhotos(Array.from(e.target.files));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // 1. Create Report
            const reportResponse = await api.post('reports/', formData);
            const reportId = reportResponse.data.id;

            // 2. Upload Photos
            if (photos.length > 0) {
                const uploadPromises = photos.map(photo => {
                    const photoData = new FormData();
                    photoData.append('report', reportId);
                    photoData.append('image', photo);
                    return api.post('reports/photos/', photoData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                });
                await Promise.all(uploadPromises);
            }

            alert('Daily Report Submitted Successfully!');
            navigate('/dashboard');

        } catch (err) {
            console.error("Submission error:", err);
            setError('Failed to submit report. Please check your inputs.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '2rem' }}>
            <div className="glass-card" style={{ padding: '2rem' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--primary-color)' }}>
                    📝 Daily Site Report
                </h2>

                {error && (
                    <div style={{ padding: '10px', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '1rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
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
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Date</label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Weather Condition</label>
                            <input
                                type="text"
                                name="weather"
                                placeholder="e.g. Sunny, Rainy"
                                value={formData.weather}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Labor Count</label>
                            <input
                                type="number"
                                name="labor_count"
                                value={formData.labor_count}
                                onChange={handleChange}
                                required
                                min="0"
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Work Done Description</label>
                        <textarea
                            name="work_done"
                            rows="4"
                            value={formData.work_done}
                            onChange={handleChange}
                            required
                            placeholder="Describe the work completed today..."
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Issues (Optional)</label>
                            <textarea
                                name="issues"
                                rows="3"
                                value={formData.issues}
                                onChange={handleChange}
                                placeholder="Any delays or problems?"
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Remarks (Optional)</label>
                            <textarea
                                name="remarks"
                                rows="3"
                                value={formData.remarks}
                                onChange={handleChange}
                                placeholder="Additional notes..."
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Upload Site Photos</label>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handlePhotoChange}
                            style={{ width: '100%', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}
                        />
                        <small style={{ color: 'var(--text-secondary)' }}>Select multiple images if needed.</small>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                        style={{ padding: '14px', borderRadius: '8px', fontSize: '1rem', marginTop: '1rem' }}
                    >
                        {loading ? 'Submitting Report...' : 'Submit Daily Report'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default DailyReportForm;
