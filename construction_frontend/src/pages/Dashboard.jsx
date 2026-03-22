import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import api from '../api/axios';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
    const [stats, setStats] = useState({
        total_projects: 0,
        todays_reports: 0,
        project_expenses: [],
        pending_material_requests: 0
    });
    const [loading, setLoading] = useState(true);
    const role = localStorage.getItem('user_role');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('dashboard/stats/');
                setStats(response.data);
                setTimeout(() => setLoading(false), 300);
            } catch (err) {
                console.error("Failed to fetch dashboard stats", err);
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const chartData = {
        labels: ['Projects', 'Reports (Today)', 'Pending Requests'],
        datasets: [
            {
                label: 'Count',
                data: [stats.total_projects, stats.todays_reports, stats.pending_material_requests],
                backgroundColor: ['rgba(79, 70, 229, 0.6)', 'rgba(16, 185, 129, 0.6)', 'rgba(245, 158, 11, 0.6)'],
                borderColor: ['rgba(79, 70, 229, 1)', 'rgba(16, 185, 129, 1)', 'rgba(245, 158, 11, 1)'],
                borderWidth: 1,
                borderRadius: 4,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(0, 0, 0, 0.05)' }
            },
            x: {
                grid: { display: false }
            }
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center" style={{ height: '400px' }}>
            <div className="text-secondary text-lg animate-pulse">Loading Dashboard...</div>
        </div>
    );

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
            <header className="page-header">
                <div>
                    <h1>Dashboard</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                        Welcome back! Here's what's happening today.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-secondary btn-sm">Report</button>
                    <button className="btn btn-primary btn-sm">+ New Project</button>
                </div>
            </header>

            {/* Quick Stats Grid */}
            <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
                <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f5f7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>🏗️</div>
                    <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '2px' }}>Projects</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1 }}>{stats.total_projects}</div>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>📝</div>
                    <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '2px' }}>Reports</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1 }}>{stats.todays_reports}</div>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>⚠️</div>
                    <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '2px' }}>Pending</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1 }}>{stats.pending_material_requests}</div>
                    </div>
                </div>
            </div>

            <div className="grid-analytics" style={{ 
                display: 'grid', 
                gridTemplateColumns: window.innerWidth > 992 ? '2fr 1fr' : '1fr', 
                gap: '1.5rem', 
                marginBottom: '2rem' 
            }}>
                {/* Main Analytics Chart */}
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        📊 Activity Trends
                    </h3>
                    <div style={{ height: '300px' }}>
                        <Bar data={chartData} options={chartOptions} />
                    </div>
                </div>

                {/* Side Widget: Expenses */}
                {role !== 'SITE_ENGINEER' && (
                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            💰 Project Budgets
                        </h3>
                        {stats.project_expenses.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-light)', fontSize: '0.9rem' }}>
                                No expense data
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {stats.project_expenses.slice(0, 5).map((proj) => {
                                    const expense = parseFloat(proj.total_expense || 0);
                                    const budget = parseFloat(proj.budget || 0);
                                    const percent = budget > 0 ? Math.min((expense / budget) * 100, 100) : 0;
                                    
                                    return (
                                        <div key={proj.id}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                                                <span style={{ fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>{proj.name}</span>
                                                <span style={{ color: 'var(--text-secondary)' }}>{Math.round(percent)}%</span>
                                            </div>
                                            <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                                                <div style={{ 
                                                    width: `${percent}%`, 
                                                    height: '100%', 
                                                    background: percent > 90 ? 'var(--danger-color)' : 'var(--primary-color)',
                                                    borderRadius: '3px'
                                                }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        <button className="btn btn-ghost btn-block btn-sm" style={{ marginTop: '1.5rem' }}>View Expenses</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
