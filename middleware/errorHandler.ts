import { NextApiRequest, NextApiResponse } from "next";
import { ApiError } from "@/lib/apiError";
import { ZodError } from "zod";

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export function handleApiError(error: unknown, res: NextApiResponse): void {
  if (res.headersSent) return;

  if (error instanceof ApiError) {
    const body: ErrorResponse = {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        ...(process.env.NODE_ENV === "development" && error.details !== undefined
          ? { details: error.details }
          : {}),
      },
    };
    res.status(error.statusCode).json(body);
    return;
  }

  if (error instanceof ZodError) {
    const body: ErrorResponse = {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        ...(process.env.NODE_ENV === "development"
          ? { details: error.flatten() }
          : {}),
      },
    };
    res.status(400).json(body);
    return;
  }

  // Unknown errors - don't leak details in production
  console.error("[API Error]", error);
  const body: ErrorResponse = {
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "An internal server error occurred",
      ...(process.env.NODE_ENV === "development"
        ? { details: error instanceof Error ? error.message : String(error) }
        : {}),
    },
  };
  res.status(500).json(body);
}

export function withErrorHandler(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await handler(req, res);
    } catch (error) {
      handleApiError(error, res);
    }
  };
}
