import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Test fetching fractal metadata
    const metaResponse = await fetch('http://localhost:3001/fractals/button-fractal');
    const metadata = await metaResponse.json();
    
    // Test fetching fractal code
    const codeResponse = await fetch(metadata.url);
    const code = await codeResponse.text();
    
    res.status(200).json({
      success: true,
      metadata,
      codeLength: code.length,
      codePreview: code.substring(0, 200) + '...'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}