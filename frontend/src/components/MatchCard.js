import React, { useState } from 'react';
import api from '../api';

const TYPE_COLORS = {
  internship: 'badge-internship',
  research: 'badge-research',
  competition: 'badge-competition',
  scholarship: 'badge-scholarship',
};

function ScoreRing({ score }) {
  const cls = score >= 70 ? 'score-high' : score >= 45 ? 'score-mid' : 'score-low';
  return <div className={`score-ring ${cls}`}>{score}</div>;
}

export default function MatchCard({ match, onUpdate }) {
  const [saving, setSaving] = useState(false);
  const [applying, setApplying] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const opp = match.opportunity;

  if (!opp) return null;

  const deadline = new Date(opp.deadline);
  const daysLeft = Math.ceil((deadline - new Date()) / 86400000);
  const urgency = daysLeft <= 7 ? 'var(--rose)' : daysLeft <= 21 ? 'var(--amber)' : 'var(--text3)';

  const toggleSave = async () => {
    setSaving(true);
    try {
      const res = await api.patch(`/matches/${match._id}/save`, { saved: !match.saved });
      onUpdate && onUpdate(res.data);
    } finally { setSaving(false); }
  };

  const markApplied = async () => {
    setApplying(true);
    try {
      const res = await api.patch(`/matches/${match._id}/apply`);
      onUpdate && onUpdate(res.data);
    } finally { setApplying(false); }
  };

  return (
    <div className="card fade-up" style={{ marginBottom: 16, transition: 'border-color 0.2s' }}>
      {/* Header */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <ScoreRing score={match.relevanceScore} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
            <span className={`badge ${TYPE_COLORS[opp.type] || ''}`}>{opp.type}</span>
            {match.applied && (
              <span className="badge" style={{ background: 'rgba(34,197,94,0.1)', color: 'var(--green)' }}>✓ Applied</span>
            )}
            {match.saved && (
              <span className="badge" style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--accent2)' }}>★ Saved</span>
            )}
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>{opp.title}</h3>
          <div style={{ fontSize: 13, color: 'var(--text2)' }}>
            {opp.organization} · {opp.location}
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          {opp.stipend && (
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--teal)', marginBottom: 4 }}>{opp.stipend}</div>
          )}
          <div style={{ fontSize: 12, color: urgency }}>
            {daysLeft > 0 ? `${daysLeft}d left` : 'Expired'}
          </div>
        </div>
      </div>

      {/* AI Explanation */}
      <div style={{
        margin: '16px 0', padding: '14px 16px',
        background: 'rgba(99,102,241,0.07)', borderRadius: 10,
        borderLeft: '3px solid var(--accent)',
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Why this matches you
        </div>
        <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{match.explanation}</p>
      </div>

      {/* Highlights */}
      {match.highlights?.length > 0 && (
        <ul style={{ margin: '0 0 12px', paddingLeft: 0, listStyle: 'none' }}>
          {match.highlights.map((h, i) => (
            <li key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: 'var(--text2)', marginBottom: 6 }}>
              <span style={{ color: 'var(--green)', flexShrink: 0 }}>✓</span>
              {h}
            </li>
          ))}
        </ul>
      )}

      {/* Expand more */}
      {expanded && (
        <div style={{ marginBottom: 12 }}>
          {match.skillsMatched?.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 6, fontWeight: 500 }}>MATCHED SKILLS</div>
              <div className="tags-display">
                {match.skillsMatched.map((s) => (
                  <span key={s} className="tag">{s}</span>
                ))}
              </div>
            </div>
          )}
          {match.gapAnalysis && (
            <div style={{
              padding: '10px 14px', borderRadius: 8,
              background: 'rgba(245,158,11,0.08)', borderLeft: '3px solid var(--amber)',
              fontSize: 13, color: 'var(--text2)',
            }}>
              <span style={{ color: 'var(--amber)', fontWeight: 600 }}>Growth area: </span>
              {match.gapAnalysis}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginTop: 4 }}>
        <a href={opp.link} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
          Apply Now →
        </a>
        <button className="btn btn-outline btn-sm" onClick={toggleSave} disabled={saving}>
          {match.saved ? '★ Saved' : '☆ Save'}
        </button>
        {!match.applied && (
          <button className="btn btn-outline btn-sm" onClick={markApplied} disabled={applying}
            style={{ color: 'var(--green)', borderColor: 'rgba(34,197,94,0.3)' }}>
            Mark Applied
          </button>
        )}
        <button className="btn btn-ghost btn-sm" onClick={() => setExpanded(!expanded)} style={{ marginLeft: 'auto' }}>
          {expanded ? 'Less ↑' : 'More ↓'}
        </button>
      </div>
    </div>
  );
}
