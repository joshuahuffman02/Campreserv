import { Route, Routes } from 'react-router-dom';
import BookingPage from './pages/BookingPage';
import AdminDashboard from './pages/AdminDashboard';
import AuthPage from './pages/AuthPage';
import EventsPage from './pages/EventsPage';
import DealsPage from './pages/DealsPage';
import CampgroundGuide from './pages/CampgroundGuide';
import SettingsPage from './pages/SettingsPage';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import MobileNavPanel from './components/MobileNavPanel';

export default function App() {
  return (
    <div className="page">
      <NavBar />
      <MobileNavPanel />

      <Routes>
        <Route path="/" element={<BookingPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/deals" element={<DealsPage />} />
        <Route path="/guide" element={<CampgroundGuide />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
      <Footer />
    </div>
  );
}
