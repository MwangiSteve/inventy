import { NextApiRequest, NextApiResponse } from "next";

/**
 * Creates a mock NextApiRequest object for testing.
 */
export function createMockRequest(
  overrides: Partial<NextApiRequest> & { body?: unknown } = {}
): NextApiRequest {
  const req = {
    method: "GET",
    headers: {},
    cookies: {},
    query: {},
    body: undefined,
    socket: { remoteAddress: "127.0.0.1" },
    ...overrides,
  } as unknown as NextApiRequest;
  return req;
}

/**
 * Creates a mock NextApiResponse object for testing.
 */
export function createMockResponse(): NextApiResponse & {
  _status: number;
  _json: unknown;
  _headers: Record<string, string | string[]>;
  headersSent: boolean;
} {
  const res = {
    _status: 200,
    _json: null,
    _headers: {},
    headersSent: false,
    status(code: number) {
      this._status = code;
      return this;
    },
    json(data: unknown) {
      this._json = data;
      this.headersSent = true;
      return this;
    },
    send(data: unknown) {
      this._json = data;
      this.headersSent = true;
      return this;
    },
    end() {
      this.headersSent = true;
      return this;
    },
    setHeader(key: string, value: string | string[]) {
      this._headers[key] = value;
      return this;
    },
    getHeader(key: string) {
      return this._headers[key];
    },
  } as unknown as NextApiResponse & {
    _status: number;
    _json: unknown;
    _headers: Record<string, string | string[]>;
    headersSent: boolean;
  };
  return res;
}

/**
 * Test data factories for creating consistent test data.
 */
export const testData = {
  user: {
    id: "test-user-id-123",
    email: "test@example.com",
    name: "Test User",
    password: "$2b$10$hashedpassword",
    username: "testuser",
    createdAt: new Date("2024-01-01"),
    updatedAt: null,
  },
  product: {
    id: "test-product-id-456",
    name: "Test Product",
    family: "Test Family",
    weightClass: "Heavy",
    size: "Large",
    buyingPrice: 10.0,
    sellingPrice: 15.0,
    quantity: 100,
    lowStockAlert: 5,
    status: "IN_STOCK",
    userId: "test-user-id-123",
    categoryId: "test-category-id",
    supplierId: "test-supplier-id",
    createdAt: new Date("2024-01-01"),
  },
  category: {
    id: "test-category-id",
    name: "Electronics",
    userId: "test-user-id-123",
  },
  supplier: {
    id: "test-supplier-id",
    name: "Test Supplier Co.",
    userId: "test-user-id-123",
  },
};
