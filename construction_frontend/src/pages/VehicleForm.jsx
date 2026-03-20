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
        <div className="animate-fade-in" style={{ maxWidth: '700px', margin: '0 auto', paddingBottom: '4rem' }}>
            <header style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    {isEditMode ? 'Edit Vehicle' : 'Register New Vehicle'}
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    {isEditMode ? 'Update asset details and project assignments.' : 'Add a new piece of equipment or vehicle to the fleet.'}
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
                        <label className="form-label">Vehicle / Model Name</label>
                        <input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="e.g. Caterpillar 320 GC Excavator"
                            className="form-control"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Registration / Plate Number</label>
                        <input
                            name="number"
                            value={formData.number}
                            onChange={handleChange}
                            required
                            placeholder="e.g. KO 1 PA 4567"
                            className="form-control"
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label className="form-label">Current Status</label>
                            <select name="status" value={formData.status} onChange={handleChange} className="form-control">
                                <option value="AVAILABLE">Available</option>
                                <option value="IN_USE">In Use</option>
                                <option value="MAINTENANCE">Maintenance</option>
                                <option value="RETIRED">Retired</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Assign to Project</label>
                            <select name="project" value={formData.project} onChange={handleChange} className="form-control">
                                <option value="">Fleet Reserve (Unassigned)</option>
                                {projects.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Equipment Photograph</label>
                        <div style={{ 
                            padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', 
                            border: '1px solid #eef2f6', display: 'flex', gap: '20px', alignItems: 'center' 
                        }}>
                            {existingPhoto && !formData.photo && (
                                <img src={existingPhoto} alt="Asset" style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
                            )}
                            <div style={{ flex: 1 }}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    style={{ fontSize: '0.85rem' }}
                                />
                                {formData.photo && (
                                    <p style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--success-color)', fontWeight: '600' }}>
                                        ✓ {formData.photo.name}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '3rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button type="button" onClick={() => navigate('/vehicles')} className="btn btn-secondary">
                        Back to Fleet
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ minWidth: '160px' }}>
                        {loading ? 'Processing...' : (isEditMode ? 'Update Asset' : 'Register Asset')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default VehicleForm;
