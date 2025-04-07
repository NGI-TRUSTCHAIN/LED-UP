# ZKP Playwright Tests

This directory contains end-to-end tests for Zero-Knowledge Proof (ZKP) components using Playwright.

## Overview

These tests verify the functionality and user experience of ZKP-related components in the LED-UP frontend. The tests cover:

1. Age verification circuits
2. Hash verification circuits
3. FHIR resource verification circuits
4. Proof generation and verification utilities

## Test Structure

- `AgeVerifier.playwright.spec.ts`: Tests for age verification component
- `HashVerifier.playwright.spec.ts`: Tests for hash verification component
- `FhirVerifier.playwright.spec.ts`: Tests for FHIR resource verification component
- `ZkpProofUtils.playwright.spec.ts`: Tests for ZKP proof generation and verification utilities

## Prerequisites

Before running these tests, ensure:

1. Playwright is installed: `yarn add -D @playwright/test`
2. Browsers are installed: `npx playwright install`
3. Circuit files are set up: `yarn setup-circuits`

## Running Tests

You can run the ZKP Playwright tests using the following commands:

```bash
# Run all ZKP tests
yarn test:playwright:zkp

# Run with UI
yarn test:playwright:ui

# Run in debug mode
yarn test:playwright:debug
```

## Test Environment

These tests assume:

1. The development server is running (or will be started by Playwright)
2. ZKP circuit files are properly set up in the `/public/circuits` directory
3. The `/zkp/*` routes are available in the application

## Common Issues

### Missing Circuit Files

If tests fail with errors about missing circuit files, ensure:

1. You've run `yarn setup-circuits` before starting the tests
2. Circuit output files exist in the `/circuits/out-files` directory
3. The `setupCircuits.js` script correctly copied files to `/public/circuits`

### Performance Issues

ZKP operations can be computationally intensive. If tests timeout:

1. Increase the timeout values in the test files
2. Consider running tests with fewer parallel workers: `playwright test --workers=1`

## Adding New Tests

When adding new tests:

1. Follow the pattern in existing test files
2. Mock complex ZKP operations where appropriate
3. Balance thoroughness with test runtime
4. Use appropriate timeouts for proof generation steps
