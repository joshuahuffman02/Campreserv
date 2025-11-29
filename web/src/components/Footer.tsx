import { InstagramLogoIcon, TwitterLogoIcon, LinkedInLogoIcon } from '@radix-ui/react-icons';

export default function Footer() {
  return (
    <footer
      className="card"
      style={{ marginTop: 48, display: 'grid', gap: 14, background: 'rgba(18,32,23,0.8)' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div>
          <div className="badge">Camp Everyday</div>
          <div style={{ color: '#9ab290' }}>Events-first booking. OTA-ready. Mobile-first for guests.</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <a href="#" className="ghost" aria-label="Instagram">
            <InstagramLogoIcon />
          </a>
          <a href="#" className="ghost" aria-label="Twitter">
            <TwitterLogoIcon />
          </a>
          <a href="#" className="ghost" aria-label="LinkedIn">
            <LinkedInLogoIcon />
          </a>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
        <div>
          <h4 style={{ margin: '0 0 8px' }}>Guest</h4>
          <ul className="link-list">
            <li><a href="/">Book a stay</a></li>
            <li><a href="/events">Events</a></li>
            <li><a href="/deals">Deals</a></li>
            <li><a href="/guide">Campground guide</a></li>
          </ul>
        </div>
        <div>
          <h4 style={{ margin: '0 0 8px' }}>Owners & staff</h4>
          <ul className="link-list">
            <li><a href="/admin">Dashboard</a></li>
            <li><a href="/settings">Campground settings</a></li>
            <li><a href="/auth">Login</a></li>
            <li><a href="#">Docs</a></li>
          </ul>
        </div>
        <div>
          <h4 style={{ margin: '0 0 8px' }}>Roadmap</h4>
          <ul className="link-list">
            <li>OTA calendar sync</li>
            <li>POS & add-ons</li>
            <li>PowerBI export</li>
            <li>Marketing automation</li>
          </ul>
        </div>
      </div>
      <div style={{ color: '#6c7f6f', fontSize: 13 }}>
        © {new Date().getFullYear()} Camp Everyday. Built for multi-campground operators.
      </div>
    </footer>
  );
}
