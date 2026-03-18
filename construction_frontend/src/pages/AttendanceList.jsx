import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const AttendanceList = () => {
    const [attendance, setAttendance] = useState([]);
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProjects();
    }, []);

    useEffect(() => {
        fetchAttendance();
    }, [selectedProject]);

    const fetchProjects = async () => {
        try {
            const response = await api.get('projects/');
            setProjects(response.data);
        } catch (err) {
            console.error('Failed to fetch projects');
        }
    };

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            // Build query string
            let url = 'reports/attendance/';
            if (selectedProject) {
                url += `?project=${selectedProject}`;
            }

            const response = await api.get(url);
            setAttendance(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch attendance records');
            setLoading(false);
        }
    };

    if (loading && !attendance.length) return <div style={{ padding: '20px' }}>Loading attendance...</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ color: '#2c3e50' }}>📋 Attendance Log</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <select
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.target.value)}
                        style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                    >
                        <option value="">All Projects</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <Link to="/workers" className="btn-secondary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        👷 Manage Workers
                    </Link>
                    <Link to="/attendance/new" className="btn-primary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>+</span> Mark Attendance
                    </Link>
                </div>
            </div>

            {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

            <div className="glass-card" style={{ overflow: 'hidden', padding: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f8f9fa' }}>
                        <tr>
                            <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #eef2f7' }}>Date</th>
                            <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #eef2f7' }}>Project</th>
                            <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #eef2f7' }}>Worker Name</th>
                            <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #eef2f7' }}>Role</th>
                            <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #eef2f7' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {attendance.length === 0 ? (
                            <tr><td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#888' }}>No records found.</td></tr>
                        ) : (
                            attendance.map((record, index) => (
                                <tr key={record.id} style={{ background: index % 2 === 0 ? 'white' : '#fcfcfc', borderBottom: '1px solid #f0f0f0' }}>
                                    <td style={{ padding: '15px' }}>{record.date}</td>
                                    <td style={{ padding: '15px', fontWeight: 500 }}>{record.project_name || record.project}</td>
                                    <td style={{ padding: '15px' }}>{record.worker_name}</td>
                                    <td style={{ padding: '15px' }}>
                                        <span style={{
                                            background: '#e0f2fe', color: '#0369a1',
                                            padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem'
                                        }}>
                                            {record.role}
                                        </span>
                                    </td>
                                    <td style={{ padding: '15px' }}>
                                        <span style={{
                                            color: record.present ? '#16a34a' : '#dc2626',
                                            fontWeight: 600
                                        }}>
                                            {record.present ? 'Present' : 'Absent'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AttendanceList;
