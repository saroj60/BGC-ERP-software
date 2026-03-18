import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const HRDashboard = () => {
    const [stats, setStats] = useState({
        employees: 0,
        jobs: 0,
        applicants: 0,
        trainings: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHRStats = async () => {
            try {
                const [empRes, jobRes, appRes, trainRes] = await Promise.all([
                    api.get('hr/employees/'),
                    api.get('hr/jobs/'),
                    api.get('hr/applicants/'),
                    api.get('hr/trainings/')
                ]);

                // Extract array data considering pagination `.results`
                const getCount = (res) => Array.isArray(res.data) ? res.data.length : (res.data.results ? res.data.results.length : 0);

                setStats({
                    employees: getCount(empRes),
                    jobs: getCount(jobRes),
                    applicants: getCount(appRes),
                    trainings: getCount(trainRes),
                });
            } catch (err) {
                console.error("Failed to fetch HR Overview stats", err);
            } finally {
                setLoading(false);
            }
        };

        fetchHRStats();
    }, []);

    const styles = {
        container: { padding: '30px', maxWidth: '1200px', margin: '0 auto', fontFamily: "'Inter', sans-serif" },
        header: { marginBottom: '30px' },
        title: { fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 10px 0' },
        subtitle: { color: 'var(--text-secondary)', fontSize: '16px', margin: 0 },
        statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' },
        statCard: { background: '#fff', padding: '25px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid rgba(226, 232, 240, 0.8)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', transition: 'transform 0.2s ease' },
        statIcon: { fontSize: '32px', marginBottom: '15px' },
        statValue: { fontSize: '36px', fontWeight: '800', color: 'var(--primary-color)', margin: '0 0 5px 0', lineHeight: 1 },
        statLabel: { fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' },
        navGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' },
        navCard: { background: '#fff', padding: '30px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', border: '1px solid #e2e8f0', textDecoration: 'none', color: 'inherit', display: 'flex', gap: '20px', alignItems: 'flex-start', transition: 'box-shadow 0.2s ease, transform 0.2s ease' },
        navIconWrapper: { background: 'var(--primary-light)', color: 'var(--primary-color)', width: '60px', height: '60px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 },
        navContent: { flex: 1 },
        navTitle: { fontSize: '18px', fontWeight: '700', margin: '0 0 8px 0', color: 'var(--text-primary)' },
        navDesc: { fontSize: '14px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading HR System...</div>;

    return (
        <div style={styles.container} className="animate-fade-in">
            <div style={styles.header}>
                <h1 style={styles.title}>Human Resources Hub</h1>
                <p style={styles.subtitle}>Overview of workforce, recruitment, and training</p>
            </div>

            {/* Top Stats Row */}
            <div style={styles.statsGrid}>
                <div style={styles.statCard} className="hover-lift">
                    <div style={styles.statIcon}>👥</div>
                    <div style={styles.statValue}>{stats.employees}</div>
                    <div style={styles.statLabel}>Active Employees</div>
                </div>
                <div style={styles.statCard} className="hover-lift">
                    <div style={styles.statIcon}>🎯</div>
                    <div style={styles.statValue}>{stats.jobs}</div>
                    <div style={styles.statLabel}>Open Positions</div>
                </div>
                <div style={styles.statCard} className="hover-lift">
                    <div style={styles.statIcon}>📄</div>
                    <div style={styles.statValue}>{stats.applicants}</div>
                    <div style={styles.statLabel}>Total Applicants</div>
                </div>
                <div style={styles.statCard} className="hover-lift">
                    <div style={styles.statIcon}>🎓</div>
                    <div style={styles.statValue}>{stats.trainings}</div>
                    <div style={styles.statLabel}>Training Programs</div>
                </div>
            </div>

            {/* HR Navigation Modules */}
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '20px', fontSize: '20px' }}>HR Management Modules</h3>
            <div style={styles.navGrid}>
                <Link to="/hr/employees" style={styles.navCard} className="hover-lift">
                    <div style={styles.navIconWrapper}>👔</div>
                    <div style={styles.navContent}>
                        <h4 style={styles.navTitle}>Employee Directory</h4>
                        <p style={styles.navDesc}>Manage staff records, departments, salaries, and contact information.</p>
                    </div>
                </Link>

                <Link to="/hr/recruitment" style={styles.navCard} className="hover-lift">
                    <div style={styles.navIconWrapper}>🤝</div>
                    <div style={styles.navContent}>
                        <h4 style={styles.navTitle}>Recruitment Board</h4>
                        <p style={styles.navDesc}>Post new job openings, track applicants, and manage hiring pipelines.</p>
                    </div>
                </Link>

                <Link to="/hr/training" style={styles.navCard} className="hover-lift">
                    <div style={styles.navIconWrapper}>📚</div>
                    <div style={styles.navContent}>
                        <h4 style={styles.navTitle}>Training & Safety</h4>
                        <p style={styles.navDesc}>Schedule safety orientations, skills workshops, and track employee certifications.</p>
                    </div>
                </Link>

                <Link to="/hr/performance" style={styles.navCard} className="hover-lift">
                    <div style={styles.navIconWrapper}>📈</div>
                    <div style={styles.navContent}>
                        <h4 style={styles.navTitle}>Performance Reviews</h4>
                        <p style={styles.navDesc}>Conduct periodic employee evaluations and track team growth metrics.</p>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default HRDashboard;
