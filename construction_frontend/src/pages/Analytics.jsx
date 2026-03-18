import React, { useState, useEffect, useRef } from 'react';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement,
    LineElement, PointElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import api from '../api/axios';

ChartJS.register(
    CategoryScale, LinearScale, BarElement, ArcElement,
    LineElement, PointElement, Title, Tooltip, Legend, Filler
);

// ── Design tokens ──────────────────────────────────────────────────────────────
const COLORS = {
    primary: '#4f46e5', primaryLight: '#ede9fe',
    success: '#10b981', successLight: '#d1fae5',
    warning: '#f59e0b', warningLight: '#fef3c7',
    danger:  '#ef4444', dangerLight:  '#fee2e2',
    info:    '#0ea5e9', infoLight:    '#e0f2fe',
    purple:  '#8b5cf6', orange: '#f97316', teal: '#14b8a6',
};
const PALETTE = [COLORS.primary, COLORS.success, COLORS.warning, COLORS.danger, COLORS.info, COLORS.purple, COLORS.orange, COLORS.teal];

// ── Reusable helpers ──────────────────────────────────────────────────────────
const KpiCard = ({ icon, label, value, sub, color = COLORS.primary, lightColor }) => (
    <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ background: lightColor || '#ede9fe', color, padding: '14px', borderRadius: '14px', fontSize: '1.6rem', flexShrink: 0 }}>
            {icon}
        </div>
        <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>{value}</div>
            {sub && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{sub}</div>}
        </div>
    </div>
);

const SectionTitle = ({ title, subtitle }) => (
    <div style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h3>
        {subtitle && <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{subtitle}</p>}
    </div>
);

const ChartCard = ({ title, subtitle, children, style = {} }) => (
    <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '16px', ...style }}>
        <SectionTitle title={title} subtitle={subtitle} />
        {children}
    </div>
);

const ProgressBar = ({ label, value, max, color = COLORS.primary, suffix = '' }) => {
    const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
    return (
        <div style={{ marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem' }}>
                <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{label}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{suffix || `${pct.toFixed(0)}%`}</span>
            </div>
            <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '8px', transition: 'width 0.8s ease-out' }} />
            </div>
        </div>
    );
};

const chartDefaults = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { font: { size: 11 } } },
        x: { grid: { display: false }, ticks: { font: { size: 11 } } },
    },
};

// ── Main Component ─────────────────────────────────────────────────────────────
const Analytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('kpi');

    useEffect(() => {
        api.get('dashboard/analytics/')
            .then(r => { setData(r.data); setLoading(false); })
            .catch(() => { setError('Failed to load analytics data.'); setLoading(false); });
    }, []);

    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', gap: '1rem' }}>
            <div style={{ fontSize: '2.5rem', animation: 'spin 1.5s linear infinite' }}>📊</div>
            <div style={{ color: 'var(--text-secondary)' }}>Loading Analytics…</div>
        </div>
    );

    if (error || !data) return (
        <div style={{ padding: '2rem', background: '#fef2f2', borderRadius: '12px', color: '#dc2626' }}>
            {error || 'No data available.'}
        </div>
    );

    const { kpis, cost_report, productivity } = data;

    // ── Tab definitions ─────────────────────────────────────────────────────────
    const tabs = [
        { key: 'kpi',          label: '📈 KPI Dashboard' },
        { key: 'cost',         label: '💰 Cost Reports' },
        { key: 'productivity', label: '⚡ Productivity' },
    ];

    return (
        <div className="animate-fade-in">
            {/* Page header */}
            <div style={{ marginBottom: '1.75rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    📊 Reporting &amp; Analytics
                </h2>
                <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)' }}>
                    Business insights across projects, costs, and team productivity.
                </p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.75rem', borderBottom: '2px solid #f1f5f9' }}>
                {tabs.map(t => (
                    <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        padding: '0.7rem 1.2rem', fontSize: '0.95rem',
                        fontWeight: activeTab === t.key ? 700 : 450,
                        color: activeTab === t.key ? 'var(--primary-color)' : 'var(--text-secondary)',
                        borderBottom: activeTab === t.key ? '3px solid var(--primary-color)' : '3px solid transparent',
                        marginBottom: '-2px', transition: 'all 0.2s',
                    }}>{t.label}</button>
                ))}
            </div>

            {/* ════ KPI DASHBOARD ════ */}
            {activeTab === 'kpi' && (
                <div>
                    {/* KPI grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
                        <KpiCard icon="🏗️" label="Total Projects" value={kpis.total_projects}
                            sub={`${kpis.ongoing_projects} ongoing · ${kpis.completed_projects} done`} color={COLORS.primary} lightColor={COLORS.primaryLight} />
                        <KpiCard icon="💰" label="Total Budget" value={`₨${(kpis.total_budget/1000).toFixed(0)}K`}
                            sub={`₨${(kpis.total_expense/1000).toFixed(0)}K spent`} color={COLORS.success} lightColor={COLORS.successLight} />
                        <KpiCard icon="📉" label="Budget Used" value={`${kpis.budget_utilization}%`}
                            sub={kpis.budget_utilization > 90 ? '⚠️ Near limit' : kpis.budget_utilization > 75 ? '🟡 Watch closely' : '🟢 On track'}
                            color={kpis.budget_utilization > 90 ? COLORS.danger : kpis.budget_utilization > 75 ? COLORS.warning : COLORS.success}
                            lightColor={kpis.budget_utilization > 90 ? COLORS.dangerLight : kpis.budget_utilization > 75 ? COLORS.warningLight : COLORS.successLight} />
                        <KpiCard icon="👷" label="Total Workers" value={kpis.total_workers}
                            sub={`${kpis.attendance_rate}% attendance rate`} color={COLORS.info} lightColor={COLORS.infoLight} />
                        <KpiCard icon="✅" label="Tasks Done" value={`${kpis.completed_tasks}/${kpis.total_tasks}`}
                            sub={`${kpis.task_completion_rate}% completion rate`} color={COLORS.purple} lightColor="#ede9fe" />
                        <KpiCard icon="⛽" label="Fuel Cost" value={`₨${kpis.vehicle_fuel_cost.toLocaleString()}`}
                            sub={`Maint: ₨${kpis.vehicle_maintenance_cost.toLocaleString()}`} color={COLORS.orange} lightColor="#fff7ed" />
                    </div>

                    {/* Budget utilization bars */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                        <ChartCard title="📊 Project Budget vs Spend" subtitle="Budget utilization per project">
                            {cost_report.by_project.length === 0
                                ? <Empty text="No project budget data." />
                                : cost_report.by_project.map((p, i) => {
                                    const pct = p.budget > 0 ? (p.total_expense / p.budget) * 100 : 0;
                                    const col = pct > 90 ? COLORS.danger : pct > 75 ? COLORS.warning : COLORS.success;
                                    return (
                                        <div key={p.id} style={{ marginBottom: '1rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.83rem', marginBottom: '4px' }}>
                                                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</span>
                                                <span style={{ color: 'var(--text-secondary)' }}>
                                                    ₨{(p.total_expense/1000).toFixed(1)}K / ₨{(p.budget/1000).toFixed(1)}K
                                                </span>
                                            </div>
                                            <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '8px', overflow: 'hidden' }}>
                                                <div style={{ width: `${Math.min(pct,100)}%`, height:'100%', background: col, transition: 'width 0.8s ease-out', borderRadius: '8px' }} />
                                            </div>
                                        </div>
                                    );
                                })
                            }
                        </ChartCard>

                        <ChartCard title="✅ Task Completion by Project" subtitle="Completed vs total tasks">
                            {productivity.task_by_project.length === 0
                                ? <Empty text="No task data." />
                                : productivity.task_by_project.map((p, i) => (
                                    <ProgressBar key={p.project} label={p.project}
                                        value={p.completed} max={p.total}
                                        color={COLORS.primary}
                                        suffix={`${p.completed}/${p.total} (${p.rate}%)`} />
                                ))
                            }
                        </ChartCard>
                    </div>
                </div>
            )}

            {/* ════ COST REPORTS ════ */}
            {activeTab === 'cost' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {/* Monthly trend */}
                    <ChartCard title="📅 Monthly Expense Trend" subtitle="Total expenses over the last 6 months">
                        <div style={{ height: '260px' }}>
                            {cost_report.monthly_trend.length === 0
                                ? <Empty text="No expense data in the last 6 months." />
                                : <Line
                                    data={{
                                        labels: cost_report.monthly_trend.map(m => m.month),
                                        datasets: [{
                                            label: 'Expenses (₨)',
                                            data: cost_report.monthly_trend.map(m => m.total),
                                            borderColor: COLORS.primary,
                                            backgroundColor: 'rgba(79,70,229,0.1)',
                                            fill: true, tension: 0.4, pointRadius: 5,
                                        }]
                                    }}
                                    options={{
                                        ...chartDefaults,
                                        plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => `₨${ctx.parsed.y.toLocaleString()}` } } }
                                    }}
                                />
                            }
                        </div>
                    </ChartCard>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                        {/* Expense by category – doughnut */}
                        <ChartCard title="🏷️ Expenses by Category" subtitle="Breakdown of cost categories">
                            <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {cost_report.by_category.length === 0
                                    ? <Empty text="No expense categories yet." />
                                    : <Doughnut
                                        data={{
                                            labels: cost_report.by_category.map(c => c.category),
                                            datasets: [{
                                                data: cost_report.by_category.map(c => c.total),
                                                backgroundColor: PALETTE,
                                                borderWidth: 2, borderColor: '#fff',
                                            }]
                                        }}
                                        options={{
                                            responsive: true, maintainAspectRatio: false,
                                            plugins: {
                                                legend: { display: true, position: 'right', labels: { font: { size: 11 }, boxWidth: 14, padding: 10 } },
                                                tooltip: { callbacks: { label: ctx => ` ₨${ctx.parsed.toLocaleString()}` } }
                                            },
                                            cutout: '60%',
                                        }}
                                    />
                                }
                            </div>
                        </ChartCard>

                        {/* Expense by project – bar */}
                        <ChartCard title="🏗️ Expenses by Project" subtitle="Total amount spent per project">
                            <div style={{ height: '260px' }}>
                                {cost_report.by_project.length === 0
                                    ? <Empty text="No project expenses." />
                                    : <Bar
                                        data={{
                                            labels: cost_report.by_project.map(p => p.name.length > 12 ? p.name.slice(0, 12) + '…' : p.name),
                                            datasets: [
                                                {
                                                    label: 'Spent (₨)',
                                                    data: cost_report.by_project.map(p => p.total_expense),
                                                    backgroundColor: 'rgba(79,70,229,0.7)',
                                                    borderRadius: 6,
                                                },
                                                {
                                                    label: 'Budget (₨)',
                                                    data: cost_report.by_project.map(p => p.budget),
                                                    backgroundColor: 'rgba(16,185,129,0.3)',
                                                    borderRadius: 6,
                                                },
                                            ]
                                        }}
                                        options={{
                                            ...chartDefaults,
                                            plugins: {
                                                legend: { display: true, labels: { font: { size: 11 }, boxWidth: 14 } },
                                                tooltip: { callbacks: { label: ctx => ` ₨${ctx.parsed.y.toLocaleString()}` } }
                                            },
                                        }}
                                    />
                                }
                            </div>
                        </ChartCard>
                    </div>

                    {/* Category table */}
                    {cost_report.by_category.length > 0 && (
                        <ChartCard title="📋 Expense Category Breakdown" subtitle="Full cost breakdown by category">
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                                        {['Category', 'Amount (₨)', 'Share %'].map(h => (
                                            <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.8rem' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {cost_report.by_category.map((c, i) => {
                                        const totalAll = cost_report.by_category.reduce((s, x) => s + x.total, 0);
                                        const share = totalAll > 0 ? ((c.total / totalAll) * 100).toFixed(1) : 0;
                                        return (
                                            <tr key={c.category} style={{ borderBottom: '1px solid #f8fafc', background: i % 2 === 0 ? 'transparent' : '#fafbff' }}>
                                                <td style={{ padding: '10px 12px', fontWeight: 600 }}>
                                                    <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: PALETTE[i % PALETTE.length], marginRight: '8px' }} />
                                                    {c.category}
                                                </td>
                                                <td style={{ padding: '10px 12px', color: '#dc2626', fontWeight: 700 }}>₨{c.total.toLocaleString()}</td>
                                                <td style={{ padding: '10px 12px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <div style={{ flex: 1, height: '6px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                                            <div style={{ width: `${share}%`, height: '100%', background: PALETTE[i % PALETTE.length] }} />
                                                        </div>
                                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', width: '36px', textAlign: 'right' }}>{share}%</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </ChartCard>
                    )}
                </div>
            )}

            {/* ════ PRODUCTIVITY ════ */}
            {activeTab === 'productivity' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                        {/* Task status doughnut */}
                        <ChartCard title="📝 Task Status Overview" subtitle="Distribution of all task statuses">
                            <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {productivity.task_status_breakdown.length === 0
                                    ? <Empty text="No tasks recorded." />
                                    : <Doughnut
                                        data={{
                                            labels: productivity.task_status_breakdown.map(t => t.status.replace('_', ' ')),
                                            datasets: [{
                                                data: productivity.task_status_breakdown.map(t => t.count),
                                                backgroundColor: [COLORS.warning, COLORS.primary, COLORS.success],
                                                borderWidth: 2, borderColor: '#fff',
                                            }]
                                        }}
                                        options={{
                                            responsive: true, maintainAspectRatio: false, cutout: '60%',
                                            plugins: { legend: { display: true, position: 'right', labels: { font: { size: 11 }, boxWidth: 14 } } }
                                        }}
                                    />
                                }
                            </div>
                        </ChartCard>

                        {/* Worker role distribution */}
                        <ChartCard title="👷 Workforce by Role" subtitle="Worker distribution across roles">
                            <div style={{ height: '240px' }}>
                                {productivity.worker_by_role.length === 0
                                    ? <Empty text="No worker data." />
                                    : <Bar
                                        data={{
                                            labels: productivity.worker_by_role.map(w => w.role),
                                            datasets: [{
                                                label: 'Workers',
                                                data: productivity.worker_by_role.map(w => w.count),
                                                backgroundColor: PALETTE,
                                                borderRadius: 8,
                                            }]
                                        }}
                                        options={{ ...chartDefaults }}
                                    />
                                }
                            </div>
                        </ChartCard>
                    </div>

                    {/* Attendance by project */}
                    <ChartCard title="📋 Attendance Rate by Project" subtitle="Last 30 days — present vs absent">
                        {productivity.attendance_by_project.length === 0
                            ? <Empty text="No attendance data in the last 30 days." />
                            : <>
                                <div style={{ height: '240px', marginBottom: '1rem' }}>
                                    <Bar
                                        data={{
                                            labels: productivity.attendance_by_project.map(a => a.project.length > 14 ? a.project.slice(0,14)+'…' : a.project),
                                            datasets: [
                                                { label: 'Present', data: productivity.attendance_by_project.map(a => a.present), backgroundColor: 'rgba(16,185,129,0.75)', borderRadius: 6 },
                                                { label: 'Absent',  data: productivity.attendance_by_project.map(a => a.absent),  backgroundColor: 'rgba(239,68,68,0.65)',  borderRadius: 6 },
                                            ]
                                        }}
                                        options={{
                                            ...chartDefaults,
                                            plugins: { legend: { display: true, labels: { font: { size: 11 }, boxWidth: 14 } } },
                                        }}
                                    />
                                </div>
                                {/* Attendance rate bars */}
                                {productivity.attendance_by_project.map(a => (
                                    <ProgressBar key={a.project} label={a.project}
                                        value={a.present} max={a.total}
                                        color={a.rate >= 80 ? COLORS.success : a.rate >= 60 ? COLORS.warning : COLORS.danger}
                                        suffix={`${a.rate}% (${a.present}/${a.total})`} />
                                ))}
                            </>
                        }
                    </ChartCard>

                    {/* Task completion bars */}
                    <ChartCard title="🎯 Task Completion Rate by Project" subtitle="Completed tasks out of all assigned">
                        {productivity.task_by_project.length === 0
                            ? <Empty text="No task data per project." />
                            : productivity.task_by_project.map(p => (
                                <ProgressBar key={p.project} label={p.project}
                                    value={p.completed} max={p.total}
                                    color={p.rate >= 75 ? COLORS.success : p.rate >= 40 ? COLORS.warning : COLORS.danger}
                                    suffix={`${p.rate}% (${p.completed}/${p.total})`} />
                            ))
                        }
                    </ChartCard>
                </div>
            )}
        </div>
    );
};

const Empty = ({ text }) => (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', flexDirection: 'column', gap: '0.5rem' }}>
        <span style={{ fontSize: '2rem' }}>📭</span>
        <span style={{ fontSize: '0.85rem' }}>{text}</span>
    </div>
);

export default Analytics;
