import { useRouter } from 'next/router';
import { Fractal } from '@fractal/core';

export default function FractalPage() {
  const router = useRouter();
  const { id } = router.query;
  
  if (!id || typeof id !== 'string') {
    return <div>Loading...</div>;
  }

  return (
    <main className="container">
      <h1>Fractal: {id}</h1>
      <Fractal id={id} />
      
      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }
        h1 {
          font-size: 2rem;
          margin-bottom: 2rem;
        }
      `}</style>
    </main>
  );
}