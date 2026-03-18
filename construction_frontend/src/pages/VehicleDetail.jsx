import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';

const STATUS_STYLES = {
    AVAILABLE:   { bg: '#dcfce7', color: '#16a34a', label: 'Available' },
    IN_USE:      { bg: '#dbeafe', color: '#2563eb', label: 'In Use' },
    MAINTENANCE: { bg: '#fee2e2', color: '#dc2626', label: 'Maintenance' },
};

const MAINTENANCE_STATUS = {
    SCHEDULED:   { bg: '#fef9c3', color: '#a16207', label: 'Scheduled' },
    IN_PROGRESS: { bg: '#dbeafe', color: '#2563eb', label: 'In Progress' },
    COMPLETED:   { bg: '#dcfce7', color: '#16a34a', label: 'Completed' },
};

// ---------- helpers ----------
const Badge = ({ text, bg, color }) => (
    <span style={{ background: bg, color, padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
        {text}
    </span>
);

const Card = ({ children, style = {} }) => (
    <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '12px', marginBottom: '1rem', ...style }}>
        {children}
    </div>
);

const SectionHeader = ({ title, onAdd, canManage }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{title}</h3>
        {canManage && onAdd && (
            <button className="btn btn-primary" onClick={onAdd}
                style={{ padding: '6px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                + Add
            </button>
        )}
    </div>
);

// ---------- Modal ----------
const Modal = ({ title, onClose, children }) => (
    <div style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
    }}>
        <div className="glass-panel" style={{
            background: 'white', borderRadius: '16px', padding: '2rem',
            width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, color: 'var(--primary-color)' }}>{title}</h3>
                <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
            </div>
            {children}
        </div>
    </div>
);

const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.95rem', boxSizing: 'border-box' };
const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)' };
const fieldGroup = { marginBottom: '1rem' };

// =====================
// Vehicle Detail Page
// =====================
const VehicleDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const role = localStorage.getItem('user_role');
    const canManage = role === 'ADMIN' || role === 'PROJECT_MANAGER';

    const [vehicle, setVehicle] = useState(null);
    const [activeTab, setActiveTab] = useState('tracking');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // tab data
    const [trackingLogs, setTrackingLogs] = useState([]);
    const [fuelLogs, setFuelLogs] = useState([]);
    const [maintenanceLogs, setMaintenanceLogs] = useState([]);

    // modals
    const [showTrackingModal, setShowTrackingModal] = useState(false);
    const [showFuelModal, setShowFuelModal] = useState(false);
    const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);

    // forms
    const [trackingForm, setTrackingForm] = useState({ location: '', notes: '' });
    const [fuelForm, setFuelForm] = useState({ date: new Date().toISOString().split('T')[0], quantity_liters: '', cost: '', odometer_reading: '' });
    const [maintenanceForm, setMaintenanceForm] = useState({
        date: new Date().toISOString().split('T')[0], description: '', cost: '',
        service_provider: '', status: 'COMPLETED', next_due_date: '', next_due_odometer: ''
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => { fetchVehicle(); }, [id]);
    useEffect(() => { if (vehicle) { fetchSubData(); } }, [vehicle?.id]);

    const fetchVehicle = async () => {
        setLoading(true);
        try {
            const vRes = await api.get(`vehicles/${id}/`);
            setVehicle(vRes.data);
        } catch (err) {
            setError('Failed to load vehicle details.');
        } finally {
            setLoading(false);
        }
    };

    const fetchSubData = async () => {
        // Fetch each independently so one failure doesn't block the others
        try {
            const tRes = await api.get(`vehicles/tracking/?vehicle=${id}`);
            setTrackingLogs(tRes.data);
        } catch (err) { console.warn('Tracking fetch failed', err); }

        try {
            const fRes = await api.get(`vehicles/fuel/?vehicle=${id}`);
            setFuelLogs(fRes.data);
        } catch (err) { console.warn('Fuel fetch failed', err); }

        try {
            const mRes = await api.get(`vehicles/maintenance/?vehicle=${id}`);
            setMaintenanceLogs(mRes.data);
        } catch (err) { console.warn('Maintenance fetch failed', err); }
    };

    // ---------- Tracking ----------
    const handleAddTracking = async () => {
        if (!trackingForm.location.trim()) return;
        setSaving(true);
        try {
            await api.post('vehicles/tracking/', { vehicle: id, ...trackingForm });
            setShowTrackingModal(false);
            setTrackingForm({ location: '', notes: '' });
            const res = await api.get(`vehicles/tracking/?vehicle=${id}`);
            setTrackingLogs(res.data);
        } catch { alert('Failed to save tracking log.'); }
        finally { setSaving(false); }
    };

    // ---------- Fuel ----------
    const handleAddFuel = async () => {
        setSaving(true);
        try {
            await api.post('vehicles/fuel/', { vehicle: id, ...fuelForm });
            setShowFuelModal(false);
            setFuelForm({ date: new Date().toISOString().split('T')[0], quantity_liters: '', cost: '', odometer_reading: '' });
            const res = await api.get(`vehicles/fuel/?vehicle=${id}`);
            setFuelLogs(res.data);
        } catch { alert('Failed to save fuel log.'); }
        finally { setSaving(false); }
    };

    // ---------- Maintenance ----------
    const handleAddMaintenance = async () => {
        setSaving(true);
        try {
            await api.post('vehicles/maintenance/', { vehicle: id, ...maintenanceForm });
            setShowMaintenanceModal(false);
            setMaintenanceForm({ date: new Date().toISOString().split('T')[0], description: '', cost: '', service_provider: '', status: 'COMPLETED', next_due_date: '', next_due_odometer: '' });
            const res = await api.get(`vehicles/maintenance/?vehicle=${id}`);
            setMaintenanceLogs(res.data);
        } catch { alert('Failed to save maintenance record.'); }
        finally { setSaving(false); }
    };

    if (loading) return <div style={{ padding: '3rem', textAlign: 'center' }}>Loading Vehicle…</div>;
    if (!vehicle) return <div style={{ padding: '2rem', color: '#dc2626' }}>Vehicle not found.</div>;

    const vstyle = STATUS_STYLES[vehicle.status] || STATUS_STYLES.AVAILABLE;

    const tabs = [
        { key: 'tracking', label: '📍 Tracking', count: trackingLogs.length },
        { key: 'fuel', label: '⛽ Fuel Usage', count: fuelLogs.length },
        { key: 'maintenance', label: '🔧 Maintenance', count: maintenanceLogs.length },
    ];

    const totalFuelCost = fuelLogs.reduce((s, f) => s + parseFloat(f.cost || 0), 0);
    const totalFuelLiters = fuelLogs.reduce((s, f) => s + parseFloat(f.quantity_liters || 0), 0);
    const totalMaintenanceCost = maintenanceLogs.reduce((s, m) => s + parseFloat(m.cost || 0), 0);

    return (
        <div>
            {error && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>}

            {/* Vehicle Header */}
            <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '16px', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {vehicle.photo
                            ? <img src={vehicle.photo} alt={vehicle.name} style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
                            : <div style={{ width: '80px', height: '60px', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>🚜</div>
                        }
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{vehicle.name}</h2>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
                                Reg: <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{vehicle.number}</span>
                            </div>
                            {vehicle.project_details && (
                                <div style={{ fontSize: '0.85rem', marginTop: '4px', color: 'var(--text-secondary)' }}>
                                    🏗️ {vehicle.project_details.name}
                                </div>
                            )}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <Badge text={vstyle.label} bg={vstyle.bg} color={vstyle.color} />
                        <button onClick={() => navigate('/vehicles')} style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                            ← Back
                        </button>
                        {canManage && (
                            <button className="btn btn-primary" onClick={() => navigate(`/vehicles/${id}/edit`)} style={{ padding: '6px 14px', fontSize: '0.9rem' }}>
                                ✏️ Edit
                            </button>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: '1rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
                    {[
                        { label: 'Tracking Logs', value: trackingLogs.length, icon: '📍' },
                        { label: 'Fuel Fills', value: fuelLogs.length, icon: '⛽' },
                        { label: 'Total Fuel (L)', value: totalFuelLiters.toFixed(1), icon: '🛢️' },
                        { label: 'Fuel Cost (NPR)', value: `₨${totalFuelCost.toLocaleString()}`, icon: '💰' },
                        { label: 'Maintenance', value: maintenanceLogs.length, icon: '🔧' },
                        { label: 'Maint. Cost (NPR)', value: `₨${totalMaintenanceCost.toLocaleString()}`, icon: '🧾' },
                    ].map(stat => (
                        <div key={stat.label} style={{ textAlign: 'center', padding: '0.75rem', background: '#f8fafc', borderRadius: '10px' }}>
                            <div style={{ fontSize: '1.4rem' }}>{stat.icon}</div>
                            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary-color)', marginTop: '4px' }}>{stat.value}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tab Bar */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '0' }}>
                {tabs.map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            padding: '0.75rem 1.25rem',
                            fontSize: '0.95rem', fontWeight: activeTab === tab.key ? 700 : 400,
                            color: activeTab === tab.key ? 'var(--primary-color)' : 'var(--text-secondary)',
                            borderBottom: activeTab === tab.key ? '3px solid var(--primary-color)' : '3px solid transparent',
                            marginBottom: '-2px', transition: 'all 0.2s'
                        }}
                    >
                        {tab.label} <span style={{ fontSize: '0.8rem', background: '#f1f5f9', borderRadius: '10px', padding: '2px 7px', marginLeft: '4px' }}>{tab.count}</span>
                    </button>
                ))}
            </div>

            {/* ---------- TRACKING TAB ---------- */}
            {activeTab === 'tracking' && (
                <div>
                    <SectionHeader title="📍 Location Tracking" onAdd={() => setShowTrackingModal(true)} canManage={canManage} />
                    {trackingLogs.length === 0
                        ? <EmptyState icon="📍" text="No tracking logs yet." />
                        : trackingLogs.map(log => (
                            <Card key={log.id}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '4px' }}>📍 {log.location}</div>
                                        {log.notes && <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{log.notes}</div>}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                                        {new Date(log.timestamp).toLocaleString('en-NP', { dateStyle: 'medium', timeStyle: 'short' })}
                                    </div>
                                </div>
                            </Card>
                        ))
                    }
                </div>
            )}

            {/* ---------- FUEL TAB ---------- */}
            {activeTab === 'fuel' && (
                <div>
                    <SectionHeader title="⛽ Fuel Usage Records" onAdd={() => setShowFuelModal(true)} canManage={canManage} />
                    {/* Summary bar */}
                    {fuelLogs.length > 0 && (
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                            {[
                                { label: 'Total Fills', value: fuelLogs.length },
                                { label: 'Total Liters', value: `${totalFuelLiters.toFixed(1)} L` },
                                { label: 'Total Cost', value: `₨${totalFuelCost.toLocaleString()}` },
                            ].map(s => (
                                <div key={s.label} style={{ flex: 1, minWidth: '120px', background: '#f0f9ff', borderRadius: '10px', padding: '0.75rem 1rem', textAlign: 'center' }}>
                                    <div style={{ fontWeight: 700, color: '#0369a1', fontSize: '1.1rem' }}>{s.value}</div>
                                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{s.label}</div>
                                </div>
                            ))}
                        </div>
                    )}
                    {fuelLogs.length === 0
                        ? <EmptyState icon="⛽" text="No fuel records logged yet." />
                        : fuelLogs.map(log => (
                            <Card key={log.id}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: '0.75rem', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Date</div>
                                        <div style={{ fontWeight: 600 }}>{log.date}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Quantity</div>
                                        <div style={{ fontWeight: 600, color: '#0369a1' }}>{log.quantity_liters} L</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Cost</div>
                                        <div style={{ fontWeight: 600, color: '#16a34a' }}>₨{parseFloat(log.cost).toLocaleString()}</div>
                                    </div>
                                    {log.odometer_reading && (
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Odometer</div>
                                            <div style={{ fontWeight: 600 }}>{log.odometer_reading} km</div>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        ))
                    }
                </div>
            )}

            {/* ---------- MAINTENANCE TAB ---------- */}
            {activeTab === 'maintenance' && (
                <div>
                    <SectionHeader title="🔧 Maintenance Records" onAdd={() => setShowMaintenanceModal(true)} canManage={canManage} />
                    {maintenanceLogs.length === 0
                        ? <EmptyState icon="🔧" text="No maintenance records yet." />
                        : maintenanceLogs.map(log => {
                            const ms = MAINTENANCE_STATUS[log.status] || MAINTENANCE_STATUS.COMPLETED;
                            return (
                                <Card key={log.id}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                                        <div style={{ flex: 1, minWidth: '200px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                                                <span style={{ fontWeight: 600, fontSize: '1rem' }}>{log.description}</span>
                                                <Badge text={ms.label} bg={ms.bg} color={ms.color} />
                                            </div>
                                            {log.service_provider && (
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>🏪 {log.service_provider}</div>
                                            )}
                                            {log.next_due_date && (
                                                <div style={{ fontSize: '0.82rem', color: '#d97706', marginTop: '4px' }}>⚠️ Next Due: {log.next_due_date}</div>
                                            )}
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: 700, color: '#dc2626', fontSize: '1rem' }}>
                                                {log.cost ? `₨${parseFloat(log.cost).toLocaleString()}` : '—'}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{log.date}</div>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })
                    }
                </div>
            )}

            {/* ===== MODALS ===== */}

            {/* Tracking Modal */}
            {showTrackingModal && (
                <Modal title="📍 Log Location" onClose={() => setShowTrackingModal(false)}>
                    <div style={fieldGroup}>
                        <label style={labelStyle}>Location / Site Name *</label>
                        <input style={inputStyle} value={trackingForm.location} onChange={e => setTrackingForm({ ...trackingForm, location: e.target.value })} placeholder="e.g. Site A - Bhaktapur" />
                    </div>
                    <div style={fieldGroup}>
                        <label style={labelStyle}>Notes</label>
                        <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} value={trackingForm.notes} onChange={e => setTrackingForm({ ...trackingForm, notes: e.target.value })} placeholder="Any additional notes…" />
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                        <button onClick={() => setShowTrackingModal(false)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'none', cursor: 'pointer' }}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleAddTracking} disabled={saving} style={{ flex: 2, padding: '10px' }}>{saving ? 'Saving…' : 'Save Log'}</button>
                    </div>
                </Modal>
            )}

            {/* Fuel Modal */}
            {showFuelModal && (
                <Modal title="⛽ Add Fuel Record" onClose={() => setShowFuelModal(false)}>
                    <div style={fieldGroup}>
                        <label style={labelStyle}>Date *</label>
                        <input type="date" style={inputStyle} value={fuelForm.date} onChange={e => setFuelForm({ ...fuelForm, date: e.target.value })} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={fieldGroup}>
                            <label style={labelStyle}>Quantity (Liters) *</label>
                            <input type="number" step="0.1" style={inputStyle} value={fuelForm.quantity_liters} onChange={e => setFuelForm({ ...fuelForm, quantity_liters: e.target.value })} placeholder="e.g. 45.5" />
                        </div>
                        <div style={fieldGroup}>
                            <label style={labelStyle}>Cost (NPR) *</label>
                            <input type="number" style={inputStyle} value={fuelForm.cost} onChange={e => setFuelForm({ ...fuelForm, cost: e.target.value })} placeholder="e.g. 5200" />
                        </div>
                    </div>
                    <div style={fieldGroup}>
                        <label style={labelStyle}>Odometer Reading (km)</label>
                        <input type="number" style={inputStyle} value={fuelForm.odometer_reading} onChange={e => setFuelForm({ ...fuelForm, odometer_reading: e.target.value })} placeholder="e.g. 12450" />
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                        <button onClick={() => setShowFuelModal(false)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'none', cursor: 'pointer' }}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleAddFuel} disabled={saving} style={{ flex: 2, padding: '10px' }}>{saving ? 'Saving…' : 'Save Record'}</button>
                    </div>
                </Modal>
            )}

            {/* Maintenance Modal */}
            {showMaintenanceModal && (
                <Modal title="🔧 Add Maintenance Record" onClose={() => setShowMaintenanceModal(false)}>
                    <div style={fieldGroup}>
                        <label style={labelStyle}>Date *</label>
                        <input type="date" style={inputStyle} value={maintenanceForm.date} onChange={e => setMaintenanceForm({ ...maintenanceForm, date: e.target.value })} />
                    </div>
                    <div style={fieldGroup}>
                        <label style={labelStyle}>Description *</label>
                        <textarea style={{ ...inputStyle, minHeight: '70px', resize: 'vertical' }} value={maintenanceForm.description} onChange={e => setMaintenanceForm({ ...maintenanceForm, description: e.target.value })} placeholder="e.g. Oil change, tyre replacement…" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={fieldGroup}>
                            <label style={labelStyle}>Status</label>
                            <select style={inputStyle} value={maintenanceForm.status} onChange={e => setMaintenanceForm({ ...maintenanceForm, status: e.target.value })}>
                                <option value="SCHEDULED">Scheduled</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="COMPLETED">Completed</option>
                            </select>
                        </div>
                        <div style={fieldGroup}>
                            <label style={labelStyle}>Cost (NPR)</label>
                            <input type="number" style={inputStyle} value={maintenanceForm.cost} onChange={e => setMaintenanceForm({ ...maintenanceForm, cost: e.target.value })} placeholder="e.g. 3500" />
                        </div>
                    </div>
                    <div style={fieldGroup}>
                        <label style={labelStyle}>Service Provider</label>
                        <input style={inputStyle} value={maintenanceForm.service_provider} onChange={e => setMaintenanceForm({ ...maintenanceForm, service_provider: e.target.value })} placeholder="e.g. Balaju Auto Workshop" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={fieldGroup}>
                            <label style={labelStyle}>Next Due Date</label>
                            <input type="date" style={inputStyle} value={maintenanceForm.next_due_date} onChange={e => setMaintenanceForm({ ...maintenanceForm, next_due_date: e.target.value })} />
                        </div>
                        <div style={fieldGroup}>
                            <label style={labelStyle}>Next Due Odometer (km)</label>
                            <input type="number" style={inputStyle} value={maintenanceForm.next_due_odometer} onChange={e => setMaintenanceForm({ ...maintenanceForm, next_due_odometer: e.target.value })} placeholder="e.g. 15000" />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                        <button onClick={() => setShowMaintenanceModal(false)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'none', cursor: 'pointer' }}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleAddMaintenance} disabled={saving} style={{ flex: 2, padding: '10px' }}>{saving ? 'Saving…' : 'Save Record'}</button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

const EmptyState = ({ icon, text }) => (
    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)', background: '#f8fafc', borderRadius: '12px' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{icon}</div>
        <div>{text}</div>
    </div>
);

export default VehicleDetail;
