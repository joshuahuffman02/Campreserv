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
  const [dates, setDates] = useState({ start: 'Aug 14', end: 'Aug 18' });

  const events = useMemo(
    () => [
      {
        id: '1',
        title: 'Bluegrass & BBQ Weekend',
        summary: 'Live music on the lawn, food trucks, and late checkout on Sunday.',
        campground: 'Redwood Pines',
        startDate: 'Sep 6',
        endDate: 'Sep 8',
        hero: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=60',
        deals: '15% off RV W/E + BBQ tasting wristbands',
      },
      {
        id: '2',
        title: 'Stargazer Retreat',
        summary: 'Guided night hike, telescope bar, and free cocoa kits at the camp store.',
        campground: 'Sierra Summit',
        startDate: 'Oct 11',
        endDate: 'Oct 13',
        hero: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=60&sat=-60',
        deals: 'Cabins get late checkout + 10% off',
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
            Lakeside, mountain, or glamping — search live availability across your campgrounds.
          </h1>
          <p style={{ color: '#9fb3c8', maxWidth: 620 }}>
            Filter by rig length, hookups, or pet friendliness. Pricing rules, minimum stays, and blackout dates are
            respected automatically.
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
            <input className="input" placeholder="Campground" defaultValue="Redwood Pines" />
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
