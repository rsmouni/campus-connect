import React, { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

function TagInput({ label, values, onChange, placeholder }) {
  const [input, setInput] = useState('');

  const add = () => {
    const val = input.trim();
    if (val && !values.includes(val)) {
      onChange([...values, val]);
    }
    setInput('');
  };

  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div style={{ display: 'flex', gap: 8 }}>
        <input className="form-input" value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder={placeholder} />
        <button type="button" className="btn btn-outline" onClick={add}>Add</button>
      </div>
      <div className="tags-display">
        {values.map((v) => (
          <span key={v} className="tag">
            {v}
            <button type="button" className="tag-remove"
              onClick={() => onChange(values.filter((x) => x !== v))}>×</button>
          </span>
        ))}
      </div>
    </div>
  );
}

const DEFAULT = {
  degree: '', institution: '', yearOfStudy: '', gpa: '',
  bio: '', linkedIn: '', github: '',
  skills: [], interests: [], coursesTaken: [],
  preferredTypes: ['internship', 'research', 'competition', 'scholarship'],
  projects: [],
};

export default function Profile() {
  const { user } = useAuth();
  const [form, setForm] = useState(DEFAULT);
  const [completeness, setCompleteness] = useState(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [newProject, setNewProject] = useState({ title: '', description: '', techStack: '', link: '' });
  const [showProjectForm, setShowProjectForm] = useState(false);

  useEffect(() => {
    api.get('/profile/me').then((res) => {
      setForm({ ...DEFAULT, ...res.data });
    }).catch(() => {});
    api.get('/profile/completeness').then((res) => setCompleteness(res.data)).catch(() => {});
  }, []);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const toggleType = (t) => {
    const types = form.preferredTypes.includes(t)
      ? form.preferredTypes.filter((x) => x !== t)
      : [...form.preferredTypes, t];
    setForm({ ...form, preferredTypes: types });
  };

  const addProject = () => {
    if (!newProject.title || !newProject.description) return;
    const p = {
      ...newProject,
      techStack: newProject.techStack.split(',').map((s) => s.trim()).filter(Boolean),
    };
    setForm({ ...form, projects: [...form.projects, p] });
    setNewProject({ title: '', description: '', techStack: '', link: '' });
    setShowProjectForm(false);
  };

  const removeProject = (i) => {
    setForm({ ...form, projects: form.projects.filter((_, idx) => idx !== i) });
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess('');
    try {
      await api.put('/profile/me', form);
      const comp = await api.get('/profile/completeness');
      setCompleteness(comp.data);
      setSuccess('Profile saved! AI matches will use your updated info.');
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const OPTY_TYPES = ['internship', 'research', 'competition', 'scholarship'];

  return (
    <div className="page page-padded" style={{ maxWidth: 720 }}>
      <div className="fade-up" style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, marginBottom: 4 }}>Your Profile</h1>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>
          The AI reads every field here to understand who you are — not just keywords.
        </p>
      </div>

      {/* Completeness */}
      {completeness && (
        <div className="card fade-up fade-up-1" style={{ marginBottom: 24, padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>Profile Completeness</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: completeness.score >= 80 ? 'var(--green)' : 'var(--amber)' }}>
              {completeness.score}%
            </span>
          </div>
          <div className="progress-bar" style={{ marginBottom: 8 }}>
            <div className="progress-fill" style={{ width: `${completeness.score}%`,
              background: completeness.score >= 80 ? 'var(--green)' : 'var(--amber)' }} />
          </div>
          {completeness.missing.length > 0 && (
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>
              Still missing: {completeness.missing.join(' · ')}
            </div>
          )}
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={submit}>
        {/* Basic info */}
        <div className="card fade-up fade-up-2" style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 17, marginBottom: 20 }}>Academic Info</h2>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Degree / Major</label>
              <input className="form-input" name="degree" value={form.degree} onChange={handle}
                placeholder="B.Tech Computer Science" />
            </div>
            <div className="form-group">
              <label className="form-label">Institution</label>
              <input className="form-input" name="institution" value={form.institution} onChange={handle}
                placeholder="MIT" />
            </div>
            <div className="form-group">
              <label className="form-label">Year of Study</label>
              <select className="form-input" name="yearOfStudy" value={form.yearOfStudy} onChange={handle}>
                <option value="">Select</option>
                {[1,2,3,4,5,6].map((y) => <option key={y} value={y}>Year {y}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">GPA (optional)</label>
              <input className="form-input" name="gpa" type="number" step="0.01" min="0" max="10"
                value={form.gpa} onChange={handle} placeholder="3.8" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Bio — Tell us about yourself</label>
            <textarea className="form-input" name="bio" value={form.bio} onChange={handle} rows={3}
              placeholder="I'm a 3rd-year CS student passionate about AI applied to healthcare. I've built image classification models for medical datasets..." />
          </div>
        </div>

        {/* Skills & Interests */}
        <div className="card fade-up fade-up-2" style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 17, marginBottom: 20 }}>Skills & Interests</h2>
          <TagInput label="Technical Skills" values={form.skills}
            onChange={(v) => setForm({ ...form, skills: v })}
            placeholder="Python, React, Machine Learning..." />
          <TagInput label="Interests & Domains" values={form.interests}
            onChange={(v) => setForm({ ...form, interests: v })}
            placeholder="Healthcare AI, FinTech, Robotics..." />
          <TagInput label="Courses Taken" values={form.coursesTaken}
            onChange={(v) => setForm({ ...form, coursesTaken: v })}
            placeholder="Deep Learning, Algorithms, NLP..." />
        </div>

        {/* Projects */}
        <div className="card fade-up fade-up-3" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 17 }}>Projects</h2>
            <button type="button" className="btn btn-outline btn-sm"
              onClick={() => setShowProjectForm(!showProjectForm)}>
              {showProjectForm ? 'Cancel' : '+ Add Project'}
            </button>
          </div>

          {showProjectForm && (
            <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
              <div className="grid-2">
                <div className="form-group" style={{ marginBottom: 12 }}>
                  <label className="form-label">Project Title</label>
                  <input className="form-input" value={newProject.title}
                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                    placeholder="Medical Image Classifier" />
                </div>
                <div className="form-group" style={{ marginBottom: 12 }}>
                  <label className="form-label">Link (optional)</label>
                  <input className="form-input" value={newProject.link}
                    onChange={(e) => setNewProject({ ...newProject, link: e.target.value })}
                    placeholder="https://github.com/..." />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label">Description</label>
                <textarea className="form-input" value={newProject.description} rows={2}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Describe what you built, the problem it solves, and key outcomes..." />
              </div>
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label">Tech Stack (comma-separated)</label>
                <input className="form-input" value={newProject.techStack}
                  onChange={(e) => setNewProject({ ...newProject, techStack: e.target.value })}
                  placeholder="Python, PyTorch, OpenCV, FastAPI" />
              </div>
              <button type="button" className="btn btn-primary btn-sm" onClick={addProject}>
                Add Project
              </button>
            </div>
          )}

          {form.projects.length === 0 && !showProjectForm && (
            <p style={{ color: 'var(--text3)', fontSize: 13 }}>No projects yet — add at least one to boost match quality significantly.</p>
          )}

          {form.projects.map((p, i) => (
            <div key={i} style={{ padding: '14px 16px', background: 'var(--bg3)', borderRadius: 10, marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <strong style={{ fontSize: 14 }}>{p.title}</strong>
                <button type="button" className="btn-ghost" style={{ fontSize: 18, padding: 0, color: 'var(--text3)' }}
                  onClick={() => removeProject(i)}>×</button>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 8 }}>{p.description}</p>
              <div className="tags-display">
                {(Array.isArray(p.techStack) ? p.techStack : []).map((t) => (
                  <span key={t} className="tag">{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Opportunity preferences */}
        <div className="card fade-up fade-up-3" style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 17, marginBottom: 16 }}>Opportunity Preferences</h2>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Types I'm interested in</label>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
              {OPTY_TYPES.map((t) => (
                <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
                  padding: '7px 14px', borderRadius: 20, border: '1px solid',
                  borderColor: form.preferredTypes.includes(t) ? 'var(--accent)' : 'var(--border)',
                  background: form.preferredTypes.includes(t) ? 'rgba(99,102,241,0.12)' : 'transparent',
                  fontSize: 13, fontWeight: 500,
                  color: form.preferredTypes.includes(t) ? 'var(--accent3)' : 'var(--text2)',
                  transition: 'all 0.15s',
                }}>
                  <input type="checkbox" style={{ display: 'none' }} checked={form.preferredTypes.includes(t)}
                    onChange={() => toggleType(t)} />
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="card fade-up fade-up-4" style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 17, marginBottom: 20 }}>Links</h2>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">LinkedIn</label>
              <input className="form-input" name="linkedIn" value={form.linkedIn} onChange={handle}
                placeholder="https://linkedin.com/in/..." />
            </div>
            <div className="form-group">
              <label className="form-label">GitHub</label>
              <input className="form-input" name="github" value={form.github} onChange={handle}
                placeholder="https://github.com/..." />
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
          {saving ? 'Saving...' : '✓ Save Profile'}
        </button>
      </form>
    </div>
  );
}
