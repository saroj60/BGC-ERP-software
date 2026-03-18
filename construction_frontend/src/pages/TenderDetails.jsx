import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const TenderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [tender, setTender] = useState(null);
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Bid Form State
    const [showBidForm, setShowBidForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newBid, setNewBid] = useState({
        contractor_name: '',
        bid_amount: '',
        estimated_duration_days: ''
    });

    const fetchData = async () => {
        try {
            // Fetch Tender Details
            const tenderRes = await api.get(`tenders/${id}/`);
            setTender(tenderRes.data);
            
            // Fetch Bids sorted automatically via custom endpoint
            const bidsRes = await api.get(`tenders/${id}/compare_bids/`);
            setBids(bidsRes.data);
            
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch Tender documentation.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleBidChange = (e) => {
        setNewBid({ ...newBid, [e.target.name]: e.target.value });
    };

    const handleSubmitBid = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = { ...newBid, tender: id };
            await api.post('tenders/bids/', payload);
            await fetchData(); // Refresh data to show UI changes
            
            setNewBid({ contractor_name: '', bid_amount: '', estimated_duration_days: '' });
            setShowBidForm(false);
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        } catch (err) {
            alert('Failed to submit cost estimation. Check your inputs.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAcceptBid = async (bidId, contractorName) => {
        if (!window.confirm(`Are you sure you want to award this tender to ${contractorName}? This will reject all other bids.`)) return;
        
        try {
            await api.patch(`tenders/bids/${bidId}/respond/`, { status: 'ACCEPTED' });
            await fetchData(); // Refresh to see updated statuses logic on the backend
        } catch (err) {
            alert('Failed to award bid. Check permissions.');
        }
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Procurement Docs...</div>;
    if (error) return <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>{error}</div>;
    if (!tender) return <div style={{ padding: '40px', textAlign: 'center' }}>Tender Not Found</div>;

    const styles = {
        container: { padding: '30px', maxWidth: '1000px', margin: '0 auto', fontFamily: "'Inter', sans-serif" },
        card: { background: '#fff', borderRadius: 'var(--radius-lg)', padding: '30px', boxShadow: 'var(--shadow-md)', marginBottom: '30px', border: '1px solid #e2e8f0' },
        header: { display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px', marginBottom: '20px' },
        title: { fontSize: '24px', margin: '0 0 10px 0', color: 'var(--text-primary)' },
        label: { fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px', display: 'block' },
        value: { fontSize: '16px', color: 'var(--text-primary)', fontWeight: '500' },
        grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' },
        table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
        th: { textAlign: 'left', padding: '12px 15px', background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '14px' },
        td: { padding: '12px 15px', borderBottom: '1px solid #e2e8f0', fontSize: '15px' },
        badge: (status) => ({
            padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold',
            background: status === 'ACCEPTED' ? '#d1fae5' : status === 'REJECTED' ? '#fee2e2' : '#f1f5f9',
            color: status === 'ACCEPTED' ? '#065f46' : status === 'REJECTED' ? '#991b1b' : '#475569'
        })
    };

    return (
        <div style={styles.container} className="animate-fade-in">
            <button onClick={() => navigate('/tenders')} className="btn btn-secondary" style={{ marginBottom: '20px' }}>
                &larr; Back to Board
            </button>

            {/* Tender Abstract Details */}
            <div style={styles.card}>
                <div style={styles.header}>
                    <div>
                        <h2 style={styles.title}>{tender.title}</h2>
                        <p style={{ margin: 0, color: 'var(--text-light)', fontSize: '14px' }}>Published by: {tender.created_by_name || 'Admin'} on {tender.issue_date}</p>
                    </div>
                    <div>
                        <span style={styles.badge(tender.status === 'AWARDED' ? 'ACCEPTED' : 'PENDING')} style={{ padding: '8px 16px', fontSize: '14px', borderRadius: '20px', background: tender.status === 'AWARDED' ? '#d1fae5' : '#e0f2fe', color: tender.status === 'AWARDED' ? '#065f46' : '#0369a1', fontWeight: 'bold' }}>
                            {tender.status}
                        </span>
                    </div>
                </div>

                <div style={{ marginBottom: '25px' }}>
                    <span style={styles.label}>Tender Description (Scope of Work):</span>
                    <p style={{ margin: '5px 0 0 0', lineHeight: '1.6', color: 'var(--text-primary)' }}>{tender.description}</p>
                </div>

                <div style={styles.grid}>
                    <div>
                        <span style={styles.label}>Location</span>
                        <div style={styles.value}>{tender.location || 'N/A'}</div>
                    </div>
                    <div>
                        <span style={styles.label}>Submission Deadline</span>
                        <div style={{ ...styles.value, color: 'var(--danger-color)', fontWeight: '600' }}>{tender.submission_deadline}</div>
                    </div>
                    <div>
                        <span style={styles.label}>Estimated Project Budget</span>
                        <div style={styles.value}>{tender.estimated_budget ? `₨ ${parseFloat(tender.estimated_budget).toLocaleString()}` : 'Not Disclosed'}</div>
                    </div>
                </div>
            </div>

            {/* Cost Estimator / Bid Submissions */}
            <div style={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Bid Comparison Table</h3>
                    {tender.status === 'OPEN' && (
                        <button className="btn btn-primary" onClick={() => setShowBidForm(!showBidForm)}>
                            {showBidForm ? 'Cancel Proposal' : '+ Submit New Bid'}
                        </button>
                    )}
                </div>

                {/* Submit New Bid Inline Form */}
                {showBidForm && (
                    <div style={{ background: '#f8fafc', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--primary-light)', marginBottom: '25px' }} className="animate-fade-in">
                        <h4 style={{ margin: '0 0 15px 0', color: 'var(--primary-hover)' }}>Cost Estimation Proposal</h4>
                        <form onSubmit={handleSubmitBid}>
                            <div className="dashboard-grid">
                                <div className="form-group">
                                    <label className="form-label">Contractor / Company Name *</label>
                                    <input type="text" className="form-control" name="contractor_name" required value={newBid.contractor_name} onChange={handleBidChange} placeholder="e.g. ABC Constructors Pvt Ltd." />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Total Est. Cost (Rs) *</label>
                                    <input type="number" className="form-control" name="bid_amount" required min="0" step="0.01" value={newBid.bid_amount} onChange={handleBidChange} placeholder="0.00" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Est. Completion Time (Days) *</label>
                                    <input type="number" className="form-control" name="estimated_duration_days" required min="1" value={newBid.estimated_duration_days} onChange={handleBidChange} placeholder="e.g. 180" />
                                </div>
                            </div>
                            <div style={{ textAlign: 'right', marginTop: '10px' }}>
                                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                                    {isSubmitting ? 'Uploading...' : 'Submit Final Bid'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Bids List View */}
                {bids.length > 0 ? (
                    <div className="table-container">
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Rank</th>
                                    <th style={styles.th}>Contractor</th>
                                    <th style={styles.th}>Est. Duration</th>
                                    <th style={styles.th}>Bid Amount (Rs)</th>
                                    <th style={styles.th}>Status</th>
                                    {tender.status !== 'AWARDED' && localStorage.getItem('user_role') === 'ADMIN' && <th style={{ ...styles.th, textAlign: 'right' }}>Action</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {bids.map((bid, index) => (
                                    <tr key={bid.id} style={{ background: index === 0 && bid.status !== 'REJECTED' ? '#f0fdf4' : 'transparent', transition: 'background 0.2s' }}>
                                        <td style={{ ...styles.td, fontWeight: 'bold', color: index === 0 ? 'var(--success-color)' : 'inherit' }}>
                                            #{index + 1} {index === 0 && '🏆'}
                                        </td>
                                        <td style={{ ...styles.td, fontWeight: '600' }}>{bid.contractor_name}</td>
                                        <td style={styles.td}>{bid.estimated_duration_days} days</td>
                                        <td style={{ ...styles.td, fontWeight: '700', color: index === 0 ? 'var(--success-color)' : 'var(--text-primary)' }}>
                                            ₨ {parseFloat(bid.bid_amount).toLocaleString()}
                                        </td>
                                        <td style={styles.td}>
                                            <span style={styles.badge(bid.status)}>{bid.status}</span>
                                        </td>
                                        {tender.status !== 'AWARDED' && localStorage.getItem('user_role') === 'ADMIN' && (
                                            <td style={{ ...styles.td, textAlign: 'right' }}>
                                                {bid.status === 'SUBMITTED' && (
                                                    <button 
                                                        onClick={() => handleAcceptBid(bid.id, bid.contractor_name)}
                                                        className="btn btn-primary" 
                                                        style={{ padding: '6px 12px', fontSize: '13px', background: 'var(--success-color)' }}
                                                    >
                                                        Award Tender
                                                    </button>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <p style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '15px' }}>
                            * System automatically sorts bids from lowest estimated cost to highest representing optimal financial cost projections.
                        </p>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: 'var(--radius-lg)' }}>
                        <p style={{ color: 'var(--text-light)' }}>No bids have been submitted for this tender yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TenderDetails;
