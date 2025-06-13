"use fractal";

interface CardProps {
  title: string;
  content: string;
  footer?: React.ReactNode;
}

export default function Card({ title, content, footer }: CardProps) {
  return (
    <>
      <div className="card">
        <h3>{title}</h3>
        <p>{content}</p>
        {footer && <div className="card-footer">{footer}</div>}
      </div>
      <style>{`
        .card {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 16px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          background-color: white;
        }
        .card h3 {
          margin: 0 0 12px 0;
        }
        .card p {
          margin: 0 0 16px 0;
          color: #666;
        }
        .card-footer {
          border-top: 1px solid #eee;
          padding-top: 12px;
        }
      `}</style>
    </>
  );
}