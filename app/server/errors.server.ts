export class HttpError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
    };
  }
}

/**
 * 401 Unauthorized - User is not authenticated
 */
export class UnauthorizedError extends HttpError {
  constructor(message: string = "Authentication required") {
    super(message, 401, "UNAUTHORIZED");
  }
}

/**
 * 403 Forbidden - User is authenticated but doesn't have permission
 */
export class ForbiddenError extends HttpError {
  constructor(message: string = "Access denied") {
    super(message, 403, "FORBIDDEN");
  }
}

/**
 * 404 Not Found - Resource does not exist
 */
export class NotFoundError extends HttpError {
  constructor(resource: string, id?: string) {
    const message = id
      ? `${resource} with id '${id}' not found`
      : `${resource} not found`;
    super(message, 404, "NOT_FOUND");
  }
}

/**
 * 400 Bad Request - Invalid input
 */
export class BadRequestError extends HttpError {
  constructor(message: string = "Invalid request") {
    super(message, 400, "BAD_REQUEST");
  }
}

/**
 * 409 Conflict - Resource conflict (e.g., duplicate entry)
 */
export class ConflictError extends HttpError {
  constructor(message: string = "Resource conflict") {
    super(message, 409, "CONFLICT");
  }
}

/**
 * Helper to convert HttpError to Response object
 */
export function errorToResponse(error: Error): Response {
  if (error instanceof HttpError) {
    return new Response(JSON.stringify(error.toJSON()), {
      status: error.statusCode,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  // Unknown error - return 500
  console.error("Unhandled error:", error);
  return new Response(
    JSON.stringify({
      error: "InternalServerError",
      message: "An unexpected error occurred",
      code: "INTERNAL_SERVER_ERROR",
      statusCode: 500,
    }),
    {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

