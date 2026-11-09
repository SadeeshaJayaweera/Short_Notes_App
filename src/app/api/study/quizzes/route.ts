import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiResponse, errorResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    const { searchParams } = new URL(req.url);
    const quizId = searchParams.get('id');

    if (quizId) {
      const quiz = await prisma.quiz.findFirst({
        where: { id: quizId, userId: session.user.id },
        include: {
          questions: true,
          note: { select: { id: true, title: true } },
        },
      });

      if (!quiz) {
        return errorResponse('Quiz not found', 404);
      }

      return apiResponse({ quiz });
    }

    const quizzes = await prisma.quiz.findMany({
      where: { userId: session.user.id },
      include: {
        questions: { select: { id: true } },
        note: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return apiResponse({
      quizzes: quizzes.map((q) => ({
        id: q.id,
        title: q.title,
        description: q.description,
        score: q.score,
        questionCount: q.questions.length,
        note: q.note,
        createdAt: q.createdAt,
      })),
    });
  } catch (error) {
    console.error('Quiz GET error:', error);
    return errorResponse('Failed to fetch quizzes', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await req.json();
    const { quizId, score } = body;

    if (!quizId || typeof score !== 'number') {
      return errorResponse('Valid quiz ID and score required', 400);
    }

    const quiz = await prisma.quiz.findFirst({
      where: { id: quizId, userId: session.user.id },
    });

    if (!quiz) {
      return errorResponse('Quiz not found', 404);
    }

    const updated = await prisma.quiz.update({
      where: { id: quizId },
      data: { score },
    });

    return apiResponse({ quiz: updated });
  } catch (error) {
    console.error('Quiz POST error:', error);
    return errorResponse('Failed to record quiz score', 500);
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
      return errorResponse('Quiz ID required', 400);
    }

    await prisma.quiz.deleteMany({
      where: { id, userId: session.user.id },
    });

    return apiResponse({ success: true, message: 'Quiz deleted' });
  } catch (error) {
    console.error('Quiz DELETE error:', error);
    return errorResponse('Failed to delete quiz', 500);
  }
}

