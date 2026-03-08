// Global test setup
// This file runs before each test file

// Set test environment variables
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-jwt-secret-for-testing-only";
process.env.DATABASE_URL = "mongodb://localhost:27017/test";

// Suppress console output in tests unless DEBUG is set
if (!process.env.DEBUG) {
  global.console.log = jest.fn();
  global.console.info = jest.fn();
  global.console.warn = jest.fn();
}
