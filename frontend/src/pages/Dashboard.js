import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import MatchCard from '../components/MatchCard';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [topMatches, setTopMatches] = useState([]);
  const [completeness, setCompleteness] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, matchesRes, compRes] = await Promise.all([
        api.get('/matches/stats'),
        api.get('/matches?minScore=50'),
        api.get('/profile/completeness'),
      ]);
      setStats(statsRes.data);
      setTopMatches(matchesRes.data.matches.slice(0, 3));
      setCompleteness(compRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  const generateMatches = async () => {
    setError(''); setSuccess(''); setGenerating(true);
    try {
      await api.post('/matches/generate');
      setSuccess('AI matching complete! Your personalized matches are ready.');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Matching failed. Please try again.');
    } finally { setGenerating(false); }
  };

  const handleMatchUpdate = (updated) => {
    setTopMatches((prev) => prev.map((m) => (m._id === updated._id ? updated : m)));
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="page page-padded">
      {/* Header */}
      <div style={{ marginBottom: 32 }} className="fade-up">
        <h1 style={{ fontSize: 32, marginBottom: 4 }}>
          {greeting}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: 15 }}>
          Discover opportunities matched to your unique profile using AI.
        </p>
      </div>

      {/* Profile completeness */}
      {completeness && completeness.score < 80 && (
        <div className="card fade-up fade-up-1" style={{ marginBottom: 24, borderColor: 'rgba(245,158,11,0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <h3 style={{ fontSize: 15, marginBottom: 2 }}>Complete your profile</h3>
              <p style={{ fontSize: 13, color: 'var(--text2)' }}>
                Better profiles get more accurate AI matches.
                {completeness.missing.length > 0 && ` Missing: ${completeness.missing.join(', ')}`}
              </p>
            </div>
            <Link to="/profile" className="btn btn-outline btn-sm">Edit Profile</Link>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${completeness.score}%`, background: 'var(--amber)' }} />
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 6 }}>{completeness.score}% complete</div>
        </div>
      )}

      {/* Stats grid */}
      {stats && (
        <div className="grid-4 fade-up fade-up-1" style={{ marginBottom: 32 }}>
          <div className="stat-card">
            <div className="stat-label">Total Matches</div>
            <div className="stat-value" style={{ color: 'var(--accent2)' }}>{stats.total}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Top Score</div>
            <div className="stat-value" style={{ color: 'var(--green)' }}>{stats.topMatch}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Saved</div>
            <div className="stat-value" style={{ color: 'var(--teal)' }}>{stats.saved}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Applied</div>
            <div className="stat-value" style={{ color: 'var(--amber)' }}>{stats.applied}</div>
          </div>
        </div>
      )}

      {/* Generate matches CTA */}
      <div className="card fade-up fade-up-2" style={{
        marginBottom: 32, textAlign: 'center', padding: '40px 24px',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(20,184,166,0.05))',
        borderColor: 'rgba(99,102,241,0.25)',
      }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>🤖</div>
        <h2 style={{ fontSize: 22, marginBottom: 8 }}>Run AI Matching</h2>
        <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 24, maxWidth: 440, margin: '0 auto 24px' }}>
          Our AI reads your profile semantically — understanding your projects, domain knowledge, and growth trajectory — then finds your best-fit opportunities.
        </p>
        {error && <div className="alert alert-error" style={{ maxWidth: 420, margin: '0 auto 16px' }}>{error}</div>}
        {success && <div className="alert alert-success" style={{ maxWidth: 420, margin: '0 auto 16px' }}>{success}</div>}
        <button
          className="btn btn-primary btn-lg pulse-glow"
          onClick={generateMatches}
          disabled={generating}
        >
          {generating ? (
            <>
              <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
              Analyzing your profile...
            </>
          ) : '✦ Generate My Matches'}
        </button>
      </div>

      {/* Top matches preview */}
      {topMatches.length > 0 && (
        <div className="fade-up fade-up-3">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 20 }}>Top Matches</h2>
            <Link to="/matches" className="btn btn-outline btn-sm">View All →</Link>
          </div>
          {topMatches.map((m) => (
            <MatchCard key={m._id} match={m} onUpdate={handleMatchUpdate} />
          ))}
        </div>
      )}

      {topMatches.length === 0 && !generating && (
        <div className="empty-state fade-up fade-up-3">
          <div className="empty-state-icon">🎯</div>
          <h3>No matches yet</h3>
          <p>Run AI matching above to get personalized opportunity recommendations.</p>
        </div>
      )}
    </div>
  );
}
