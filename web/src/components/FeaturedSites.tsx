import { LightningBoltIcon, PawIcon } from '@radix-ui/react-icons';

const featured = [
  {
    name: 'Riverbend 12',
    type: 'RV • Full hookups',
    price: '$72/night',
    tag: 'Most requested',
    perks: ['50 amp', 'Pull-through', 'Picnic table'],
  },
  {
    name: 'Oak Ridge A3',
    type: 'Tent • Premium',
    price: '$48/night',
    tag: 'Shaded + private',
    perks: ['Near showers', 'Bear box', 'Fire ring'],
  },
  {
    name: 'Summit Cabin 2',
    type: 'Cabin • Sleeps 6',
    price: '$162/night',
    tag: 'Great for families',
    perks: ['AC + heat', 'Kitchenette', 'Pet friendly'],
  },
];

export default function FeaturedSites() {
  return (
    <div className="card" style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
      <div className="section-title">
        <div>
          <h2>Instant book picks</h2>
          <span>Hand-curated sites with consistent 5⭐ check-in scores</span>
        </div>
        <button className="cta" style={{ padding: '10px 14px' }}>
          View all sites
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        {featured.map((site) => (
          <div key={site.name} className="card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <div className="badge" style={{ background: 'rgba(34, 211, 238, 0.15)', color: '#b3effc' }}>
                <LightningBoltIcon /> {site.tag}
              </div>
              <div className="chip" style={{ color: '#c4d3e5' }}>
                <PawIcon /> Pets OK
              </div>
            </div>
            <h3 style={{ margin: '0 0 4px' }}>{site.name}</h3>
            <div className="small" style={{ marginBottom: 10 }}>
              {site.type}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <strong>{site.price}</strong>
              <button className="cta" style={{ padding: '10px 12px' }}>
                Book now
              </button>
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {site.perks.map((perk) => (
                <span key={perk} className="chip">
                  {perk}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
