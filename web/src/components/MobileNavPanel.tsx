import { useState } from 'react';
import { HamburgerMenuIcon, Cross2Icon } from '@radix-ui/react-icons';

const links = [
  { href: '/', label: 'Book a stay' },
  { href: '/events', label: 'Events' },
  { href: '/deals', label: 'Deals' },
  { href: '/guide', label: 'Guide' },
  { href: '/admin', label: 'Admin' },
];

export default function MobileNavPanel() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mobile-nav">
      <button className="ghost" onClick={() => setOpen((p) => !p)} aria-label="Toggle navigation">
        {open ? <Cross2Icon /> : <HamburgerMenuIcon />}
      </button>
      {open && (
        <div className="mobile-nav-panel">
          {links.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
