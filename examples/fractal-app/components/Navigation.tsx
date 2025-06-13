"use fractal";

import { useRouter } from 'next/router';

interface NavigationProps {
  links: Array<{
    href: string;
    label: string;
  }>;
}

export default function Navigation({ links }: NavigationProps) {
  const router = useRouter();

  return (
    <nav style={{ padding: '1rem', backgroundColor: '#f8f9fa' }}>
      <ul style={{ listStyle: 'none', display: 'flex', gap: '1rem', margin: 0, padding: 0 }}>
        {links.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                router.push(link.href);
              }}
              style={{
                color: router.pathname === link.href ? '#007bff' : '#333',
                textDecoration: 'none',
                fontWeight: router.pathname === link.href ? 'bold' : 'normal',
              }}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}