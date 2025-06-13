import React, { useEffect } from 'react';
import { Fractal } from '@fractal/core';

export default function DashboardWrapper() {
  useEffect(() => {
    // This demonstrates that the parent component can interact with the fractal
    console.log('DashboardWrapper mounted - will load Dashboard fractal');
  }, []);

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>Dashboard Fractal Demo</h2>
      <p style={{ marginBottom: '20px', color: '#666' }}>
        This demonstrates a fractal (Dashboard) that loads another fractal (StatsCard) inside it.
      </p>
      
      {/* Load the Dashboard fractal */}
      <Fractal
        id="fractal-demo-app::Dashboard::0.1.0"
        props={{
          title: "My Analytics Dashboard",
          userName: "John Doe"
        }}
        fallback={<div>Loading Dashboard...</div>}
      />

      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
        <h3>How this works:</h3>
        <ol>
          <li>The DashboardWrapper component loads the Dashboard fractal</li>
          <li>The Dashboard fractal renders its own content (title, activity feed, quick actions)</li>
          <li>The Dashboard fractal has a placeholder for the StatsCard fractal</li>
          <li>We'll inject the StatsCard fractal into the Dashboard after it loads</li>
        </ol>
      </div>
    </div>
  );
}