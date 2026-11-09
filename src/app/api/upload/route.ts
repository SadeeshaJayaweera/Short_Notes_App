import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { parsePDF, parseWord, parseText } from '@/lib/parsers';
import { summarizeText, generateTitle } from '@/lib/openai';
import { prisma } from '@/lib/prisma';

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const folderId = formData.get('folderId') as string | null;
    const template = formData.get('template') as string | undefined;

    if (!file) {
      return NextResponse.json(
        { message: 'No file provided' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { message: 'File exceeds maximum allowed size (15MB)' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name;
    const mimeType = file.type;

    let parsedDoc;

    // Parse based on file type
    if (mimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
      parsedDoc = await parsePDF(buffer, fileName);
    } else if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimeType === 'application/msword' ||
      fileName.toLowerCase().endsWith('.docx') ||
      fileName.toLowerCase().endsWith('.doc')
    ) {
      parsedDoc = await parseWord(buffer, fileName);
    } else if (
      mimeType.startsWith('text/') ||
      fileName.toLowerCase().endsWith('.txt') ||
      fileName.toLowerCase().endsWith('.md')
    ) {
      const text = buffer.toString('utf-8');
      parsedDoc = parseText(text, fileName);
    } else {
      return NextResponse.json(
        { message: 'Unsupported file type. Please upload PDF, Word (.docx), or text files.' },
        { status: 400 }
      );
    }

    let summary = '';
    let bulletPoints: string[] = [];
    let tagsToConnect: string[] = [];
    let sentiment: string | null = null;
    let title = fileName.replace(/\.[^/.]+$/, '');

    // Attempt AI summarization with fallback
    try {
      const summaryResult = await summarizeText(parsedDoc.text, template);
      summary = summaryResult.summary;
      bulletPoints = summaryResult.bulletPoints;
      tagsToConnect = summaryResult.tags || [];
      sentiment = summaryResult.sentiment;

      const aiTitle = await generateTitle(parsedDoc.text);
      if (aiTitle && aiTitle !== 'Untitled Note') {
        title = aiTitle;
      }
    } catch (aiError) {
      console.warn('AI summarization unavailable, saving parsed document content directly:', aiError);
      summary = parsedDoc.text.slice(0, 300).trim() + (parsedDoc.text.length > 300 ? '...' : '');
      bulletPoints = parsedDoc.text
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 20)
        .slice(0, 5);
    }

    // Create note
    const note = await prisma.note.create({
      data: {
        title,
        originalText: parsedDoc.text,
        summary,
        bulletPoints,
        content: bulletPoints.length > 0 ? bulletPoints.join('\n') : parsedDoc.text,
        userId: session.user.id,
        folderId: folderId || null,
        sourceType: parsedDoc.sourceType,
        fileName: parsedDoc.fileName,
        sentiment,
        ...(tagsToConnect.length > 0
          ? {
              tags: {
                create: tagsToConnect.map((tagName) => ({
                  tag: {
                    connectOrCreate: {
                      where: { name: tagName.toLowerCase().trim() },
                      create: { name: tagName.toLowerCase().trim() },
                    },
                  },
                })),
              },
            }
          : {}),
      },
      include: {
        tags: { include: { tag: true } },
        folder: true,
      },
    });

    // Create initial version
    await prisma.noteVersion.create({
      data: {
        noteId: note.id,
        content: note.content,
        title: note.title,
        summary: note.summary,
      },
    });

    return NextResponse.json({ success: true, data: note }, { status: 201 });
  } catch (error: any) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to upload and process file' },
      { status: 500 }
    );
  }
}
