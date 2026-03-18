import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';

const VehicleForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [projects, setProjects] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        number: '',
        status: 'AVAILABLE',
        project: '',
        photo: null
    });
    const [existingPhoto, setExistingPhoto] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProjects();
        if (isEditMode) {
            fetchVehicleDetails();
        }
    }, [id]);

    const fetchProjects = async () => {
        try {
            const response = await api.get('projects/');
            setProjects(response.data);
        } catch (err) {
            console.error("Failed to fetch projects");
        }
    };

    const fetchVehicleDetails = async () => {
        try {
            const response = await api.get(`vehicles/${id}/`);
            const v = response.data;
            setFormData({
                name: v.name,
                number: v.number,
                status: v.status,
                project: v.project || '',
                photo: null
            });
            if (v.photo) setExistingPhoto(v.photo);
        } catch (err) {
            console.error("Failed to fetch details", err);
            setError("Could not load vehicle details.");
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({ ...formData, photo: e.target.files[0] });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const data = new FormData();
        data.append('name', formData.name);
        data.append('number', formData.number);
        data.append('status', formData.status);
        if (formData.project) data.append('project', formData.project);
        if (formData.photo) data.append('photo', formData.photo);

        try {
            if (isEditMode) {
                await api.patch(`vehicles/${id}/`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('vehicles/', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            navigate('/vehicles');
        } catch (err) {
            console.error(err);
            setError('Failed to save vehicle. Check inputs or connection.');
            setLoading(false);
        }
    };

    return (
        <div className="glass-panel" style={{ padding: '2.5rem', maxWidth: '600px', margin: '2rem auto', borderRadius: '16px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--primary-color)' }}>
                {isEditMode ? '🚜 Edit Vehicle' : '🚜 Add New Vehicle'}
            </h2>

            {error && (
                <div style={{ background: '#fef2f2', color: '#dc2626', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        Vehicle Name / Model
                    </label>
                    <input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="e.g. JCB 3DX Excavator"
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        Registration Number
                    </label>
                    <input
                        name="number"
                        value={formData.number}
                        onChange={handleChange}
                        required
                        placeholder="e.g. BA 2 PA 1234"
                    />
                </div>

                <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                            Status
                        </label>
                        <select name="status" value={formData.status} onChange={handleChange}>
                            <option value="AVAILABLE">Available</option>
                            <option value="IN_USE">In Use</option>
                            <option value="MAINTENANCE">Maintenance</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                            Assign to Project
                        </label>
                        <select name="project" value={formData.project} onChange={handleChange}>
                            <option value="">-- No Assignment --</option>
                            {projects.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        Vehicle Photo
                    </label>
                    <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        {existingPhoto && !formData.photo && (
                            <div style={{ marginBottom: '10px' }}>
                                <img src={existingPhoto} alt="Current" style={{ width: '100px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Current Photo</div>
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{
                                display: 'block',
                                width: '100%',
                                padding: '10px',
                                cursor: 'pointer'
                            }}
                        />
                        {formData.photo && (
                            <div style={{ marginTop: '10px', fontSize: '0.9rem', color: '#10b981' }}>
                                ✅ New File Selected: {formData.photo.name}
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button type="button" onClick={() => navigate('/vehicles')} className="btn-secondary" style={{ flex: 1 }}>
                        Cancel
                    </button>
                    <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 2 }}>
                        {loading ? 'Saving...' : (isEditMode ? 'Update Vehicle' : 'Add Vehicle')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default VehicleForm;
