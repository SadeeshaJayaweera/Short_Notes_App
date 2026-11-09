import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const task = await prisma.task.findUnique({ where: { id: params.id } });
    if (!task || task.userId !== session.user.id) {
      return NextResponse.json({ message: 'Task not found or access denied' }, { status: 404 });
    }

    const body = await req.json();
    const { title, description, status, priority, dueDate } = body;

    const updated = await prisma.task.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      },
      include: {
        note: { select: { id: true, title: true } },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ message: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const task = await prisma.task.findUnique({ where: { id: params.id } });
    if (!task || task.userId !== session.user.id) {
      return NextResponse.json({ message: 'Task not found or access denied' }, { status: 404 });
    }

    await prisma.task.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ message: 'Failed to delete task' }, { status: 500 });
  }
}

