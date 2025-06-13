import { Fractal, useFractal } from '@fractal/core';
import { useState } from 'react';

const Section = ({ title, description, children }: any) => (
  <section>
    <h2>{title}</h2>
    <p>{description}</p>
    {children}
    <style jsx>{`
      section {
        margin-bottom: 3rem;
      }
      h2 {
        font-size: 1.5rem;
        margin-bottom: 0.5rem;
      }
      p {
        color: #666;
        margin-bottom: 1.5rem;
      }
    `}</style>
  </section>
);

export default function ComposeDemoPage() {
  const [showAlternate, setShowAlternate] = useState(false);
  const button = useFractal('button-fractal');
  const card = useFractal('card-fractal');
  const styledCard = useFractal('styled-card-fractal');
  
  return (
    <main>
      <h1>Fractal Composition Demo</h1>
      
      <Section title="1. Multiple Fractals" description="Load multiple fractals and compose them manually">
        <div className="demo-box flex">
          {button && <button.Component text="Composed Button" onClick={() => alert('Button clicked!')} />}
          {card && <card.Component title="Composed Card" content="This demonstrates fractal composition" />}
          {styledCard && <styledCard.Component title="Styled Card" content="With isolated styles" theme="light" />}
        </div>
      </Section>
      
      <Section title="2. Conditional Loading" description="Load different fractals based on conditions">
        <button onClick={() => setShowAlternate(!showAlternate)} className="toggle-btn">
          Toggle Component
        </button>
        <div className="demo-box">
          <Fractal 
            id={showAlternate ? "styled-card-fractal" : "card-fractal"}
            props={showAlternate ? 
              { title: "Alternative Card", content: "This is the styled version", theme: "dark" } :
              { title: "Default Card", content: "This is the regular version" }
            }
          />
        </div>
      </Section>
      
      <Section title="3. With Custom Wrapper" description="Wrap fractals with custom styling">
        <div className="custom-wrapper">
          <h3>Enhanced Navigation</h3>
          <Fractal id="navigation-demo-fractal" props={{ title: "With Custom Wrapper" }} />
        </div>
      </Section>
      
      <Section title="4. Standard Usage" description="Regular fractal component for comparison">
        <div className="demo-box">
          <Fractal id="navigation-demo-fractal" props={{ title: "Standard Navigation Demo" }} />
        </div>
      </Section>
      
      <Section title="5. Multiple Instances" description="Same component with different props">
        <div className="flex">
          <Fractal id="button-fractal" props={{ text: "Primary", onClick: () => alert('Primary!') }} />
          <Fractal id="button-fractal" props={{ text: "Secondary", onClick: () => alert('Secondary!') }} />
          <Fractal id="button-fractal" props={{ text: "Tertiary", onClick: () => alert('Tertiary!') }} />
        </div>
      </Section>
      
      <Section title="6. Nested Fractals Demo" description="A fractal that loads other fractals inside it">
        <div className="demo-box">
          <Fractal 
            id="nested-demo-fractal" 
            props={{ 
              title: "Fractal Composition Demo"
            }}
            fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Loading nested fractal container...</div>}
          />
        </div>
      </Section>
      
      <Section title="7. Parent-Child Fractals" description="Advanced fractal orchestration with state management">
        <div className="demo-box">
          <Fractal 
            id="parent-fractal" 
            props={{ 
              title: "Advanced Fractal Orchestration"
            }}
            fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Loading parent fractal...</div>}
          />
        </div>
      </Section>

      <style jsx>{`
        main {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }
        h1 {
          font-size: 2.5rem;
          margin-bottom: 3rem;
        }
        .demo-box {
          border: 1px solid #e5e7eb;
          padding: 1.5rem;
          border-radius: 8px;
        }
        .flex {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
        }
        .toggle-btn {
          padding: 0.75rem 1.5rem;
          background: ${showAlternate ? '#333' : '#0070f3'};
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          margin-bottom: 1.5rem;
          font-size: 1rem;
          transition: background 0.2s;
        }
        .toggle-btn:hover {
          opacity: 0.9;
        }
        .custom-wrapper {
          border: 2px solid #0070f3;
          border-radius: 8px;
          padding: 1.5rem;
          background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
        }
        .custom-wrapper h3 {
          margin: 0 0 1rem 0;
          color: #0070f3;
        }
      `}</style>
    </main>
  );
}