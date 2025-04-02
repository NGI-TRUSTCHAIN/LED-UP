# Testing Strategy

This document outlines the testing approach used in the LEDUP frontend application, including the tools, patterns, and best practices implemented to ensure code quality and reliability.

## Testing Approach

The LEDUP frontend implements a comprehensive testing strategy with multiple levels of testing:

1. **Unit Testing**: Testing individual components, hooks, and utility functions in isolation
2. **Integration Testing**: Testing interactions between related components and features
3. **End-to-End Testing**: Testing complete user flows through the application

This multi-layered approach ensures that issues are caught at the appropriate level, with fast feedback from unit tests and comprehensive coverage from integration and E2E tests.

## Testing Tools

The LEDUP frontend uses the following testing tools:

### Jest

[Jest](https://jestjs.io/) serves as the primary test runner and assertion library for unit and integration tests. The configuration is defined in `jest.config.js`:

```js
// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  rootDir: './',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    // Handle module aliases
    '^@/(.*)$': '<rootDir>/$1',
  },
  transformIgnorePatterns: ['/node_modules/', '^.+\\.module\\.(css|sass|scss)$'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
  collectCoverageFrom: ['features/**/*.{js,jsx,ts,tsx}', '!**/*.d.ts', '!**/node_modules/**'],
};

module.exports = createJestConfig(customJestConfig);
```

### React Testing Library

[React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) is used for testing React components in a way that resembles how users interact with them. This library encourages testing behavior rather than implementation details.

```tsx
// Example of React Testing Library usage in use-did-auth.test.tsx
import { renderHook, act } from '@testing-library/react';
import { useDidAuth } from '@/hooks/use-did-auth';

describe('useDidAuth', () => {
  it('should initialize as not authenticated', () => {
    const { result } = renderHook(() => useDidAuth());

    // Verify initial state
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.did).toBe('');
    expect(result.current.address).toBe('');
  });
});
```

### Playwright

[Playwright](https://playwright.dev/) is used for end-to-end testing, allowing tests to run in real browsers and simulate complete user interactions. The LEDUP application specifically uses Playwright for testing complex user flows, particularly for the ZKP (Zero-Knowledge Proof) features.

```ts
// Example of Playwright test in AgeVerifier.playwright.spec.ts
import { expect, test } from '@playwright/test';

test.describe('Age Verifier', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/circom');

    // The page loads with Age Verifier tab active by default
    await page.waitForSelector('[data-state="active"][role="tabpanel"]');
  });

  test('should render Age Verifier tab', async ({ page }) => {
    await expect(page.locator('h2:has-text("Age Verification")')).toBeVisible();
  });
});
```

## Test Directory Structure

The test files are organized in a structured manner:

```
led-up-fe/
├── __tests__/                   # Top-level tests directory
│   ├── config/                  # Test configuration helpers
│   ├── register-producer.test.tsx  # Component tests
│   ├── use-did-auth.test.tsx    # Hook tests
│   └── zkp/                     # ZKP-specific tests
│       ├── e2e/                 # Playwright E2E tests
│       ├── integration/         # ZKP integration tests
│       └── unit/                # ZKP unit tests
└── features/
    └── data-registry/
        └── tests/               # Feature-specific tests
            └── ipfs-integration.test.ts
```

This structure allows for:

- Centralized configuration and setup
- Feature-specific test organization
- Clear separation between test types

## Unit Testing Patterns

### Component Testing

Components are tested for proper rendering, user interactions, and state management:

```tsx
// Example component test structure
describe('ComponentName', () => {
  it('should render correctly', () => {
    // Test initial rendering
  });

  it('should handle user interactions', () => {
    // Test click, input, and other events
  });

  it('should manage state correctly', () => {
    // Test state changes
  });
});
```

### Hook Testing

Custom hooks are tested using the `renderHook` utility from React Testing Library:

```tsx
// Example from use-did-auth.test.tsx
describe('useDidAuth', () => {
  it('should update localStorage on login and logout', async () => {
    // Setup test mocks...

    const { result } = renderHook(() => useDidAuth());

    // Log in
    await act(async () => {
      await result.current.login();
    });

    // Check token is stored
    expect(localStorageMock.setItem).toHaveBeenCalledWith('led_up_auth_token', 'new-token');

    // Log out
    act(() => {
      result.current.logout();
    });

    // Check token is removed
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('led_up_auth_token');
  });
});
```

### Utility Function Testing

Utility functions are tested with straightforward input/output assertions:

```tsx
// Example utility test pattern
describe('utilityFunction', () => {
  it('should handle valid inputs correctly', () => {
    expect(utilityFunction(validInput)).toEqual(expectedOutput);
  });

  it('should handle edge cases', () => {
    expect(utilityFunction(edgeCaseInput)).toEqual(expectedEdgeCaseOutput);
  });

  it('should throw errors for invalid inputs', () => {
    expect(() => utilityFunction(invalidInput)).toThrow();
  });
});
```

## Integration Testing

Integration tests focus on how different parts of the application work together:

```tsx
// Example from ipfs-integration.test.ts
describe('IPFS Actions', () => {
  describe('uploadToIPFS', () => {
    it('should successfully upload data to IPFS', async () => {
      // Mock response from the API
      const mockResponse = {
        success: true,
        data: {
          cid: 'Qm123456789abcdef',
          size: 1024,
          contentHash: '0x123456789abcdef',
        },
      };

      // Setup the mock to return the response
      mockedFetch.mockResolvedValue(mockResponse);

      // Test data
      const testData = {
        title: 'Test Document',
        content: 'This is test content',
      };

      // Call the function
      const result = await uploadToIPFS(testData, 'test-document.json');

      // Assertions...
    });
  });
});
```

## End-to-End Testing

E2E tests with Playwright cover complete user flows:

```tsx
// Example from ZKP E2E tests
test.describe('Age Verifier', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/circom');
    await page.waitForSelector('[data-state="active"][role="tabpanel"]');
  });

  test('should switch between tabs', async ({ page }) => {
    // Check that we can switch between tabs
    await page.getByRole('tab', { name: /FHIR/ }).click();
    await expect(page.locator('h2:has-text("FHIR")')).toBeVisible();

    await page.getByRole('tab', { name: /Hash Verifier/ }).click();
    await expect(page.locator('h2:has-text("Hash")')).toBeVisible();

    await page.getByRole('tab', { name: /Age Verifier/ }).click();
    await expect(page.locator('h2:has-text("Age")')).toBeVisible();
  });
});
```

## Mocking Strategies

The LEDUP frontend uses several mocking approaches:

### API Mocking

API calls are mocked to prevent actual network requests during tests:

```tsx
// Example API mocking
jest.mock('@/utils/api/did-auth', () => ({
  requestChallenge: jest.fn(),
  authenticate: jest.fn(),
  checkAuth: jest.fn(),
  refreshToken: jest.fn(),
  getOrCreateDid: jest.fn().mockResolvedValue('did:ala:mainnet:0x1234567890123456789012345678901234567890'),
}));
```

### Browser API Mocking

Browser APIs like localStorage are mocked for testing:

```tsx
// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});
```

### React Hook Mocking

React hooks like `useRouter` are mocked for testing component behavior without actual routing:

```tsx
// Mock next/router in jest.setup.ts
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
```

## Running Tests

Tests can be run using the following npm scripts:

```bash
# Run Jest tests
npm run test

# Run Jest tests in watch mode
npm run test:watch

# Run Playwright tests
npm run test:playwright

# Run Playwright tests with UI
npm run test:playwright:ui

# Run Playwright tests in debug mode
npm run test:playwright:debug

# Run specific Playwright tests for ZKP features
npm run test:playwright:zkp
```

## Best Practices

The LEDUP frontend follows these testing best practices:

1. **Test Isolation**: Each test runs in isolation to prevent test interdependence
2. **Clear Test Names**: Test descriptions clearly state what is being tested
3. **Arrange-Act-Assert Pattern**: Tests follow the AAA pattern for clarity
4. **Focus on Behavior**: Tests focus on component behavior rather than implementation details
5. **Comprehensive Coverage**: Critical paths have comprehensive test coverage
6. **Mock External Dependencies**: External services and APIs are properly mocked
7. **Clean Test Setup/Teardown**: Tests properly set up and clean up their environment

## Continuous Integration

Tests are run as part of the CI pipeline to ensure code quality before merging. The Playwright tests in particular help ensure that complex features like ZKP verification continue to work correctly.

## Testing Challenges and Solutions

### ZKP Testing Challenges

Zero-Knowledge Proof operations are computationally intensive, which can make tests slow. The LEDUP frontend addresses this by:

1. **Mocking Proof Generation**: For unit tests, proof generation is mocked
2. **Isolated E2E Tests**: Keeping complete proof generation tests separate in the ZKP test suite
3. **Adjustable Timeouts**: Using longer timeouts for ZKP-specific tests

### React Testing Challenges

React components with complex state or context dependencies can be challenging to test. The LEDUP frontend addresses this by:

1. **Custom Render Functions**: Using custom render functions that provide necessary context providers
2. **Focused Component Tests**: Testing components with minimal dependencies when possible
3. **Integration Tests for Complex Components**: Using integration tests for components with many dependencies

---

**Last Updated:** March 2025  
**Contact:** LED-UP Development Team
