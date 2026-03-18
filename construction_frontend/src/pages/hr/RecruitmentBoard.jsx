import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const RecruitmentBoard = () => {
    const [jobs, setJobs] = useState([]);
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // New Job Form State
    const [showJobForm, setShowJobForm] = useState(false);
    const [newJob, setNewJob] = useState({ title: '', description: '', department: '', vacancies: 1, location: '' });

    useEffect(() => {
        fetchRecruitmentData();
    }, []);

    const fetchRecruitmentData = async () => {
        try {
            const [jobsRes, appsRes] = await Promise.all([
                api.get('hr/jobs/'),
                api.get('hr/applicants/')
            ]);
            setJobs(Array.isArray(jobsRes.data) ? jobsRes.data : jobsRes.data.results || []);
            setApplicants(Array.isArray(appsRes.data) ? appsRes.data : appsRes.data.results || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateJob = async (e) => {
        e.preventDefault();
        try {
            await api.post('hr/jobs/', newJob);
            await fetchRecruitmentData();
            setShowJobForm(false);
            setNewJob({ title: '', description: '', department: '', vacancies: 1, location: '' });
        } catch (err) {
            alert("Failed to create job posting");
        }
    };

    const handleUpdateApplicantStatus = async (id, newStatus) => {
        try {
            await api.patch(`hr/applicants/${id}/`, { status: newStatus });
            // Optimistic UI Update
            setApplicants(applicants.map(app => app.id === id ? { ...app, status: newStatus } : app));
        } catch (err) {
            alert("Failed to update applicant status");
        }
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Recruitment Board...</div>;

    const styles = {
        container: { padding: '30px', maxWidth: '1200px', margin: '0 auto', fontFamily: "'Inter', sans-serif" },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
        card: { background: '#fff', borderRadius: 'var(--radius-lg)', padding: '20px', boxShadow: 'var(--shadow-md)', border: '1px solid #e2e8f0', marginBottom: '20px' },
        jobGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' },
        jobTitle: { fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', margin: '0 0 10px 0' },
        appCard: { background: '#f8fafc', border: '1px solid #e2e8f0', padding: '15px', borderRadius: 'var(--radius-md)', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
        appName: { fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', margin: '0 0 5px 0' },
        appDetail: { fontSize: '13px', color: 'var(--text-secondary)', margin: 0 },
        badge: (status) => ({
            padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase',
            background: status === 'APPLIED' ? '#e0f2fe' : status === 'INTERVIEWING' ? '#fef08a' : status === 'OFFERED' ? '#d1fae5' : '#fee2e2',
            color: status === 'APPLIED' ? '#0369a1' : status === 'INTERVIEWING' ? '#854d0e' : status === 'OFFERED' ? '#065f46' : '#991b1b'
        })
    };

    return (
        <div style={styles.container} className="animate-fade-in">
            <div style={styles.header}>
                <div>
                    <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>Recruitment & Hiring</h2>
                    <p style={{ margin: 0, color: 'var(--text-light)' }}>Manage open positions and track applicants.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowJobForm(!showJobForm)}>
                    {showJobForm ? 'Cancel' : '+ Open New Position'}
                </button>
            </div>

            {showJobForm && (
                <div style={styles.card} className="animate-fade-in">
                    <h3 style={{ marginTop: 0 }}>Create Job Posting</h3>
                    <form onSubmit={handleCreateJob}>
                        <div className="dashboard-grid">
                            <div className="form-group">
                                <label className="form-label">Job Title *</label>
                                <input type="text" className="form-control" required value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Department *</label>
                                <input type="text" className="form-control" required value={newJob.department} onChange={e => setNewJob({...newJob, department: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Vacancies</label>
                                <input type="number" className="form-control" min="1" required value={newJob.vacancies} onChange={e => setNewJob({...newJob, vacancies: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Location</label>
                                <input type="text" className="form-control" required value={newJob.location} onChange={e => setNewJob({...newJob, location: e.target.value})} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Job Description</label>
                            <textarea className="form-control" rows="3" required value={newJob.description} onChange={e => setNewJob({...newJob, description: e.target.value})}></textarea>
                        </div>
                        <div style={{ textAlign: 'right', marginTop: '10px' }}>
                            <button type="submit" className="btn btn-primary">Publish Job</button>
                        </div>
                    </form>
                </div>
            )}

            <h3 style={{ color: 'var(--text-primary)' }}>Active Job Postings</h3>
            <div style={styles.jobGrid}>
                {jobs.map(job => (
                    <div key={job.id} style={styles.card} className="hover-lift">
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <h4 style={styles.jobTitle}>{job.title}</h4>
                            <span style={{ fontSize: '12px', color: job.status === 'OPEN' ? 'var(--success-color)' : 'var(--danger-color)', fontWeight: 'bold' }}>
                                {job.status}
                            </span>
                        </div>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 15px 0' }}>
                            {job.department} • {job.location} • {job.vacancies} Vacancies
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '15px', borderTop: '1px solid #e2e8f0' }}>
                            <span style={{ fontSize: '13px', color: 'var(--primary-color)', fontWeight: '600' }}>
                                👥 {job.applicant_count} Applicants
                            </span>
                        </div>
                    </div>
                ))}
                {jobs.length === 0 && <p style={{ color: 'var(--text-light)' }}>No active job postings.</p>}
            </div>

            <h3 style={{ color: 'var(--text-primary)', borderTop: '2px solid #e2e8f0', paddingTop: '30px' }}>Recent Applications</h3>
            <div>
                {applicants.map(app => (
                    <div key={app.id} style={styles.appCard}>
                        <div>
                            <h4 style={styles.appName}>{app.name}</h4>
                            <p style={styles.appDetail}>Applied for: <strong>{app.job_title || `Job ID ${app.job_posting}`}</strong> | {app.email} | {app.phone}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                            <select 
                                value={app.status} 
                                onChange={(e) => handleUpdateApplicantStatus(app.id, e.target.value)}
                                style={{ ...styles.badge(app.status), border: 'none', outline: 'none', cursor: 'pointer' }}
                            >
                                <option value="APPLIED">Applied</option>
                                <option value="INTERVIEWING">Interviewing</option>
                                <option value="OFFERED">Offered</option>
                                <option value="REJECTED">Rejected</option>
                            </select>
                        </div>
                    </div>
                ))}
                {applicants.length === 0 && <p style={{ color: 'var(--text-light)' }}>No applicants currently in the pipeline.</p>}
            </div>
        </div>
    );
};

export default RecruitmentBoard;
