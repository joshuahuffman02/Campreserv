import { Route, Routes, NavLink } from 'react-router-dom';
import { DashboardIcon, GlobeIcon, LockClosedIcon } from '@radix-ui/react-icons';
import BookingPage from './pages/BookingPage';
import AdminDashboard from './pages/AdminDashboard';
import AuthPage from './pages/AuthPage';

const navLinkStyle = ({ isActive }: { isActive: boolean }) => ({
  padding: '10px 14px',
  borderRadius: 12,
  background: isActive ? 'rgba(110, 231, 183, 0.15)' : 'transparent',
  color: isActive ? '#b1f6d9' : '#c5d3e3',
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
          <div className="badge">Campreserv</div>
          <span style={{ color: '#90a2b5' }}>Modern booking for your campgrounds</span>
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
