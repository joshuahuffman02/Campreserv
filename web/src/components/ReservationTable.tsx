import { CheckCircledIcon, ClockIcon, ReloadIcon } from '@radix-ui/react-icons';

const reservations = [
  {
    name: 'Alex Morgan',
    site: 'Riverbend 12',
    dates: 'Aug 14 → Aug 18',
    status: 'Arriving today',
    payment: 'Paid',
  },
  {
    name: 'Priya Patel',
    site: 'Summit Cabin 2',
    dates: 'Aug 12 → Aug 15',
    status: 'In house',
    payment: 'Authorized',
  },
  {
    name: 'Jason Lee',
    site: 'Maple Loop 7',
    dates: 'Aug 13 → Aug 16',
    status: 'Departing tomorrow',
    payment: 'Paid',
  },
  {
    name: 'Taylor Brooks',
    site: 'Lakeside 3',
    dates: 'Aug 20 → Aug 22',
    status: 'Maintenance block',
    payment: 'N/A',
  },
];

export default function ReservationTable() {
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div className="section-title">
        <div>
          <h2>Reservations</h2>
          <span>Quick actions: check-in, adjust vehicles, resend confirmation</span>
        </div>
        <button className="cta" style={{ padding: '10px 12px' }}>
          Export CSV
        </button>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Guest</th>
            <th>Site</th>
            <th>Dates</th>
            <th>Status</th>
            <th>Payment</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((res) => (
            <tr key={res.name}>
              <td style={{ fontWeight: 600 }}>{res.name}</td>
              <td className="small">{res.site}</td>
              <td>{res.dates}</td>
              <td>
                <span className={`tag ${res.status.includes('Arriving') ? 'success' : 'muted'}`}>
                  <ClockIcon /> {res.status}
                </span>
              </td>
              <td>
                <span className={`tag ${res.payment === 'Paid' ? 'success' : res.payment === 'Authorized' ? 'warning' : 'muted'}`}>
                  <CheckCircledIcon /> {res.payment}
                </span>
              </td>
              <td>
                <button className="cta" style={{ padding: '10px 12px' }}>
                  {res.payment === 'N/A' ? 'Edit block' : 'Check in'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="chip" style={{ justifyContent: 'space-between', marginTop: 12 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <ReloadIcon />
          <span className="small">Sync with Stripe webhooks to reconcile payments in real time.</span>
        </div>
        <button className="cta" style={{ padding: '8px 10px' }}>
          Trigger sync
        </button>
      </div>
    </div>
  );
}
