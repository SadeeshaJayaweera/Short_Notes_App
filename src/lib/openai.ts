import OpenAI from 'openai';
import { SummaryResult } from '@/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function summarizeText(text: string, template?: string): Promise<SummaryResult> {
  try {
    const stylePrompt = template ? `Please format the summary and bullet points in a ${template} style/template.` : '';
    const prompt = `You are an expert note-taking assistant. Your job is to convert the following text into a concise summary, a list of bullet points, some tags, and a sentiment analysis.
${stylePrompt}

Text to summarize:
${text}

Please provide:
1. A brief summary (2-3 sentences)
2. A numbered list of 5-10 key bullet points
3. A list of 3-5 relevant tags (lowercase, one word each if possible)
4. A sentiment analysis (must be exactly one of: "positive", "neutral", "negative", or "mixed")

Format your response as JSON:
{
  "summary": "Your summary here",
  "bulletPoints": ["Point 1", "Point 2", "Point 3", ...],
  "tags": ["tag1", "tag2", ...],
  "sentiment": "neutral"
}`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const contentText = completion.choices[0].message.content;
    if (!contentText) {
      throw new Error('Unexpected response type from OpenAI');
    }

    const jsonMatch = contentText.match(/\{[\s\S]*\}/);
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

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const contentText = completion.choices[0].message.content;
    if (!contentText) {
      throw new Error('Unexpected response type from OpenAI');
    }

    return contentText.trim().replace(/^["']|["']$/g, '');
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

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const contentText = completion.choices[0].message.content;
    if (!contentText) {
      throw new Error('Unexpected response type from OpenAI');
    }

    return contentText.trim();
  } catch (error) {
    console.error('Error improving text:', error);
    throw new Error('Failed to improve text');
  }
}
