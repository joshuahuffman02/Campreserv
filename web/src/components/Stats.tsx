import { LightningBoltIcon, MixerHorizontalIcon, PersonIcon } from '@radix-ui/react-icons';

const stats = [
  { label: 'Occupancy', value: '78%', delta: '+6% vs last week' },
  { label: 'Arrivals today', value: '18', delta: '5 early check-ins' },
  { label: 'Revenue (7d)', value: '$28.4k', delta: '+$3.2k vs prior' },
  { label: 'Pending tasks', value: '7', delta: 'Housekeeping, blocks, refunds' },
];

export default function Stats() {
  return (
    <div className="kpi-grid">
      {stats.map((stat, idx) => (
        <div key={stat.label} className="kpi">
          <h3>{stat.label}</h3>
          <div className="value" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {idx === 0 ? <MixerHorizontalIcon /> : idx === 1 ? <PersonIcon /> : <LightningBoltIcon />}
            {stat.value}
          </div>
          <div className="small">{stat.delta}</div>
        </div>
      ))}
    </div>
  );
}
