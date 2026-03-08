# Quick Start: Writing Tests for inventy

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration
```

## Project Structure

```
__tests__/
├── advanced/            # Advanced patterns and guides
├── fixtures/            # Shared test data
│   └── mockData.ts
├── integration/         # Integration tests
│   └── api/
│       ├── auth.test.ts
│       ├── products.test.ts
│       └── export.test.ts
├── mocks/               # Shared mock factories
│   └── prisma.ts
└── unit/                # Unit tests
    ├── lib/
    │   ├── apiError.test.ts
    │   └── validationSchemas.test.ts
    └── middleware/
        ├── errorHandler.test.ts
        └── rateLimiter.test.ts
```

## Writing a Simple Unit Test

```typescript
// __tests__/unit/example.test.ts
import { myFunction } from '@/lib/myFunction';

describe('myFunction', () => {
  it('should return the expected output for valid input', () => {
    const result = myFunction('input');
    expect(result).toBe('expected');
  });

  it('should throw for invalid input', () => {
    expect(() => myFunction('')).toThrow('Input cannot be empty');
  });
});
```

## Testing an API Endpoint

```typescript
// __tests__/integration/api/example.test.ts
import { createMockRequest, createMockResponse } from '@/__tests__/utils';
import handler from '@/pages/api/example';

describe('POST /api/example', () => {
  it('should handle a valid request', async () => {
    const req = createMockRequest({
      method: 'POST',
      body: { name: 'Test' },
    });
    const res = createMockResponse();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
  });

  it('should reject missing body fields', async () => {
    const req = createMockRequest({ method: 'POST', body: {} });
    const res = createMockResponse();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});
```

## Mocking Prisma

```typescript
// At the top of your test file
import { mockPrismaClient } from '@/__tests__/mocks/prisma';

jest.mock('@/lib/prisma', () => ({ prisma: mockPrismaClient }));

describe('My feature', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should query the database', async () => {
    mockPrismaClient.product.findMany.mockResolvedValue([
      { id: '1', name: 'Widget', quantity: 10 },
    ]);

    // ... call your handler ...

    expect(mockPrismaClient.product.findMany).toHaveBeenCalledTimes(1);
  });
});
```

## Using Test Factories

```typescript
import { createMockUser, createMockProduct } from '@/__tests__/fixtures/mockData';

const user = createMockUser({ email: 'custom@example.com' });
const product = createMockProduct({ quantity: 0 }); // out of stock scenario
```

## Common Testing Patterns

### Testing Authentication
```typescript
import { createMockRequest } from '@/__tests__/utils';

// Authenticated request
const req = createMockRequest({
  headers: { authorization: 'Bearer valid-test-token' },
});

// Unauthenticated request
const unauthReq = createMockRequest({ headers: {} });
```

### Testing Query Parameters
```typescript
const req = createMockRequest({
  method: 'GET',
  query: { page: '1', limit: '10', search: 'widget' },
});
```

### Asserting on Response Headers
```typescript
expect(res.setHeader).toHaveBeenCalledWith('X-Total-Count', '42');
```

### Testing Async Errors
```typescript
it('should handle async errors', async () => {
  mockPrismaClient.product.create.mockRejectedValueOnce(
    new Error('Unique constraint violation')
  );

  const req = createMockRequest({ method: 'POST', body: validBody });
  const res = createMockResponse();

  await handler(req, res);

  expect(res.status).toHaveBeenCalledWith(409);
});
```

## Coverage Goals

| Metric | Target |
|--------|--------|
| Statements | ≥ 80% |
| Branches | ≥ 75% |
| Functions | ≥ 80% |
| Lines | ≥ 80% |

Run `npm run test:coverage` to see the current coverage report.
