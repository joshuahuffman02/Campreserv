import { NavLink } from 'react-router-dom';
import {
  DashboardIcon,
  GlobeIcon,
  LockClosedIcon,
  CalendarIcon,
  LightningBoltIcon,
  EnterIcon,
  GearIcon,
} from '@radix-ui/react-icons';
import logo from '../assets/camp-everyday-logo.svg';

const navLinkStyle = ({ isActive }: { isActive: boolean }) => ({
  padding: '12px 14px',
  borderRadius: 12,
  background: isActive ? 'rgba(217, 120, 47, 0.15)' : 'transparent',
  color: isActive ? '#f1b43c' : '#e7e3d4',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  textDecoration: 'none',
  fontWeight: 600,
});

export default function NavBar() {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 28,
        position: 'sticky',
        top: 0,
        backdropFilter: 'blur(10px)',
        background: 'rgba(15, 23, 18, 0.7)',
        padding: '12px 0',
        zIndex: 20,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <img src={logo} alt="Camp Everyday logo" style={{ height: 56, width: 'auto' }} />
        <div>
          <div className="badge">Camp Everyday</div>
          <span style={{ color: '#c2cdbd' }}>Events-first booking, multi-campground ready.</span>
        </div>
      </div>
      <nav style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <NavLink to="/" style={navLinkStyle} end>
          <GlobeIcon /> Guest Booking
        </NavLink>
        <NavLink to="/events" style={navLinkStyle}>
          <CalendarIcon /> Events
        </NavLink>
        <NavLink to="/deals" style={navLinkStyle}>
          <LightningBoltIcon /> Deals
        </NavLink>
        <NavLink to="/guide" style={navLinkStyle}>
          <EnterIcon /> Campground Guide
        </NavLink>
        <NavLink to="/admin" style={navLinkStyle}>
          <DashboardIcon /> Admin Dashboard
        </NavLink>
        <NavLink to="/auth" style={navLinkStyle}>
          <LockClosedIcon /> Login
        </NavLink>
        <NavLink to="/settings" style={navLinkStyle}>
          <GearIcon /> Settings
        </NavLink>
      </nav>
    </header>
  );
}
