import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { summarizeText, generateTitle } from '@/lib/openai';
import { z } from 'zod';
import { apiHandler, validateRequestBody } from '@/lib/api-handler';
import { AuthenticationError, ValidationError, ErrorLogger } from '@/lib/errors';

const createNoteSchema = z.object({
  title: z.string().optional().default('Untitled Note'),
  originalText: z.string().optional(),
  content: z.string().optional(),
  summary: z.string().optional(),
  bulletPoints: z.array(z.string()).optional(),
  folderId: z.string().nullable().optional(),
  sourceType: z.enum(['manual', 'pdf', 'word', 'text', 'web']).default('manual'),
  fileName: z.string().nullable().optional(),
  generateAI: z.boolean().optional().default(false),
  template: z.string().optional(),
});

export const GET = apiHandler(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new AuthenticationError('You must be logged in to view notes');
  }

  const { searchParams } = new URL(req.url);
  const folderId = searchParams.get('folderId');
  const search = searchParams.get('search');
  const trash = searchParams.get('trash') === 'true';
  const pinnedOnly = searchParams.get('pinned') === 'true';
  const favoriteOnly = searchParams.get('favorite') === 'true';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
  const skip = (page - 1) * limit;

  try {
    const where: any = {
      userId: session.user.id,
      deletedAt: trash ? { not: null } : null,
    };

    if (folderId) where.folderId = folderId;
    if (pinnedOnly) where.isPinned = true;
    if (favoriteOnly) where.isFavorite = true;

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { content: { contains: q, mode: 'insensitive' } },
        { summary: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [notes, total] = await Promise.all([
      prisma.note.findMany({
        where,
        include: {
          tags: { include: { tag: true } },
          folder: true,
        },
        orderBy: [
          { isPinned: 'desc' },
          { updatedAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.note.count({ where }),
    ]);

    return {
      data: {
        notes,
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  } catch (error) {
    ErrorLogger.log(error, { action: 'fetch_notes', userId: session.user.id });
    throw error;
  }
});

export const POST = apiHandler(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new AuthenticationError('You must be logged in to create notes');
  }

  const body = await validateRequestBody(req, (data) =>
    createNoteSchema.parseAsync(data)
  );

  const rawText = body.originalText || body.content || '';
  if (!rawText.trim() && !body.title) {
    throw new ValidationError('Note content or title is required');
  }

  try {
    if (rawText.length > 500000) {
      throw new ValidationError('Content is too long (max 500KB)', {
        maxLength: 500000,
        currentLength: rawText.length,
      });
    }

    let summary = body.summary || '';
    let bulletPoints = body.bulletPoints || [];
    let tagsToConnect: string[] = [];
    let sentiment: string | null = null;
    let finalTitle = body.title && body.title.trim() ? body.title.trim() : 'Untitled Note';

    // If AI generation is requested or document upload has raw text
    if (body.generateAI && rawText.trim().length > 30) {
      try {
        const summaryResult = await summarizeText(rawText, body.template);
        summary = summaryResult.summary || summary;
        bulletPoints = summaryResult.bulletPoints || bulletPoints;
        tagsToConnect = summaryResult.tags || [];
        sentiment = summaryResult.sentiment || null;

        if (finalTitle === 'Untitled Note') {
          const autoTitle = await generateTitle(rawText);
          if (autoTitle) finalTitle = autoTitle;
        }
      } catch (aiErr) {
        console.warn('AI summarization failed or was skipped, falling back to local text:', aiErr);
        if (!summary && rawText.length > 0) {
          summary = rawText.slice(0, 200).trim() + (rawText.length > 200 ? '...' : '');
        }
      }
    } else {
      if (!summary && rawText.length > 0) {
        summary = rawText.slice(0, 200).trim() + (rawText.length > 200 ? '...' : '');
      }
    }

    const content = body.content || (bulletPoints.length > 0 ? bulletPoints.join('\n') : rawText);

    // Create note in database
    const note = await prisma.note.create({
      data: {
        title: finalTitle,
        originalText: rawText,
        summary: summary,
        bulletPoints: bulletPoints,
        content: content,
        userId: session.user.id,
        folderId: body.folderId || null,
        sourceType: body.sourceType,
        fileName: body.fileName || null,
        sentiment: sentiment,
        ...(tagsToConnect.length > 0
          ? {
              tags: {
                create: tagsToConnect.map((tagName) => ({
                  tag: {
                    connectOrCreate: {
                      where: { name: tagName.toLowerCase().trim() },
                      create: { name: tagName.toLowerCase().trim() },
                    },
                  },
                })),
              },
            }
          : {}),
      },
      include: {
        tags: { include: { tag: true } },
        folder: true,
      },
    });

    // Create initial version checkpoint
    await prisma.noteVersion.create({
      data: {
        noteId: note.id,
        content: note.content,
        title: note.title,
        summary: note.summary,
      },
    });

    return {
      data: note,
      statusCode: 201,
    };
  } catch (error) {
    ErrorLogger.log(error, {
      action: 'create_note',
      userId: session.user.id,
      sourceType: body.sourceType,
    });
    throw error;
  }
});
