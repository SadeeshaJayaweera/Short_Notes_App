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

    const conversations = await prisma.aIConversation.findMany({
      where: { userId: session.user.id },
      include: {
        _count: { select: { messages: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: conversations });
  } catch (error) {
    console.error('Error fetching AI conversations:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const title = body.title || 'New Conversation';
    const scope = body.scope || 'all';
    const scopeId = body.scopeId || null;

    const conversation = await prisma.aIConversation.create({
      data: {
        title,
        userId: session.user.id,
        scope,
        scopeId,
      },
    });

    return NextResponse.json({ success: true, data: conversation }, { status: 201 });
  } catch (error) {
    console.error('Error creating AI conversation:', error);
    return NextResponse.json({ message: 'Failed to create conversation' }, { status: 500 });
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
      return NextResponse.json({ message: 'Conversation ID is required' }, { status: 400 });
    }

    const conv = await prisma.aIConversation.findUnique({ where: { id } });
    if (!conv || conv.userId !== session.user.id) {
      return NextResponse.json({ message: 'Conversation not found or access denied' }, { status: 404 });
    }

    await prisma.aIConversation.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Conversation deleted' });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return NextResponse.json({ message: 'Failed to delete conversation' }, { status: 500 });
  }
}

