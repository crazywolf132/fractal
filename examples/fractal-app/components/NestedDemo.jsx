"use fractal";

import React from 'react';

// This demonstrates the concept of nested fractals
export default function NestedDemo({ title = "Nested Fractals Demonstration" }) {
  const [loadedFractals, setLoadedFractals] = React.useState({
    button: false,
    card: false,
    styled: false
  });
  
  // Simulate loading fractals
  React.useEffect(() => {
    setTimeout(() => setLoadedFractals(prev => ({ ...prev, button: true })), 500);
    setTimeout(() => setLoadedFractals(prev => ({ ...prev, card: true })), 1000);
    setTimeout(() => setLoadedFractals(prev => ({ ...prev, styled: true })), 1500);
  }, []);
  
  return (
    <div style={{
      backgroundColor: '#f5f5f5',
      padding: '24px',
      borderRadius: '12px',
      minHeight: '400px'
    }}>
      <h3 style={{ margin: '0 0 20px 0', color: '#333', fontSize: '24px' }}>{title}</h3>
      <p style={{ margin: '0 0 24px 0', color: '#666' }}>
        This demonstrates how a parent fractal would load child fractals dynamically.
      </p>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {/* Button fractal placeholder */}
        <div style={{ 
          padding: '20px', 
          backgroundColor: 'white', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          minHeight: '120px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#555' }}>Child Fractal: Button</h4>
          {loadedFractals.button ? (
            <button style={{
              padding: '10px 20px',
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px'
            }} onClick={() => alert('Nested button clicked!')}>
              Nested Button
            </button>
          ) : (
            <div style={{ color: '#999' }}>Loading button fractal...</div>
          )}
        </div>
        
        {/* Card fractal placeholder */}
        <div style={{ 
          padding: '20px', 
          backgroundColor: 'white', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          minHeight: '120px'
        }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#555' }}>Child Fractal: Card</h4>
          {loadedFractals.card ? (
            <div style={{
              padding: '12px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px'
            }}>
              <h5 style={{ margin: '0 0 8px 0', color: '#333' }}>Nested Card</h5>
              <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                This card is loaded inside the parent fractal!
              </p>
            </div>
          ) : (
            <div style={{ color: '#999' }}>Loading card fractal...</div>
          )}
        </div>
      </div>
      
      {/* Styled card fractal placeholder */}
      <div style={{ 
        padding: '20px', 
        backgroundColor: 'white', 
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h4 style={{ margin: '0 0 12px 0', color: '#555' }}>Child Fractal: Styled Card</h4>
        {loadedFractals.styled ? (
          <div style={{
            padding: '16px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '8px',
            color: 'white'
          }}>
            <h5 style={{ margin: '0 0 8px 0' }}>Nested Styled Card</h5>
            <p style={{ margin: 0, fontSize: '14px' }}>
              This demonstrates fractal composition - a parent fractal containing multiple child fractals!
            </p>
          </div>
        ) : (
          <div style={{ color: '#999' }}>Loading styled card fractal...</div>
        )}
      </div>
      
      <div style={{
        marginTop: '24px',
        padding: '16px',
        backgroundColor: '#e3f2fd',
        borderRadius: '8px',
        textAlign: 'center',
        fontSize: '14px',
        color: '#1976d2'
      }}>
        <strong>How it works:</strong> In production, this parent fractal would use the Fractal component
        to dynamically load button-fractal, card-fractal, and styled-card-fractal at runtime.
      </div>
    </div>
  );
}