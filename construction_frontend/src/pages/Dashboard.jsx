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
                // Artificial delay for smoother loading animation experience (optional but nice)
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
        <div className="animate-fade-in">
            <div style={{ marginBottom: '2rem' }}>
                <h1 className="text-2xl font-bold text-primary">
                    Welcome back, {role ? role.charAt(0) + role.slice(1).toLowerCase().replace('_', ' ') : 'User'} 👋
                </h1>
                <p className="text-secondary">Overview of all active construction sites and resources.</p>
            </div>

            <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
                {/* Stats Cards */}
                <div className="glass-card flex items-center gap-4" style={{ padding: '1.5rem' }}>
                    <div style={{
                        background: 'var(--primary-light)', color: 'var(--primary-color)',
                        padding: '12px', borderRadius: '12px', fontSize: '1.5rem'
                    }}>🏗️</div>
                    <div>
                        <div className="text-sm text-secondary">Total Projects</div>
                        <div className="text-2xl font-bold text-primary">{stats.total_projects}</div>
                    </div>
                </div>

                <div className="glass-card flex items-center gap-4" style={{ padding: '1.5rem' }}>
                    <div style={{
                        background: '#dcfce7', color: '#16a34a',
                        padding: '12px', borderRadius: '12px', fontSize: '1.5rem'
                    }}>📝</div>
                    <div>
                        <div className="text-sm text-secondary">Reports Today</div>
                        <div className="text-2xl font-bold text-primary">{stats.todays_reports}</div>
                    </div>
                </div>

                <div className="glass-card flex items-center gap-4" style={{ padding: '1.5rem' }}>
                    <div style={{
                        background: '#fef3c7', color: '#d97706',
                        padding: '12px', borderRadius: '12px', fontSize: '1.5rem'
                    }}>⚠️</div>
                    <div>
                        <div className="text-sm text-secondary">Pending Requests</div>
                        <div className="text-2xl font-bold text-primary">{stats.pending_material_requests}</div>
                    </div>
                </div>

                {role !== 'SITE_ENGINEER' && (
                    <div className="glass-card" style={{ padding: '1.5rem', gridRow: 'span 2' }}>
                        <h3 className="text-lg font-bold text-primary flex items-center gap-2" style={{ marginBottom: '1rem' }}>
                            💰 Project Expenses
                        </h3>
                        {stats.project_expenses.length === 0 ? (
                            <p className="text-secondary" style={{ fontStyle: 'italic', padding: '1rem', textAlign: 'center' }}>No expenses recorded yet.</p>
                        ) : (
                            <div className="flex flex-col gap-4" style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '8px' }}>
                                {stats.project_expenses.map((proj) => {
                                    const expense = parseFloat(proj.total_expense || 0);
                                    const budget = parseFloat(proj.budget || 0);
                                    const percent = budget > 0 ? Math.min((expense / budget) * 100, 100) : 0;
                                    let color = 'var(--success-color)';
                                    if (percent > 75) color = 'var(--warning-color)';
                                    if (percent > 90) color = 'var(--danger-color)';

                                    return (
                                        <div key={proj.id} style={{ paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                                            <div className="flex justify-between" style={{ marginBottom: '6px' }}>
                                                <span className="font-medium text-primary text-sm">{proj.name}</span>
                                                <span className="text-sm text-secondary">
                                                    <span className="font-bold text-primary">Rs. {expense.toLocaleString()}</span>
                                                    {' / '}
                                                    <span style={{ fontSize: '0.8em' }}>{budget > 0 ? `Rs. ${budget.toLocaleString()}` : 'No Budget'}</span>
                                                </span>
                                            </div>
                                            {budget > 0 && (
                                                <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                                                    <div style={{ width: `${percent}%`, height: '100%', background: color, transition: 'width 0.8s ease-out' }} />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="glass-card" style={{ padding: '2rem' }}>
                <h3 className="text-lg font-bold text-primary" style={{ marginBottom: '1.5rem' }}>Activity Summary</h3>
                <div style={{ height: '300px' }}>
                    <Bar data={chartData} options={chartOptions} />
                </div>
            </div>
        </div >
    );
};

export default Dashboard;
