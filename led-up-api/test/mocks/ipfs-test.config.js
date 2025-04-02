module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: [],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
      },
    ],
  },
  moduleNameMapper: {
    // Mock any problematic imports
    '\\..\\/src\\/db\\/connect': '<rootDir>/test/mocks/db-connect.js',
  },
};
