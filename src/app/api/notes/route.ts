import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { summarizeText, generateTitle } from '@/lib/openai';
import { z } from 'zod';
import { apiHandler, validateRequestBody, ApiResponse } from '@/lib/api-handler';
import { AuthenticationError, ValidationError, ErrorLogger } from '@/lib/errors';

const createNoteSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  originalText: z.string().min(1, 'Content is required'),
  folderId: z.string().optional(),
  sourceType: z.enum(['manual', 'pdf', 'word', 'text']).default('manual'),
  fileName: z.string().optional(),
});

export const GET = apiHandler(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new AuthenticationError('You must be logged in to view notes');
  }

  const { searchParams } = new URL(req.url);
  const folderId = searchParams.get('folderId');
  const search = searchParams.get('search');
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = 20;
  const skip = (page - 1) * limit;

  try {
    const where: any = { userId: session.user.id };
    if (folderId) where.folderId = folderId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [notes, total] = await Promise.all([
      prisma.note.findMany({
        where,
        include: { tags: { include: { tag: true } }, folder: true },
        orderBy: { createdAt: 'desc' },
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

  try {
    // Validate content length
    if (body.originalText.length > 500000) {
      throw new ValidationError('Content is too long (max 500KB)', {
        maxLength: 500000,
        currentLength: body.originalText.length,
      });
    }

    // Summarize the text using OpenAI
    const summaryResult = await summarizeText(body.originalText);

    // Generate auto title if not provided
    const finalTitle =
      body.title && body.title !== 'Untitled Note'
        ? body.title
        : await generateTitle(body.originalText);

    // Create the note
    const note = await prisma.note.create({
      data: {
        title: finalTitle,
        originalText: body.originalText,
        summary: summaryResult.summary,
        bulletPoints: summaryResult.bulletPoints,
        content: summaryResult.bulletPoints.join('\n'),
        userId: session.user.id,
        folderId: body.folderId,
        sourceType: body.sourceType,
        fileName: body.fileName,
      },
      include: { tags: { include: { tag: true } }, folder: true },
    });

    // Store version
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

