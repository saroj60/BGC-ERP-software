import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const VehicleList = () => {
    const navigate = useNavigate();
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const role = localStorage.getItem('user_role');
    const canManage = role === 'ADMIN' || role === 'PROJECT_MANAGER';

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            const response = await api.get('vehicles/');
            setVehicles(response.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch vehicles", err);
            setError("Failed to load vehicles.");
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            AVAILABLE: { bg: '#dcfce7', color: '#16a34a', label: 'Available' },
            IN_USE: { bg: '#dbeafe', color: '#2563eb', label: 'In Use' },
            MAINTENANCE: { bg: '#fee2e2', color: '#dc2626', label: 'Maintenance' },
        };
        const s = styles[status] || styles.AVAILABLE;
        return (
            <span style={{
                background: s.bg, color: s.color,
                padding: '4px 8px', borderRadius: '12px',
                fontSize: '0.75rem', fontWeight: 600
            }}>
                {s.label}
            </span>
        );
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Fleet...</div>;

    return (
        <div>
            <div className="page-header">
                <div>
                    <h2 style={{ fontSize: '1.8rem', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
                        🚜 Vehicle Fleet
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>Manage construction vehicles and equipment.</p>
                </div>
                {canManage && (
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={() => navigate('/vehicles/new')}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <span>+</span> Add Vehicle
                    </button>
                )}
            </div>

            {error && <div style={{ color: '#dc2626', marginBottom: '1rem' }}>{error}</div>}

            <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                {vehicles.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                        No vehicles found. Add one to get started.
                    </div>
                ) : (
                    vehicles.map(vehicle => (
                        <div key={vehicle.id} className="glass-card" style={{ overflow: 'hidden' }}>
                            <div style={{
                                height: '200px',
                                background: '#f1f5f9',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                overflow: 'hidden'
                            }}>
                                {vehicle.photo ? (
                                    <img
                                        src={vehicle.photo}
                                        alt={vehicle.name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <span style={{ fontSize: '3rem' }}>🚜</span>
                                )}
                            </div>
                            <div style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0 }}>{vehicle.name}</h3>
                                    {getStatusBadge(vehicle.status)}
                                </div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                    Reg: <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{vehicle.number}</span>
                                </div>

                                <div style={{
                                    borderTop: '1px solid #f1f5f9',
                                    paddingTop: '1rem',
                                    marginTop: '1rem',
                                    fontSize: '0.875rem'
                                }}>
                                    <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>Current Project:</div>
                                    <div style={{ fontWeight: 500 }}>
                                        {vehicle.project_details ? (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                🏗️ {vehicle.project_details.name}
                                            </span>
                                        ) : (
                                            <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Not Assigned</span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                                        style={{
                                            background: '#eff6ff',
                                            border: '1px solid #bfdbfe',
                                            borderRadius: '6px',
                                            padding: '4px 8px',
                                            cursor: 'pointer',
                                            fontSize: '0.8rem',
                                            color: '#2563eb',
                                            fontWeight: 600
                                        }}
                                        title="View Details"
                                    >
                                        📋 Details
                                    </button>
                                    {canManage && (
                                        <button
                                            onClick={() => navigate(`/vehicles/${vehicle.id}/edit`)}
                                            style={{
                                                background: 'transparent',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '6px',
                                                padding: '4px 8px',
                                                cursor: 'pointer',
                                                fontSize: '0.8rem',
                                                color: 'var(--text-secondary)'
                                            }}
                                            title="Edit Vehicle"
                                        >
                                            ✏️ Edit
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default VehicleList;
