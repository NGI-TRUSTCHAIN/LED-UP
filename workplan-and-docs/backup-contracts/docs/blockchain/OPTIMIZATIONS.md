# Contract Optimizations

## Overview

This document summarizes the optimizations made to the `DidRegistry.sol` and `Consent.sol` contracts to address the "Stack too deep" error and improve gas efficiency.

## DidRegistry Optimizations

### 1. Storage Optimization

- Replaced string-based DID storage with `bytes32` hashes for more efficient lookups
- Added a reverse mapping from hash to DID string for efficient lookups in both directions
- Implemented helper functions to extract and validate DID components

### 2. Function Refactoring

- Split complex functions into smaller, focused helper functions
- Reduced the number of local variables in functions to avoid stack depth issues
- Optimized string operations to minimize gas costs

### 3. Caching and Lazy Loading

- Implemented caching for frequently accessed data
- Used lazy loading patterns to avoid unnecessary storage operations

## Consent Contract Optimizations

### 1. Storage Optimization

- Replaced string-based DID mappings with `bytes32` hash-based mappings
- Maintained original DIDs as strings for event emission and external interfaces
- Added caching for address to DID conversion to avoid repeated string operations

### 2. Function Refactoring

- Created a helper function `getOrCreateDid` to handle DID creation and caching
- Optimized consent lookup by using hash-based mappings
- Reduced the number of local variables in functions

### 3. Gas Efficiency

- Minimized storage operations by using hash-based lookups
- Cached frequently used values to avoid recomputation
- Optimized string operations and address conversions

## Testing Approach

Due to the complexity of the contracts and the instrumentation added by the coverage tool, we encountered persistent "Stack too deep" errors when running coverage analysis. To address this:

1. We created simplified test files specifically for coverage testing
2. We used gas reports as an alternative to coverage analysis
3. We configured Foundry to use the IR-based pipeline and optimizer for coverage

## Results

- All tests now pass without the need for the `--via-ir` flag
- Gas usage has been significantly reduced
- The contracts are more modular and easier to understand
- The code is more maintainable and follows best practices

## Future Improvements

- Further optimize string operations in DID handling
- Consider using assembly for critical gas-intensive operations
- Explore alternative coverage tools that are more compatible with complex Solidity contracts
