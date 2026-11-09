import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';
import { apiResponse, errorResponse } from '@/lib/api-response';

interface FlashcardGen {
  front: string;
  back: string;
}

interface QuestionGen {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

function generateLocalStudyMaterials(title: string, content: string): {
  flashcards: FlashcardGen[];
  quiz: { title: string; questions: QuestionGen[] };
} {
  const lines = content
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 10 && !l.startsWith('#'));

  const flashcards: FlashcardGen[] = [];
  const questions: QuestionGen[] = [];

  // Parse lines for definition-like structures or sentences
  for (const line of lines) {
    if (flashcards.length >= 6) break;

    const colonSplit = line.split(':');
    if (colonSplit.length === 2 && colonSplit[0].length < 60 && colonSplit[1].length > 10) {
      flashcards.push({
        front: `What is the significance or definition of "${colonSplit[0].replace(/^[-*•\d.]+\s*/, '').trim()}"?`,
        back: colonSplit[1].trim(),
      });
      continue;
    }

    if (line.includes(' is ') || line.includes(' refers to ') || line.includes(' means ')) {
      const parts = line.split(/\bis\b|\brefers to\b|\bmeans\b/);
      if (parts.length >= 2 && parts[0].length < 60) {
        flashcards.push({
          front: `Define: ${parts[0].replace(/^[-*•\d.]+\s*/, '').trim()}`,
          back: parts.slice(1).join(' ').trim(),
        });
        continue;
      }
    }

    if (line.length > 25 && line.length < 180) {
      flashcards.push({
        front: `Key Concept from "${title}":`,
        back: line.replace(/^[-*•\d.]+\s*/, ''),
      });
    }
  }

  // Ensure at least 3 flashcards
  if (flashcards.length === 0) {
    flashcards.push(
      {
        front: `What is the main topic of "${title}"?`,
        back: content.slice(0, 200) + '...',
      },
      {
        front: `Key takeaways regarding ${title}`,
        back: content.slice(200, 500) || 'Review the core documentation of this topic.',
      }
    );
  }

  // Generate 3 practice quiz questions from available text chunks
  for (let i = 0; i < Math.min(3, flashcards.length); i++) {
    const card = flashcards[i];
    const correct = card.back.slice(0, 80);
    questions.push({
      question: `Regarding ${title}: ${card.front.replace(/^Key Concept from.*:\s*/, '')}`,
      options: [
        correct,
        `An unrelated concept from an older draft.`,
        `The inverse of the standard definition.`,
        `A deprecated legacy procedure.`,
      ],
      correctAnswer: 0,
      explanation: card.back,
    });
  }

  return {
    flashcards,
    quiz: {
      title: `Practice Quiz: ${title}`,
      questions,
    },
  };
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    const userId = session.user.id;
    const body = await req.json();
    const { noteId, content: rawContent, title: rawTitle, deckName } = body;

    let title = rawTitle || 'Quick Study Set';
    let content = rawContent || '';

    if (noteId) {
      const note = await prisma.note.findFirst({
        where: { id: noteId, userId, deletedAt: null },
      });
      if (!note) {
        return errorResponse('Note not found or deleted', 404);
      }
      title = note.title;
      content = note.content || note.originalText || '';
    }

    if (!content.trim()) {
      return errorResponse('Note content is empty. Cannot generate study materials.', 400);
    }

    let generatedData: {
      flashcards: FlashcardGen[];
      quiz?: { title: string; questions: QuestionGen[] };
    } | null = null;

    // Attempt OpenAI generation if key exists
    if (process.env.OPENAI_API_KEY) {
      try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const prompt = `You are an expert cognitive learning and active-recall tutor.
Analyze the following document and extract high-yield active-recall study materials:
1. 5 to 8 Flashcards focusing on key concepts, terminology, relationships, and problem-solving facts.
2. A 3 to 5 question multiple-choice Practice Quiz. Each question must have exactly 4 plausible options, with 0-indexed correctAnswer, and an explanation.

Document Title: ${title}
Document Content:
${content.slice(0, 4000)}

Respond ONLY with valid JSON conforming to this exact TypeScript shape:
{
  "flashcards": [
    { "front": "Question / Prompt", "back": "Clear, concise answer" }
  ],
  "quiz": {
    "title": "Quiz Title",
    "questions": [
      {
        "question": "Question text",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": 0,
        "explanation": "Why this is correct"
      }
    ]
  }
}`;

        const completion = await openai.chat.completions.create({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
          temperature: 0.2,
        });

        const jsonText = completion.choices[0]?.message?.content;
        if (jsonText) {
          generatedData = JSON.parse(jsonText);
        }
      } catch (aiError) {
        console.warn('OpenAI study generation error, falling back to local extractor:', aiError);
      }
    }

    // Fallback if AI was unavailable or failed
    if (!generatedData || !generatedData.flashcards?.length) {
      generatedData = generateLocalStudyMaterials(title, content);
    }

    // Save flashcards into database
    const targetDeck = deckName || title || 'Default';
    const createdFlashcards = await Promise.all(
      generatedData.flashcards.map((fc) =>
        prisma.flashcard.create({
          data: {
            userId,
            noteId: noteId || null,
            deckName: targetDeck,
            front: fc.front,
            back: fc.back,
            dueDate: new Date(),
          },
        })
      )
    );

    // Save quiz if questions exist
    let createdQuiz = null;
    if (generatedData.quiz && generatedData.quiz.questions?.length) {
      createdQuiz = await prisma.quiz.create({
        data: {
          userId,
          noteId: noteId || null,
          title: generatedData.quiz.title || `Quiz: ${title}`,
          description: `Generated practice quiz for ${title}`,
          questions: {
            create: generatedData.quiz.questions.map((q) => ({
              question: q.question,
              options: q.options,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation,
            })),
          },
        },
        include: {
          questions: true,
        },
      });
    }

    return apiResponse(
      {
        message: 'Study materials successfully generated',
        flashcards: createdFlashcards,
        quiz: createdQuiz,
        count: createdFlashcards.length,
      },
      201
    );
  } catch (error) {
    console.error('Study material generation error:', error);
    return errorResponse('Failed to generate study materials', 500);
  }
}

