import { CalendarIcon, CheckCircledIcon, CubeIcon, LightningBoltIcon, PersonIcon } from '@radix-ui/react-icons';
import Stats from '../components/Stats';
import ReservationTable from '../components/ReservationTable';

const maintenance = [
  { site: 'Lakeside 3', range: 'Aug 20-21', reason: 'Tree trimming' },
  { site: 'Maple Loop 4', range: 'Aug 22', reason: 'Electrical check' },
];

export default function AdminDashboard() {
  return (
    <div className="grid" style={{ gap: 18 }}>
      <div className="section-title">
        <div>
          <h1 style={{ margin: 0 }}>Operations overview</h1>
          <span>Today’s arrivals, departures, and revenue snapshot</span>
        </div>
        <button className="cta">Create manual booking</button>
      </div>

      <Stats />

      <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <ReservationTable />
        <div className="card" style={{ display: 'grid', gap: 12 }}>
          <div className="section-title">
            <div>
              <h2>Blocks & maintenance</h2>
              <span>Site-level holds applied to availability</span>
            </div>
            <button className="cta" style={{ padding: '10px 12px' }}>
              Add block
            </button>
          </div>
          {maintenance.map((item) => (
            <div key={item.site} className="chip" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <CubeIcon />
                <div>
                  <div style={{ fontWeight: 700 }}>{item.site}</div>
                  <div className="small">{item.range}</div>
                </div>
              </div>
              <span className="small">{item.reason}</span>
            </div>
          ))}
          <div className="card" style={{ borderStyle: 'dashed' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <LightningBoltIcon />
              <div>
                <div style={{ fontWeight: 700 }}>Auto-resolve conflicts</div>
                <div className="small">Use OTA sync webhooks to block sites when external reservations arrive.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ display: 'grid', gap: 14 }}>
        <div className="section-title">
          <div>
            <h2>Workflow shortcuts</h2>
            <span>Designed for front desk and mobile staff</span>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
          {[
            {
              title: 'Arrivals today',
              cta: 'Check in guests',
              icon: <PersonIcon />,
              desc: 'Scan QR or search by name to mark as checked in.',
            },
            {
              title: 'Departures',
              cta: 'Check out',
              icon: <CheckCircledIcon />,
              desc: 'Capture notes, damages, and trigger cleaning tasks.',
            },
            {
              title: 'Calendar',
              cta: 'View occupancy',
              icon: <CalendarIcon />,
              desc: 'Heatmap by site type, see gaps and minimum-stay rules.',
            },
          ].map((item) => (
            <div key={item.title} className="card" style={{ padding: 16 }}>
              <div className="chip" style={{ width: 'fit-content' }}>
                {item.icon} {item.title}
              </div>
              <p style={{ color: '#9fb3c8' }}>{item.desc}</p>
              <button className="cta" style={{ padding: '10px 12px' }}>
                {item.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
