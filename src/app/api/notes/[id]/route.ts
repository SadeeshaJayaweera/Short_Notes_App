import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
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
      include: {
        tags: { include: { tag: true } },
        versions: { orderBy: { createdAt: 'desc' }, take: 10 },
        folder: true,
        sharedNotes: true,
        targetRelationships: {
          include: {
            sourceNote: {
              select: { id: true, title: true, summary: true },
            },
          },
        },
        sourceRelationships: {
          include: {
            targetNote: {
              select: { id: true, title: true, summary: true },
            },
          },
        },
      },
    });

    if (!note) {
      return NextResponse.json({ message: 'Note not found' }, { status: 404 });
    }

    if (note.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, data: note });
  } catch (error) {
    console.error('Error fetching note:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const {
      title,
      content,
      summary,
      bulletPoints,
      color,
      isPinned,
      isFavorite,
      folderId,
      restore,
    } = body;

    // Handle restore from trash
    if (restore) {
      const restored = await prisma.note.update({
        where: { id: params.id },
        data: { deletedAt: null },
      });
      return NextResponse.json({ success: true, data: restored });
    }

    // Only create version if content, title, or summary changed
    const contentChanged =
      (content !== undefined && content !== note.content) ||
      (title !== undefined && title !== note.title) ||
      (summary !== undefined && summary !== note.summary);

    if (contentChanged) {
      await prisma.noteVersion.create({
        data: {
          noteId: note.id,
          content: note.content,
          title: note.title,
          summary: note.summary,
        },
      });
    }

    const updatedNote = await prisma.note.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(summary !== undefined && { summary }),
        ...(bulletPoints !== undefined && { bulletPoints }),
        ...(color !== undefined && { color }),
        ...(isPinned !== undefined && { isPinned }),
        ...(isFavorite !== undefined && { isFavorite }),
        ...(folderId !== undefined && { folderId: folderId || null }),
      },
      include: {
        tags: { include: { tag: true } },
        folder: true,
      },
    });

    return NextResponse.json({ success: true, data: updatedNote });
  } catch (error) {
    console.error('Error updating note:', error);
    return NextResponse.json(
      { message: 'Failed to update note' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const { searchParams } = new URL(req.url);
    const permanent = searchParams.get('permanent') === 'true';

    if (permanent) {
      // Hard delete from DB
      await prisma.note.delete({
        where: { id: params.id },
      });
      return NextResponse.json({ success: true, message: 'Note permanently purged' });
    } else {
      // Soft delete: move to trash
      await prisma.note.update({
        where: { id: params.id },
        data: { deletedAt: new Date() },
      });
      return NextResponse.json({ success: true, message: 'Note moved to trash' });
    }
  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json(
      { message: 'Failed to delete note' },
      { status: 500 }
    );
  }
}
