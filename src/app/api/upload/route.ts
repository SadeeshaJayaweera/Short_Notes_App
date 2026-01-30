import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { parsePDF, parseWord, parseText } from '@/lib/parsers';
import { summarizeText, generateTitle } from '@/lib/openai';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const folderId = formData.get('folderId') as string | null;

    if (!file) {
      return NextResponse.json(
        { message: 'No file provided' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name;
    const mimeType = file.type;

    let parsedDoc;

    // Parse based on file type
    if (mimeType === 'application/pdf') {
      parsedDoc = await parsePDF(buffer, fileName);
    } else if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimeType === 'application/msword'
    ) {
      parsedDoc = await parseWord(buffer, fileName);
    } else if (mimeType.startsWith('text/')) {
      const text = buffer.toString('utf-8');
      parsedDoc = parseText(text, fileName);
    } else {
      return NextResponse.json(
        { message: 'Unsupported file type. Please upload PDF, Word, or text files.' },
        { status: 400 }
      );
    }

    // Summarize text
    const summaryResult = await summarizeText(parsedDoc.text);

    // Generate title
    const title = await generateTitle(parsedDoc.text);

    // Create note
    const note = await prisma.note.create({
      data: {
        title,
        originalText: parsedDoc.text,
        summary: summaryResult.summary,
        bulletPoints: summaryResult.bulletPoints,
        content: summaryResult.bulletPoints.join('\n'),
        userId: session.user.id,
        folderId: folderId || undefined,
        sourceType: parsedDoc.sourceType,
        fileName: parsedDoc.fileName,
      },
      include: { tags: { include: { tag: true } } },
    });

    // Create version
    await prisma.noteVersion.create({
      data: {
        noteId: note.id,
        content: note.content,
        title: note.title,
        summary: note.summary,
      },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error: any) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to upload and process file' },
      { status: 500 }
    );
  }
}
