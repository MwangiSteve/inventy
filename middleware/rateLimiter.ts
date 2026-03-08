import rateLimit from "express-rate-limit";
import { NextApiRequest, NextApiResponse } from "next";

type RateLimitOptions = {
  windowMs: number;
  max: number;
  message?: string;
};

/**
 * Creates an express-rate-limit middleware configured for Next.js API routes.
 */
function createLimiter(options: RateLimitOptions) {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: options.message || "Too many requests, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      // Use the forwarded IP or the connection remote address
      const forwarded = (req.headers["x-forwarded-for"] as string) || "";
      const ip = forwarded.split(",")[0]?.trim() || (req as NextApiRequest).socket?.remoteAddress || "unknown";
      return ip;
    },
  });
}

// Auth endpoints: 5 requests per 15 minutes (strict)
export const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many authentication attempts, please try again in 15 minutes.",
});

// Product endpoints: 50 requests per 15 minutes (moderate)
export const productLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: "Too many product requests, please try again later.",
});

// General data endpoints: 100 requests per 15 minutes
export const dataLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later.",
});

/**
 * Wraps an express-compatible middleware to work with Next.js API routes.
 */
export function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: (
    req: NextApiRequest,
    res: NextApiResponse,
    next: (result?: unknown) => void
  ) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    fn(req, res, (result?: unknown) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve();
    });
  });
}

/**
 * Higher-order function that applies a rate limiter to a Next.js API handler.
 */
export function withRateLimit(
  limiter: ReturnType<typeof createLimiter>,
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    await runMiddleware(req, res, limiter);
    if (res.headersSent) return;
    await handler(req, res);
  };
}
