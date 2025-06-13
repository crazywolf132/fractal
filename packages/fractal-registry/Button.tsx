'use fractal';

import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

export default function Button({ children, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button 
      onClick={onClick}
      className={`btn btn-${variant}`}
    >
      {children}
    </button>
  );
}

export const ButtonGroup = ({ children }: { children: React.ReactNode }) => {
  return <div className="button-group">{children}</div>;
};