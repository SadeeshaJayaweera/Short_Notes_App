import OpenAI from 'openai';
import { SummaryResult } from '@/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function summarizeText(text: string): Promise<SummaryResult> {
  try {
    const prompt = `You are an expert note-taking assistant. Your job is to convert the following text into a concise summary and a list of bullet points.

Text to summarize:
${text}

Please provide:
1. A brief summary (2-3 sentences)
2. A numbered list of 5-10 key bullet points

Format your response as JSON:
{
  "summary": "Your summary here",
  "bulletPoints": ["Point 1", "Point 2", "Point 3", ...]
}`;

    const message = await openai.messages.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from OpenAI');
    }

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from OpenAI response');
    }

    const result = JSON.parse(jsonMatch[0]) as SummaryResult;
    return result;
  } catch (error) {
    console.error('Error summarizing text:', error);
    throw new Error('Failed to summarize text');
  }
}

export async function generateTitle(text: string): Promise<string> {
  try {
    const prompt = `Based on the following text, generate a concise and descriptive title (5-10 words max):

${text.substring(0, 500)}...

Respond with only the title, no quotes or extra formatting.`;

    const message = await openai.messages.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from OpenAI');
    }

    return content.text.trim().replace(/^["']|["']$/g, '');
  } catch (error) {
    console.error('Error generating title:', error);
    return 'Untitled Note';
  }
}

export async function improveText(text: string): Promise<string> {
  try {
    const prompt = `Improve the following text by making it clearer, more concise, and better organized while maintaining the original meaning:

${text}

Respond with only the improved text.`;

    const message = await openai.messages.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from OpenAI');
    }

    return content.text.trim();
  } catch (error) {
    console.error('Error improving text:', error);
    throw new Error('Failed to improve text');
  }
}
