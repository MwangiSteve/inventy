# Testing Documentation

## Overview

This document explains the test infrastructure for Stockly Inventory Management and provides guidance for writing and running tests.

## Test Stack

- **Jest** — Test runner and assertion library
- **ts-jest** — TypeScript support for Jest
- **@testing-library/react** — React component testing utilities
- **@testing-library/jest-dom** — Custom Jest matchers for DOM testing
- **next/jest** — Next.js Jest configuration helper

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration
```

## Test Structure

```
__tests__/
├── setup/
│   └── setup.ts              # Global test setup (env vars, mocks)
├── utils/
│   └── testHelpers.ts        # Shared test utilities and data factories
├── unit/
│   ├── lib/
│   │   ├── apiError.test.ts          # Tests for ApiError class
│   │   └── validationSchemas.test.ts # Tests for Zod validation schemas
│   └── middleware/
│       └── errorHandler.test.ts      # Tests for error handling middleware
└── integration/
    └── api/
        ├── auth.test.ts      # Integration tests for auth endpoints
        └── products.test.ts  # Integration tests for product endpoints
```

## Writing Tests

### Unit Tests

Unit tests should test a single function or class in isolation, mocking all external dependencies.

```typescript
import { ApiError } from "@/lib/apiError";

describe("ApiError", () => {
  it("creates an error with correct status code", () => {
    const error = ApiError.notFound("Resource not found");
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe("NOT_FOUND");
  });
});
```

### Integration Tests

Integration tests test the interaction between components (e.g., API handler + database), mocking external services.

```typescript
// Mock Prisma
jest.mock("@prisma/client", () => ({
  PrismaClient: jest.fn(() => ({
    product: { findMany: jest.fn() },
  })),
}));

describe("GET /api/products", () => {
  it("returns products for authenticated user", async () => {
    // ...
  });
});
```

### Using Test Helpers

```typescript
import { createMockRequest, createMockResponse, testData } from "@/__tests__/utils/testHelpers";

const req = createMockRequest({ method: "POST", body: { name: "Test" } });
const res = createMockResponse();

await handler(req, res);

expect(res._status).toBe(201);
expect(res._json).toMatchObject({ name: "Test" });
```

## Coverage Goals

The project targets **80% coverage** for:
- `lib/` — Utility libraries
- `middleware/` — Middleware functions
- `pages/api/` — API route handlers
- `utils/` — Utility functions

Run `npm run test:coverage` to generate a coverage report in the `coverage/` directory.

## Testing Strategies

1. **Validation schemas** — Test valid and invalid inputs for each schema field
2. **Error handling** — Test each error code and HTTP status mapping
3. **API routes** — Test authentication, authorization, happy paths, and error paths
4. **Middleware** — Test that middleware correctly intercepts requests

## Mocking Prisma

Always mock the Prisma client in tests to avoid database dependencies:

```typescript
jest.mock("@prisma/client", () => {
  const mockPrisma = {
    product: {
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockResolvedValue({ id: "123", name: "Test" }),
    },
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});
```
