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
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            position: 'relative',
            backgroundImage: `url(${loginBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
        }}>
            {/* Overlay */}
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(15, 23, 42, 0.55)',
                backdropFilter: 'blur(6px)',
                zIndex: 0,
            }} />

            {/* Login card */}
            <div className="glass-panel animate-fade-in login-card-mobile" style={{
                padding: '2.5rem',
                borderRadius: '20px',
                width: '100%',
                maxWidth: '420px',
                position: 'relative',
                zIndex: 10,
                border: '1px solid rgba(255,255,255,0.5)',
                boxShadow: '0 24px 48px rgba(0,0,0,0.18)',
            }}>
                {/* Brand */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '64px', height: '64px',
                        background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                        borderRadius: '16px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '2rem',
                        margin: '0 auto 1rem',
                        boxShadow: '0 8px 20px rgba(79,70,229,0.35)',
                    }}>🏗️</div>
                    <h2 style={{
                        fontSize: '1.75rem',
                        fontWeight: '700',
                        color: 'var(--primary-color)',
                        marginBottom: '0.4rem',
                        fontFamily: "'Outfit', sans-serif",
                    }}>Welcome Back</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                        Sign in to manage your construction sites.
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div style={{
                        display: 'block',
                        padding: '12px 16px',
                        marginBottom: '1.25rem',
                        textAlign: 'center',
                        fontSize: '0.88rem',
                        borderRadius: 'var(--radius-md)',
                        background: '#fee2e2',
                        color: '#dc2626',
                        border: '1px solid #fecaca',
                        fontWeight: 500,
                    }}>
                        ⚠️ {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                    <div>
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="name@company.com"
                            autoComplete="email"
                            inputMode="email"
                            style={{ fontSize: '16px' }}
                        />
                    </div>

                    <div>
                        <label className="form-label">Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="form-control"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                autoComplete="current-password"
                                style={{ fontSize: '16px', paddingRight: '3rem' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    color: 'var(--text-secondary)', fontSize: '1.1rem', padding: '4px',
                                    display: 'flex', alignItems: 'center',
                                }}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-block"
                        disabled={loading}
                        style={{ marginTop: '0.5rem', minHeight: '48px', fontSize: '1rem' }}
                    >
                        {loading ? '⏳ Authenticating...' : '🔐 Sign In'}
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Having trouble?{' '}
                    <span style={{ color: 'var(--primary-color)', fontWeight: '600', cursor: 'pointer' }}>
                        Contact Admin
                    </span>
                </div>
            </div>

            {/* Responsive padding tweak for very small screens */}
            <style>{`
                @media (max-width: 400px) {
                    .login-card-mobile {
                        padding: 1.5rem !important;
                        border-radius: 16px !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default Login;
