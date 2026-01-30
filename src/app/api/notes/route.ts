import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { summarizeText, generateTitle } from '@/lib/openai';
import { z } from 'zod';

const createNoteSchema = z.object({
  title: z.string().min(1),
  originalText: z.string().min(1),
  folderId: z.string().optional(),
  sourceType: z.enum(['manual', 'pdf', 'word', 'text']).default('manual'),
  fileName: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const folderId = searchParams.get('folderId');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 20;
    const skip = (page - 1) * limit;

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

    return NextResponse.json({
      notes,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, originalText, folderId, sourceType, fileName } =
      createNoteSchema.parse(body);

    // Summarize the text using OpenAI
    const summaryResult = await summarizeText(originalText);

    // Generate auto title if not provided
    const finalTitle = title && title !== 'Untitled Note'
      ? title
      : await generateTitle(originalText);

    // Create the note
    const note = await prisma.note.create({
      data: {
        title: finalTitle,
        originalText,
        summary: summaryResult.summary,
        bulletPoints: summaryResult.bulletPoints,
        content: summaryResult.bulletPoints.join('\n'),
        userId: session.user.id,
        folderId,
        sourceType,
        fileName,
      },
      include: { tags: { include: { tag: true } } },
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

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error('Error creating note:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid input', errors: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: 'Failed to create note' },
      { status: 500 }
    );
  }
}
