import { useState } from 'react';
import { faqs } from '../data/mockData';
import { ChevronDownIcon } from '@radix-ui/react-icons';

export default function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState(0);
  return (
    <div className="card" style={{ display: 'grid', gap: 10 }}>
      <div className="section-title">
        <div>
          <h2 style={{ margin: 0 }}>FAQs</h2>
          <span>Policies and booking clarity for guests</span>
        </div>
      </div>
      <div className="accordion">
        {faqs.map((item, idx) => (
          <details key={item.q} open={idx === openIndex} onClick={() => setOpenIndex(idx)}>
            <summary>
              <span>{item.q}</span>
              <ChevronDownIcon />
            </summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
