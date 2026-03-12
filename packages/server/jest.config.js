module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/*.test.ts'],
  globalSetup: '<rootDir>/jest.globalSetup.js',
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/services/baiduAI.ts', '!src/services/oss.ts'],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 70,
      lines: 75,
      statements: 75
    }
  },
  setupFiles: ['<rootDir>/jest.setup.js'],
  maxWorkers: 1
}
