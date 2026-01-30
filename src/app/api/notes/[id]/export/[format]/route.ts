import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  exportNoteToPDF,
  exportNoteToWord,
  exportNoteToMarkdown,
  exportNoteToHTML,
} from '@/lib/export';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; format: string } }
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

    const format = params.format.toLowerCase();

    switch (format) {
      case 'pdf': {
        const blob = await exportNoteToPDF(
          note.title,
          note.content,
          note.bulletPoints
        );
        return new NextResponse(blob, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${note.title}.pdf"`,
          },
        });
      }

      case 'docx':
      case 'word': {
        const blob = await exportNoteToWord(note.title, note.bulletPoints);
        return new NextResponse(blob, {
          headers: {
            'Content-Type':
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition': `attachment; filename="${note.title}.docx"`,
          },
        });
      }

      case 'md':
      case 'markdown': {
        const markdown = exportNoteToMarkdown(note.title, note.bulletPoints);
        return new NextResponse(markdown, {
          headers: {
            'Content-Type': 'text/markdown',
            'Content-Disposition': `attachment; filename="${note.title}.md"`,
          },
        });
      }

      case 'html': {
        const html = await exportNoteToHTML(note.title, note.bulletPoints);
        return new NextResponse(html, {
          headers: {
            'Content-Type': 'text/html',
            'Content-Disposition': `attachment; filename="${note.title}.html"`,
          },
        });
      }

      case 'json': {
        const json = JSON.stringify(
          {
            title: note.title,
            summary: note.summary,
            bulletPoints: note.bulletPoints,
            createdAt: note.createdAt,
            updatedAt: note.updatedAt,
          },
          null,
          2
        );
        return new NextResponse(json, {
          headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="${note.title}.json"`,
          },
        });
      }

      default:
        return NextResponse.json(
          { message: 'Unsupported export format' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error exporting note:', error);
    return NextResponse.json(
      { message: 'Failed to export note' },
      { status: 500 }
    );
  }
}
