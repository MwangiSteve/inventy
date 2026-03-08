export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "METHOD_NOT_ALLOWED"
  | "RATE_LIMIT_EXCEEDED"
  | "INTERNAL_ERROR"
  | "CONFLICT";

const ERROR_STATUS_MAP: Record<ErrorCode, number> = {
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  RATE_LIMIT_EXCEEDED: 429,
  INTERNAL_ERROR: 500,
};

export class ApiError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(code: ErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.statusCode = ERROR_STATUS_MAP[code];
    this.details = details;
  }

  static unauthorized(message = "Unauthorized") {
    return new ApiError("UNAUTHORIZED", message);
  }

  static forbidden(message = "Forbidden") {
    return new ApiError("FORBIDDEN", message);
  }

  static notFound(message = "Resource not found") {
    return new ApiError("NOT_FOUND", message);
  }

  static validation(message: string, details?: unknown) {
    return new ApiError("VALIDATION_ERROR", message, details);
  }

  static conflict(message: string) {
    return new ApiError("CONFLICT", message);
  }

  static internal(message = "Internal server error") {
    return new ApiError("INTERNAL_ERROR", message);
  }

  static rateLimitExceeded(message = "Too many requests, please try again later") {
    return new ApiError("RATE_LIMIT_EXCEEDED", message);
  }
}
