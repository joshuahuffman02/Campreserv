import { CalendarIcon, LightningBoltIcon, TicketIcon } from '@radix-ui/react-icons';

type Event = {
  id: string;
  title: string;
  summary: string;
  campground: string;
  startDate: string;
  endDate: string;
  hero: string;
  deals?: string;
};

type Props = {
  events: Event[];
  onSelect: (event: Event) => void;
};

export default function EventSpotlight({ events, onSelect }: Props) {
  return (
    <section className="card" style={{ border: '1px solid rgba(130,150,180,0.25)', position: 'relative' }}>
      <div className="section-title">
        <div>
          <div className="badge">Campground events</div>
          <h2>Stay during something special</h2>
          <span>Featured weekends, live music, and seasonal festivals. Booking pre-fills the event dates.</span>
        </div>
        <div className="chip">
          <CalendarIcon /> Auto-fills stay dates
        </div>
      </div>
      <div className="event-grid">
        {events.map((event) => (
          <article key={event.id} className="event-card">
            <div className="event-media" style={{ backgroundImage: `url(${event.hero})` }} />
            <div style={{ display: 'grid', gap: 8 }}>
              <div className="tag success" style={{ width: 'fit-content' }}>
                <LightningBoltIcon /> Featured
              </div>
              <h3 style={{ margin: 0 }}>{event.title}</h3>
              <p className="small" style={{ color: '#9fb3c8' }}>
                {event.summary}
              </p>
              <div className="meta-row">
                <span className="chip subtle">
                  <CalendarIcon /> {event.startDate} → {event.endDate}
                </span>
                <span className="chip subtle">
                  <TicketIcon /> {event.campground}
                </span>
                {event.deals && <span className="chip subtle">{event.deals}</span>}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="cta" onClick={() => onSelect(event)}>
                  Book these dates
                </button>
                <button className="ghost" onClick={() => onSelect(event)}>
                  View availability
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
