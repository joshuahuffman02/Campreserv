import DealStrip from '../components/DealStrip';
import FeaturedSites from '../components/FeaturedSites';
import EventSpotlight from '../components/EventSpotlight';
import FAQAccordion from '../components/FAQAccordion';

export default function DealsPage() {
  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="hero">
        <div className="card" style={{ display: 'grid', gap: 10 }}>
          <div className="badge">Save on your stay</div>
          <h1 style={{ margin: '6px 0' }}>Promo-ready booking for guests & staff</h1>
          <p className="small" style={{ margin: 0 }}>
            Staff can copy codes or auto-apply. Guests see the best available rate per date range.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="cta">Apply hottest deal</button>
            <button className="ghost">Share to SMS</button>
          </div>
        </div>
        <FeaturedSites />
      </div>
      <DealStrip />
      <EventSpotlight />
      <FAQAccordion />
    </div>
  );
}
