'use client';

import dynamic from 'next/dynamic';

// Export all components with dynamic loading and better error handling
export const AgeVerifier = dynamic(() => import('./AgeVerifier'), {
  ssr: false,
  loading: () => null,
});

export const FhirVerifier = dynamic(() => import('./FhirVerifier'), {
  ssr: false,
  loading: () => null,
});

export const HashVerifier = dynamic(() => import('./HashVerifier'), {
  ssr: false,
  loading: () => null,
});

export { default as CircuitCard } from './CircuitCard';
