/**
 * Integration tests for products API endpoint.
 * These tests mock Prisma and session validation.
 */

import { createMockRequest, createMockResponse, testData } from "@/__tests__/utils/testHelpers";

// Mock Prisma client
jest.mock("@prisma/client", () => {
  const mockPrisma = {
    product: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    category: {
      findUnique: jest.fn(),
    },
    supplier: {
      findUnique: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

// Mock session
jest.mock("@/utils/auth", () => ({
  getSessionServer: jest.fn(),
}));

describe("GET /api/products", () => {
  let handler: typeof import("@/pages/api/products/index").default;
  let mockGetSession: jest.Mock;
  let mockPrisma: { product: { findMany: jest.Mock; create: jest.Mock; update: jest.Mock; delete: jest.Mock } };

  beforeEach(() => {
    jest.resetModules();
    const { getSessionServer } = require("@/utils/auth");
    mockGetSession = getSessionServer;
    const { PrismaClient } = require("@prisma/client");
    mockPrisma = new PrismaClient();
  });

  it("returns 401 when session is missing", async () => {
    mockGetSession.mockResolvedValue(null);
    handler = require("@/pages/api/products/index").default;
    const req = createMockRequest({ method: "GET" });
    const res = createMockResponse();
    await handler(req as never, res as never);
    expect(res._status).toBe(401);
  });

  it("returns 200 with products for authenticated user", async () => {
    mockGetSession.mockResolvedValue(testData.user);
    const mockProducts = [
      {
        ...testData.product,
        quantity: BigInt(100),
        createdAt: new Date("2024-01-01"),
      },
    ];
    mockPrisma.product.findMany.mockResolvedValue(mockProducts);

    handler = require("@/pages/api/products/index").default;
    const req = createMockRequest({ method: "GET" });
    const res = createMockResponse();
    await handler(req as never, res as never);
    expect(res._status).toBe(200);
  });

  it("returns 405 for unsupported methods", async () => {
    mockGetSession.mockResolvedValue(testData.user);
    handler = require("@/pages/api/products/index").default;
    const req = createMockRequest({ method: "PATCH" });
    const res = createMockResponse();
    await handler(req as never, res as never);
    expect(res._status).toBe(405);
  });
});

describe("POST /api/products", () => {
  let handler: typeof import("@/pages/api/products/index").default;
  let mockGetSession: jest.Mock;
  let mockPrisma: { product: { findMany: jest.Mock; create: jest.Mock; update: jest.Mock; delete: jest.Mock } };

  beforeEach(() => {
    jest.resetModules();
    const { getSessionServer } = require("@/utils/auth");
    mockGetSession = getSessionServer;
    const { PrismaClient } = require("@prisma/client");
    mockPrisma = new PrismaClient();
  });

  it("returns 401 when not authenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    handler = require("@/pages/api/products/index").default;
    const req = createMockRequest({ method: "POST", body: {} });
    const res = createMockResponse();
    await handler(req as never, res as never);
    expect(res._status).toBe(401);
  });

  it("returns 400 when required fields are missing", async () => {
    mockGetSession.mockResolvedValue(testData.user);
    handler = require("@/pages/api/products/index").default;
    const req = createMockRequest({
      method: "POST",
      body: { name: "Test Product" }, // missing sellingPrice, quantity, categoryId
    });
    const res = createMockResponse();
    await handler(req as never, res as never);
    expect(res._status).toBe(400);
  });
});
