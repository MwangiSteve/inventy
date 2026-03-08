import {
  registerSchema,
  loginSchema,
  productSchema,
  categorySchema,
  supplierSchema,
  productUpdateSchema,
} from "@/lib/validationSchemas";

describe("registerSchema", () => {
  it("validates a valid registration payload", () => {
    const result = registerSchema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      password: "secret123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing name", () => {
    const result = registerSchema.safeParse({
      email: "john@example.com",
      password: "secret123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = registerSchema.safeParse({
      name: "John",
      email: "not-an-email",
      password: "secret123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password shorter than 6 characters", () => {
    const result = registerSchema.safeParse({
      name: "John",
      email: "john@example.com",
      password: "abc",
    });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("validates a valid login payload", () => {
    const result = loginSchema.safeParse({
      email: "john@example.com",
      password: "secret123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing password", () => {
    const result = loginSchema.safeParse({
      email: "john@example.com",
    });
    expect(result.success).toBe(false);
  });
});

describe("productSchema", () => {
  it("validates a valid product payload", () => {
    const result = productSchema.safeParse({
      name: "Widget A",
      sellingPrice: 9.99,
      quantity: 100,
      categoryId: "cat-123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const result = productSchema.safeParse({
      name: "Widget A",
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative selling price", () => {
    const result = productSchema.safeParse({
      name: "Widget A",
      sellingPrice: -5,
      quantity: 10,
      categoryId: "cat-123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative quantity", () => {
    const result = productSchema.safeParse({
      name: "Widget A",
      sellingPrice: 5,
      quantity: -1,
      categoryId: "cat-123",
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional fields", () => {
    const result = productSchema.safeParse({
      name: "Widget A",
      family: "Widgets",
      weightClass: "Light",
      size: "Small",
      buyingPrice: 5.0,
      sellingPrice: 9.99,
      quantity: 100,
      lowStockAlert: 10,
      categoryId: "cat-123",
      supplierId: "sup-456",
    });
    expect(result.success).toBe(true);
  });
});

describe("productUpdateSchema", () => {
  it("validates a product update with id", () => {
    const result = productUpdateSchema.safeParse({
      id: "prod-123",
      name: "Updated Widget",
      sellingPrice: 12.99,
    });
    expect(result.success).toBe(true);
  });

  it("rejects update without id", () => {
    const result = productUpdateSchema.safeParse({
      name: "Updated Widget",
    });
    expect(result.success).toBe(false);
  });
});

describe("categorySchema", () => {
  it("validates a valid category", () => {
    const result = categorySchema.safeParse({ name: "Electronics" });
    expect(result.success).toBe(true);
  });

  it("rejects empty category name", () => {
    const result = categorySchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });
});

describe("supplierSchema", () => {
  it("validates a valid supplier", () => {
    const result = supplierSchema.safeParse({ name: "Acme Corp" });
    expect(result.success).toBe(true);
  });

  it("rejects empty supplier name", () => {
    const result = supplierSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });
});
