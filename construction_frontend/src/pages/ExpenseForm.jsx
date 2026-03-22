import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const ExpenseForm = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [formData, setFormData] = useState({
        project: '',
        vehicle: '',
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

    useEffect(() => {
        if (formData.project) {
            fetchVehicles(formData.project);
        } else {
            setVehicles([]);
        }
    }, [formData.project]);

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

    const fetchVehicles = async (projectId) => {
        try {
            const response = await api.get(`vehicles/?project=${projectId}`);
            setVehicles(response.data);
        } catch (err) {
            console.error('Failed to fetch vehicles');
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
        <div className="animate-fade-in" style={{ maxWidth: '750px', margin: '0 auto', paddingBottom: '3rem' }}>
            <header className="page-header">
                <div>
                    <h1>Log New Expense</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                        Record expenditures and associate them with projects or assets.
                    </p>
                </div>
            </header>

            {error && (
                <div style={{
                    padding: '0.8rem 1.25rem', marginBottom: '1.5rem', borderRadius: '12px',
                    background: '#fef2f2', color: '#dc2626', border: '1px solid #fee2e2',
                    fontSize: '0.85rem', fontWeight: '500'
                }}>
                    ⚠️ {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="glass-card" style={{ padding: window.innerWidth > 768 ? '2.5rem' : '1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="form-group">
                        <label className="form-label">Associated Project</label>
                        <select name="project" value={formData.project} onChange={handleChange} required className="form-control">
                            <option value="">Choose Project...</option>
                            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Related Vehicle / Asset (Optional)</label>
                        <select name="vehicle" value={formData.vehicle} onChange={handleChange} className="form-control">
                            <option value="">General Expenditure</option>
                            {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} ({v.number})</option>)}
                        </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 768 ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label className="form-label">Expense Category</label>
                            <select name="category" value={formData.category} onChange={handleChange} required className="form-control">
                                <option value="">Select Category</option>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Receipt Date</label>
                            <input type="date" name="expense_date" value={formData.expense_date} onChange={handleChange} required className="form-control" />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Total Amount (Rs.)</label>
                        <input type="number" name="amount" step="0.01" min="0" placeholder="0.00" value={formData.amount} onChange={handleChange} required className="form-control" />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                            name="description"
                            placeholder="Provide details about this expenditure..."
                            value={formData.description}
                            onChange={handleChange}
                            required
                            rows="3"
                            className="form-control"
                            style={{ fontFamily: 'inherit', resize: 'vertical' }}
                        />
                    </div>
                </div>

                <div style={{ 
                    marginTop: '2.5rem', 
                    display: 'flex', 
                    gap: '0.75rem', 
                    justifyContent: 'flex-end',
                    flexWrap: 'wrap'
                }}>
                    <button type="button" onClick={() => navigate('/expenses')} className="btn btn-secondary btn-block-mobile" style={{ flex: window.innerWidth <= 768 ? '1' : 'none' }}>
                        Back
                    </button>
                    <button type="submit" className="btn btn-primary btn-block-mobile" disabled={loading} style={{ 
                        minWidth: window.innerWidth > 768 ? '180px' : '100%',
                        flex: window.innerWidth <= 768 ? '1' : 'none'
                    }}>
                        {loading ? 'Processing...' : 'Save Expense'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ExpenseForm;
