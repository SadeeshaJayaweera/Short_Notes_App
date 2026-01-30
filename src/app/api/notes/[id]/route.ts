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
      include: { tags: { include: { tag: true } }, versions: true, folder: true },
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

    return NextResponse.json(note);
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
    const { title, content, summary, bulletPoints, color, isPinned, isFavorite } = body;

    // Create version before updating
    await prisma.noteVersion.create({
      data: {
        noteId: note.id,
        content: note.content,
        title: note.title,
        summary: note.summary,
      },
    });

    const updatedNote = await prisma.note.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(summary && { summary }),
        ...(bulletPoints && { bulletPoints }),
        ...(color && { color }),
        ...(isPinned !== undefined && { isPinned }),
        ...(isFavorite !== undefined && { isFavorite }),
      },
      include: { tags: { include: { tag: true } } },
    });

    return NextResponse.json(updatedNote);
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

    await prisma.note.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json(
      { message: 'Failed to delete note' },
      { status: 500 }
    );
  }
}
