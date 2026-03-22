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
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}>
            <div className="page-header">
                <div>
                    <h2 style={{ fontSize: '1.8rem', color: '#2c3e50', marginBottom: '0.25rem' }}>📋 Attendance Log</h2>
                    <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>Track daily presence of your site labor.</p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <Link to="/workers" className="btn btn-secondary btn-sm">
                        👷 Workers
                    </Link>
                    <Link to="/attendance/new" className="btn btn-primary btn-sm">
                        + Mark
                    </Link>
                </div>
            </div>

            <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Filter Project:</label>
                <select
                    className="form-control"
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    style={{ maxWidth: '100%' }}
                >
                    <option value="">All Projects</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
            </div>

            {error && <div style={{ color: 'var(--danger-color)', marginBottom: '1rem', fontSize: '0.9rem' }}>⚠️ {error}</div>}

            <div className="table-container shadow-sm" style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 16px', background: 'rgba(79,70,229,0.05)',
                    borderBottom: '1px solid #eef2f7',
                    fontSize: '0.7rem', color: 'var(--primary-color)', fontWeight: 500,
                }}>
                    ⇔ Swipe to see all columns
                </div>
                <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                    <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f8fafc' }}>
                            <tr>
                                <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '2px solid #eef2f7', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Date</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '2px solid #eef2f7', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Project</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '2px solid #eef2f7', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Worker Name</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '2px solid #eef2f7', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Role</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '2px solid #eef2f7', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendance.length === 0 ? (
                                <tr><td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No attendance records found.</td></tr>
                            ) : (
                                attendance.map((record, index) => (
                                    <tr key={record.id} style={{ background: index % 2 === 0 ? 'white' : '#fafbfc', borderBottom: '1px solid #f0f0f0' }}>
                                        <td style={{ padding: '12px 16px', fontSize: '0.85rem' }}>{record.date}</td>
                                        <td style={{ padding: '12px 16px', fontWeight: 600, fontSize: '0.85rem' }}>{record.project_name || record.project}</td>
                                        <td style={{ padding: '12px 16px', fontSize: '0.85rem' }}>{record.worker_name}</td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <span style={{
                                                background: '#e0f2fe', color: '#0369a1',
                                                padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600
                                            }}>
                                                {record.role}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <span style={{
                                                color: record.present ? '#16a34a' : '#dc2626',
                                                fontWeight: 700, fontSize: '0.85rem'
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
        </div>
    );
};

export default AttendanceList;
