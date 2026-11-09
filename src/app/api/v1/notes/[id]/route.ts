import { NextRequest } from 'next/server';
import { authenticateApiKey } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { apiResponse, errorResponse } from '@/lib/api-response';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await authenticateApiKey(req);
  if (!auth.authenticated || !auth.user) {
    return errorResponse(auth.error || 'Unauthorized', 401);
  }

  try {
    const note = await prisma.note.findFirst({
      where: {
        id: params.id,
        userId: auth.user.id,
        deletedAt: null,
      },
      include: {
        tags: {
          select: {
            tag: { select: { id: true, name: true, color: true } },
          },
        },
        folder: {
          select: { id: true, name: true, color: true },
        },
      },
    });

    if (!note) {
      return errorResponse('Note not found', 404);
    }

    return apiResponse({
      note: {
        ...note,
        tags: note.tags.map((t) => t.tag),
      },
    });
  } catch (error) {
    console.error('v1/notes/[id] GET error:', error);
    return errorResponse('Failed to retrieve note', 500);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await authenticateApiKey(req);
  if (!auth.authenticated || !auth.user) {
    return errorResponse(auth.error || 'Unauthorized', 401);
  }

  try {
    const existing = await prisma.note.findFirst({
      where: { id: params.id, userId: auth.user.id, deletedAt: null },
    });

    if (!existing) {
      return errorResponse('Note not found', 404);
    }

    const body = await req.json();
    const { title, content, folderId, isPinned, isFavorite } = body;

    const dataToUpdate: any = {};
    if (title !== undefined) dataToUpdate.title = title.trim();
    if (content !== undefined) {
      dataToUpdate.content = content;
      dataToUpdate.originalText = content;
      const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
      dataToUpdate.wordCount = wordCount;
      dataToUpdate.readingTime = Math.max(1, Math.ceil(wordCount / 200));
    }
    if (folderId !== undefined) dataToUpdate.folderId = folderId || null;
    if (isPinned !== undefined) dataToUpdate.isPinned = Boolean(isPinned);
    if (isFavorite !== undefined) dataToUpdate.isFavorite = Boolean(isFavorite);

    const updated = await prisma.note.update({
      where: { id: params.id },
      data: dataToUpdate,
    });

    return apiResponse({ note: updated });
  } catch (error) {
    console.error('v1/notes/[id] PUT error:', error);
    return errorResponse('Failed to update note', 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await authenticateApiKey(req);
  if (!auth.authenticated || !auth.user) {
    return errorResponse(auth.error || 'Unauthorized', 401);
  }

  try {
    const existing = await prisma.note.findFirst({
      where: { id: params.id, userId: auth.user.id },
    });

    if (!existing) {
      return errorResponse('Note not found', 404);
    }

    // Soft delete
    await prisma.note.update({
      where: { id: params.id },
      data: { deletedAt: new Date() },
    });

    return apiResponse({ success: true, message: 'Note soft-deleted successfully' });
  } catch (error) {
    console.error('v1/notes/[id] DELETE error:', error);
    return errorResponse('Failed to delete note', 500);
  }
}

