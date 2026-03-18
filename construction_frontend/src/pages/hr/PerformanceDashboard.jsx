import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const PerformanceDashboard = () => {
    const [reviews, setReviews] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showForm, setShowForm] = useState(false);
    const [newReview, setNewReview] = useState({ employee: '', rating: 5, comments: '', goals_for_next_period: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [revRes, empRes] = await Promise.all([
                api.get('hr/reviews/'),
                api.get('hr/employees/')
            ]);
            setReviews(Array.isArray(revRes.data) ? revRes.data : revRes.data.results || []);
            setEmployees(Array.isArray(empRes.data) ? empRes.data : empRes.data.results || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        try {
            await api.post('hr/reviews/', newReview);
            await fetchData();
            setShowForm(false);
            setNewReview({ employee: '', rating: 5, comments: '', goals_for_next_period: '' });
        } catch (err) {
            alert("Failed to submit performance review.");
        }
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Performance Metrics...</div>;

    const styles = {
        container: { padding: '30px', maxWidth: '1000px', margin: '0 auto', fontFamily: "'Inter', sans-serif" },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
        card: { background: '#fff', borderRadius: 'var(--radius-lg)', padding: '25px', boxShadow: 'var(--shadow-md)', border: '1px solid #e2e8f0', marginBottom: '20px' },
        reviewGrid: { display: 'flex', flexDirection: 'column', gap: '20px' },
        stars: (rating) => '⭐'.repeat(rating) + '☆'.repeat(5 - rating)
    };

    return (
        <div style={styles.container} className="animate-fade-in">
            <div style={styles.header}>
                <div>
                    <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>Performance Evaluations</h2>
                    <p style={{ margin: 0, color: 'var(--text-light)' }}>Track employee reviews and formal feedback.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : '+ Log Formal Review'}
                </button>
            </div>

            {showForm && (
                <div style={styles.card} className="animate-fade-in">
                    <form onSubmit={handleSubmitReview}>
                        <div className="dashboard-grid">
                            <div className="form-group">
                                <label className="form-label">Select Employee *</label>
                                <select className="form-control" required value={newReview.employee} onChange={e => setNewReview({...newReview, employee: e.target.value})}>
                                    <option value="">-- Choose Employee --</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.user_details?.name || `Emp ID ${emp.id}`} - {emp.designation}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Overall Rating (1-5) *</label>
                                <input type="number" className="form-control" min="1" max="5" required value={newReview.rating} onChange={e => setNewReview({...newReview, rating: parseInt(e.target.value)})} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Manager Comments & Feedback *</label>
                            <textarea className="form-control" rows="3" required value={newReview.comments} onChange={e => setNewReview({...newReview, comments: e.target.value})} placeholder="Detail the employee's strengths and areas for improvement..." />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Goals for Next Period</label>
                            <textarea className="form-control" rows="2" value={newReview.goals_for_next_period} onChange={e => setNewReview({...newReview, goals_for_next_period: e.target.value})} placeholder="Set actionable KPIs..." />
                        </div>
                        <div style={{ textAlign: 'right', marginTop: '10px' }}>
                            <button type="submit" className="btn btn-primary">Submit Evaluation to File</button>
                        </div>
                    </form>
                </div>
            )}

            <div style={styles.reviewGrid}>
                {reviews.map(rev => (
                    <div key={rev.id} style={styles.card} className="hover-lift">
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px', marginBottom: '15px' }}>
                            <div>
                                <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', color: 'var(--text-primary)' }}>
                                    {rev.employee_name || `Employee ID: ${rev.employee}`}
                                </h3>
                                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-light)' }}>
                                    Reviewed by {rev.reviewer_name || 'Manager'} on {rev.review_date}
                                </p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '20px', letterSpacing: '2px' }}>{styles.stars(rev.rating)}</div>
                                <span style={{ fontSize: '12px', fontWeight: 'bold', color: rev.rating >= 4 ? 'var(--success-color)' : rev.rating <= 2 ? 'var(--danger-color)' : 'var(--text-secondary)' }}>
                                    {rev.rating}/5 Score
                                </span>
                            </div>
                        </div>
                        
                        <div>
                            <strong style={{ fontSize: '14px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Manager Comments:</strong>
                            <p style={{ fontSize: '14px', color: 'var(--text-primary)', margin: '0 0 15px 0', lineHeight: 1.5 }}>{rev.comments}</p>
                        </div>

                        {rev.goals_for_next_period && (
                            <div style={{ background: '#f8fafc', padding: '15px', borderRadius: 'var(--radius-md)' }}>
                                <strong style={{ fontSize: '13px', color: 'var(--primary-color)', display: 'block', marginBottom: '5px' }}>🎯 Future Goals & KPIs:</strong>
                                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>{rev.goals_for_next_period}</p>
                            </div>
                        )}
                    </div>
                ))}
                
                {reviews.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: 'var(--radius-lg)' }}>
                        <h3 style={{ color: 'var(--text-secondary)' }}>No performance reviews logged.</h3>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PerformanceDashboard;
