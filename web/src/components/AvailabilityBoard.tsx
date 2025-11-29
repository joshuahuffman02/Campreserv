import { CheckIcon, LightningBoltIcon, MixerHorizontalIcon, PawIcon } from '@radix-ui/react-icons';

const rows = [
  {
    site: 'Riverbend 12',
    type: 'RV • FHU',
    price: '$72',
    status: 'Available',
    tags: ['50 amp', 'Pull-through'],
  },
  {
    site: 'Maple Loop 7',
    type: 'Tent',
    price: '$39',
    status: '1 night min',
    tags: ['Near bathhouse'],
  },
  {
    site: 'Summit Cabin 2',
    type: 'Cabin',
    price: '$162',
    status: 'Available',
    tags: ['AC + Heat', 'Pets OK'],
  },
  {
    site: 'Lakeside 3',
    type: 'RV • W/E',
    price: '$58',
    status: 'Blocked (maintenance)',
    tags: ['Water', '30 amp'],
  },
];

type Props = {
  selectionLabel?: string;
  dateRange?: string;
};

export default function AvailabilityBoard({ selectionLabel, dateRange }: Props) {
  return (
    <section className="card">
      <div className="section-title">
        <div>
          <h2>Live availability</h2>
          <span>{selectionLabel ?? 'Based on requested dates and filters'}</span>
        </div>
        <div className="chip">
          <MixerHorizontalIcon /> {dateRange ? `Dates: ${dateRange}` : 'Filters applied: RV FHU, Pet friendly, 35ft+'}
        </div>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Site</th>
            <th>Type</th>
            <th>Nightly</th>
            <th>Status</th>
            <th>Details</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.site}>
              <td style={{ fontWeight: 600 }}>{row.site}</td>
              <td className="small">{row.type}</td>
              <td>{row.price}</td>
              <td>
                <span
                  className={`tag ${row.status.startsWith('Available') ? 'success' : row.status.startsWith('Blocked') ? 'warning' : 'muted'}`}
                >
                  <LightningBoltIcon /> {row.status}
                </span>
              </td>
              <td>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {row.tags.map((tag) => (
                    <span key={tag} className="chip">
                      {tag.includes('Pet') ? <PawIcon /> : <CheckIcon />} {tag}
                    </span>
                  ))}
                </div>
              </td>
              <td>
                {row.status.startsWith('Available') && (
                  <button className="cta" style={{ padding: '10px 12px' }}>
                    Reserve
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
