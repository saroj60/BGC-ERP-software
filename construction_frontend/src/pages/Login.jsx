import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import loginBg from '../assets/login_bg.png';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await api.post('token/', { email, password });
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);

            if (response.data.role) {
                localStorage.setItem('user_role', response.data.role);
                localStorage.setItem('user_id', response.data.id);
                localStorage.setItem('user_email', email);
            }

            navigate('/dashboard');
        } catch (err) {
            console.error('Login Error:', err);
            const msg = err.response?.data?.detail || err.response?.data?.message || err.message || 'Login failed';
            setError(`Login failed: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1.5rem', position: 'relative',
            backgroundImage: `url(${loginBg})`, backgroundSize: 'cover', backgroundPosition: 'center',
        }}>
            <div style={{
                position: 'absolute', inset: 0,
                backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(8px)', zIndex: 0,
            }} />

            <div className="glass-panel animate-fade-in" style={{
                padding: '3rem', borderRadius: '24px', width: '100%', maxWidth: '440px',
                position: 'relative', zIndex: 10, border: '1px solid rgba(255,255,255,0.4)',
                boxShadow: 'var(--shadow-premium)',
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{
                        width: '72px', height: '72px',
                        background: 'linear-gradient(135deg, var(--primary-color), var(--primary-soft))',
                        borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '2.5rem', margin: '0 auto 1.5rem',
                        boxShadow: '0 12px 24px rgba(79, 70, 229, 0.3)',
                    }}>🏗️</div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                        ConstructionOS
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                        Professional Construction Management
                    </p>
                </div>

                {error && (
                    <div style={{
                        padding: '12px 16px', marginBottom: '1.5rem', textAlign: 'center',
                        fontSize: '0.9rem', borderRadius: '10px', background: '#fef2f2',
                        color: '#dc2626', border: '1px solid #fee2e2', fontWeight: '500'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="name@company.com"
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="form-control"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                style={{ paddingRight: '3.5rem' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    color: 'var(--text-light)', fontSize: '1.2rem', padding: '8px'
                                }}
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-block btn-lg"
                        disabled={loading}
                        style={{ marginTop: '0.5rem' }}
                    >
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-light)' }}>
                    Protected by Enterprise-grade Security
                </div>
            </div>

            <style>{`
                @media (max-width: 480px) {
                    .glass-panel { padding: 2rem !important; margin: 1rem !important; }
                }
            `}</style>
        </div>
    );
};

export default Login;
