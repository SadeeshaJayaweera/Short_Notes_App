import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const { message, conversationId, scope = 'all', scopeId } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ message: 'User message cannot be empty' }, { status: 400 });
    }

    // 1. Resolve or create AIConversation
    let convId = conversationId;
    if (!convId) {
      const conv = await prisma.aIConversation.create({
        data: {
          title: message.trim().slice(0, 40) + (message.length > 40 ? '...' : ''),
          userId,
          scope,
          scopeId: scopeId || null,
        },
      });
      convId = conv.id;
    }

    // Save user message
    await prisma.aIMessage.create({
      data: {
        conversationId: convId,
        role: 'user',
        content: message.trim(),
      },
    });

    // 2. RAG Retrieval Step: Find relevant notes
    const where: any = {
      userId,
      deletedAt: null,
    };

    if (scope === 'folder' && scopeId) {
      where.folderId = scopeId;
    } else if (scope === 'note' && scopeId) {
      where.id = scopeId;
    }

    // Split query terms for keyword scoring
    const searchTerms = message
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .split(/\s+/)
      .filter((t: string) => t.length > 2);

    const userNotes = await prisma.note.findMany({
      where,
      select: {
        id: true,
        title: true,
        content: true,
        summary: true,
        bulletPoints: true,
        sourceType: true,
        folder: { select: { name: true } },
        tags: { select: { tag: { select: { name: true } } } },
      },
      take: 20,
    });

    // Score notes by keyword match frequency
    const scoredNotes = userNotes.map((note) => {
      let score = 0;
      const combinedText = `${note.title} ${note.summary} ${note.content}`.toLowerCase();
      searchTerms.forEach((term: string) => {
        if (note.title.toLowerCase().includes(term)) score += 5;
        if (note.summary?.toLowerCase().includes(term)) score += 3;
        if (combinedText.includes(term)) score += 1;
      });
      return { note, score };
    });

    // Select top 4 most relevant notes (or first 4 if generic question)
    scoredNotes.sort((a, b) => b.score - a.score);
    const topScored = scoredNotes.slice(0, 4);
    const relevantSources = topScored.map((item, idx) => ({
      citationNumber: idx + 1,
      noteId: item.note.id,
      title: item.note.title,
      folder: item.note.folder?.name || 'Unorganized',
      snippet: item.note.summary || item.note.content.slice(0, 300) + '...',
      content: item.note.content.slice(0, 1500),
    }));

    // 3. Assemble Grounded Context
    let contextBlock = '';
    if (relevantSources.length > 0) {
      contextBlock = relevantSources
        .map(
          (s) =>
            `[Source ^${s.citationNumber}] Title: "${s.title}" (Folder: ${s.folder})\nContent:\n${s.content}\n`
        )
        .join('\n---\n');
    }

    const systemPrompt = `You are Short Notes AI Knowledge Assistant, an elite personal knowledge engine.
Your mission is to help the user understand, recall, and act on their personal notes and documents.

CRITICAL INSTRUCTIONS:
1. Ground your answers ONLY in the provided note excerpts below.
2. For every statement or key insight derived from a note, cite the source using [^1], [^2], matching the source numbers.
3. If the user asks something not covered in the notes, explicitly state: "Based on your notes, I couldn't find information about this." Do not fabricate or hallucinate answers.
4. Format your response cleanly using Markdown with bullet points, bold highlights, and clear structure.

User's Retrieved Notes Context:
${contextBlock || 'No matching notes found for this query.'}`;

    // 4. Retrieve conversation history (last 6 messages)
    const pastMessages = await prisma.aIMessage.findMany({
      where: { conversationId: convId },
      orderBy: { createdAt: 'desc' },
      take: 6,
    });
    pastMessages.reverse();

    const formattedMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...pastMessages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ];

    // 5. Model Execution
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    let assistantReply = '';
    try {
      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
        messages: formattedMessages,
        max_tokens: 1500,
        temperature: 0.3,
      });

      assistantReply =
        completion.choices[0]?.message?.content ||
        'I processed your notes, but could not produce a response.';
    } catch (aiError: any) {
      console.warn('AI call error, generating rule-based response:', aiError);
      // Fallback if OpenAI key is not set or quota exceeded
      if (relevantSources.length > 0) {
        assistantReply = `Here are the relevant notes found in your knowledge base regarding your query:\n\n` +
          relevantSources
            .map((s) => `**[^${s.citationNumber}] ${s.title}**\n${s.snippet}\n`)
            .join('\n') +
          `\n*(AI completion temporarily running in offline mode. Configure your API key in Settings to enable full natural language synthesis).*`;
      } else {
        assistantReply = `I couldn't find any notes matching "${message}" in your knowledge base.`;
      }
    }

    // 6. Save assistant message & source citations
    const savedAssistantMsg = await prisma.aIMessage.create({
      data: {
        conversationId: convId,
        role: 'assistant',
        content: assistantReply,
        sources: {
          create: relevantSources.map((s) => ({
            noteId: s.noteId,
            snippet: s.snippet,
            citationNumber: s.citationNumber,
          })),
        },
      },
      include: {
        sources: {
          include: {
            note: {
              select: { id: true, title: true, folder: { select: { name: true } } },
            },
          },
        },
      },
    });

    // Update conversation updatedAt
    await prisma.aIConversation.update({
      where: { id: convId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      data: {
        conversationId: convId,
        message: savedAssistantMsg,
        sources: relevantSources,
      },
    });
  } catch (error: any) {
    console.error('Error in AI Chat API:', error);
    return NextResponse.json(
      { message: error.message || 'Internal AI service error' },
      { status: 500 }
    );
  }
}

