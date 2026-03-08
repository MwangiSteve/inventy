import { NextApiRequest, NextApiResponse } from "next";
import { ZodSchema } from "zod";
import { ApiError } from "@/lib/apiError";

/**
 * Validates request body against a Zod schema.
 * Throws ApiError with VALIDATION_ERROR code if validation fails.
 */
export function validateBody<T>(schema: ZodSchema<T>, body: unknown): T {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw ApiError.validation("Validation failed", result.error.flatten());
  }
  return result.data;
}

/**
 * Higher-order function that wraps a Next.js API handler with body validation.
 */
export function withValidation<T>(
  schema: ZodSchema<T>,
  handler: (req: NextApiRequest, res: NextApiResponse, data: T) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const data = validateBody(schema, req.body);
    await handler(req, res, data);
  };
}
