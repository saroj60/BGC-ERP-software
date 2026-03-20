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
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>💰 Project Expenses</h2>
                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Track and manage project expenditures.</p>
                </div>
                <Link to="/expenses/new" className="btn btn-primary">
                    + New Expense
                </Link>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Select Project:</label>
                <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    style={{ padding: '10px', borderRadius: '5px', minWidth: '200px' }}
                >
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
            </div>

            {selectedProject && (
                <div className="glass-card" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Total Expenses</span>
                    <span style={{ color: 'var(--danger-color)', fontWeight: 700, fontSize: '1.3rem' }}>₨ {parseFloat(totalAmount).toLocaleString()}</span>
                </div>
            )}

            {loading ? <p style={{ textAlign: 'center', padding: '2rem' }}>Loading...</p> : (
                <div className="scrollable-table-wrap">
                    <div className="table-container">
                        <table className="modern-table">
                            <thead>
                                <tr>
                                    <th style={{ whiteSpace: 'nowrap' }}>Date</th>
                                    <th>Category</th>
                                    <th>Vehicle</th>
                                    <th style={{ minWidth: '140px' }}>Description</th>
                                    <th style={{ whiteSpace: 'nowrap' }}>Amount (₨)</th>
                                    <th style={{ whiteSpace: 'nowrap' }}>Added By</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenses.map(exp => (
                                    <tr key={exp.id}>
                                        <td style={{ whiteSpace: 'nowrap' }}>{exp.expense_date}</td>
                                        <td><span className="badge badge-info">{exp.category}</span></td>
                                        <td>{exp.vehicle_details ? `${exp.vehicle_details.name} (${exp.vehicle_details.number})` : '—'}</td>
                                        <td>{exp.description}</td>
                                        <td style={{ fontWeight: 700, color: 'var(--danger-color)', whiteSpace: 'nowrap' }}>₨{parseFloat(exp.amount).toLocaleString()}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{exp.created_by}</td>
                                        <td>
                                            <button
                                                onClick={() => handleDelete(exp.id)}
                                                className="btn btn-soft-danger btn-sm"
                                            >
                                                🗑 Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {expenses.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No expenses found.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpenseList;
