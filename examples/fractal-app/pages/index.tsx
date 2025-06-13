import { Fractal } from '@fractal/core';
import Link from 'next/link';

const Demo = ({ title, id, props, children }: any) => (
  <section className="demo">
    <h3>{title}</h3>
    <Fractal id={id} props={props} fallback={<span>Loading...</span>} />
    <style jsx>{`
      .demo {
        margin: 2rem 0;
        padding: 1.5rem;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
      }
      .demo h3 {
        margin: 0 0 1rem 0;
        font-size: 1.25rem;
      }
    `}</style>
  </section>
);

export default function Home() {
  return (
    <main className="container">
      <h1>Fractal Demo</h1>
      <p>This app demonstrates the fractal module federation system.</p>
      
      <Link href="/compose" className="jsx-2f2aff2535b73bf6 cta">
        Component Composition Demo →
      </Link>
      
      <h2>Remote Fractal Components</h2>
      
      <Demo 
        title="Button Fractal" 
        id="button-fractal"
        props={{ text: 'Click Me!', onClick: () => alert('Fractal clicked!') }}
      />

      <Demo 
        title="Card Fractal" 
        id="card-fractal"
        props={{ title: 'Dynamic Card', content: 'This card was loaded at runtime!' }}
      />

      <Demo 
        title="Styled Card - Light Theme" 
        id="styled-card-fractal"
        props={{ 
          title: 'Isolated Styles', 
          content: 'This component has its own styles that don\'t affect the rest of the page!',
          theme: 'light'
        }}
      />
      
      <Demo 
        title="Styled Card - Dark Theme" 
        id="styled-card-fractal"
        props={{ 
          title: 'Dark Theme Card', 
          content: 'Same component, different theme - all styles are isolated!',
          theme: 'dark'
        }}
      />

      <Demo 
        title="Navigation Demo (Next.js Integration)" 
        id="navigation-demo-fractal"
        props={{ title: 'Next.js Navigation Features' }}
      />

      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }
        h1 {
          font-size: 3rem;
          margin-bottom: 0.5rem;
        }
        h2 {
          font-size: 2rem;
          margin: 3rem 0 1rem;
        }
        .cta {
          display: inline-block;
          margin: 2rem 0;
          padding: 1rem 2rem;
          background: #0070f3;
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          transition: background 0.2s;
        }
        .cta:hover {
          background: #0051cc;
        }
      `}</style>
    </main>
  );
}