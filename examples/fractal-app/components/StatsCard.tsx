"use fractal";

import React from 'react';

interface Stat {
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
}

interface StatsCardProps {
  stats?: Stat[];
}

const defaultStats: Stat[] = [
  { label: 'Total Users', value: '1,234', change: '+12%', changeType: 'positive' },
  { label: 'Active Sessions', value: '89', change: '+5%', changeType: 'positive' },
  { label: 'Response Time', value: '45ms', change: '-10%', changeType: 'positive' },
  { label: 'Error Rate', value: '0.02%', change: '+0.01%', changeType: 'negative' }
];

export default function StatsCard({ stats = defaultStats }: StatsCardProps) {
  const getChangeColor = (type?: string) => {
    switch (type) {
      case 'positive': return '#28a745';
      case 'negative': return '#dc3545';
      default: return '#6c757d';
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '16px'
      }}>
        {stats.map((stat, index) => (
          <div key={index} style={{
            padding: '12px',
            backgroundColor: '#f8f9fa',
            borderRadius: '6px',
            borderLeft: `3px solid ${getChangeColor(stat.changeType)}`
          }}>
            <div style={{
              fontSize: '12px',
              color: '#666',
              marginBottom: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {stat.label}
            </div>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '4px'
            }}>
              {stat.value}
            </div>
            {stat.change && (
              <div style={{
                fontSize: '12px',
                color: getChangeColor(stat.changeType),
                fontWeight: '500'
              }}>
                {stat.change}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div style={{
        marginTop: '16px',
        paddingTop: '16px',
        borderTop: '1px solid #e0e0e0',
        fontSize: '12px',
        color: '#999',
        textAlign: 'center'
      }}>
        StatsCard Fractal - Nested inside Dashboard
      </div>
    </div>
  );
}