import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card} className="fade-up">
        {/* Logo */}
        <div style={styles.logo}>
          <span style={{ color: '#6366f1', fontSize: 28 }}>⬡</span>
          <h1 style={{ fontSize: 26, fontFamily: "'Syne',sans-serif" }}>CampusConnect</h1>
        </div>
        <p style={styles.sub}>Your AI-powered opportunity matcher</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" name="email" type="email" value={form.email}
              onChange={handle} placeholder="you@university.edu" required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" name="password" type="password" value={form.password}
              onChange={handle} placeholder="••••••••" required />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={styles.footer}>
          New here? <Link to="/register" style={{ color: 'var(--accent2)' }}>Create an account</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'radial-gradient(ellipse at 60% 20%, rgba(99,102,241,0.12) 0%, transparent 60%), var(--bg)',
    padding: 24,
  },
  card: {
    background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: 20, padding: '40px 36px', width: '100%', maxWidth: 420,
  },
  logo: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 },
  sub: { color: 'var(--text2)', fontSize: 14, marginBottom: 28 },
  footer: { textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--text2)' },
};
