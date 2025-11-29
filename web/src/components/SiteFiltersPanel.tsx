import { useState } from 'react';
import { MixerHorizontalIcon, LightningBoltIcon, PawIcon, RulerHorizontalIcon } from '@radix-ui/react-icons';

export type Filters = {
  dates: string;
  siteType?: string;
  petFriendly?: boolean;
  length?: number;
  electric?: string;
};

export default function SiteFiltersPanel({ onApply }: { onApply: (f: Filters) => void }) {
  const [filters, setFilters] = useState<Filters>({ dates: 'Jul 12 – Jul 14' });

  const update = (patch: Partial<Filters>) => setFilters((prev) => ({ ...prev, ...patch }));

  return (
    <div className="card" style={{ display: 'grid', gap: 14 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <MixerHorizontalIcon /> <strong>Fine-tune your stay</strong>
      </div>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <label className="stack">
          <span className="small">Dates</span>
          <input
            className="input"
            value={filters.dates}
            onChange={(e) => update({ dates: e.target.value })}
            placeholder="Jul 12 – Jul 14"
          />
        </label>
        <label className="stack">
          <span className="small">Site type</span>
          <select className="input" onChange={(e) => update({ siteType: e.target.value })}>
            <option value="">Any</option>
            <option value="rv">RV Full Hookup</option>
            <option value="glamping">Glamping</option>
            <option value="cabins">Cabins</option>
          </select>
        </label>
        <label className="stack">
          <span className="small">Rig length (ft)</span>
          <input
            className="input"
            type="number"
            min={0}
            placeholder="34"
            onChange={(e) => update({ length: Number(e.target.value) })}
          />
        </label>
        <label className="stack">
          <span className="small">Electric</span>
          <select className="input" onChange={(e) => update({ electric: e.target.value })}>
            <option value="">Any</option>
            <option value="20">20A</option>
            <option value="30">30A</option>
            <option value="50">50A</option>
          </select>
        </label>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <button className="ghost" onClick={() => update({ petFriendly: !filters.petFriendly })}>
          <PawIcon /> {filters.petFriendly ? 'Pet friendly' : 'Pets optional'}
        </button>
        <button className="ghost" onClick={() => onApply(filters)}>
          <LightningBoltIcon /> Apply filters
        </button>
        <div className="chip" style={{ background: 'rgba(209,120,47,0.15)', color: '#f1b43c' }}>
          <RulerHorizontalIcon /> Saved for mobile search
        </div>
      </div>
    </div>
  );
}
