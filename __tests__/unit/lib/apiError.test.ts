import { ApiError } from "@/lib/apiError";

describe("ApiError", () => {
  it("creates an error with the correct code and status code", () => {
    const error = new ApiError("VALIDATION_ERROR", "Validation failed");
    expect(error.code).toBe("VALIDATION_ERROR");
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe("Validation failed");
    expect(error.name).toBe("ApiError");
  });

  it("creates an unauthorized error via static method", () => {
    const error = ApiError.unauthorized();
    expect(error.code).toBe("UNAUTHORIZED");
    expect(error.statusCode).toBe(401);
    expect(error.message).toBe("Unauthorized");
  });

  it("creates a forbidden error via static method", () => {
    const error = ApiError.forbidden("Access denied");
    expect(error.code).toBe("FORBIDDEN");
    expect(error.statusCode).toBe(403);
    expect(error.message).toBe("Access denied");
  });

  it("creates a not found error via static method", () => {
    const error = ApiError.notFound("User not found");
    expect(error.code).toBe("NOT_FOUND");
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe("User not found");
  });

  it("creates a validation error with details", () => {
    const details = { field: "email", message: "Invalid email" };
    const error = ApiError.validation("Validation failed", details);
    expect(error.code).toBe("VALIDATION_ERROR");
    expect(error.statusCode).toBe(400);
    expect(error.details).toEqual(details);
  });

  it("creates a conflict error via static method", () => {
    const error = ApiError.conflict("User already exists");
    expect(error.code).toBe("CONFLICT");
    expect(error.statusCode).toBe(409);
    expect(error.message).toBe("User already exists");
  });

  it("creates an internal error via static method", () => {
    const error = ApiError.internal();
    expect(error.code).toBe("INTERNAL_ERROR");
    expect(error.statusCode).toBe(500);
    expect(error.message).toBe("Internal server error");
  });

  it("creates a rate limit error via static method", () => {
    const error = ApiError.rateLimitExceeded();
    expect(error.code).toBe("RATE_LIMIT_EXCEEDED");
    expect(error.statusCode).toBe(429);
  });

  it("is an instance of Error", () => {
    const error = new ApiError("NOT_FOUND", "Not found");
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ApiError);
  });

  it("maps all error codes to correct HTTP status codes", () => {
    expect(new ApiError("VALIDATION_ERROR", "").statusCode).toBe(400);
    expect(new ApiError("UNAUTHORIZED", "").statusCode).toBe(401);
    expect(new ApiError("FORBIDDEN", "").statusCode).toBe(403);
    expect(new ApiError("NOT_FOUND", "").statusCode).toBe(404);
    expect(new ApiError("METHOD_NOT_ALLOWED", "").statusCode).toBe(405);
    expect(new ApiError("CONFLICT", "").statusCode).toBe(409);
    expect(new ApiError("RATE_LIMIT_EXCEEDED", "").statusCode).toBe(429);
    expect(new ApiError("INTERNAL_ERROR", "").statusCode).toBe(500);
  });
});
