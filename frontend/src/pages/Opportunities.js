import React, { useEffect, useState } from 'react';
import api from '../api';

const TYPE_COLORS = {
  internship: 'badge-internship',
  research: 'badge-research',
  competition: 'badge-competition',
  scholarship: 'badge-scholarship',
};

const TYPES = ['all', 'internship', 'research', 'competition', 'scholarship'];

function OppCard({ opp }) {
  const deadline = new Date(opp.deadline);
  const daysLeft = Math.ceil((deadline - new Date()) / 86400000);
  const urgency = daysLeft <= 7 ? 'var(--rose)' : daysLeft <= 21 ? 'var(--amber)' : 'var(--text3)';

  return (
    <div className="card fade-up" style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
            <span className={`badge ${TYPE_COLORS[opp.type] || ''}`}>{opp.type}</span>
            {opp.tags?.slice(0, 3).map((t) => (
              <span key={t} style={{ fontSize: 11, color: 'var(--text3)', padding: '2px 8px', borderRadius: 10, border: '1px solid var(--border)' }}>{t}</span>
            ))}
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>{opp.title}</h3>
          <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 10 }}>
            {opp.organization} · {opp.location}
          </div>
          <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 12 }}>
            {opp.description.slice(0, 160)}...
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {opp.skills?.slice(0, 5).map((s) => (
              <span key={s} className="tag">{s}</span>
            ))}
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          {opp.stipend && (
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--teal)', marginBottom: 6 }}>{opp.stipend}</div>
          )}
          <div style={{ fontSize: 12, color: urgency, marginBottom: 12 }}>
            {daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
          </div>
          <a href={opp.link} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
            Apply →
          </a>
        </div>
      </div>
    </div>
  );
}

export default function Opportunities() {
  const [opps, setOpps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchOpps();
  }, [filter, search]);

  const fetchOpps = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: 50 });
      if (filter !== 'all') params.append('type', filter);
      if (search) params.append('search', search);
      const res = await api.get(`/opportunities?${params}`);
      setOpps(res.data.opportunities);
      setTotal(res.data.total);
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); }
  };

  return (
    <div className="page page-padded">
      <div style={{ marginBottom: 28 }} className="fade-up">
        <h1 style={{ fontSize: 28, marginBottom: 4 }}>Explore Opportunities</h1>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>{total} active listings</p>
      </div>

      {/* Search + filters */}
      <div className="card fade-up fade-up-1" style={{ marginBottom: 24, padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <input
            className="form-input"
            style={{ flex: 1 }}
            placeholder="Search by title, org, or keywords..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && setSearch(searchInput)}
          />
          <button className="btn btn-primary" onClick={() => setSearch(searchInput)}>Search</button>
          {search && (
            <button className="btn btn-outline" onClick={() => { setSearch(''); setSearchInput(''); }}>Clear</button>
          )}
        </div>
        <div className="filters-row" style={{ margin: 0 }}>
          {TYPES.map((t) => (
            <button key={t} className={`filter-btn ${filter === t ? 'active' : ''}`} onClick={() => setFilter(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div className="spinner" style={{ margin: '0 auto' }} />
        </div>
      ) : opps.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <h3>No opportunities found</h3>
          <p>Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="fade-up fade-up-2">
          {opps.map((o) => <OppCard key={o._id} opp={o} />)}
        </div>
      )}
    </div>
  );
}
