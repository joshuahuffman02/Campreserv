import { CalendarIcon, CheckCircledIcon, TimerIcon } from '@radix-ui/react-icons';

const steps = [
  {
    title: 'Pick dates & filters',
    detail: 'We respect minimum stays, blackout dates, and site-specific buffers.',
    icon: <CalendarIcon />,
  },
  {
    title: 'Reserve + pay securely',
    detail: 'Stripe Payment Intents with instant confirmation or auth + capture.',
    icon: <TimerIcon />,
  },
  {
    title: 'Self-serve portal',
    detail: 'Guests can edit details, add vehicle info, or request changes.',
    icon: <CheckCircledIcon />,
  },
];

export default function Timeline() {
  return (
    <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
      {steps.map((step) => (
        <div key={step.title} className="chip" style={{ alignItems: 'flex-start' }}>
          <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(110,231,183,0.12)', display: 'grid', placeItems: 'center' }}>
            {step.icon}
          </div>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>{step.title}</div>
            <div className="small">{step.detail}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
