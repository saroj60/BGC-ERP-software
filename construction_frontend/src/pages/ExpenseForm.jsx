import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const ExpenseForm = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [formData, setFormData] = useState({
        project: '',
        category: '',
        description: '',
        amount: '',
        expense_date: new Date().toISOString().split('T')[0]
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await api.get('projects/');
            setProjects(response.data);
            if (response.data.length > 0) {
                setFormData(prev => ({ ...prev, project: response.data[0].id }));
            }
        } catch (err) {
            setError('Failed to fetch projects');
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('expenses/', formData);
            alert('Expense Added Successfully!');
            navigate('/expenses');
        } catch (err) {
            console.error(err);
            setError('Failed to add expense. Please check input.');
            setLoading(false);
        }
    };

    const CATEGORIES = [
        'Labour', 'Materials', 'Equipment', 'Transport', 'Food',
        'Utilities', 'Maintenance', 'Permits', 'Subcontractor', 'Other'
    ];

    return (
        <div className="animate-fade-in" style={{ maxWidth: '640px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <Link to="/expenses" className="btn btn-secondary btn-sm" style={{ marginBottom: '1rem', display: 'inline-flex' }}>
                    ← Back to Expenses
                </Link>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '0.4rem', color: 'var(--text-primary)', marginTop: '0.5rem' }}>
                    💰 Add New Expense
                </h2>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Log an expenditure against a project.</p>
            </div>

            {error && (
                <div style={{ padding: '0.9rem 1.2rem', background: '#fef2f2', color: '#dc2626', borderRadius: '10px', marginBottom: '1.5rem', border: '1px solid #fecaca', fontWeight: 500 }}>
                    ⚠️ {error}
                </div>
            )}

            <div className="glass-card" style={{ padding: '2rem' }}>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Project</label>
                        <select name="project" value={formData.project} onChange={handleChange} required className="form-control">
                            <option value="">Select Project</option>
                            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label">Category</label>
                            <select name="category" value={formData.category} onChange={handleChange} required className="form-control">
                                <option value="">Select Category</option>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Date</label>
                            <input type="date" name="expense_date" value={formData.expense_date} onChange={handleChange} required className="form-control" />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Amount (₨)</label>
                        <input type="number" name="amount" step="0.01" min="0" placeholder="0.00" value={formData.amount} onChange={handleChange} required className="form-control" />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                            name="description"
                            placeholder="Details about this expense..."
                            value={formData.description}
                            onChange={handleChange}
                            required
                            rows="3"
                            className="form-control"
                            style={{ fontFamily: 'inherit', resize: 'vertical' }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary btn-lg btn-block"
                        style={{ marginTop: '0.5rem' }}
                    >
                        {loading ? '⏳ Saving...' : '💾 Add Expense'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ExpenseForm;
