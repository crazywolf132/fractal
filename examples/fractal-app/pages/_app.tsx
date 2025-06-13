import type { AppProps } from 'next/app';
import { FractalProvider } from '@fractal/core';
import '../lib/setup-fractals';

const REGISTRY_URL = process.env.NEXT_PUBLIC_FRACTAL_REGISTRY_URL || 'http://localhost:3001';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <FractalProvider registry={REGISTRY_URL}>
      <Component {...pageProps} />
    </FractalProvider>
  );
}