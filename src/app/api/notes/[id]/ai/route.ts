import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { summarizeText, generateTitle, improveText } from '@/lib/openai';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const note = await prisma.note.findUnique({
      where: { id: params.id },
    });

    if (!note || note.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'Note not found or access denied' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const action = body.action || 'summarize';
    const textToProcess = body.text || note.content || note.originalText || '';

    if (!textToProcess.trim()) {
      return NextResponse.json(
        { message: 'Note has no content to process' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'summarize': {
        const result = await summarizeText(textToProcess, body.template);
        return NextResponse.json({
          success: true,
          data: {
            summary: result.summary,
            bulletPoints: result.bulletPoints,
            tags: result.tags,
            sentiment: result.sentiment,
          },
        });
      }

      case 'improve': {
        const improved = await improveText(textToProcess);
        return NextResponse.json({
          success: true,
          data: { improvedText: improved },
        });
      }

      case 'title': {
        const newTitle = await generateTitle(textToProcess);
        return NextResponse.json({
          success: true,
          data: { title: newTitle },
        });
      }

      default:
        return NextResponse.json(
          { message: 'Unknown AI action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Error in note AI operation:', error);
    return NextResponse.json(
      { message: error.message || 'AI service unavailable' },
      { status: 500 }
    );
  }
}

