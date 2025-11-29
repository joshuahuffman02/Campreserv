import { Route, Routes, NavLink } from 'react-router-dom';
import { DashboardIcon, GlobeIcon, LockClosedIcon } from '@radix-ui/react-icons';
import BookingPage from './pages/BookingPage';
import AdminDashboard from './pages/AdminDashboard';
import AuthPage from './pages/AuthPage';
import logo from './assets/camp-everyday-logo.svg';

const navLinkStyle = ({ isActive }: { isActive: boolean }) => ({
  padding: '10px 14px',
  borderRadius: 12,
  background: isActive ? 'rgba(217, 120, 47, 0.15)' : 'transparent',
  color: isActive ? '#f1b43c' : '#e7e3d4',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  textDecoration: 'none',
  fontWeight: 600,
});

export default function App() {
  return (
    <div className="page">
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src={logo} alt="Camp Everyday logo" style={{ height: 56, width: 'auto' }} />
          <div>
            <div className="badge">Camp Everyday</div>
            <span style={{ color: '#c2cdbd' }}>Events-first booking, multi-campground ready.</span>
          </div>
        </div>
        <nav style={{ display: 'flex', gap: 6 }}>
          <NavLink to="/" style={navLinkStyle} end>
            <GlobeIcon /> Guest Booking
          </NavLink>
          <NavLink to="/admin" style={navLinkStyle}>
            <DashboardIcon /> Admin Dashboard
          </NavLink>
          <NavLink to="/auth" style={navLinkStyle}>
            <LockClosedIcon /> Login
          </NavLink>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<BookingPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/auth" element={<AuthPage />} />
      </Routes>
    </div>
  );
}
