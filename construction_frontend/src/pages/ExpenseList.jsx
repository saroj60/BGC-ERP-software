import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const ExpenseList = () => {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState('');
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProjects();
    }, []);

    useEffect(() => {
        if (selectedProject) {
            fetchExpenses(selectedProject);
        } else {
            setExpenses([]);
        }
    }, [selectedProject]);

    const fetchProjects = async () => {
        try {
            const response = await api.get('projects/');
            setProjects(response.data);
            if (response.data.length > 0) setSelectedProject(response.data[0].id);
        } catch (err) {
            console.error('Failed to fetch projects');
        }
    };

    const fetchExpenses = async (projectId) => {
        setLoading(true);
        try {
            const response = await api.get(`expenses/?project=${projectId}`);
            setExpenses(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch expenses');
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this expense?')) return;
        try {
            await api.delete(`expenses/${id}/`);
            setExpenses(expenses.filter(e => e.id !== id));
        } catch (err) {
            if (err.response && err.response.status === 403) {
                alert('Permission Denied: Only Admins can delete expenses.');
            } else {
                alert('Failed to delete expense.');
            }
        }
    };

    const totalAmount = expenses.reduce((sum, item) => sum + parseFloat(item.amount), 0).toFixed(2);

    return (
        <div>
            <div className="page-header">
                <div>
                    <h2 style={{ fontSize: '1.8rem', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>💰 Project Expenses</h2>
                    <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>Track and manage project expenditures.</p>
                </div>
                <Link to="/expenses/new" className="btn btn-primary btn-sm">
                    + New Expense
                </Link>
            </div>

            <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Filter by Project:</label>
                <select
                    className="form-control"
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    style={{ maxWidth: '100%' }}
                >
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
            </div>

            {selectedProject && (
                <div className="glass-card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>Total Period Expense</span>
                    <span style={{ color: 'var(--danger-color)', fontWeight: 700, fontSize: '1.2rem' }}>₨ {parseFloat(totalAmount).toLocaleString()}</span>
                </div>
            )}

            {loading ? <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Loading expenses...</p> : (
                <div className="table-container shadow-sm" style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '8px 16px', background: 'rgba(79,70,229,0.05)',
                        borderBottom: '1px solid #eef2f7',
                        fontSize: '0.7rem', color: 'var(--primary-color)', fontWeight: 500,
                    }}>
                        ⇔ Swipe to see all details
                    </div>
                    <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                        <table className="modern-table" style={{ width: '100%', minWidth: '800px' }}>
                            <thead>
                                <tr>
                                    <th style={{ whiteSpace: 'nowrap' }}>Date</th>
                                    <th>Category</th>
                                    <th>Asset/Vehicle</th>
                                    <th style={{ minWidth: '160px' }}>Description</th>
                                    <th style={{ whiteSpace: 'nowrap' }}>Amount (₨)</th>
                                    <th style={{ whiteSpace: 'nowrap' }}>Log By</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenses.map(exp => (
                                    <tr key={exp.id}>
                                        <td style={{ whiteSpace: 'nowrap' }}>{exp.expense_date}</td>
                                        <td><span className="badge badge-info">{exp.category}</span></td>
                                        <td style={{ fontSize: '0.85rem' }}>{exp.vehicle_details ? `${exp.vehicle_details.name} (${exp.vehicle_details.number})` : '—'}</td>
                                        <td style={{ fontSize: '0.85rem' }}>{exp.description}</td>
                                        <td style={{ fontWeight: 700, color: 'var(--danger-color)', whiteSpace: 'nowrap' }}>₨{parseFloat(exp.amount).toLocaleString()}</td>
                                        <td style={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}>{exp.created_by}</td>
                                        <td>
                                            <button
                                                onClick={() => handleDelete(exp.id)}
                                                className="btn btn-soft-danger btn-sm"
                                                style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                            >
                                                🗑 Del
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {expenses.length === 0 && <tr><td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>No expenses recorded for this project.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpenseList;
