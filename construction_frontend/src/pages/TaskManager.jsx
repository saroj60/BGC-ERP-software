import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const TaskManager = () => {
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // View Filters
    const [selectedProject, setSelectedProject] = useState('');
    
    // Form States
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [newTask, setNewTask] = useState({
        project: '',
        title: '',
        description: '',
        assigned_to: '',
        due_date: ''
    });

    const userRole = localStorage.getItem('user_role');
    const isEngineer = userRole === 'SITE_ENGINEER';

    const fetchData = async () => {
        setLoading(true);
        try {
            const [tasksRes, projectsRes, usersRes] = await Promise.all([
                api.get('projects/tasks/'),
                api.get('projects/'),
                api.get('accounts/users/')
            ]);
            
            setTasks(tasksRes.data);
            setProjects(projectsRes.data);
            setUsers(Array.isArray(usersRes.data) ? usersRes.data : usersRes.data.results || []);
        } catch (err) {
            console.error('Failed to fetch data', err);
            setError('Failed to load tasks dashboard');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleFormChange = (e) => {
        setNewTask({ ...newTask, [e.target.name]: e.target.value });
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormError('');
        try {
            await api.post('projects/tasks/', newTask);
            await fetchData();
            setNewTask({ project: '', title: '', description: '', assigned_to: '', due_date: '' });
            setShowTaskForm(false);
        } catch (err) {
            setFormError('Failed to create task. Please ensure all required fields are filled.');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        try {
            await api.delete(`projects/tasks/${taskId}/`);
            setTasks(tasks.filter(t => t.id !== taskId));
        } catch (err) {
            alert('Failed to delete task. You might not have permission.');
        }
    };

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            await api.patch(`projects/tasks/${taskId}/`, { status: newStatus });
            setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
        } catch (err) {
            alert('Failed to update task status.');
        }
    };

    // Filter tasks based on selected project
    const filteredTasks = selectedProject 
        ? tasks.filter(t => t.project.toString() === selectedProject) 
        : tasks;

    // Group tasks by status for Kanban view
    const columns = {
        'TODO': { title: 'To Do', items: filteredTasks.filter(t => t.status === 'TODO'), color: 'border-l-4 border-slate-300' },
        'IN_PROGRESS': { title: 'In Progress', items: filteredTasks.filter(t => t.status === 'IN_PROGRESS'), color: 'border-l-4 border-blue-400' },
        'COMPLETED': { title: 'Completed', items: filteredTasks.filter(t => t.status === 'COMPLETED'), color: 'border-l-4 border-green-400' }
    };

    // Optional drag tracking
    const onDragEnd = (result) => {
        if (!result.destination) return;
        const { source, destination, draggableId } = result;
        if (source.droppableId !== destination.droppableId) {
            handleStatusChange(draggableId, destination.droppableId);
        }
    };

    const getAssigneeName = (userId) => {
        if (!userId) return 'Unassigned';
        const user = users.find(u => u.id === userId);
        return user ? (user.name || user.email) : 'Unassigned';
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading tasks...</div>;
    if (error) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--danger-color)' }}>{error}</div>;

    return (
        <div style={{ padding: '30px', maxWidth: '1400px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }} className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ margin: '0 0 5px 0', fontSize: '28px', color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>Task Board</h1>
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Manage and track project assignments</p>
                </div>
                
                <div style={{ display: 'flex', gap: '15px' }}>
                    <select 
                        className="form-control" 
                        value={selectedProject} 
                        onChange={(e) => setSelectedProject(e.target.value)}
                        style={{ minWidth: '200px', margin: 0 }}
                    >
                        <option value="">All Projects</option>
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>

                    {!isEngineer && (
                        <button className="btn btn-primary" onClick={() => setShowTaskForm(true)}>
                            + Assign Task
                        </button>
                    )}
                </div>
            </div>

            {/* Task Creation Form Modal */}
            {showTaskForm && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50
                }}>
                    <div className="animate-fade-in" style={{
                        background: 'white', padding: '30px', borderRadius: 'var(--radius-xl)',
                        width: '100%', maxWidth: '600px', boxShadow: 'var(--shadow-xl)'
                    }}>
                        <h2 style={{ margin: '0 0 20px 0', fontFamily: "'Outfit', sans-serif" }}>Create New Task</h2>
                        {formError && <div style={{ color: 'var(--danger-color)', marginBottom: '15px' }}>{formError}</div>}
                        
                        <form onSubmit={handleCreateTask}>
                            <div className="form-group">
                                <label className="form-label">Project *</label>
                                <select className="form-control" name="project" value={newTask.project} onChange={handleFormChange} required>
                                    <option value="">Select a project...</option>
                                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Task Title *</label>
                                <input type="text" className="form-control" name="title" value={newTask.title} onChange={handleFormChange} placeholder="e.g., Inspect foundation pour" required />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea className="form-control" name="description" value={newTask.description} onChange={handleFormChange} placeholder="Add any necessary details or instructions..." rows="3"></textarea>
                            </div>

                            <div className="dashboard-grid">
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Assign To</label>
                                    <select className="form-control" name="assigned_to" value={newTask.assigned_to} onChange={handleFormChange}>
                                        <option value="">Unassigned</option>
                                        {users.filter(u => u.role === 'SITE_ENGINEER').map(u => (
                                            <option key={u.id} value={u.id}>{u.name || u.email}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Due Date</label>
                                    <input type="date" className="form-control" name="due_date" value={newTask.due_date} onChange={handleFormChange} />
                                </div>
                            </div>

                            <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowTaskForm(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                                    {isSubmitting ? 'Creating...' : 'Create Task'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Kanban Board Container */}
            <DragDropContext onDragEnd={onDragEnd}>
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                    gap: '20px',
                    alignItems: 'start'
                }}>
                    {Object.entries(columns).map(([status, column]) => (
                        <div key={status} style={{ 
                            background: '#f8fafc',
                            borderRadius: 'var(--radius-lg)',
                            padding: '20px',
                            minHeight: '400px'
                        }}>
                            <div style={{ 
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                                marginBottom: '20px', paddingBottom: '10px', borderBottom: '2px solid #e2e8f0' 
                            }}>
                                <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--text-primary)', fontWeight: '600' }}>
                                    {column.title}
                                </h3>
                                <span className="badge badge-neutral">{column.items.length}</span>
                            </div>

                            <Droppable droppableId={status}>
                                {(provided) => (
                                    <div 
                                        {...provided.droppableProps} 
                                        ref={provided.innerRef}
                                        style={{ minHeight: '100px' }}
                                    >
                                        {column.items.map((task, index) => (
                                            <Draggable key={task.id.toString()} draggableId={task.id.toString()} index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        style={{
                                                            background: 'white',
                                                            padding: '16px',
                                                            borderRadius: 'var(--radius-md)',
                                                            boxShadow: snapshot.isDragging ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
                                                            marginBottom: '15px',
                                                            borderLeft: status === 'TODO' ? '4px solid #cbd5e1' : 
                                                                        status === 'IN_PROGRESS' ? '4px solid #60a5fa' : 
                                                                        '4px solid #4ade80',
                                                            ...provided.draggableProps.style
                                                        }}
                                                    >
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                            <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--primary-color)' }}>
                                                                {task.project_name || 'Project Name'}
                                                            </span>
                                                            {!isEngineer && (
                                                                <button onClick={() => handleDeleteTask(task.id)} className="btn-icon" style={{ fontSize: '0.85rem' }}>
                                                                    ✕
                                                                </button>
                                                            )}
                                                        </div>
                                                        <h4 style={{ margin: '0 0 10px 0', fontSize: '15px', color: 'var(--text-primary)' }}>{task.title}</h4>
                                                        
                                                        {task.description && (
                                                            <p style={{ margin: '0 0 15px 0', fontSize: '13px', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                                {task.description}
                                                            </p>
                                                        )}
                                                        
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-light)', borderTop: '1px dashed #e2e8f0', paddingTop: '10px' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                                                {getAssigneeName(task.assigned_to)}
                                                            </div>
                                                            {task.due_date && (
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                                                    {task.due_date}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {isEngineer && (
                                                            <div className="btn-group" style={{ marginTop: '12px', width: '100%' }}>
                                                                {status !== 'TODO' && <button onClick={() => handleStatusChange(task.id, 'TODO')} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>↩ To Do</button>}
                                                                {status !== 'IN_PROGRESS' && <button onClick={() => handleStatusChange(task.id, 'IN_PROGRESS')} className="btn btn-soft-info btn-sm" style={{ flex: 1 }}>▶ Start</button>}
                                                                {status !== 'COMPLETED' && <button onClick={() => handleStatusChange(task.id, 'COMPLETED')} className="btn btn-soft-success btn-sm" style={{ flex: 1 }}>✓ Done</button>}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                        {column.items.length === 0 && (
                                            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-light)', fontSize: '13px', border: '1px dashed #cbd5e1', borderRadius: 'var(--radius-md)' }}>
                                                Drop tasks here
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    ))}
                </div>
            </DragDropContext>
        </div>
    );
};

export default TaskManager;
