import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const sharedNote = await prisma.sharedNote.findUnique({
      where: { shareToken: params.token },
      include: {
        note: {
          include: {
            tags: { include: { tag: true } },
            user: { select: { name: true, image: true } },
          },
        },
      },
    });

    if (!sharedNote || !sharedNote.isPublic) {
      return NextResponse.json({ message: 'Note not found or link has been disabled' }, { status: 404 });
    }

    if (sharedNote.expiresAt && new Date(sharedNote.expiresAt) < new Date()) {
      return NextResponse.json({ message: 'This shared note link has expired' }, { status: 410 });
    }

    if (sharedNote.note.deletedAt) {
      return NextResponse.json({ message: 'This note has been deleted by its author' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: sharedNote.note.id,
        title: sharedNote.note.title,
        content: sharedNote.note.content,
        summary: sharedNote.note.summary,
        bulletPoints: sharedNote.note.bulletPoints,
        sourceType: sharedNote.note.sourceType,
        createdAt: sharedNote.note.createdAt,
        updatedAt: sharedNote.note.updatedAt,
        author: sharedNote.note.user.name || 'Anonymous',
        tags: sharedNote.note.tags.map((t) => t.tag.name),
        canEdit: sharedNote.canEdit,
      },
    });
  } catch (error) {
    console.error('Error fetching public shared note:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

