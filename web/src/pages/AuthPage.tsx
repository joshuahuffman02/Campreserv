import { LockClosedIcon, PersonIcon } from '@radix-ui/react-icons';

export default function AuthPage() {
  return (
    <div className="grid" style={{ gap: 16, maxWidth: 720, margin: '0 auto' }}>
      <div className="card" style={{ display: 'grid', gap: 12 }}>
        <div className="section-title">
          <div>
            <h1 style={{ margin: 0 }}>Access the console</h1>
            <span>JWT-based auth with guest checkout tokens supported</span>
          </div>
        </div>
        <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          <div className="card" style={{ padding: 16 }}>
            <div className="chip" style={{ width: 'fit-content' }}>
              <PersonIcon /> Staff / Admin
            </div>
            <input className="input" placeholder="Email" defaultValue="manager@lakeside.com" />
            <input className="input" placeholder="Password" type="password" defaultValue="••••••" />
            <button className="cta">Login</button>
            <p className="small">Uses /auth/login. Roles: admin, staff, guest.</p>
          </div>
          <div className="card" style={{ padding: 16 }}>
            <div className="chip" style={{ width: 'fit-content' }}>
              <LockClosedIcon /> Guest checkout
            </div>
            <p className="small">
              Issue short-lived tokens for guests who book without an account. Encourage account creation after payment so
              they can edit rigs, arrival times, or request changes.
            </p>
            <button className="cta">Send magic link</button>
          </div>
        </div>
      </div>
    </div>
  );
}
