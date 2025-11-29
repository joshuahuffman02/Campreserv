import { CalendarIcon, LightningBoltIcon, MixerHorizontalIcon, PawIcon } from '@radix-ui/react-icons';
import { useMemo, useState } from 'react';
import FeaturedSites from '../components/FeaturedSites';
import AvailabilityBoard from '../components/AvailabilityBoard';
import Timeline from '../components/Timeline';
import EventSpotlight from '../components/EventSpotlight';

const filters = [
  { label: 'RV Full Hookups', icon: <LightningBoltIcon /> },
  { label: 'Pet friendly', icon: <PawIcon /> },
  { label: 'Pull-through', icon: <MixerHorizontalIcon /> },
  { label: 'Cabins', icon: <CalendarIcon /> },
];

export default function BookingPage() {
  const [selectedEvent, setSelectedEvent] = useState<null | { title: string; startDate: string; endDate: string }>(null);
  const [dates, setDates] = useState({ start: 'Apr 15', end: 'Apr 18' });

  const events = useMemo(
    () => [
      {
        id: '1',
        title: 'Camp Everyday Season Opener',
        summary: 'Opening weekend with s’mores under the stars, kayak demos, and sunrise yoga.',
        campground: 'Camp Everyday',
        startDate: 'Apr 15',
        endDate: 'Apr 18',
        hero: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=60',
        deals: 'Opening deal: 10% off full hookups + free cocoa kits',
      },
      {
        id: '2',
        title: 'Harvest & Colors Festival',
        summary: 'Hayrides, live bluegrass, and a fall market with local makers.',
        campground: 'Camp Everyday',
        startDate: 'Oct 4',
        endDate: 'Oct 6',
        hero: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=60&sat=-60',
        deals: 'Cabins: late checkout + 15% off midweek nights',
      },
    ],
    []
  );

  const handleEventSelect = (event: { title: string; startDate: string; endDate: string }) => {
    setSelectedEvent(event);
    setDates({ start: event.startDate, end: event.endDate });
  };

  return (
    <div className="grid" style={{ gap: 20 }}>
      <EventSpotlight events={events} onSelect={handleEventSelect} />

      <section className="hero card">
        <div style={{ display: 'grid', gap: 16 }}>
          <div className="badge">Book a stay</div>
          <h1 style={{ margin: 0, fontSize: 36, lineHeight: 1.2 }}>
            Camp Everyday bookings center events, deals, and campground-specific policies.
          </h1>
          <p style={{ color: '#c2cdbd', maxWidth: 620 }}>
            Filter by rig length, hookups, or pet friendliness. Seasonal windows (Apr 15 – Oct 15), holiday rules,
            custom fees/taxes, and each campground’s cancellation policy are respected automatically.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
            {filters.map((filter) => (
              <div key={filter.label} className="chip">
                {filter.icon}
                {filter.label}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <input
              className="input"
              placeholder="Select dates"
              value={`${dates.start} → ${dates.end}`}
              onChange={(e) => {
                const [start, end] = e.target.value.split('→').map((s) => s.trim());
                if (start && end) setDates({ start, end });
              }}
            />
            <input className="input" placeholder="Campground" defaultValue="Camp Everyday" />
            <input className="input" placeholder="Guests" defaultValue="2 adults, 1 dog" />
            <button className="cta">Check availability</button>
          </div>
          <Timeline />
        </div>
        <FeaturedSites />
      </section>

      <AvailabilityBoard
        selectionLabel={selectedEvent ? `${selectedEvent.title} weekend` : 'Custom search'}
        dateRange={`${dates.start} → ${dates.end}`}
      />
    </div>
  );
}
