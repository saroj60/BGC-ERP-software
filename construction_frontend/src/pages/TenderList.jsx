import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const TenderList = () => {
    const [tenders, setTenders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchTenders();
    }, []);

    const fetchTenders = async () => {
        try {
            const response = await api.get('tenders/');
            // Handle both paginated and non-paginated responses
            setTenders(Array.isArray(response.data) ? response.data : response.data.results || []);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch tenders', err);
            setError('Failed to load tenders API. Is the backend running?');
            setLoading(false);
        }
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Tenders Dashboard...</div>;
    if (error) return <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>{error}</div>;

    const styles = {
        container: { padding: '30px', maxWidth: '1200px', margin: '0 auto', fontFamily: "'Inter', sans-serif" },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
        title: { fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 },
        card: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: 'var(--radius-lg)',
            padding: '25px',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            transition: 'transform 0.2s ease, box-shadow 0.2s'
        },
        grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' },
        badge: (status) => ({
            padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600',
            backgroundColor: status === 'OPEN' ? '#e0f2fe' : status === 'AWARDED' ? '#d1fae5' : '#f1f5f9',
            color: status === 'OPEN' ? '#0284c7' : status === 'AWARDED' ? '#059669' : '#475569'
        }),
        statsRow: { display: 'flex', justifyContent: 'space-between', marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #e2e8f0', fontSize: '14px' }
    };

    return (
        <div style={styles.container} className="animate-fade-in">
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>Tender & Bid Board</h1>
                    <p style={{ color: 'var(--text-light)', margin: '5px 0 0 0' }}>Manage project bidding and cost estimations</p>
                </div>
                {localStorage.getItem('user_role') === 'ADMIN' && (
                    <Link to="/tenders/new" className="btn btn-primary" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span>+ Create Tender</span>
                    </Link>
                )}
            </div>

            <div style={styles.grid}>
                {tenders.map((tender) => (
                    <Link to={`/tenders/${tender.id}`} key={tender.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div style={styles.card} className="hover-lift">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-primary)', fontWeight: '600' }}>{tender.title}</h3>
                                <span style={styles.badge(tender.status)}>{tender.status.replace('_', ' ')}</span>
                            </div>
                            
                            <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>
                                <strong>Location:</strong> {tender.location || 'N/A'}
                            </div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '15px' }}>
                                <strong>Deadline:</strong> <span style={{ color: 'var(--danger-color)' }}>{tender.submission_deadline}</span>
                            </div>

                            <div style={styles.statsRow}>
                                <div>
                                    <span style={{ color: 'var(--text-light)', display: 'block', fontSize: '12px' }}>Budget Estimate</span>
                                    <strong style={{ color: 'var(--text-primary)' }}>
                                        {tender.estimated_budget ? `₨ ${parseFloat(tender.estimated_budget).toLocaleString()}` : 'TBD'}
                                    </strong>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ color: 'var(--text-light)', display: 'block', fontSize: '12px' }}>Submitted Bids</span>
                                    <strong style={{ color: 'var(--primary-color)' }}>
                                        {tender.bids_count} Proposals
                                    </strong>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {tenders.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(255,255,255,0.6)', borderRadius: 'var(--radius-lg)' }}>
                    <h3 style={{ color: 'var(--text-secondary)' }}>No active tenders found.</h3>
                    <p style={{ color: 'var(--text-light)' }}>Create a new tender to start receiving contractor bids.</p>
                </div>
            )}
        </div>
    );
};

export default TenderList;
