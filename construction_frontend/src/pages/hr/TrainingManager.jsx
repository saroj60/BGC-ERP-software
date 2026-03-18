import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const TrainingManager = () => {
    const [trainings, setTrainings] = useState([]);
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form states
    const [showTrainingForm, setShowTrainingForm] = useState(false);
    const [newTraining, setNewTraining] = useState({ title: '', description: '', date: '', instructor: '', duration_hours: '' });

    useEffect(() => {
        fetchTrainingData();
    }, []);

    const fetchTrainingData = async () => {
        try {
            const [trainRes, recRes] = await Promise.all([
                api.get('hr/trainings/'),
                api.get('hr/training-records/')
            ]);
            setTrainings(Array.isArray(trainRes.data) ? trainRes.data : trainRes.data.results || []);
            setRecords(Array.isArray(recRes.data) ? recRes.data : recRes.data.results || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTraining = async (e) => {
        e.preventDefault();
        try {
            await api.post('hr/trainings/', newTraining);
            await fetchTrainingData();
            setShowTrainingForm(false);
            setNewTraining({ title: '', description: '', date: '', instructor: '', duration_hours: '' });
        } catch (err) {
            alert("Failed to schedule training program.");
        }
    };

    const handleUpdateRecordStatus = async (id, newStatus) => {
        try {
            await api.patch(`hr/training-records/${id}/`, { completion_status: newStatus });
            setRecords(records.map(r => r.id === id ? { ...r, completion_status: newStatus } : r));
        } catch (err) {
            alert("Failed to update status");
        }
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Training Programs...</div>;

    const styles = {
        container: { padding: '30px', maxWidth: '1200px', margin: '0 auto', fontFamily: "'Inter', sans-serif" },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
        card: { background: '#fff', borderRadius: 'var(--radius-lg)', padding: '20px', boxShadow: 'var(--shadow-md)', border: '1px solid #e2e8f0', marginBottom: '20px' },
        grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' },
        title: { margin: '0 0 5px 0', fontSize: '18px', color: 'var(--text-primary)' },
        subtitle: { margin: '0 0 15px 0', fontSize: '13px', color: 'var(--text-secondary)' },
        table: { width: '100%', borderCollapse: 'collapse' },
        th: { textAlign: 'left', padding: '12px', background: '#f8fafc', borderBottom: '2px solid #e2e8f0', fontSize: '13px', color: 'var(--text-secondary)' },
        td: { padding: '12px', borderBottom: '1px solid #e2e8f0', fontSize: '14px', color: 'var(--text-primary)' }
    };

    return (
        <div style={styles.container} className="animate-fade-in">
            <div style={styles.header}>
                <div>
                    <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>Training & Safety Programs</h2>
                    <p style={{ margin: 0, color: 'var(--text-light)' }}>Schedule learning and compliance sessions.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowTrainingForm(!showTrainingForm)}>
                    {showTrainingForm ? 'Cancel' : '+ Schedule Training'}
                </button>
            </div>

            {showTrainingForm && (
                <div style={styles.card} className="animate-fade-in">
                    <form onSubmit={handleCreateTraining}>
                        <div className="dashboard-grid">
                            <div className="form-group">
                                <label className="form-label">Program Title *</label>
                                <input type="text" className="form-control" required value={newTraining.title} onChange={e => setNewTraining({...newTraining, title: e.target.value})} placeholder="e.g. OSHA Safety Orientation" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Instructor / Certifier</label>
                                <input type="text" className="form-control" required value={newTraining.instructor} onChange={e => setNewTraining({...newTraining, instructor: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Date *</label>
                                <input type="date" className="form-control" required value={newTraining.date} onChange={e => setNewTraining({...newTraining, date: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Duration (Hours) *</label>
                                <input type="number" step="0.5" className="form-control" required value={newTraining.duration_hours} onChange={e => setNewTraining({...newTraining, duration_hours: e.target.value})} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Description / Syllabus</label>
                            <textarea className="form-control" required value={newTraining.description} onChange={e => setNewTraining({...newTraining, description: e.target.value})}></textarea>
                        </div>
                        <div style={{ textAlign: 'right', marginTop: '10px' }}>
                            <button type="submit" className="btn btn-primary">Publish Program</button>
                        </div>
                    </form>
                </div>
            )}

            <h3 style={{ color: 'var(--text-primary)' }}>Upcoming Programs</h3>
            <div style={styles.grid}>
                {trainings.map(t => (
                    <div key={t.id} style={styles.card} className="hover-lift">
                        <h4 style={styles.title}>{t.title}</h4>
                        <p style={styles.subtitle}>Instructor: {t.instructor} • {t.duration_hours} Hrs</p>
                        <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '4px', fontSize: '13px', color: 'var(--text-primary)' }}>
                            <strong>Date:</strong> {t.date}
                        </div>
                        <div style={{ marginTop: '15px', color: 'var(--primary-color)', fontSize: '13px', fontWeight: 'bold' }}>
                            🎓 {t.enrollment_count} Employees Enrolled
                        </div>
                    </div>
                ))}
                {trainings.length === 0 && <p style={{ color: 'var(--text-light)' }}>No training programs scheduled.</p>}
            </div>

            <h3 style={{ color: 'var(--text-primary)', borderTop: '2px solid #e2e8f0', paddingTop: '30px' }}>Employee Certification Logs</h3>
            <div style={{ ...styles.card, padding: 0, overflow: 'hidden' }}>
                {records.length > 0 ? (
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Employee</th>
                                <th style={styles.th}>Training Program</th>
                                <th style={styles.th}>Feedback Score</th>
                                <th style={styles.th}>Completion Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map(r => (
                                <tr key={r.id} className="hover-bg">
                                    <td style={{ ...styles.td, fontWeight: '600' }}>{r.employee_name || `Emp ID ${r.employee}`}</td>
                                    <td style={styles.td}>{r.program_title || `Prog ID ${r.program}`}</td>
                                    <td style={{ ...styles.td, textAlign: 'center' }}>{r.feedback_score ? `${r.feedback_score} / 5` : '-'}</td>
                                    <td style={styles.td}>
                                        <select 
                                            value={r.completion_status} 
                                            onChange={(e) => handleUpdateRecordStatus(r.id, e.target.value)}
                                            style={{ 
                                                padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer', outline: 'none',
                                                background: r.completion_status === 'COMPLETED' ? '#d1fae5' : r.completion_status === 'ENROLLED' ? '#e0f2fe' : '#fee2e2',
                                                color: r.completion_status === 'COMPLETED' ? '#065f46' : r.completion_status === 'ENROLLED' ? '#0369a1' : '#991b1b'
                                            }}
                                        >
                                            <option value="ENROLLED">Enrolled</option>
                                            <option value="COMPLETED">Completed</option>
                                            <option value="FAILED">Failed</option>
                                            <option value="NO_SHOW">No Show</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-light)' }}>
                        No employees enrolled in training programs.
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrainingManager;
