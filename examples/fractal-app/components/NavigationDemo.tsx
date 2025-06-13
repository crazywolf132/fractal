"use fractal";

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface NavigationDemoProps {
  title?: string;
}

export default function NavigationDemo({ title = "Navigation Demo" }: NavigationDemoProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleAddParam = () => {
    const params = new URLSearchParams(searchParams);
    params.set('demo', 'true');
    params.set('timestamp', Date.now().toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const NavButton = ({ label, onClick, variant }: any) => (
    <button className={`nav-btn nav-btn-${variant}`} onClick={onClick}>
      {label}
    </button>
  );

  return (
    <>
      <div className="nav-demo">
        <h3>{title}</h3>
        
        <div className="info">
          <strong>Current Path:</strong> {pathname}
        </div>
        
        <div className="info">
          <strong>Search Params:</strong> {searchParams.toString() || 'none'}
        </div>

        <div className="nav-buttons">
          <NavButton label="Go Home" onClick={() => router.push('/')} variant="primary" />
          <NavButton label="Go to Fractal Page" onClick={() => router.push('/fractal/navigation-demo-fractal')} variant="success" />
          <NavButton label="Add Query Params" onClick={handleAddParam} variant="secondary" />
          <NavButton label="Go Back" onClick={() => router.back()} variant="danger" />
          <NavButton label="Reload Page" onClick={() => window.location.reload()} variant="warning" />
        </div>
      </div>
      
      <style>{`
        .nav-demo {
          padding: 20px;
          border: 2px solid #0070f3;
          border-radius: 8px;
          background-color: #f0f8ff;
        }
        .nav-demo h3 {
          margin: 0 0 15px 0;
        }
        .info {
          margin-bottom: 15px;
        }
        .nav-buttons {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .nav-btn {
          padding: 8px 16px;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .nav-btn:hover {
          opacity: 0.9;
        }
        .nav-btn-primary { background-color: #0070f3; }
        .nav-btn-success { background-color: #28a745; }
        .nav-btn-secondary { background-color: #6c757d; }
        .nav-btn-danger { background-color: #dc3545; }
        .nav-btn-warning { background-color: #ffc107; color: black; }
      `}</style>
    </>
  );
}