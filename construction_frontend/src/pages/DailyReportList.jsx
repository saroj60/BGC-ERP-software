import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const DailyReportList = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const response = await api.get('reports/');
            setReports(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch reports');
            setLoading(false);
        }
    };

    const [selectedReport, setSelectedReport] = useState(null);

    // ... existing fetch logic ...

    const closeModal = () => setSelectedReport(null);

    if (loading) return <div style={{ padding: '20px' }}>Loading reports...</div>;

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>📝 Daily Site Reports</h2>
                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>View and manage day-to-day site activity logs.</p>
                </div>
                <Link to="/reports/new" className="btn btn-primary">
                    + Create Report
                </Link>
            </div>

            {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

            <div style={{ background: 'white', borderRadius: '12px', boxShadow: 'var(--shadow-md)', border: '1px solid rgba(226,232,240,0.6)' }}>
                {/* Mobile scroll hint */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 16px',
                    background: 'rgba(79,70,229,0.06)',
                    borderBottom: '1px solid #eef2f7',
                    fontSize: '0.72rem',
                    color: 'var(--primary-color)',
                    fontWeight: 500,
                }}>
                    <span>&#8644;</span> Swipe table to see more
                </div>

                {/* Scrollable table wrapper */}
                <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', touchAction: 'pan-x' }}>
                    <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f8f9fa' }}>
                            <tr>
                                <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #eef2f7', whiteSpace: 'nowrap' }}>Date</th>
                                <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #eef2f7', minWidth: '130px' }}>Project</th>
                                <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #eef2f7', whiteSpace: 'nowrap' }}>Weather</th>
                                <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #eef2f7', minWidth: '160px' }}>Work Done</th>
                                <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #eef2f7', minWidth: '140px' }}>Issues</th>
                                <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #eef2f7', whiteSpace: 'nowrap' }}>Photos</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.length === 0 ? (
                                <tr><td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#888' }}>No reports found.</td></tr>
                            ) : (
                                reports.map((report, index) => (
                                    <tr key={report.id} style={{ background: index % 2 === 0 ? 'white' : '#fcfcfc', borderBottom: '1px solid #f0f0f0' }}>
                                        <td style={{ padding: '12px 15px', whiteSpace: 'nowrap' }}>{report.date}</td>
                                        <td style={{ padding: '12px 15px', fontWeight: 500 }}>{report.project_name || report.project}</td>
                                        <td style={{ padding: '12px 15px', whiteSpace: 'nowrap' }}>{report.weather}</td>
                                        <td style={{ padding: '12px 15px' }}>{report.work_done?.substring(0, 60)}{report.work_done?.length > 60 ? '...' : ''}</td>
                                        <td style={{ padding: '12px 15px', color: report.issues ? '#e74c3c' : '#2ecc71' }}>
                                            {report.issues ? report.issues.substring(0, 50) + (report.issues.length > 50 ? '...' : '') : 'None'}
                                        </td>
                                        <td style={{ padding: '12px 15px', whiteSpace: 'nowrap' }}>
                                            {report.photos && report.photos.length > 0 ? (
                                                <button
                                                    onClick={() => setSelectedReport(report)}
                                                    className="btn btn-soft-info btn-sm"
                                                >
                                                    📷 {report.photos.length} Photos
                                                </button>
                                            ) : (
                                                <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>No Photos</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Photo Modal */}
            {selectedReport && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }} onClick={closeModal}>
                    <div style={{
                        background: 'white', padding: '20px', borderRadius: '12px',
                        maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto',
                        position: 'relative', width: '800px'
                    }} onClick={e => e.stopPropagation()}>
                        <button
                            onClick={closeModal}
                            className="btn btn-soft-danger btn-sm"
                            style={{ position: 'absolute', top: '12px', right: '12px' }}
                        >
                            ✕ Close
                        </button>
                        <h3 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                            Photos for {selectedReport.date} - {selectedReport.project_name}
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px', marginTop: '15px' }}>
                            {selectedReport.photos.map(photo => (
                                <div key={photo.id} style={{ border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden' }}>
                                    <a href={photo.image} target="_blank" rel="noopener noreferrer">
                                        <img
                                            src={photo.image}
                                            alt={photo.caption || 'Site Photo'}
                                            style={{ width: '100%', height: '150px', objectFit: 'cover', display: 'block' }}
                                        />
                                    </a>
                                    {photo.caption && <div style={{ padding: '8px', fontSize: '0.85rem', background: '#f8f9fa' }}>{photo.caption}</div>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DailyReportList;
