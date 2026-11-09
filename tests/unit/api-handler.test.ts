import { describe, it, expect } from 'vitest';
import { apiHandler } from '@/lib/api-handler';
import { NextRequest } from 'next/server';
import { ValidationError, AuthenticationError, NotFoundError } from '@/lib/errors';

describe('API Handler & Error Hierarchy', () => {
  it('wraps successful handler in standardized JSON ApiResponse shape', async () => {
    const handler = apiHandler(async () => {
      return { data: { message: 'success' }, statusCode: 200 };
    });

    const req = new NextRequest('http://localhost:3000/api/test');
    const response = await handler(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual({ message: 'success' });
    expect(body.meta).toBeDefined();
    expect(body.meta.requestId).toBeDefined();
    expect(body.meta.timestamp).toBeDefined();
  });

  it('handles ValidationError with 400 and structured error details', async () => {
    const handler = apiHandler(async () => {
      throw new ValidationError('Invalid input field', { field: 'title' });
    });

    const req = new NextRequest('http://localhost:3000/api/test');
    const response = await handler(req);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.message).toBe('Invalid input field');
    expect(body.error.details).toEqual({ field: 'title' });
  });

  it('handles AuthenticationError with 401 status', async () => {
    const handler = apiHandler(async () => {
      throw new AuthenticationError('User not logged in');
    });

    const req = new NextRequest('http://localhost:3000/api/test');
    const response = await handler(req);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('AUTHENTICATION_ERROR');
  });

  it('handles NotFoundError with 404 status', async () => {
    const handler = apiHandler(async () => {
      throw new NotFoundError('Note not found');
    });

    const req = new NextRequest('http://localhost:3000/api/test');
    const response = await handler(req);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('NOT_FOUND_ERROR');
  });
});

