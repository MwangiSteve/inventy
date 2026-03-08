/**
 * Integration tests for auth API endpoints.
 * These tests mock Prisma and external dependencies.
 */

import { createMockRequest, createMockResponse } from "@/__tests__/utils/testHelpers";

// Mock Prisma client
jest.mock("@prisma/client", () => {
  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

// Mock bcryptjs
jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

// Mock JWT utils
jest.mock("@/utils/auth", () => ({
  generateToken: jest.fn(() => "mock-jwt-token"),
  verifyToken: jest.fn(),
  getSessionServer: jest.fn(),
}));

// Mock cookies
jest.mock("cookies", () => {
  return jest.fn().mockImplementation(() => ({
    set: jest.fn(),
    get: jest.fn(),
  }));
});

describe("POST /api/auth/register", () => {
  let handler: typeof import("@/pages/api/auth/register").default;
  let mockPrisma: {
    user: { findUnique: jest.Mock; create: jest.Mock };
  };

  beforeEach(() => {
    jest.resetModules();
    const { PrismaClient } = require("@prisma/client");
    mockPrisma = new PrismaClient();
  });

  it("returns 405 for non-POST requests", async () => {
    handler = require("@/pages/api/auth/register").default;
    const req = createMockRequest({ method: "GET" });
    const res = createMockResponse();
    await handler(req as never, res as never);
    expect(res._status).toBe(405);
  });

  it("returns 400 for invalid body", async () => {
    handler = require("@/pages/api/auth/register").default;
    const req = createMockRequest({
      method: "POST",
      body: { name: "Test", email: "invalid-email", password: "abc" },
    });
    const res = createMockResponse();
    await handler(req as never, res as never);
    expect(res._status).toBe(400);
  });
});

describe("POST /api/auth/login", () => {
  it("returns 405 for non-POST requests", async () => {
    const handler = require("@/pages/api/auth/login").default;
    const req = createMockRequest({ method: "GET" });
    const res = createMockResponse();
    await handler(req as never, res as never);
    expect(res._status).toBe(405);
  });

  it("returns 400 when email is missing", async () => {
    const handler = require("@/pages/api/auth/login").default;
    const req = createMockRequest({
      method: "POST",
      body: { password: "secret" },
    });
    const res = createMockResponse();
    await handler(req as never, res as never);
    expect(res._status).toBe(400);
  });

  it("returns 400 when password is missing", async () => {
    const handler = require("@/pages/api/auth/login").default;
    const req = createMockRequest({
      method: "POST",
      body: { email: "test@example.com" },
    });
    const res = createMockResponse();
    await handler(req as never, res as never);
    expect(res._status).toBe(400);
  });
});
