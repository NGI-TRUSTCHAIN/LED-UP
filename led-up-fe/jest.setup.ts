// Learn more: https://github.com/testing-library/jest-dom

import '@testing-library/jest-dom/jest-globals';
import '@testing-library/jest-dom';

// Mock the global fetch
global.fetch = jest.fn();

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    pathname: '/',
    route: '/',
    query: {},
    asPath: '/',
  }),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock global fetch
global.fetch = jest.fn();

// Mock snarkjs
jest.mock('snarkjs', () => ({
  fullProve: jest.fn(),
  verify: jest.fn(),
}));
