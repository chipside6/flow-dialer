import '@testing-library/jest-dom';

// Set up any global mocks or configurations here
jest.setTimeout(10000);

// Mock window.setTimeout and other browser APIs
global.setTimeout = jest.fn((cb) => {
  return 123 as unknown as NodeJS.Timeout;
});

global.clearTimeout = jest.fn();

// Mock console methods to reduce noise in test output
global.console = {
  ...console,
  // Keep error for debugging, but silence others
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
};
