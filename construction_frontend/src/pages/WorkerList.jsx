import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const WorkerList = () => {
    const [workers, setWorkers] = useState([]);
    const [projects, setProjects] = useState([]);
    const [newWorker, setNewWorker] = useState({ name: '', role: '', project: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [role, setRole] = useState(localStorage.getItem('user_role'));

    useEffect(() => {
        fetchWorkers();
        fetchProjects();
    }, []);

    const fetchWorkers = async () => {
        try {
            const response = await api.get('reports/workers/');
            setWorkers(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch workers');
            setLoading(false);
        }
    };

    const fetchProjects = async () => {
        try {
            const response = await api.get('projects/');
            setProjects(response.data);
            if (response.data.length > 0) {
                setNewWorker(prev => ({ ...prev, project: response.data[0].id }));
            }
        } catch (err) {
            console.error('Failed to fetch projects');
        }
    };

    const handleAddWorker = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('reports/workers/', newWorker);
            setWorkers([...workers, response.data]);
            setNewWorker({ ...newWorker, name: '', role: '' });
            alert('Worker added successfully');
        } catch (err) {
            alert('Failed to add worker');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await api.delete(`reports/workers/${id}/`);
            setWorkers(workers.filter(w => w.id !== id));
        } catch (err) {
            alert('Failed to delete worker');
        }
    };

    if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>👷 Worker Management</h2>

            <div className="glass-panel" style={{ padding: '20px', marginBottom: '30px' }}>
                <h3 style={{ marginTop: 0 }}>Add New Worker</h3>
                <form onSubmit={handleAddWorker} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'end' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Project</label>
                        <select
                            value={newWorker.project}
                            onChange={(e) => setNewWorker({ ...newWorker, project: e.target.value })}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                            required
                        >
                            <option value="">Select Project</option>
                            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Worker Name</label>
                        <input
                            type="text"
                            value={newWorker.name}
                            onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })}
                            placeholder="e.g. Ram Bahadur"
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                            required
                        />
                    </div>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Role</label>
                        <input
                            type="text"
                            value={newWorker.role}
                            onChange={(e) => setNewWorker({ ...newWorker, role: e.target.value })}
                            placeholder="e.g. Mason"
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                            required
                        />
                    </div>
                    <button type="submit" className="btn-primary" style={{ height: '42px' }}>
                        + Add Worker
                    </button>
                </form>
            </div>

            <div className="glass-card" style={{ overflow: 'hidden', padding: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f8f9fa' }}>
                        <tr>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Name</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Role</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Project</th>
                            {role !== 'SITE_ENGINEER' && (
                                <th style={{ padding: '15px', textAlign: 'left' }}>Action</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {workers.map((worker, index) => (
                            <tr key={worker.id} style={{ borderBottom: '1px solid #eee', background: index % 2 === 0 ? 'white' : '#f9f9f9' }}>
                                <td style={{ padding: '15px', fontWeight: 'bold' }}>{worker.name}</td>
                                <td style={{ padding: '15px' }}>
                                    <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>
                                        {worker.role}
                                    </span>
                                </td>
                                <td style={{ padding: '15px' }}>{worker.project_name}</td>
                                {role !== 'SITE_ENGINEER' && (
                                    <td style={{ padding: '15px' }}>
                                        <button
                                            onClick={() => handleDelete(worker.id)}
                                            style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                        {workers.length === 0 && (
                            <tr><td colSpan={role !== 'SITE_ENGINEER' ? "4" : "3"} style={{ padding: '30px', textAlign: 'center', color: '#888' }}>No workers found. Add one above!</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default WorkerList;
