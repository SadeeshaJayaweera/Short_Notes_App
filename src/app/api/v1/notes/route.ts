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
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0', 10));
    const search = searchParams.get('search');
    const folderId = searchParams.get('folderId');
    const tag = searchParams.get('tag');

    const where: any = {
      userId: auth.user.id,
      deletedAt: null,
    };

    if (folderId) {
      where.folderId = folderId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (tag) {
      where.tags = {
        some: {
          tag: {
            name: { equals: tag, mode: 'insensitive' },
          },
        },
      };
    }

    const [notes, total] = await Promise.all([
      prisma.note.findMany({
        where,
        select: {
          id: true,
          title: true,
          content: true,
          summary: true,
          bulletPoints: true,
          noteType: true,
          folderId: true,
          isPinned: true,
          isFavorite: true,
          wordCount: true,
          readingTime: true,
          createdAt: true,
          updatedAt: true,
          tags: {
            select: {
              tag: { select: { id: true, name: true, color: true } },
            },
          },
        },
        orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
        skip: offset,
        take: limit,
      }),
      prisma.note.count({ where }),
    ]);

    const formattedNotes = notes.map((n) => ({
      ...n,
      tags: n.tags.map((t) => t.tag),
    }));

    return apiResponse({
      notes: formattedNotes,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('v1/notes GET error:', error);
    return errorResponse('Failed to retrieve notes', 500);
  }
}

export async function POST(req: NextRequest) {
  const auth = await authenticateApiKey(req);
  if (!auth.authenticated || !auth.user) {
    return errorResponse(auth.error || 'Unauthorized', 401);
  }

  try {
    const body = await req.json();
    const { title, content, folderId, tags = [] } = body;

    if (!title || !title.trim()) {
      return errorResponse('Note title is required', 400);
    }

    const textContent = content || '';
    const wordCount = textContent.trim() ? textContent.trim().split(/\s+/).length : 0;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    // Handle tags creation/connection
    const tagConnects: { tag: { connectOrCreate: { where: { name: string }; create: { name: string } } } }[] = [];
    if (Array.isArray(tags)) {
      for (const t of tags) {
        if (typeof t === 'string' && t.trim()) {
          const clean = t.trim().toLowerCase();
          tagConnects.push({
            tag: {
              connectOrCreate: {
                where: { name: clean },
                create: { name: clean },
              },
            },
          });
        }
      }
    }

    const createdNote = await prisma.note.create({
      data: {
        userId: auth.user.id,
        title: title.trim(),
        content: textContent,
        originalText: textContent,
        summary: '',
        bulletPoints: [],
        folderId: folderId || null,
        wordCount,
        readingTime,
        sourceType: 'api',
        tags: {
          create: tagConnects,
        },
      },
      include: {
        tags: {
          select: {
            tag: { select: { id: true, name: true, color: true } },
          },
        },
      },
    });

    return apiResponse(
      {
        note: {
          ...createdNote,
          tags: createdNote.tags.map((t) => t.tag),
        },
      },
      201
    );
  } catch (error) {
    console.error('v1/notes POST error:', error);
    return errorResponse('Failed to create note', 500);
  }
}
