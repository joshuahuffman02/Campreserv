import { featuredSites } from '../data/mockData';
import { PawIcon, LightningBoltIcon, RulerHorizontalIcon, ExternalLinkIcon } from '@radix-ui/react-icons';

export default function SiteGrid() {
  return (
    <div className="card" style={{ display: 'grid', gap: 12 }}>
      <div className="section-title">
        <div>
          <h2 style={{ margin: 0 }}>Available sites</h2>
          <span>Filtered by your preferences and event window</span>
        </div>
        <a href="/" className="ghost">
          See in map view <ExternalLinkIcon />
        </a>
      </div>
      <div className="site-grid">
        {featuredSites.map((site) => (
          <div key={site.id} className="site-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: '0 0 4px' }}>{site.title}</h3>
                <div className="small">{site.type}</div>
              </div>
              <div className="chip" style={{ background: 'rgba(209,120,47,0.15)', color: '#f1b43c' }}>
                {site.price}/night
              </div>
            </div>
            <p className="small" style={{ margin: '8px 0' }}>{site.note}</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span className="chip subtle">
                <LightningBoltIcon /> {site.electric}
              </span>
              <span className="chip subtle">
                <RulerHorizontalIcon /> {site.length}
              </span>
              <span className="chip subtle" aria-label={site.petFriendly ? 'Pet friendly' : 'Pets restricted'}>
                <PawIcon /> {site.petFriendly ? 'Pets welcome' : 'No pets'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
              <button className="ghost">Hold & book</button>
              <button className="cta" style={{ padding: '10px 14px' }}>Book site</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
