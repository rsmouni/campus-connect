import React, { useEffect, useState, useCallback } from 'react';
import api from '../api';
import MatchCard from '../components/MatchCard';

const TYPES = ['all', 'internship', 'research', 'competition', 'scholarship'];

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [filter, setFilter] = useState('all');
  const [savedOnly, setSavedOnly] = useState(false);
  const [minScore, setMinScore] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('type', filter);
      if (savedOnly) params.append('saved', 'true');
      if (minScore > 0) params.append('minScore', minScore);
      const res = await api.get(`/matches?${params}`);
      setMatches(res.data.matches);
    } catch (e) {
      setError('Failed to load matches');
    } finally { setLoading(false); }
  }, [filter, savedOnly, minScore]);

  useEffect(() => { fetchMatches(); }, [fetchMatches]);

  const generateMatches = async () => {
    setError(''); setSuccess(''); setGenerating(true);
    try {
      const res = await api.post('/matches/generate');
      setSuccess(`AI matching done! Found ${res.data.count} matches.`);
      fetchMatches();
    } catch (err) {
      setError(err.response?.data?.message || 'Matching failed');
    } finally { setGenerating(false); }
  };

  const handleUpdate = (updated) => {
    setMatches((prev) => prev.map((m) => (m._id === updated._id ? updated : m)));
  };

  return (
    <div className="page page-padded">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }} className="fade-up">
        <div>
          <h1 style={{ fontSize: 28, marginBottom: 4 }}>My Matches</h1>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>
            {matches.length} opportunity{matches.length !== 1 ? 'ies' : 'y'} matched to your profile
          </p>
        </div>
        <button className="btn btn-primary" onClick={generateMatches} disabled={generating}>
          {generating ? (
            <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Matching...</>
          ) : '✦ Refresh Matches'}
        </button>
      </div>

      {error && <div className="alert alert-error fade-up">{error}</div>}
      {success && <div className="alert alert-success fade-up">{success}</div>}

      {/* Controls */}
      <div className="card fade-up fade-up-1" style={{ marginBottom: 24, padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="filters-row" style={{ margin: 0, flex: 1 }}>
            {TYPES.map((t) => (
              <button key={t} className={`filter-btn ${filter === t ? 'active' : ''}`} onClick={() => setFilter(t)}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text2)', cursor: 'pointer' }}>
            <input type="checkbox" checked={savedOnly} onChange={(e) => setSavedOnly(e.target.checked)} />
            Saved only
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text2)' }}>
            Min score:
            <select className="form-input" style={{ width: 80, padding: '6px 10px' }}
              value={minScore} onChange={(e) => setMinScore(Number(e.target.value))}>
              <option value={0}>Any</option>
              <option value={30}>30+</option>
              <option value={50}>50+</option>
              <option value={70}>70+</option>
              <option value={85}>85+</option>
            </select>
          </div>
        </div>
      </div>

      {/* Matches list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div className="spinner" style={{ margin: '0 auto' }} />
        </div>
      ) : matches.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3>No matches found</h3>
          <p>Try adjusting your filters, or run AI matching to find new opportunities.</p>
          <button className="btn btn-primary" onClick={generateMatches} disabled={generating}>
            Run Matching
          </button>
        </div>
      ) : (
        <div className="fade-up fade-up-2">
          {matches.map((m) => (
            <MatchCard key={m._id} match={m} onUpdate={handleUpdate} />
          ))}
        </div>
      )}
    </div>
  );
}
