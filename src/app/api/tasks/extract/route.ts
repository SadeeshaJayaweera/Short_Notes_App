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
    const body = await req.json().catch(() => ({}));
    const noteId = body.noteId;

    // Fetch notes to analyze
    const where: any = { userId, deletedAt: null };
    if (noteId) where.id = noteId;

    const notes = await prisma.note.findMany({
      where,
      select: { id: true, title: true, content: true, bulletPoints: true },
      take: 5,
      orderBy: { updatedAt: 'desc' },
    });

    if (notes.length === 0) {
      return NextResponse.json({ message: 'No notes found to extract tasks from' }, { status: 400 });
    }

    const notesCorpus = notes
      .map((n) => `Note ID: ${n.id}\nTitle: "${n.title}"\nContent:\n${n.content.slice(0, 1500)}`)
      .join('\n\n---\n\n');

    const prompt = `You are an expert productivity assistant. Analyze the following notes and extract all actionable tasks, next steps, and to-dos.
For each action item found:
1. Provide a concise, action-oriented title starting with a verb.
2. Assign a priority: "urgent", "high", "medium", or "low".
3. Include the Note ID it originated from.

Format your response as a valid JSON array:
[
  { "title": "Review database migration script", "priority": "high", "noteId": "note_id_here" },
  { "title": "Schedule team alignment call", "priority": "medium", "noteId": "note_id_here" }
]

Notes to analyze:
${notesCorpus}`;

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    let createdTasks: any[] = [];

    try {
      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
      });

      const text = completion.choices[0]?.message?.content || '';
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const rawTasks = JSON.parse(jsonMatch[0]);
        for (const t of rawTasks) {
          if (t.title) {
            const created = await prisma.task.create({
              data: {
                title: t.title,
                priority: ['urgent', 'high', 'medium', 'low'].includes(t.priority) ? t.priority : 'medium',
                status: 'todo',
                noteId: notes.some((n) => n.id === t.noteId) ? t.noteId : notes[0].id,
                userId,
              },
              include: { note: { select: { id: true, title: true } } },
            });
            createdTasks.push(created);
          }
        }
      }
    } catch (aiErr) {
      console.warn('AI task extraction fallback:', aiErr);
      // Fallback: extract lines containing todo, task, action, checkbox
      for (const note of notes) {
        const lines = note.content.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (
            trimmed.toLowerCase().includes('todo') ||
            trimmed.toLowerCase().includes('action') ||
            trimmed.startsWith('- [ ]') ||
            trimmed.startsWith('• [ ]')
          ) {
            const cleanTitle = trimmed.replace(/^[-•*\[\]\s]+/, '').replace(/^(todo|action):\s*/i, '');
            if (cleanTitle.length > 5) {
              const created = await prisma.task.create({
                data: {
                  title: cleanTitle.slice(0, 100),
                  priority: 'medium',
                  status: 'todo',
                  noteId: note.id,
                  userId,
                },
                include: { note: { select: { id: true, title: true } } },
              });
              createdTasks.push(created);
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: createdTasks,
      message: `Extracted ${createdTasks.length} task(s)`,
    });
  } catch (error: any) {
    console.error('Error in task extraction:', error);
    return NextResponse.json({ message: error.message || 'Task extraction failed' }, { status: 500 });
  }
}

