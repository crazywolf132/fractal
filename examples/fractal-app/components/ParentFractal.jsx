"use fractal";

import React from 'react';

// Parent fractal that orchestrates child fractals
export default function ParentFractal({ title = "Parent Fractal Container" }) {
  const [selectedMetric, setSelectedMetric] = React.useState('revenue');
  const [theme, setTheme] = React.useState('light');
  
  // This demonstrates how a parent fractal would coordinate child fractals
  const metrics = {
    revenue: { label: 'Revenue', value: '$125,432', change: '+23%', color: '#28a745' },
    users: { label: 'Active Users', value: '8,234', change: '+156', color: '#007bff' },
    performance: { label: 'Uptime', value: '99.98%', change: '+0.02%', color: '#6f42c1' }
  };
  
  const currentMetric = metrics[selectedMetric];
  
  return (
    <div style={{
      backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f8f9fa',
      color: theme === 'dark' ? '#fff' : '#333',
      padding: '32px',
      borderRadius: '12px',
      minHeight: '500px',
      transition: 'all 0.3s ease'
    }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 8px 0' }}>{title}</h2>
        <p style={{ margin: 0, opacity: 0.8 }}>
          This parent fractal coordinates multiple child components
        </p>
      </div>
      
      {/* Theme Toggle */}
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          style={{
            padding: '8px 16px',
            backgroundColor: theme === 'dark' ? '#fff' : '#333',
            color: theme === 'dark' ? '#333' : '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Toggle Theme
        </button>
      </div>
      
      {/* Metric Selector - Child Component 1 */}
      <div style={{
        backgroundColor: theme === 'dark' ? '#2a2a2a' : 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h4 style={{ margin: '0 0 16px 0' }}>Child Component: Metric Selector</h4>
        <div style={{ display: 'flex', gap: '8px' }}>
          {Object.keys(metrics).map((key) => (
            <button
              key={key}
              onClick={() => setSelectedMetric(key)}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: selectedMetric === key ? '#0070f3' : 'transparent',
                color: selectedMetric === key ? 'white' : (theme === 'dark' ? '#fff' : '#333'),
                border: `1px solid ${selectedMetric === key ? '#0070f3' : '#ddd'}`,
                borderRadius: '6px',
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.2s'
              }}
            >
              {key}
            </button>
          ))}
        </div>
      </div>
      
      {/* Metric Display - Child Component 2 */}
      <div style={{
        backgroundColor: theme === 'dark' ? '#2a2a2a' : 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h4 style={{ margin: '0 0 16px 0' }}>Child Component: Metric Display</h4>
        <div style={{
          padding: '20px',
          backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f8f9fa',
          borderRadius: '8px',
          borderLeft: `4px solid ${currentMetric.color}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '14px', opacity: 0.7, marginBottom: '8px' }}>
            {currentMetric.label}
          </div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px' }}>
            {currentMetric.value}
          </div>
          <div style={{ fontSize: '16px', color: currentMetric.color }}>
            {currentMetric.change}
          </div>
        </div>
      </div>
      
      {/* Action Panel - Child Component 3 */}
      <div style={{
        backgroundColor: theme === 'dark' ? '#2a2a2a' : 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h4 style={{ margin: '0 0 16px 0' }}>Child Component: Actions</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <button style={{
            padding: '12px',
            backgroundColor: currentMetric.color,
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}>
            Export {currentMetric.label}
          </button>
          <button style={{
            padding: '12px',
            backgroundColor: 'transparent',
            color: theme === 'dark' ? '#fff' : '#333',
            border: `1px solid ${theme === 'dark' ? '#555' : '#ddd'}`,
            borderRadius: '6px',
            cursor: 'pointer'
          }}>
            View Details
          </button>
        </div>
      </div>
      
      <div style={{
        marginTop: '24px',
        padding: '16px',
        backgroundColor: theme === 'dark' ? '#2a2a2a' : '#e8f4f8',
        borderRadius: '8px',
        textAlign: 'center',
        fontSize: '14px',
        opacity: 0.8
      }}>
        <strong>Parent-Child Communication:</strong> The parent fractal manages state and passes it to child components.
        In production, each section would be a separate fractal loaded dynamically.
      </div>
    </div>
  );
}