import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createFolderSchema = z.object({
  name: z.string().min(1, 'Folder name is required'),
  color: z.string().optional().default('blue'),
});

const updateFolderSchema = z.object({
  id: z.string().min(1, 'Folder ID is required'),
  name: z.string().min(1).optional(),
  color: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const folders = await prisma.folder.findMany({
      where: { userId: session.user.id },
      include: {
        _count: {
          select: {
            notes: {
              where: { deletedAt: null },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ success: true, data: folders });
  } catch (error) {
    console.error('Error fetching folders:', error);
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
    const { name, color } = createFolderSchema.parse(body);

    const existing = await prisma.folder.findFirst({
      where: {
        userId: session.user.id,
        name: { equals: name.trim(), mode: 'insensitive' },
      },
    });

    if (existing) {
      return NextResponse.json(
        { message: 'Folder with this name already exists' },
        { status: 400 }
      );
    }

    const folder = await prisma.folder.create({
      data: {
        name: name.trim(),
        color: color || 'blue',
        userId: session.user.id,
      },
      include: {
        _count: { select: { notes: true } },
      },
    });

    return NextResponse.json({ success: true, data: folder }, { status: 201 });
  } catch (error) {
    console.error('Error creating folder:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid input', errors: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: 'Failed to create folder' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, name, color } = updateFolderSchema.parse(body);

    const folder = await prisma.folder.findUnique({
      where: { id },
    });

    if (!folder || folder.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'Folder not found or access denied' },
        { status: 404 }
      );
    }

    if (name && name.trim() !== folder.name) {
      const duplicate = await prisma.folder.findFirst({
        where: {
          userId: session.user.id,
          name: { equals: name.trim(), mode: 'insensitive' },
          id: { not: id },
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { message: 'Another folder with this name already exists' },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.folder.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(color && { color }),
      },
      include: {
        _count: { select: { notes: true } },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating folder:', error);
    return NextResponse.json(
      { message: 'Failed to update folder' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Folder ID is required' }, { status: 400 });
    }

    const folder = await prisma.folder.findUnique({
      where: { id },
    });

    if (!folder || folder.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'Folder not found or access denied' },
        { status: 404 }
      );
    }

    // Detach notes first so notes are preserved in root
    await prisma.note.updateMany({
      where: { folderId: id },
      data: { folderId: null },
    });

    await prisma.folder.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Folder deleted successfully' });
  } catch (error) {
    console.error('Error deleting folder:', error);
    return NextResponse.json(
      { message: 'Failed to delete folder' },
      { status: 500 }
    );
  }
}
