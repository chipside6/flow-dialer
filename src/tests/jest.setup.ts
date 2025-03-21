
import '@testing-library/jest-dom';

// Set up any global mocks or configurations here
jest.setTimeout(10000);

// Mock window.setTimeout and other browser APIs
const originalSetTimeout = global.setTimeout;
global.setTimeout = jest.fn((cb, ms) => {
  return originalSetTimeout(cb, 0) as unknown as NodeJS.Timeout;
}) as unknown as typeof global.setTimeout;

global.clearTimeout = jest.fn();

// Mock console methods to reduce noise in test output
global.console = {
  ...console,
  // Keep error for debugging, but silence others
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
};
