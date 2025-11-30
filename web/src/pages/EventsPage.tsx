import EventSpotlight from '../components/EventSpotlight';
import EventDetail from '../components/EventDetail';
import DealStrip from '../components/DealStrip';
import SiteGrid from '../components/SiteGrid';
import FAQAccordion from '../components/FAQAccordion';

export default function EventsPage() {
  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="hero">
        <div className="card" style={{ display: 'grid', gap: 12 }}>
          <div className="badge">Events-first booking</div>
          <h1 style={{ margin: '6px 0' }}>See what's happening & book those dates</h1>
          <p style={{ color: '#c2cdbd', margin: 0 }}>
            Browse a curated calendar of Camp Everyday experiences. Click an event to prefill dates and fees
            automatically during checkout on web or mobile.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="cta">Book featured weekend</button>
            <button className="ghost">Download mobile itinerary</button>
          </div>
        </div>
        <EventSpotlight />
      </div>
      <EventDetail id="campfire-stories" />
      <SiteGrid />
      <DealStrip />
      <FAQAccordion />
    </div>
  );
}
