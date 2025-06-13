"use fractal";

interface StyledCardProps {
  title: string;
  content: string;
  theme?: 'light' | 'dark';
}

export default function StyledCard({ title, content, theme = 'light' }: StyledCardProps) {
  return (
    <div className={`card ${theme}`}>
      <h2>{title}</h2>
      <p>{content}</p>
      <button className="card-button">Learn More</button>
      
      <style>{`
        .card {
          border-radius: 12px;
          padding: 24px;
          margin: 16px 0;
          transition: all 0.3s ease;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .card.light {
          background: #ffffff;
          color: #333333;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .card.dark {
          background: #1a1a1a;
          color: #ffffff;
          box-shadow: 0 4px 6px rgba(255, 255, 255, 0.1);
        }
        .card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
        }
        .card h2 {
          margin: 0 0 12px 0;
          font-size: 24px;
          font-weight: 600;
        }
        .card p {
          margin: 0 0 20px 0;
          line-height: 1.6;
          opacity: 0.9;
        }
        .card-button {
          background: #0070f3;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 10px 20px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .card-button:hover {
          background: #0051cc;
        }
        .card.dark .card-button {
          background: #ffffff;
          color: #1a1a1a;
        }
        .card.dark .card-button:hover {
          background: #f0f0f0;
        }
      `}</style>
    </div>
  );
}