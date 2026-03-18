import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const AttendanceForm = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProjects();
    }, []);

    useEffect(() => {
        if (selectedProject) {
            fetchWorkers(selectedProject);
        }
    }, [selectedProject]);

    const fetchProjects = async () => {
        try {
            const response = await api.get('projects/');
            setProjects(response.data);
            if (response.data.length > 0) setSelectedProject(response.data[0].id);
        } catch (err) {
            setError('Failed to fetch projects');
        }
    };

    const fetchWorkers = async (projectId) => {
        try {
            const response = await api.get(`reports/workers/?project=${projectId}`);
            // Map workers to attendance format (default present)
            const workerList = response.data.map(w => ({
                id: w.id, // Worker DB ID
                worker_name: w.name,
                role: w.role,
                present: true,
                worker_obj: w.id
            }));
            setWorkers(workerList);
        } catch (err) {
            console.error('Failed to fetch workers', err);
        }
    };

    const handleWorkerChange = (id, field, value) => {
        setWorkers(workers.map(w => w.id === id ? { ...w, [field]: value } : w));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!selectedProject) {
            setError('Please select a project');
            setLoading(false);
            return;
        }

        if (workers.length === 0) {
            setError('No workers to submit attendance for.');
            setLoading(false);
            return;
        }

        const payload = workers.map(w => ({
            project: selectedProject,
            date: date,
            worker: w.worker_obj, // Link to Worker model
            worker_name: w.worker_name,
            role: w.role,
            present: w.present
        }));

        try {
            await api.post('reports/attendance/', payload);
            alert('Attendance Submitted Successfully!');
            navigate('/projects');
        } catch (err) {
            console.error(err);
            if (err.response && err.response.status === 403) {
                setError('Permission Denied: Only Site Engineers can submit attendance.');
            } else {
                setError('Failed to submit attendance. Check inputs.');
            }
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <h2 style={{ textAlign: 'center' }}>Daily Attendance Entry</h2>
            {error && <div style={{ color: 'red', marginBottom: '15px', padding: '10px', background: '#ffe6e6' }}>{error}</div>}

            <div style={{ marginBottom: '20px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                    <label>Project:</label>
                    <select
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.target.value)}
                        disabled={localStorage.getItem('user_role') === 'SITE_ENGINEER'}
                        style={{
                            width: '100%',
                            padding: '10px',
                            backgroundColor: localStorage.getItem('user_role') === 'SITE_ENGINEER' ? '#f3f4f6' : 'white',
                            cursor: localStorage.getItem('user_role') === 'SITE_ENGINEER' ? 'not-allowed' : 'pointer'
                        }}
                    >
                        <option value="">Select Project</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                <div style={{ flex: 1 }}>
                    <label>Date:</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        style={{ width: '100%', padding: '10px' }}
                    />
                </div>
            </div>

            <div style={{ marginBottom: '15px', color: '#666' }}>
                Found {workers.length} workers for this project.
            </div>

            <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                <thead>
                    <tr>
                        <th>Worker Name</th>
                        <th>Role</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {workers.map((worker) => (
                        <tr key={worker.id}>
                            <td>
                                <strong>{worker.worker_name}</strong>
                            </td>
                            <td>
                                <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '4px', fontSize: '0.85rem' }}>
                                    {worker.role}
                                </span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={worker.present}
                                        onChange={(e) => handleWorkerChange(worker.id, 'present', e.target.checked)}
                                        style={{ transform: 'scale(1.5)', accentColor: '#28a745' }}
                                    />
                                    <span style={{ color: worker.present ? '#28a745' : '#dc3545', fontWeight: 'bold' }}>
                                        {worker.present ? 'PRESENT' : 'ABSENT'}
                                    </span>
                                </label>
                            </td>
                        </tr>
                    ))}
                    {workers.length === 0 && (
                        <tr>
                            <td colSpan="3" style={{ textAlign: 'center', padding: '30px' }}>
                                No workers found for this project.<br />
                                <a href="/workers" style={{ color: '#007bff' }}>Manage Workers</a> to add some.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>


            <div style={{ display: 'flex', gap: '10px' }}>

                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    style={{ flex: 1, padding: '10px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}
                >
                    {loading ? 'Submitting...' : 'Submit Attendance'}
                </button>
            </div>
        </div>
    );
};

export default AttendanceForm;
