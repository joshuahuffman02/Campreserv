import { TicketIcon, CodeIcon, LightningBoltIcon } from '@radix-ui/react-icons';
import { sampleDeals } from '../data/mockData';

export default function DealStrip() {
  return (
    <div className="card" style={{ display: 'grid', gap: 12 }}>
      <div className="section-title">
        <div>
          <h2 style={{ margin: 0 }}>Deals & promo codes</h2>
          <span>Copy-ready promos you can apply during checkout</span>
        </div>
        <button className="ghost" aria-label="View all deals">
          <LightningBoltIcon /> View all
        </button>
      </div>
      <div className="deal-strip">
        {sampleDeals.map((deal) => (
          <div key={deal.id} className="deal-card">
            <div className="deal-meta">
              <span className="chip subtle">{deal.badge ?? 'Deal'}</span>
              {deal.featured && <span className="chip" style={{ background: 'rgba(209,120,47,0.2)' }}>Featured</span>}
            </div>
            <h3 style={{ margin: '8px 0 4px' }}>{deal.title}</h3>
            <p className="small" style={{ margin: '0 0 10px' }}>{deal.description}</p>
            <div className="deal-actions">
              <span className="chip">
                <CodeIcon /> {deal.code ?? 'Auto applied'}
              </span>
              <button className="ghost">
                <TicketIcon /> Apply
              </button>
            </div>
            <div className="small">
              {deal.startDate} → {deal.endDate}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
