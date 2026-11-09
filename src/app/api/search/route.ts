import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';

    if (!query.trim()) {
      return NextResponse.json({ success: true, data: { notes: [], folders: [] } });
    }

    const q = query.trim();

    const [notes, folders] = await Promise.all([
      prisma.note.findMany({
        where: {
          userId: session.user.id,
          deletedAt: null,
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { summary: { contains: q, mode: 'insensitive' } },
            { content: { contains: q, mode: 'insensitive' } },
            { tags: { some: { tag: { name: { contains: q, mode: 'insensitive' } } } } },
          ],
        },
        select: {
          id: true,
          title: true,
          summary: true,
          sourceType: true,
          folder: { select: { name: true } },
          tags: { select: { tag: { select: { name: true } } } },
          updatedAt: true,
        },
        take: 10,
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.folder.findMany({
        where: {
          userId: session.user.id,
          name: { contains: q, mode: 'insensitive' },
        },
        include: {
          _count: { select: { notes: true } },
        },
        take: 5,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        notes,
        folders,
      },
    });
  } catch (error) {
    console.error('Error in global search:', error);
    return NextResponse.json({ message: 'Search failed' }, { status: 500 });
  }
}

