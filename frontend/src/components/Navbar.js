import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/matches', label: 'My Matches' },
    { to: '/opportunities', label: 'Explore' },
    { to: '/profile', label: 'Profile' },
  ];

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        {/* Logo */}
        <NavLink to="/dashboard" style={styles.logo}>
          <span style={styles.logoIcon}>⬡</span>
          <span>CampusConnect</span>
        </NavLink>

        {/* Desktop nav */}
        <div style={styles.links}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                ...styles.link,
                ...(isActive ? styles.linkActive : {}),
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Right side */}
        <div style={styles.right}>
          <div style={styles.avatar} onClick={() => setMenuOpen(!menuOpen)}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          {menuOpen && (
            <div style={styles.dropdown}>
              <div style={styles.dropdownName}>{user?.name}</div>
              <div style={styles.dropdownEmail}>{user?.email}</div>
              <hr style={{ border: 'none', borderTop: '1px solid rgba(148,163,184,0.1)', margin: '8px 0' }} />
              <button onClick={handleLogout} style={styles.dropdownItem}>Sign out</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
    background: 'rgba(7,9,15,0.85)',
    backdropFilter: 'blur(16px)',
    borderBottom: '1px solid rgba(148,163,184,0.1)',
    height: 60,
  },
  inner: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: '100%',
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: 8,
    fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18,
    color: '#f1f5f9',
  },
  logoIcon: { color: '#6366f1', fontSize: 20 },
  links: { display: 'flex', gap: 4 },
  link: {
    padding: '6px 14px', borderRadius: 8, fontSize: 14, fontWeight: 500,
    color: '#94a3b8', transition: 'all 0.15s',
  },
  linkActive: { color: '#f1f5f9', background: 'rgba(99,102,241,0.12)' },
  right: { position: 'relative' },
  avatar: {
    width: 36, height: 36, borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #818cf8)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: 14, color: '#fff', cursor: 'pointer',
    userSelect: 'none',
  },
  dropdown: {
    position: 'absolute', top: 44, right: 0,
    background: '#141b26', border: '1px solid rgba(148,163,184,0.15)',
    borderRadius: 12, padding: 12, minWidth: 180,
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
  },
  dropdownName: { fontWeight: 600, fontSize: 14, color: '#f1f5f9', marginBottom: 2 },
  dropdownEmail: { fontSize: 12, color: '#64748b', marginBottom: 4 },
  dropdownItem: {
    display: 'block', width: '100%', padding: '8px 10px',
    background: 'transparent', border: 'none', borderRadius: 6,
    color: '#f43f5e', fontSize: 13, fontWeight: 500,
    cursor: 'pointer', textAlign: 'left',
  },
};
