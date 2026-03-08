# Advanced Testing Patterns for inventy

## Table of Contents
1. [API Mocking Strategies](#api-mocking-strategies)
2. [Integration Testing](#integration-testing)
3. [Security Testing](#security-testing)
4. [Error Scenario Testing](#error-scenario-testing)
5. [Performance Testing](#performance-testing)

## API Mocking Strategies

### Pattern 1: Manual Mock Setup
```typescript
// __tests__/mocks/prisma.ts
export const mockPrismaClient = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  product: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};
```

### Pattern 2: Factory Pattern for Test Data
```typescript
// __tests__/factories/userFactory.ts
export const createMockUser = (overrides = {}) => ({
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  password: 'hashed-password',
  createdAt: new Date(),
  ...overrides,
});
```

### Pattern 3: Module-Level Mock with jest.mock
```typescript
// __tests__/unit/lib/someLib.test.ts
jest.mock('@/lib/prisma', () => ({
  prisma: {
    product: {
      findMany: jest.fn().mockResolvedValue([]),
    },
  },
}));
```

### Pattern 4: Spy on Existing Implementations
```typescript
import * as authModule from '@/lib/auth';

const signTokenSpy = jest
  .spyOn(authModule, 'signToken')
  .mockReturnValue('mock-token');

afterEach(() => {
  signTokenSpy.mockRestore();
});
```

## Integration Testing

### Pattern 1: API Endpoint Testing
```typescript
// __tests__/integration/api/auth.test.ts
import { createMockRequest, createMockResponse } from '@/__tests__/utils';
import handler from '@/pages/api/auth/login';

describe('POST /api/auth/login', () => {
  it('should return token for valid credentials', async () => {
    const req = createMockRequest({
      method: 'POST',
      body: { email: 'user@example.com', password: 'SecurePass1!' },
    });
    const res = createMockResponse();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ token: expect.any(String) })
    );
  });

  it('should reject invalid credentials', async () => {
    const req = createMockRequest({
      method: 'POST',
      body: { email: 'user@example.com', password: 'wrong-password' },
    });
    const res = createMockResponse();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });
});
```

### Pattern 2: Error Handling Testing
```typescript
describe('Error Handling', () => {
  it('should return 400 for invalid input', async () => {
    const req = createMockRequest({
      method: 'POST',
      body: { email: 'not-an-email' }, // Invalid email
    });
    const res = createMockResponse();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(String) })
    );
  });

  it('should return 500 for server errors', async () => {
    // Force a database error
    jest.spyOn(prisma.user, 'findUnique').mockRejectedValueOnce(new Error('DB Error'));

    const req = createMockRequest({ method: 'POST', body: validBody });
    const res = createMockResponse();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
```

### Pattern 3: Database Integration with Transactions
```typescript
describe('Product CRUD', () => {
  beforeEach(async () => {
    // Reset DB state before each test
    await prisma.product.deleteMany({});
  });

  it('should create a product', async () => {
    const req = createMockRequest({
      method: 'POST',
      body: { name: 'Widget', sku: 'WDG-001', quantity: 10, price: 9.99 },
    });
    const res = createMockResponse();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    const product = await prisma.product.findFirst({ where: { sku: 'WDG-001' } });
    expect(product).toBeTruthy();
  });
});
```

## Security Testing

### Pattern 1: Rate Limiting Tests
```typescript
// __tests__/unit/middleware/rateLimiter.test.ts
describe('Rate Limiting', () => {
  it('should reject requests exceeding limit', async () => {
    const rateLimiter = createRateLimiter({ max: 3, windowMs: 60_000 });

    // Exhaust allowed requests
    for (let i = 0; i < 3; i++) {
      const req = createMockRequest({ headers: { 'x-forwarded-for': '1.2.3.4' } });
      const res = createMockResponse();
      await rateLimiter(req, res, jest.fn());
    }

    // This one should be blocked
    const req = createMockRequest({ headers: { 'x-forwarded-for': '1.2.3.4' } });
    const res = createMockResponse();
    const next = jest.fn();
    await rateLimiter(req, res, next);

    expect(res.status).toHaveBeenCalledWith(429);
    expect(next).not.toHaveBeenCalled();
  });

  it('should reset counter after time window', async () => {
    jest.useFakeTimers();
    const rateLimiter = createRateLimiter({ max: 1, windowMs: 60_000 });

    // Exhaust the limit
    await rateLimiter(createMockRequest(), createMockResponse(), jest.fn());

    // Advance past the window
    jest.advanceTimersByTime(61_000);

    // Should be allowed again
    const res = createMockResponse();
    const next = jest.fn();
    await rateLimiter(createMockRequest(), res, next);

    expect(next).toHaveBeenCalled();
    jest.useRealTimers();
  });
});
```

### Pattern 2: Validation Testing
```typescript
// __tests__/unit/lib/validationSchemas.test.ts
import { loginSchema, productSchema } from '@/lib/validationSchemas';

describe('Input Validation', () => {
  describe('loginSchema', () => {
    it('should reject invalid email', () => {
      const result = loginSchema.safeParse({ email: 'not-an-email', password: 'Pass1!' });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].path).toContain('email');
    });

    it('should reject weak password', () => {
      const result = loginSchema.safeParse({ email: 'user@example.com', password: '123' });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].path).toContain('password');
    });

    it('should accept valid credentials', () => {
      const result = loginSchema.safeParse({
        email: 'user@example.com',
        password: 'SecurePass1!',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('productSchema', () => {
    it('should reject negative quantity', () => {
      const result = productSchema.safeParse({ name: 'Widget', quantity: -5 });
      expect(result.success).toBe(false);
    });
  });
});
```

### Pattern 3: Authentication Guard Tests
```typescript
describe('Authentication Middleware', () => {
  it('should reject requests without a token', async () => {
    const req = createMockRequest({ headers: {} });
    const res = createMockResponse();
    const next = jest.fn();

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should reject requests with an expired token', async () => {
    const expiredToken = signToken({ userId: '123' }, { expiresIn: '-1s' });
    const req = createMockRequest({
      headers: { authorization: `Bearer ${expiredToken}` },
    });
    const res = createMockResponse();
    const next = jest.fn();

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });
});
```

## Error Scenario Testing

### Common Error Patterns

1. **Database connection errors**
```typescript
it('should handle DB connection errors gracefully', async () => {
  jest.spyOn(prisma, '$connect').mockRejectedValueOnce(new Error('Connection refused'));

  const req = createMockRequest({ method: 'GET' });
  const res = createMockResponse();

  await handler(req, res);

  expect(res.status).toHaveBeenCalledWith(503);
  expect(res.json).toHaveBeenCalledWith(
    expect.objectContaining({ error: 'Service temporarily unavailable' })
  );
});
```

2. **Validation failures**
```typescript
it('should return structured validation errors', async () => {
  const req = createMockRequest({ method: 'POST', body: {} });
  const res = createMockResponse();

  await handler(req, res);

  const responseBody = (res.json as jest.Mock).mock.calls[0][0];
  expect(responseBody.errors).toBeInstanceOf(Array);
  expect(responseBody.errors[0]).toHaveProperty('field');
  expect(responseBody.errors[0]).toHaveProperty('message');
});
```

3. **Authentication failures**
```typescript
it('should not reveal whether user exists on login failure', async () => {
  const req = createMockRequest({
    method: 'POST',
    body: { email: 'nonexistent@example.com', password: 'SomePass1!' },
  });
  const res = createMockResponse();

  await loginHandler(req, res);

  // Should use generic message - not "User not found"
  const body = (res.json as jest.Mock).mock.calls[0][0];
  expect(body.error).toBe('Invalid credentials');
});
```

4. **Rate limit exceeded**
```typescript
it('should include Retry-After header when rate limited', async () => {
  // ... exhaust rate limit ...

  expect(res.setHeader).toHaveBeenCalledWith('Retry-After', expect.any(Number));
  expect(res.status).toHaveBeenCalledWith(429);
});
```

5. **Resource not found**
```typescript
it('should return 404 for missing product', async () => {
  jest.spyOn(prisma.product, 'findUnique').mockResolvedValueOnce(null);

  const req = createMockRequest({ method: 'GET', query: { id: 'nonexistent' } });
  const res = createMockResponse();

  await handler(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
});
```

## Performance Testing

### Pattern: Load Testing with Apache Bench
```bash
# Basic load test - 1000 requests, 10 concurrent
ab -n 1000 -c 10 http://localhost:3000/api/products

# With auth token
ab -n 1000 -c 10 -H "Authorization: Bearer <token>" http://localhost:3000/api/products

# POST request load test
ab -n 500 -c 5 -p /tmp/body.json -T application/json http://localhost:3000/api/products
```

### Pattern: Response Time Assertions in Tests
```typescript
it('should respond within acceptable time', async () => {
  const start = Date.now();

  const req = createMockRequest({ method: 'GET' });
  const res = createMockResponse();
  await handler(req, res);

  const duration = Date.now() - start;
  expect(duration).toBeLessThan(200); // max 200ms
});
```

### Pattern: Memory Leak Detection
```typescript
describe('Memory Usage', () => {
  it('should not leak memory on repeated calls', async () => {
    const initialMemory = process.memoryUsage().heapUsed;

    for (let i = 0; i < 100; i++) {
      await handler(createMockRequest(), createMockResponse());
    }

    // Force garbage collection (requires --expose-gc flag)
    if (global.gc) global.gc();

    const finalMemory = process.memoryUsage().heapUsed;
    const growthMB = (finalMemory - initialMemory) / 1024 / 1024;

    expect(growthMB).toBeLessThan(10); // Less than 10MB growth
  });
});
```

### Pattern: Database Query Count Assertions
```typescript
it('should not execute N+1 queries', async () => {
  const queryLog: string[] = [];
  prisma.$on('query', (e) => queryLog.push(e.query));

  const req = createMockRequest({ method: 'GET' });
  const res = createMockResponse();
  await handler(req, res);

  // Should use a JOIN rather than separate queries per product
  expect(queryLog.length).toBeLessThanOrEqual(2);
});
```
