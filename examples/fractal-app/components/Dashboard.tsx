"use fractal";

import React from 'react';

interface DashboardProps {
  title?: string;
  userName?: string;
}

export default function Dashboard({ title = "Dashboard", userName = "User" }: DashboardProps) {
  return (
    <div style={{
      padding: '24px',
      backgroundColor: '#f5f5f5',
      borderRadius: '12px',
      minHeight: '400px'
    }}>
      <div style={{
        marginBottom: '24px',
        borderBottom: '2px solid #e0e0e0',
        paddingBottom: '16px'
      }}>
        <h1 style={{ margin: 0, color: '#333' }}>{title}</h1>
        <p style={{ margin: '8px 0 0 0', color: '#666' }}>
          Welcome back, {userName}!
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        {/* Stats Card - Another fractal */}
        <div id="stats-card-container" style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#555' }}>Statistics</h3>
          <div style={{ color: '#888' }}>
            Stats component will load here...
          </div>
        </div>

        {/* Activity Feed */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#555' }}>Recent Activity</h3>
          <ul style={{ margin: 0, padding: '0 0 0 20px', color: '#666' }}>
            <li>User logged in at 9:00 AM</li>
            <li>Report generated at 10:30 AM</li>
            <li>Settings updated at 11:15 AM</li>
            <li>New message received at 2:00 PM</li>
          </ul>
        </div>

        {/* Quick Actions */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#555' }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button style={{
              padding: '10px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              Create Report
            </button>
            <button style={{
              padding: '10px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              Add User
            </button>
            <button style={{
              padding: '10px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              View Settings
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        marginTop: '32px',
        paddingTop: '24px',
        borderTop: '1px solid #e0e0e0',
        textAlign: 'center',
        color: '#999',
        fontSize: '14px'
      }}>
        Dashboard Fractal Component - Loading nested fractals dynamically
      </div>
    </div>
  );
}