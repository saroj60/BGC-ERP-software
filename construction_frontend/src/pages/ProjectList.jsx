import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const ProjectList = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await api.get('projects/');
            setProjects(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch projects');
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this project?')) return;
        try {
            await api.delete(`projects/${id}/`);
            setProjects(projects.filter(p => p.id !== id));
        } catch (err) {
            alert('Failed to delete project');
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'COMPLETED': return 'badge-success';
            case 'ONGOING': return 'badge-info';
            case 'ON_HOLD': return 'badge-warning';
            default: return 'badge-neutral';
        }
    };

    if (loading) return <div className="flex justify-center items-center h-64">Loading projects...</div>;
    if (error) return <div className="text-center text-danger p-8">{error} <button onClick={fetchProjects} className="btn btn-secondary btn-sm">Retry</button></div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-primary">Projects</h1>
                    <p className="text-secondary">Manage and track your construction sites.</p>
                </div>
                {localStorage.getItem('user_role') === 'ADMIN' && (
                    <Link to="/projects/new" className="btn btn-primary">
                        + New Project
                    </Link>
                )}
            </div>

            <div className="dashboard-grid">
                {projects.map((project) => (
                    <div
                        key={project.id}
                        className="glass-card"
                        onClick={() => navigate(`/projects/${project.id}`)}
                        style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', cursor: 'pointer' }}
                    >
                        <div className="flex justify-between items-start">
                            <h3 className="text-lg font-bold text-primary m-0">{project.name}</h3>
                            <span className={`badge ${getStatusBadgeClass(project.status)}`}>
                                {project.status.replace('_', ' ')}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm text-secondary">
                            <div><strong className="text-primary">Client:</strong> {project.client_name}</div>
                            <div><strong className="text-primary">Location:</strong> {project.location}</div>
                            <div><strong className="text-primary">Started:</strong> {project.start_date}</div>
                        </div>

                        <div className="mt-auto pt-4 border-t border-slate-100 flex justify-end gap-2">
                            {localStorage.getItem('user_role') === 'ADMIN' && (
                                <>
                                    <Link
                                        to={`/projects/${project.id}/edit`}
                                        onClick={(e) => e.stopPropagation()}
                                        className="btn btn-secondary"
                                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(project.id); }}
                                        className="btn btn-danger"
                                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                                    >
                                        Delete
                                    </button>
                                </>
                            )}
                            {localStorage.getItem('user_role') === 'SITE_ENGINEER' && (
                                <span className="text-sm text-light italic">Read Only</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {projects.length === 0 && (
                <div className="glass-panel text-center p-12 text-secondary rounded-xl">
                    No projects found. Start by creating one!
                </div>
            )}
        </div>
    );
};

export default ProjectList;
