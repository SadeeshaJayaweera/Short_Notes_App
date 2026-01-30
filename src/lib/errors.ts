/**
 * Error Handling System
 * Centralized error management and reporting
 */

export class AppError extends Error {
  constructor(
    public message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTHENTICATION_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 'AUTHORIZATION_ERROR', 403);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, resource?: string) {
    super(
      message || `${resource || 'Resource'} not found`,
      'NOT_FOUND_ERROR',
      404
    );
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 'CONFLICT_ERROR', 409);
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests', retryAfter?: number) {
    super(message, 'RATE_LIMIT_ERROR', 429, { retryAfter });
    this.name = 'RateLimitError';
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message?: string) {
    super(
      message || `${service} service error`,
      'EXTERNAL_SERVICE_ERROR',
      503,
      { service }
    );
    this.name = 'ExternalServiceError';
  }
}

// Error handler for API routes
export function handleError(error: unknown) {
  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      body: {
        error: true,
        code: error.code,
        message: error.message,
        details: error.details,
      },
    };
  }

  if (error instanceof Error) {
    console.error('Unexpected error:', error);
    return {
      statusCode: 500,
      body: {
        error: true,
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
    };
  }

  console.error('Unknown error:', error);
  return {
    statusCode: 500,
    body: {
      error: true,
      code: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred',
    },
  };
}

// Error logging service
export class ErrorLogger {
  static log(error: any, context?: Record<string, any>) {
    const timestamp = new Date().toISOString();
    const errorData = {
      timestamp,
      message: error?.message || String(error),
      code: error?.code || 'UNKNOWN',
      stack: error?.stack,
      context,
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[ERROR]', errorData);
    }

    // In production, send to monitoring service (e.g., Sentry)
    if (process.env.NODE_ENV === 'production') {
      // Send to monitoring service
      // captureException(error, { extra: { context } });
    }

    return errorData;
  }

  static logWarning(message: string, context?: Record<string, any>) {
    const timestamp = new Date().toISOString();
    const warningData = { timestamp, message, context };

    if (process.env.NODE_ENV === 'development') {
      console.warn('[WARNING]', warningData);
    }
  }
}
