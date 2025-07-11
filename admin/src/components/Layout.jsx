import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { FiHome, FiUsers, FiCreditCard, FiBarChart2, FiUser, FiBox, FiFileText, FiSettings, FiBell, FiMoon, FiSun, FiHelpCircle, FiList, FiShoppingCart, FiMapPin, FiMessageCircle } from 'react-icons/fi';
import '../App.css';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { useAuth } from '../context/AuthContext';

const navGroups = [
  {
    label: 'Main',
    items: [
      { text: 'Dashboard', path: '/', icon: <FiHome size={20} /> },
      { text: 'Support Chats', path: '/support-chats', icon: <FiMessageCircle size={20} /> },
    ],
  },
  {
    label: 'Admin Management',
    items: [
      { text: 'Admins', path: '/admins', icon: <FiUser size={20} /> },
    ],
  },
  {
    label: 'Management',
    items: [
      { text: 'Users', path: '/users', icon: <FiUsers size={20} /> },
      { text: 'Subscriptions', path: '/subscriptions', icon: <FiCreditCard size={20} /> },
      { text: 'Reports', path: '/reports', icon: <FiFileText size={20} /> },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { text: 'Analytics', path: '/analytics', icon: <FiBarChart2 size={20} /> },
    ],
  },
];

const Layout = ({ children }) => {
  const { logout, admin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [logoutDialog, setLogoutDialog] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Close sidebar on nav click (mobile)
  const handleNavClick = () => {
    if (window.innerWidth <= 900) setSidebarOpen(false);
  };

  // Toggle dark mode
  const toggleDarkMode = () => setDarkMode(d => !d);

  const handleLogout = () => {
    setLogoutDialog(true);
  };
  const confirmLogout = () => {
    logout();
    setLogoutDialog(false);
    navigate('/login');
  };

  return (
    <div className={`admin-root${darkMode ? ' dark-mode' : ''}`} style={{ fontFamily: 'Inter, Arial, sans-serif' }}>
      {/* Sidebar */}
      <aside className={`admin-sidebar${sidebarOpen ? ' sidebar-mobile-open' : ''}`}>
        <div style={{ padding: '0 32px', fontWeight: 900, fontSize: '1.7rem', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 10, letterSpacing: 1 }}>
          <span style={{ color: '#2563eb', fontSize: 28, fontWeight: 900 }}>★</span>
          <span>AdminPanel</span>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {navGroups.map((group, idx) => (
            <div key={group.label} style={{ marginBottom: idx < navGroups.length - 1 ? 18 : 0 }}>
              <div style={{ color: '#b0b8c9', fontSize: 12, fontWeight: 700, padding: '0 32px 6px 32px', letterSpacing: 1, textTransform: 'uppercase', opacity: 0.85 }}>{group.label}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {group.items.map(item => (
                  <NavLink
                    key={item.text}
                    to={item.path}
                    className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
                    end={item.path === '/'}
                    onClick={handleNavClick}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      padding: '10px 32px',
                      borderRadius: 8,
                      margin: '2px 0',
                      fontWeight: 600,
                      fontSize: 16,
                      background: isActive ? 'rgba(37,99,235,0.10)' : 'none',
                      color: isActive ? '#2563eb' : '#fff',
                      transition: 'background 0.2s, color 0.2s',
                      textDecoration: 'none',
                      gap: 12,
                    })}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center' }}>{item.icon}</span>
                    {item.text}
                  </NavLink>
                ))}
              </div>
              {idx < navGroups.length - 1 && (
                <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '16px 0 0 0', width: '80%', marginLeft: '10%' }} />
              )}
            </div>
          ))}
        </nav>
        <div style={{ marginTop: 'auto', padding: '0 32px', fontSize: 13, color: '#fff', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 24 }}>
          <div style={{ marginTop: 8, fontWeight: 600, fontSize: 14 }}>Logged in as:</div>
          <div><b>{admin?.email}</b></div>
          <div>Role: <b>{admin?.role}</b></div>
          <button onClick={handleLogout} style={{ marginTop: 16, background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: 700, fontSize: 15 }}>Logout</button>
        </div>
      </aside>
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      {/* Header */}
      <header className="admin-header" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)', background: darkMode ? '#1e293b' : '#fff' }}>
        {/* Hamburger menu for mobile */}
        <button
          className="sidebar-toggle-btn"
          aria-label="Open sidebar"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            fontSize: 28,
            marginRight: 16,
            cursor: 'pointer',
            color: darkMode ? '#fff' : '#232946',
          }}
        >
          <span className="hamburger-icon">&#9776;</span>
        </button>
        <div className="admin-title">Admin Dashboard</div>
        <div className="admin-user" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={toggleDarkMode}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: darkMode ? '#fff' : '#232946', fontSize: 22, marginRight: 8 }}
            title={darkMode ? 'Light mode' : 'Dark mode'}
          >
            {darkMode ? <FiSun /> : <FiMoon />}
          </button>
          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: darkMode ? '#fff' : '#232946', fontSize: 22, marginRight: 8 }}
            title="Notifications"
          >
            <FiBell />
          </button>
          <div className="admin-avatar" style={{ background: '#2563eb', marginRight: 8 }}><FiUser size={20} /></div>
          <span style={{ color: darkMode ? '#fff' : '#232946' }}>{admin?.email}</span>
          {/* User dropdown placeholder */}
          <div style={{ marginLeft: 8, color: '#888', fontSize: 13, cursor: 'pointer' }} title="Profile/Settings">▼</div>
        </div>
      </header>
      <main className="admin-main" style={{ background: darkMode ? 'linear-gradient(135deg, #1e293b 60%, #334155 100%)' : 'linear-gradient(135deg, #f5f6fa 60%, #e0e7ff 100%)' }}>
        {/* Page title and welcome */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ margin: 0, fontWeight: 800, fontSize: '2rem', color: darkMode ? '#fff' : '#232946' }}>
            {navGroups.flatMap(g => g.items).find(item => location.pathname.startsWith(item.path))?.text || 'Dashboard'}
          </h2>
          <div style={{ color: darkMode ? '#b0b8c9' : '#888', fontSize: 18, marginTop: 4 }}>Welcome, {admin?.email?.split('@')[0] || 'Admin'}!</div>
        </div>
        {children}
      </main>
      <Dialog open={logoutDialog} onClose={() => setLogoutDialog(false)}>
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>Are you sure you want to logout?</DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutDialog(false)}>Cancel</Button>
          <Button onClick={confirmLogout} color="primary" variant="contained">Logout</Button>
        </DialogActions>
      </Dialog>
      {/* Responsive hamburger and sidebar overlay styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        .dark-mode {
          background: #1e293b !important;
        }
        .dark-mode .admin-sidebar {
          background: #232946 !important;
          color: #fff !important;
          box-shadow: 2px 0 8px rgba(0,0,0,0.08);
          border-right: 1px solid rgba(255,255,255,0.06);
        }
        .dark-mode .nav-link {
          color: #fff;
          text-decoration: none;
          border-left: 4px solid transparent;
          transition: background 0.2s, color 0.2s, border-color 0.2s;
        }
        .dark-mode .nav-link.active {
          color: #2563eb !important;
          background: rgba(37,99,235,0.10) !important;
          border-left: 4px solid #2563eb !important;
        }
        .dark-mode .nav-link:hover {
          background: rgba(37,99,235,0.07);
          color: #2563eb;
        }
        .dark-mode .admin-header {
          background: #1e293b !important;
          color: #fff !important;
        }
        .dark-mode .admin-main {
          background: linear-gradient(135deg, #1e293b 60%, #334155 100%) !important;
        }
        @media (max-width: 900px) {
          .sidebar-toggle-btn {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Layout; 