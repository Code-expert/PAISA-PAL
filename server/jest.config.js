export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.jsx?$': ['babel-jest', { configFile: './babel.config.cjs' }]
  },
  testMatch: ['**/__tests__/**/*.test.js'],
  verbose: true,
  collectCoverageFrom: [
    '**/*.{js,jsx}',
    '!**/node_modules/**',
    '!**/coverage/**'
  ],
  moduleFileExtensions: ['js', 'json', 'jsx', 'node'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(mongodb-memory-server|other-es-module)/)'
  ],
  setupFilesAfterEnv: ['./__tests__/config/testSetup.js']
};
