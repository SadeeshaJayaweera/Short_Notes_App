import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createFolderSchema = z.object({
  name: z.string().min(1),
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
          select: { notes: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(folders);
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

    // Check if folder with same name already exists
    const existing = await prisma.folder.findFirst({
      where: {
        userId: session.user.id,
        name: name.toLowerCase(),
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
        name,
        color,
        userId: session.user.id,
      },
    });

    return NextResponse.json(folder, { status: 201 });
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
