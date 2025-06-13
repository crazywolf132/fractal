"use fractal";

interface ButtonProps {
  text: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

export default function Button({ text, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <>
      <button className={`btn btn-${variant}`} onClick={onClick}>
        {text}
      </button>
      <style>{`
        .btn {
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          border: none;
          transition: opacity 0.2s;
        }
        .btn:hover {
          opacity: 0.9;
        }
        .btn-primary {
          background-color: #007bff;
          color: white;
        }
        .btn-secondary {
          background-color: #6c757d;
          color: white;
        }
      `}</style>
    </>
  );
}