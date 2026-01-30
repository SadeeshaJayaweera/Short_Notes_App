import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateShareToken } from '@/lib/helpers';

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
    const { isPublic, canEdit, expiresAt } = body;

    // Check if already shared
    let sharedNote = await prisma.sharedNote.findFirst({
      where: { noteId: params.id, userId: session.user.id },
    });

    if (sharedNote) {
      sharedNote = await prisma.sharedNote.update({
        where: { id: sharedNote.id },
        data: {
          isPublic: isPublic ?? sharedNote.isPublic,
          canEdit: canEdit ?? sharedNote.canEdit,
          expiresAt: expiresAt ? new Date(expiresAt) : sharedNote.expiresAt,
        },
      });
    } else {
      sharedNote = await prisma.sharedNote.create({
        data: {
          noteId: params.id,
          userId: session.user.id,
          shareToken: generateShareToken(),
          isPublic: isPublic ?? false,
          canEdit: canEdit ?? false,
          expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        },
      });
    }

    const shareUrl = `${process.env.NEXTAUTH_URL}/share/${sharedNote.shareToken}`;

    return NextResponse.json({
      ...sharedNote,
      shareUrl,
    });
  } catch (error) {
    console.error('Error sharing note:', error);
    return NextResponse.json(
      { message: 'Failed to share note' },
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

    const sharedNote = await prisma.sharedNote.findFirst({
      where: { noteId: params.id, userId: session.user.id },
    });

    if (!sharedNote) {
      return NextResponse.json(
        { message: 'Shared note not found' },
        { status: 404 }
      );
    }

    await prisma.sharedNote.delete({
      where: { id: sharedNote.id },
    });

    return NextResponse.json({ message: 'Share removed successfully' });
  } catch (error) {
    console.error('Error removing share:', error);
    return NextResponse.json(
      { message: 'Failed to remove share' },
      { status: 500 }
    );
  }
}
