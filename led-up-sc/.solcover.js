module.exports = {
  skipFiles: [],
  configureYulOptimizer: true,
  providerOptions: {
    mnemonic: 'test test test test test test test test test test test junk',
  },
  mocha: {
    timeout: 100000,
  },
  // Set coverage thresholds
  threshold: {
    statements: 100,
    branches: 100,
    functions: 100,
    lines: 100,
  },
};