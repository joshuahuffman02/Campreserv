import FAQAccordion from '../components/FAQAccordion';
import Timeline from '../components/Timeline';
import Stats from '../components/Stats';
import SiteGrid from '../components/SiteGrid';
import { siteTypes } from '../data/mockData';

export default function CampgroundGuide() {
  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="hero">
        <div className="card" style={{ display: 'grid', gap: 10 }}>
          <div className="badge">Campground guide</div>
          <h1 style={{ margin: '6px 0' }}>Everything you need before you book</h1>
          <p className="small" style={{ margin: 0 }}>
            Policies, check-in tips, and mobile directions all in one place. Shareable to guests and staff.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="cta">Open in mobile</button>
            <button className="ghost">Download PDF</button>
          </div>
        </div>
        <Stats />
      </div>

      <div className="card" style={{ display: 'grid', gap: 12 }}>
        <div className="section-title">
          <div>
            <h2 style={{ margin: 0 }}>Site types</h2>
            <span>Every campground can rename, reorder, and price independently</span>
          </div>
        </div>
        <div className="site-type-grid">
          {siteTypes.map((type) => (
            <div key={type.id} className="site-type-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>{type.name}</h3>
                <span className="chip" style={{ background: 'rgba(209,120,47,0.16)', color: '#f1b43c' }}>{type.price}</span>
              </div>
              <p className="small" style={{ margin: '6px 0' }}>{type.description}</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span className="chip subtle">Capacity {type.capacity}</span>
                <span className="chip subtle">Length {type.length}</span>
                {type.perks.map((perk) => (
                  <span key={perk} className="chip subtle">{perk}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Timeline />
      <SiteGrid />
      <FAQAccordion />
    </div>
  );
}
