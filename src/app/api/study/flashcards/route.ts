import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateNextReview } from '@/lib/spaced-repetition';
import { apiResponse, errorResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    const { searchParams } = new URL(req.url);
    const dueOnly = searchParams.get('due') === 'true';
    const noteId = searchParams.get('noteId');
    const deckName = searchParams.get('deck');

    const now = new Date();
    const whereClause: Record<string, any> = {
      userId: session.user.id,
    };

    if (dueOnly) {
      whereClause.dueDate = { lte: now };
    }
    if (noteId) {
      whereClause.noteId = noteId;
    }
    if (deckName) {
      whereClause.deckName = deckName;
    }

    const [flashcards, totalCount, dueCount, masteredCount] = await Promise.all([
      prisma.flashcard.findMany({
        where: whereClause,
        include: {
          note: {
            select: { id: true, title: true },
          },
        },
        orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
        take: 100,
      }),
      prisma.flashcard.count({ where: { userId: session.user.id } }),
      prisma.flashcard.count({
        where: { userId: session.user.id, dueDate: { lte: now } },
      }),
      prisma.flashcard.count({
        where: { userId: session.user.id, repetitions: { gte: 3 } },
      }),
    ]);

    // Unique deck names
    const decks = await prisma.flashcard.groupBy({
      by: ['deckName'],
      where: { userId: session.user.id },
      _count: true,
    });

    return apiResponse({
      flashcards,
      stats: {
        total: totalCount,
        due: dueCount,
        mastered: masteredCount,
      },
      decks: decks.map((d) => ({ name: d.deckName, count: d._count })),
    });
  } catch (error) {
    console.error('Flashcards GET error:', error);
    return errorResponse('Failed to fetch flashcards', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await req.json();
    const { front, back, deckName = 'Default', noteId } = body;

    if (!front || !back) {
      return errorResponse('Both front and back content are required', 400);
    }

    if (noteId) {
      const note = await prisma.note.findFirst({
        where: { id: noteId, userId: session.user.id, deletedAt: null },
      });
      if (!note) {
        return errorResponse('Linked note not found or access denied', 404);
      }
    }

    const flashcard = await prisma.flashcard.create({
      data: {
        userId: session.user.id,
        noteId: noteId || null,
        deckName: deckName.trim() || 'Default',
        front: front.trim(),
        back: back.trim(),
        dueDate: new Date(), // immediately available for first study
      },
    });

    return apiResponse({ flashcard }, 201);
  } catch (error) {
    console.error('Flashcards POST error:', error);
    return errorResponse('Failed to create flashcard', 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await req.json();
    const { id, grade } = body;

    if (!id || typeof grade !== 'number' || grade < 1 || grade > 4) {
      return errorResponse('Valid card ID and rating grade (1-4) required', 400);
    }

    const existingCard = await prisma.flashcard.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existingCard) {
      return errorResponse('Flashcard not found', 404);
    }

    const reviewUpdate = calculateNextReview(
      {
        easeFactor: existingCard.easeFactor,
        interval: existingCard.interval,
        repetitions: existingCard.repetitions,
      },
      grade
    );

    const updatedCard = await prisma.flashcard.update({
      where: { id },
      data: {
        easeFactor: reviewUpdate.easeFactor,
        interval: reviewUpdate.interval,
        repetitions: reviewUpdate.repetitions,
        dueDate: reviewUpdate.dueDate,
        lastReviewedAt: new Date(),
      },
    });

    return apiResponse({ flashcard: updatedCard, review: reviewUpdate });
  } catch (error) {
    console.error('Flashcards PUT error:', error);
    return errorResponse('Failed to record card review', 500);
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
      return errorResponse('Card ID is required', 400);
    }

    await prisma.flashcard.deleteMany({
      where: { id, userId: session.user.id },
    });

    return apiResponse({ success: true, message: 'Flashcard deleted successfully' });
  } catch (error) {
    console.error('Flashcards DELETE error:', error);
    return errorResponse('Failed to delete flashcard', 500);
  }
}

