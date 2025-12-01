import SiteFiltersPanel from '../components/SiteFiltersPanel';
import Timeline from '../components/Timeline';
import Stats from '../components/Stats';

export default function SettingsPage() {
  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="hero">
        <div className="card" style={{ display: 'grid', gap: 10 }}>
          <div className="badge">Owner & manager settings</div>
          <h1 style={{ margin: '6px 0' }}>Per-campground controls</h1>
          <p className="small" style={{ margin: 0 }}>
            Configure taxes, fees, cancellation windows, and role-based access. Changes sync to mobile instantly.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="cta">Create role</button>
            <button className="ghost">Preview mobile</button>
          </div>
        </div>
        <Stats />
      </div>

      <SiteFiltersPanel onApply={() => {}} />

      <div className="card" style={{ display: 'grid', gap: 12 }}>
        <div className="section-title">
          <div>
            <h2 style={{ margin: 0 }}>Operational rules</h2>
            <span>Buffer nights, quiet hours, auto-assign logic</span>
          </div>
          <button className="ghost">Edit</button>
        </div>
        <ul className="link-list">
          <li>Check-in 3pm / Check-out 11am</li>
          <li>Buffers enabled on premium sites (12 hours)</li>
          <li>Quiet hours 10pm–7am, SMS reminders sent automatically</li>
          <li>Auto-assign respects pet-friendly + length limits</li>
        </ul>
      </div>

      <div className="card" style={{ display: 'grid', gap: 12 }}>
        <div className="section-title">
          <div>
            <h2 style={{ margin: 0 }}>Calendar sync roadmap</h2>
            <span>OTA-ready ICS endpoints per campground</span>
          </div>
          <button className="ghost">Copy ICS link</button>
        </div>
        <Timeline />
      </div>
    </div>
  );
}
