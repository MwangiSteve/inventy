import { handleApiError } from "@/middleware/errorHandler";
import { ApiError } from "@/lib/apiError";
import { ZodError, z } from "zod";
import { createMockResponse } from "@/__tests__/utils/testHelpers";

describe("handleApiError", () => {
  it("handles ApiError correctly", () => {
    const res = createMockResponse();
    const error = new ApiError("NOT_FOUND", "User not found");
    handleApiError(error, res as never);
    expect(res._status).toBe(404);
    expect(res._json).toMatchObject({
      success: false,
      error: {
        code: "NOT_FOUND",
        message: "User not found",
      },
    });
  });

  it("handles ZodError correctly", () => {
    const res = createMockResponse();
    const schema = z.object({ name: z.string().min(1) });
    const result = schema.safeParse({ name: "" });
    if (!result.success) {
      handleApiError(result.error, res as never);
      expect(res._status).toBe(400);
      expect(res._json).toMatchObject({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
        },
      });
    }
  });

  it("handles unknown errors with 500 status", () => {
    const res = createMockResponse();
    handleApiError(new Error("Something went wrong"), res as never);
    expect(res._status).toBe(500);
    expect(res._json).toMatchObject({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
      },
    });
  });

  it("handles string errors", () => {
    const res = createMockResponse();
    handleApiError("string error", res as never);
    expect(res._status).toBe(500);
    expect(res._json).toMatchObject({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
      },
    });
  });

  it("does not send response if headers already sent", () => {
    const res = createMockResponse();
    res.headersSent = true;
    const statusSpy = jest.spyOn(res, "status");
    handleApiError(new Error("error"), res as never);
    expect(statusSpy).not.toHaveBeenCalled();
  });
});
