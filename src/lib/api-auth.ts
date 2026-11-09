import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashApiKey } from './api-key';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string | null;
}

export interface ApiAuthResult {
  authenticated: boolean;
  user?: AuthenticatedUser;
  apiKeyId?: string;
  error?: string;
}

/**
 * Authenticates an incoming request using a Bearer API Key header:
 * Authorization: Bearer sn_live_...
 */
export async function authenticateApiKey(req: NextRequest): Promise<ApiAuthResult> {
  const authHeader = req.headers.get('authorization') || '';
  if (!authHeader.startsWith('Bearer ')) {
    return { authenticated: false, error: 'Missing or malformed Authorization header. Expected: Bearer <API_KEY>' };
  }

  const rawKey = authHeader.replace('Bearer ', '').trim();
  if (!rawKey) {
    return { authenticated: false, error: 'Empty API key provided' };
  }

  const hashedKey = hashApiKey(rawKey);

  try {
    const keyRecord = await prisma.apiKey.findUnique({
      where: { keyHash: hashedKey },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!keyRecord) {
      return { authenticated: false, error: 'Invalid or revoked API key' };
    }

    if (keyRecord.expiresAt && keyRecord.expiresAt < new Date()) {
      return { authenticated: false, error: 'API key has expired' };
    }

    // Update lastUsedAt asynchronously without blocking response
    prisma.apiKey.update({
      where: { id: keyRecord.id },
      data: { lastUsedAt: new Date() },
    }).catch((err) => console.error('Failed to update apiKey lastUsedAt:', err));

    return {
      authenticated: true,
      user: keyRecord.user,
      apiKeyId: keyRecord.id,
    };
  } catch (error) {
    console.error('API Key authentication error:', error);
    return { authenticated: false, error: 'Authentication service error' };
  }
}
