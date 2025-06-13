const fs = require('fs');
const path = require('path');

const REGISTRY_URL = process.env.FRACTAL_REGISTRY_URL || 'http://localhost:3001';

const fractals = [
  { id: 'button-fractal', path: 'examples/fractal-app/components/Button.tsx' },
  { id: 'card-fractal', path: 'examples/fractal-app/components/Card.tsx' },
  { id: 'styled-card-fractal', path: 'examples/fractal-app/components/StyledCard.tsx' },
  { id: 'navigation-fractal', path: 'examples/fractal-app/components/Navigation.tsx' },
  { id: 'navigation-demo-fractal', path: 'examples/fractal-app/components/NavigationDemo.tsx' }
];

async function uploadFractal(id, filePath) {
  const source = fs.readFileSync(filePath, 'utf-8');
  
  const response = await fetch(`${REGISTRY_URL}/fractals/${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source })
  });

  if (!response.ok) {
    throw new Error(`Failed to upload ${id}: ${await response.text()}`);
  }

  console.log(`✓ Uploaded ${id}`);
}

async function main() {
  console.log('Uploading fractals to registry...\n');

  for (const { id, path: fractalPath } of fractals) {
    try {
      await uploadFractal(id, path.join(__dirname, '..', fractalPath));
    } catch (error) {
      console.error(`✗ ${id}: ${error.message}`);
    }
  }
}

main().catch(console.error);