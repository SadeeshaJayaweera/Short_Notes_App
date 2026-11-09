import { NextRequest } from 'next/server';
import { authenticateApiKey } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { apiResponse, errorResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  const auth = await authenticateApiKey(req);
  if (!auth.authenticated || !auth.user) {
    return errorResponse(auth.error || 'Unauthorized', 401);
  }

  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));

    if (!q.trim()) {
      return apiResponse({ results: [], query: '' });
    }

    const query = q.trim();

    const notes = await prisma.note.findMany({
      where: {
        userId: auth.user.id,
        deletedAt: null,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
          { summary: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        title: true,
        summary: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        folder: { select: { id: true, name: true } },
        tags: { select: { tag: { select: { id: true, name: true } } } },
      },
      take: limit,
      orderBy: { updatedAt: 'desc' },
    });

    const results = notes.map((n) => ({
      id: n.id,
      title: n.title,
      summary: n.summary || n.content.slice(0, 150) + '...',
      folder: n.folder?.name || null,
      tags: n.tags.map((t) => t.tag.name),
      updatedAt: n.updatedAt,
    }));

    return apiResponse({ results, count: results.length, query });
  } catch (error) {
    console.error('v1/search error:', error);
    return errorResponse('Search failed', 500);
  }
}

