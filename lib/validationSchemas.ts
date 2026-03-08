import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").max(128, "Password too long"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required").max(200, "Name too long"),
  family: z.string().max(100).optional(),
  weightClass: z.string().max(50).optional(),
  size: z.string().max(50).optional(),
  buyingPrice: z.number().min(0, "Buying price must be non-negative").optional().nullable(),
  sellingPrice: z.number().min(0, "Selling price must be non-negative"),
  quantity: z.number().int("Quantity must be an integer").min(0, "Quantity must be non-negative"),
  lowStockAlert: z.number().int("Low stock alert must be an integer").min(0).optional(),
  categoryId: z.string().min(1, "Category is required"),
  supplierId: z.string().optional().nullable(),
  status: z.string().optional(),
});

export const productUpdateSchema = productSchema.partial().extend({
  id: z.string().min(1, "Product ID is required"),
});

export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(100, "Name too long"),
});

export const categoryUpdateSchema = categorySchema.extend({
  id: z.string().min(1, "Category ID is required"),
});

export const supplierSchema = z.object({
  name: z.string().min(1, "Supplier name is required").max(100, "Name too long"),
});

export const supplierUpdateSchema = supplierSchema.extend({
  id: z.string().min(1, "Supplier ID is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;
export type SupplierInput = z.infer<typeof supplierSchema>;
export type SupplierUpdateInput = z.infer<typeof supplierUpdateSchema>;
