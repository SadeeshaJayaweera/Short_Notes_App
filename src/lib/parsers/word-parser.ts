import mammoth from 'mammoth';
import { ParsedDocument } from '@/types';

export async function parseWord(buffer: Buffer, fileName: string): Promise<ParsedDocument> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value || '';

    if (!text.trim()) {
      throw new Error('Word document appears to be empty or unreadable');
    }

    return {
      text: text.trim(),
      fileName: fileName,
      sourceType: 'word',
    };
  } catch (error) {
    console.error('Error parsing Word document:', error);
    throw new Error('Failed to parse Word document');
  }
}
