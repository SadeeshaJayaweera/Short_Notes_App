import { NextRequest, NextResponse } from 'next/server';
import { handleError, AppError, ErrorLogger } from './errors';

export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  meta?: {
    timestamp: string;
    requestId: string;
  };
};

/**
 * Generate a unique request ID for tracking
 */
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Wrap API handler with error handling and response formatting
 */
export function apiHandler<T = any>(
  handler: (req: NextRequest) => Promise<{ data?: T; statusCode?: number }>
) {
  return async (req: NextRequest) => {
    const requestId = generateRequestId();
    const startTime = Date.now();

    try {
      const result = await handler(req);
      const statusCode = result.statusCode || 200;
      const duration = Date.now() - startTime;

      const response: ApiResponse<T> = {
        success: true,
        data: result.data,
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
        },
      };

      // Log successful request in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[API] ${req.method} ${req.nextUrl.pathname} - ${statusCode} (${duration}ms)`);
      }

      return NextResponse.json(response, { status: statusCode });
    } catch (error) {
      const { statusCode, body } = handleError(error);
      const duration = Date.now() - startTime;

      // Log error
      ErrorLogger.log(error, {
        requestId,
        method: req.method,
        path: req.nextUrl.pathname,
        duration,
      });

      const response: ApiResponse = {
        success: false,
        error: body.error ? undefined : body,
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
        },
      };

      if (body.error) {
        response.error = {
          code: body.code,
          message: body.message,
          details: body.details,
        };
      }

      return NextResponse.json(response, { status: statusCode });
    }
  };
}

/**
 * Helper to validate request data
 */
export async function validateRequestBody<T>(
  req: NextRequest,
  schema: (data: any) => Promise<T> | T
): Promise<T> {
  try {
    const body = await req.json();
    return await schema(body);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new AppError('Invalid JSON', 'INVALID_JSON', 400);
    }
    throw error;
  }
}

/**
 * Rate limiting helper
 */
export class RateLimiter {
  private static requests = new Map<string, { count: number; resetTime: number }>();

  static check(identifier: string, limit: number = 100, windowMs: number = 60000): boolean {
    const now = Date.now();
    const record = this.requests.get(identifier);

    if (!record || now > record.resetTime) {
      this.requests.set(identifier, { count: 1, resetTime: now + windowMs });
      return true;
    }

    record.count++;
    if (record.count > limit) {
      return false;
    }

    return true;
  }
}
