import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const ProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // Project & User State
    const [project, setProject] = useState(null);
    const [progress, setProgress] = useState(null);
    const [users, setUsers] = useState([]);
    
    // Expenses State
    const [expenses, setExpenses] = useState([]);
    const [showExpenseForm, setShowExpenseForm] = useState(false);
    const [isSubmittingExpense, setIsSubmittingExpense] = useState(false);
    const [expenseError, setExpenseError] = useState('');
    const [newExpense, setNewExpense] = useState({
        category: '',
        description: '',
        amount: '',
        expense_date: new Date().toISOString().split('T')[0]
    });
    
    // Global Loading/Error
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Documents State
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');

    const fetchData = async () => {
        try {
            const [projectRes, usersRes, expensesRes, progressRes] = await Promise.all([
                api.get(`projects/${id}/`),
                api.get('accounts/users/'),
                api.get(`expenses/?project=${id}`),
                api.get(`projects/${id}/progress/`).catch(e => ({ data: null }))
            ]);
            setProject(projectRes.data);
            setUsers(Array.isArray(usersRes.data) ? usersRes.data : usersRes.data.results || []);
            setExpenses(expensesRes.data);
            setProgress(progressRes.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch data", err);
            setError('Failed to fetch project details');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleExpenseChange = (e) => {
        setNewExpense({ ...newExpense, [e.target.name]: e.target.value });
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        setIsSubmittingExpense(true);
        setExpenseError('');
        try {
            // Include the project ID in the payload
            const payload = { ...newExpense, project: id };
            await api.post('expenses/', payload);
            
            // Re-fetch to get updated list and progress
            await fetchData();
            
            // Reset form
            setNewExpense({
                category: '',
                description: '',
                amount: '',
                expense_date: new Date().toISOString().split('T')[0]
            });
            setShowExpenseForm(false);
        } catch (err) {
            console.error(err);
            setExpenseError('Failed to add expense. Please check input.');
        } finally {
            setIsSubmittingExpense(false);
        }
    };

    const handleDeleteExpense = async (expenseId) => {
        if (!window.confirm('Are you sure you want to delete this expense?')) return;
        try {
            await api.delete(`expenses/${expenseId}/`);
            setExpenses(expenses.filter(e => e.id !== expenseId));
            // Refetch to update progress
            await fetchData();
        } catch (err) {
            if (err.response && err.response.status === 403) {
                alert('Permission Denied: Only Admins can delete expenses.');
            } else {
                alert('Failed to delete expense.');
            }
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('project', id);
        formData.append('name', file.name);

        setIsUploading(true);
        setUploadError('');

        try {
            await api.post('projects/documents/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            await fetchData(); // Refresh project details to see new doc
        } catch (err) {
            console.error("Upload failed", err);
            setUploadError('Failed to upload document.');
        } finally {
            setIsUploading(false);
            e.target.value = ''; // clear input
        }
    };

    const handleDeleteDocument = async (docId) => {
        if (!window.confirm('Delete this document?')) return;
        try {
            await api.delete(`projects/documents/${docId}/`);
            await fetchData();
        } catch (err) {
            alert('Failed to delete document.');
        }
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading project details...</div>;
    if (error) return <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>{error}</div>;
    if (!project) return <div style={{ padding: '40px', textAlign: 'center' }}>Project not found</div>;

    const getManagerName = (managerId) => {
        if (!managerId) return 'Not Assigned';
        const manager = users.find(u => u.id === managerId);
        return manager ? (manager.name || manager.email) : 'Unknown';
    };

    const getEngineerNames = (engineerIds) => {
        if (!engineerIds || engineerIds.length === 0) return 'None Assigned';
        return engineerIds.map(engId => {
            const engineer = users.find(u => u.id === engId);
            return engineer ? (engineer.name || engineer.email) : 'Unknown';
        }).join(', ');
    };

    const totalExpenses = expenses.reduce((sum, item) => sum + parseFloat(item.amount), 0).toFixed(2);
    const budgetRemaining = project.budget ? (parseFloat(project.budget) - parseFloat(totalExpenses)).toFixed(2) : null;

    const styles = {
        container: {
            maxWidth: '1000px',
            margin: '0 auto',
            fontFamily: "'Inter', sans-serif"
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            marginBottom: '30px',
            borderBottom: '1px solid #e2e8f0',
            paddingBottom: '20px'
        },
        title: {
            fontSize: '32px',
            color: 'var(--text-primary)',
            margin: 0,
            fontFamily: "'Outfit', sans-serif",
            fontWeight: '700'
        },
        statusBadge: {
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '600',
            backgroundColor:
                project.status === 'COMPLETED' ? '#d1fae5' :
                    project.status === 'ONGOING' ? '#e0f2fe' :
                        project.status === 'ON_HOLD' ? '#fef3c7' : '#f1f5f9',
            color:
                project.status === 'COMPLETED' ? '#065f46' :
                    project.status === 'ONGOING' ? '#075985' :
                        project.status === 'ON_HOLD' ? '#92400e' : '#475569'
        },
        section: {
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(8px)',
            borderRadius: 'var(--radius-xl)',
            padding: '30px',
            boxShadow: 'var(--shadow-md)',
            marginBottom: '30px',
            border: '1px solid rgba(226, 232, 240, 0.6)'
        },
        sectionHeader: {
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '20px', 
            borderBottom: '1px solid #e2e8f0', 
            paddingBottom: '10px'
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '25px'
        },
        field: {
            marginBottom: '15px'
        },
        label: {
            display: 'block',
            fontSize: '12px',
            fontWeight: '600',
            color: 'var(--text-secondary)',
            marginBottom: '5px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
        },
        value: {
            fontSize: '16px',
            color: 'var(--text-primary)',
            fontWeight: '500'
        },
        actions: {
            display: 'flex',
            gap: '15px'
        }
    };

    return (
        <div style={styles.container} className="animate-fade-in">
            <div style={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
                    <h1 style={{ ...styles.title, wordBreak: 'break-word', minWidth: 0 }}>{project.name}</h1>
                    <span style={styles.statusBadge}>{project.status.replace('_', ' ')}</span>
                </div>
                <div style={{ ...styles.actions, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <button onClick={() => navigate('/projects')} className="btn btn-secondary btn-sm">
                        ← Back
                    </button>
                    {localStorage.getItem('user_role') === 'ADMIN' && (
                        <Link to={`/projects/${id}/edit`} className="btn btn-primary btn-sm">
                            ✏️ Edit
                        </Link>
                    )}
                </div>
            </div>

            <div style={styles.section}>
                <div style={styles.grid}>
                    <div style={styles.field}>
                        <label style={styles.label}>Client Name</label>
                        <div style={styles.value}>{project.client_name}</div>
                    </div>
                    <div style={styles.field}>
                        <label style={styles.label}>Location</label>
                        <div style={styles.value}>{project.location}</div>
                    </div>
                    <div style={styles.field}>
                        <label style={styles.label}>Budget</label>
                        <div style={styles.value}>
                            {localStorage.getItem('user_role') === 'SITE_ENGINEER' ? (
                                <span style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>Hidden for your role</span>
                            ) : project.budget ? (
                                `₨ ${parseFloat(project.budget).toLocaleString()}`
                            ) : 'Not Set'}
                        </div>
                    </div>
                    <div style={styles.field}>
                        <label style={styles.label}>Project Manager</label>
                        <div style={styles.value}>{getManagerName(project.project_manager)}</div>
                    </div>
                </div>
            </div>

            <div style={styles.section}>
                <h3 style={styles.sectionHeader}>
                    <span style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-primary)' }}>Timeline & Team</span>
                </h3>
                <div style={styles.grid}>
                    <div style={styles.field}>
                        <label style={styles.label}>Start Date</label>
                        <div style={styles.value}>{project.start_date}</div>
                    </div>
                    <div style={styles.field}>
                        <label style={styles.label}>End Date</label>
                        <div style={styles.value}>{project.end_date || 'Ongoing'}</div>
                    </div>
                    <div style={{ ...styles.field, gridColumn: '1 / -1' }}>
                        <label style={styles.label}>Site Engineers</label>
                        <div style={styles.value}>{getEngineerNames(project.site_engineers)}</div>
                    </div>
                </div>
            </div>

            {/* Progress Overview Section - Hide Financials for Site Engineers */}
            {progress && (
                <div style={styles.section}>
                    <h3 style={styles.sectionHeader}>
                        <span style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-primary)' }}>Project Health</span>
                    </h3>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                        {/* Financial Progress Box - Hidden for Site Engineers */}
                        {localStorage.getItem('user_role') !== 'SITE_ENGINEER' && (
                            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '14px' }}>Budget Usage</span>
                                    <span style={{ fontWeight: '700', color: progress.financial.percentage > 90 ? 'var(--danger-color)' : 'var(--primary-color)', fontSize: '14px' }}>
                                        {progress.financial.percentage}%
                                    </span>
                                </div>
                                <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '10px' }}>
                                    <div style={{ height: '100%', width: `${Math.min(100, progress.financial.percentage)}%`, background: progress.financial.percentage > 90 ? 'var(--danger-color)' : 'var(--primary-color)', transition: 'width 1s ease-in-out' }}></div>
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                    ₨ {parseFloat(progress.financial.spent).toLocaleString()} spent of ₨ {parseFloat(progress.financial.budget).toLocaleString()}
                                </div>
                            </div>
                        )}

                        {/* Task Progress Box */}
                        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '14px' }}>Task Completion</span>
                                <span style={{ fontWeight: '700', color: progress.tasks.percentage === 100 && progress.tasks.total > 0 ? 'var(--success-color)' : '#6366f1', fontSize: '14px' }}>
                                    {progress.tasks.percentage}%
                                </span>
                            </div>
                            <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '10px' }}>
                                <div style={{ height: '100%', width: `${Math.min(100, progress.tasks.percentage)}%`, background: progress.tasks.percentage === 100 && progress.tasks.total > 0 ? 'var(--success-color)' : '#6366f1', transition: 'width 1s ease-in-out' }}></div>
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                {progress.tasks.completed} out of {progress.tasks.total} tasks completed
                            </div>
                        </div>

                        {/* Timeline Progress Box */}
                        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '14px' }}>Time Elapsed</span>
                                <span style={{ fontWeight: '700', color: progress.timeline.percentage === 100 ? 'var(--danger-color)' : '#f59e0b', fontSize: '14px' }}>
                                    {progress.timeline.percentage}%
                                </span>
                            </div>
                            <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '10px' }}>
                                <div style={{ height: '100%', width: `${Math.min(100, progress.timeline.percentage)}%`, background: progress.timeline.percentage === 100 ? 'var(--danger-color)' : '#f59e0b', transition: 'width 1s ease-in-out' }}></div>
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                {progress.timeline.percentage === 100 ? 'Deadline has passed or reached' : (progress.timeline.end_date ? `Deadline: ${progress.timeline.end_date}` : 'Ongoing (No deadline)')}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Expenses Section - Completely hidden for Site Engineers */}
            {localStorage.getItem('user_role') !== 'SITE_ENGINEER' && (
            <div style={{...styles.section, borderColor: 'rgba(79, 70, 229, 0.2)'}}>
                <div style={styles.sectionHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                            Project Expenses
                        </h3>
                        {expenses.length > 0 && (
                            <span className="badge badge-neutral" style={{ background: 'var(--primary-light)', color: 'var(--primary-hover)' }}>
                                {expenses.length} Records
                            </span>
                        )}
                    </div>
                    
                    <div>
                        <button 
                            className={`btn ${showExpenseForm ? 'btn-secondary' : 'btn-primary'}`} 
                            onClick={() => setShowExpenseForm(!showExpenseForm)}
                            style={{ padding: '0.5rem 1rem' }}
                        >
                            {showExpenseForm ? 'Cancel' : '+ Add Expense'}
                        </button>
                    </div>
                </div>

                {/* Expense Summary Grid */}
                <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, background: '#f8fafc', padding: '15px 20px', borderRadius: 'var(--radius-lg)', border: '1px solid #e2e8f0' }}>
                        <div style={styles.label}>Total Logged Expenses</div>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--danger-color)' }}>
                            ₨ {parseFloat(totalExpenses).toLocaleString()}
                        </div>
                    </div>
                    {project.budget && (
                        <div style={{ flex: 1, background: '#f8fafc', padding: '15px 20px', borderRadius: 'var(--radius-lg)', border: '1px solid #e2e8f0' }}>
                            <div style={styles.label}>Remaining Budget</div>
                            <div style={{ fontSize: '24px', fontWeight: '700', color: parseFloat(budgetRemaining) < 0 ? 'var(--danger-color)' : 'var(--success-color)' }}>
                                ₨ {parseFloat(budgetRemaining).toLocaleString()}
                            </div>
                        </div>
                    )}
                </div>

                {/* Add Expense Inline Form */}
                {showExpenseForm && (
                    <div className="animate-fade-in" style={{ 
                        background: '#f8fafc', border: '1px solid var(--primary-light)', 
                        padding: '20px', borderRadius: 'var(--radius-lg)', marginBottom: '20px' 
                    }}>
                        <h4 style={{ margin: '0 0 15px 0', color: 'var(--primary-hover)' }}>Log New Expense</h4>
                        {expenseError && <div style={{ color: 'var(--danger-color)', marginBottom: '15px', fontSize: '0.9rem' }}>{expenseError}</div>}
                        
                        <form onSubmit={handleAddExpense}>
                            <div className="dashboard-grid">
                                <div className="form-group">
                                    <label className="form-label">Category <span className="text-danger">*</span></label>
                                    <input 
                                        type="text" 
                                        name="category" 
                                        className="form-control" 
                                        placeholder="e.g. Materials, Labor" 
                                        value={newExpense.category} 
                                        onChange={handleExpenseChange} 
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Amount (Rs) <span className="text-danger">*</span></label>
                                    <input 
                                        type="number" 
                                        name="amount" 
                                        className="form-control" 
                                        placeholder="0.00" 
                                        step="0.01"
                                        min="0"
                                        value={newExpense.amount} 
                                        onChange={handleExpenseChange} 
                                        required 
                                    />
                                </div>
                            </div>
                            
                            <div className="dashboard-grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Description <span className="text-danger">*</span></label>
                                    <input 
                                        type="text" 
                                        name="description" 
                                        className="form-control" 
                                        placeholder="What was this expense for?" 
                                        value={newExpense.description} 
                                        onChange={handleExpenseChange} 
                                        required 
                                    />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Date <span className="text-danger">*</span></label>
                                    <input 
                                        type="date" 
                                        name="expense_date" 
                                        className="form-control" 
                                        value={newExpense.expense_date} 
                                        onChange={handleExpenseChange} 
                                        required 
                                    />
                                </div>
                            </div>
                            
                            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowExpenseForm(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={isSubmittingExpense}>
                                    {isSubmittingExpense ? 'Saving...' : 'Save Expense'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Expenses Table */}
                {expenses.length > 0 ? (
                    <div className="table-container">
                        <table className="modern-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Category</th>
                                    <th>Description</th>
                                    <th>Amount</th>
                                    <th>By</th>
                                    <th style={{ width: '80px', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenses.map(exp => (
                                    <tr key={exp.id}>
                                        <td>{exp.expense_date}</td>
                                        <td><span className="badge badge-neutral">{exp.category}</span></td>
                                        <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{exp.description}</td>
                                        <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>₨ {parseFloat(exp.amount).toLocaleString()}</td>
                                        <td style={{ fontSize: '0.85rem' }}>{exp.created_by_name || exp.created_by}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button 
                                                className="btn-icon" 
                                                onClick={() => handleDeleteExpense(exp.id)}
                                                title="Delete Expense"
                                            >
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" color="var(--danger-color)">
                                                    <polyline points="3 6 5 6 21 6"></polyline>
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '30px', background: '#f8fafc', borderRadius: 'var(--radius-lg)', border: '1px dashed #cbd5e1' }}>
                        <div style={{ color: 'var(--text-light)', marginBottom: '10px' }}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                                <path d="M7 15h0M2 9.5h20"></path>
                            </svg>
                        </div>
                        <h4 style={{ margin: '0 0 5px 0', color: 'var(--text-secondary)' }}>No expenses logged yet</h4>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-light)' }}>Click "Add Expense" to start tracking costs for this project.</p>
                    </div>
                )}
            </div>
            )}

            {/* Documents Section */}
            <div style={{...styles.section, borderColor: 'rgba(5, 150, 105, 0.2)'}}>
                <div style={styles.sectionHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                            Project Documents
                        </h3>
                        {project.documents && project.documents.length > 0 && (
                            <span className="badge badge-neutral" style={{ background: '#d1fae5', color: '#065f46' }}>
                                {project.documents.length} Files
                            </span>
                        )}
                    </div>
                    
                    <div style={{ position: 'relative' }}>
                        <input
                            type="file"
                            id="project-doc-upload"
                            style={{ display: 'none' }}
                            onChange={handleFileUpload}
                            disabled={isUploading}
                        />
                        <label 
                            htmlFor="project-doc-upload"
                            className="btn btn-primary"
                            style={{ padding: '0.5rem 1rem', cursor: isUploading ? 'not-allowed' : 'pointer', opacity: isUploading ? 0.7 : 1 }}
                        >
                            {isUploading ? 'Uploading...' : '+ Attach Doc'}
                        </label>
                    </div>
                </div>

                {uploadError && (
                    <div style={{ color: 'var(--danger-color)', marginBottom: '15px', fontSize: '0.9rem' }}>
                        {uploadError}
                    </div>
                )}

                {project.documents && project.documents.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                        {project.documents.map(doc => (
                            <div key={doc.id} style={{ 
                                background: '#f8fafc', border: '1px solid #e2e8f0', 
                                padding: '15px', borderRadius: 'var(--radius-lg)',
                                display: 'flex', flexDirection: 'column', gap: '10px',
                                position: 'relative'
                            }}>
                                <div style={{ 
                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                    fontWeight: '600', fontSize: '14px', color: 'var(--text-primary)'
                                }} title={doc.name}>
                                    📄 {doc.name}
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>
                                    Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                                </div>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                                    <a 
                                        href={doc.file} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="btn btn-secondary btn-sm"
                                        style={{ flex: 1, textAlign: 'center', fontSize: '12px', padding: '4px' }}
                                    >
                                        View
                                    </a>
                                    <button 
                                        onClick={() => handleDeleteDocument(doc.id)}
                                        style={{ 
                                            background: '#fee2e2', color: '#b91c1c', border: 'none',
                                            borderRadius: '4px', padding: '4px 8px', cursor: 'pointer'
                                        }}
                                        title="Delete"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '30px', background: '#f8fafc', borderRadius: 'var(--radius-lg)', border: '1px dashed #cbd5e1' }}>
                        <div style={{ color: 'var(--text-light)', marginBottom: '10px' }}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                                <polyline points="13 2 13 9 20 9"></polyline>
                            </svg>
                        </div>
                        <h4 style={{ margin: '0 0 5px 0', color: 'var(--text-secondary)' }}>No documents attached</h4>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-light)' }}>Upload project contracts, drawings, or reports.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectDetails;
