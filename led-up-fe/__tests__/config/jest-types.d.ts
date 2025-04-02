import { SpyInstance } from 'jest-mock';
import '@testing-library/jest-dom';

declare global {
  namespace jest {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type Mock<T = any, Y extends any[] = any[]> = jest.MockInstance<T, Y>;
    function fn<T = any>(): jest.Mock<T>;
    function fn<T, Y extends any[]>(implementation?: (...args: Y) => T): jest.Mock<T, Y>;
    function spyOn<T extends {}, M extends keyof T>(
      object: T,
      method: M
    ): SpyInstance<T[M], T extends jest.Constructable ? InstanceType<T> : T>;
    function mock(moduleName: string, factory?: any, options?: any): typeof jest;
    function clearAllMocks(): typeof jest;
    function resetAllMocks(): typeof jest;
    function restoreAllMocks(): typeof jest;
  }

  interface Window {
    matchMedia(query: string): MediaQueryList;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const __TEST_CONSTANTS__: Record<string, any>;
}

// Augment TypeScript's Response interface to make it more flexible for testing
interface Response {
  ok: boolean;
  status?: number;
  json(): Promise<any>;
  text(): Promise<string>;
}

// Add custom matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeWithinRange(floor: number, ceiling: number): R;
    }
  }
}
