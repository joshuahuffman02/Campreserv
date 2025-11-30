import { RocketIcon, CalendarIcon, ReaderIcon, ExternalLinkIcon } from '@radix-ui/react-icons';
import { sampleEvents } from '../data/mockData';

export default function EventDetail({ id }: { id: string }) {
  const event = sampleEvents.find((e) => e.id === id) ?? sampleEvents[0];

  return (
    <div className="card" style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="badge">Featured event</div>
          <h2 style={{ margin: '8px 0 4px' }}>{event.title}</h2>
          <div style={{ color: '#9fb99b' }}>
            <CalendarIcon /> {event.startDate} → {event.endDate}
          </div>
        </div>
        <button className="cta" style={{ whiteSpace: 'nowrap' }}>
          <RocketIcon /> Book these dates
        </button>
      </div>
      <div
        style={{
          borderRadius: 16,
          backgroundImage: `linear-gradient(120deg, rgba(15,23,18,0.75), rgba(12,19,14,0.4)), url(${event.heroImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: 220,
        }}
      />
      <p style={{ color: '#c2cdbd', margin: 0 }}>{event.description}</p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {event.tags?.map((tag) => (
          <span key={tag} className="chip subtle">
            <ReaderIcon /> {tag}
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
        <div className="small">Bookings auto-prefill to this event's dates and pet policies.</div>
        <a className="ghost" href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          View availability <ExternalLinkIcon />
        </a>
      </div>
    </div>
  );
}
