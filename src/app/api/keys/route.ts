import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateApiKey } from '@/lib/api-key';
import { apiResponse, errorResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    const keys = await prisma.apiKey.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        prefix: true,
        permissions: true,
        lastUsedAt: true,
        expiresAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return apiResponse({ keys });
  } catch (error) {
    console.error('API Keys GET error:', error);
    return errorResponse('Failed to fetch API keys', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await req.json();
    const { name = 'Developer Key', permissions = ['read', 'write'] } = body;

    const { rawKey, keyHash, prefix } = generateApiKey('sn_live');

    const createdKey = await prisma.apiKey.create({
      data: {
        userId: session.user.id,
        name: name.trim() || 'Developer Key',
        keyHash,
        prefix,
        permissions,
      },
      select: {
        id: true,
        name: true,
        prefix: true,
        permissions: true,
        createdAt: true,
      },
    });

    return apiResponse(
      {
        apiKey: createdKey,
        rawKey, // Returned only ONCE upon creation!
        message: 'API Key generated successfully. Please copy and store it securely; it will not be shown again.',
      },
      201
    );
  } catch (error) {
    console.error('API Keys POST error:', error);
    return errorResponse('Failed to create API key', 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return errorResponse('API key ID is required', 400);
    }

    await prisma.apiKey.deleteMany({
      where: {
        id,
        userId: session.user.id,
      },
    });

    return apiResponse({ success: true, message: 'API key revoked successfully' });
  } catch (error) {
    console.error('API Keys DELETE error:', error);
    return errorResponse('Failed to revoke API key', 500);
  }
}
